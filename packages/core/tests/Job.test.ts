import { Job } from "../src/Job";
import { JobContext, JobOptions } from "../src/types";

describe("Job", () => {
    let jobFunction: jest.Mock;
    let context: JobContext;
    let options: JobOptions;

    beforeEach(() => {
        jobFunction = jest.fn();
        context = {
            jobId: "test-job",
            logger: {
                debug: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            },
        };
        options = {
            interval: null,
            retries: 3,
            timeout: 1000,
            params: {},
            cron: "* * * * * *",
            repeat: false,
            allowConcurrent: false,
        };
    });

    it("should create a job instance with default options", () => {
        const job = new Job("test-job", jobFunction, options);
        expect(job.id).toBe("test-job");
        expect(job.repeat).toBe(false);
        expect(job.allowConcurrent).toBe(false);
    });

    it("should run the job successfully", async () => {
        jobFunction.mockResolvedValue("success");
        const job = new Job("test-job", jobFunction, options);
        const result = await job.run(context);
        expect(result.success).toBe(true);
        expect(result.result).toBe("success");
        expect(jobFunction).toHaveBeenCalledTimes(1);
    });

    it("should retry the job on failure", async () => {
        jobFunction.mockRejectedValueOnce(new Error("failure"));
        jobFunction.mockResolvedValueOnce("success");
        const job = new Job("test-job", jobFunction, options);
        const result = await job.run(context);
        expect(result.success).toBe(true);
        expect(result.result).toBe("success");
        expect(jobFunction).toHaveBeenCalledTimes(2);
    });

    it("should fail after max retries", async () => {
        jobFunction.mockRejectedValue(new Error("failure"));
        const job = new Job("test-job", jobFunction, options);
        const result = await job.run(context);
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe("failure");
        expect(jobFunction).toHaveBeenCalledTimes(4); // initial run + 3 retries
    });

    it("should not run if already complete and repeat is false", async () => {
        jobFunction.mockResolvedValue("success");
        const job = new Job("test-job", jobFunction, { ...options, repeat: false });
        await job.run(context);
        const result = await job.run(context);
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe("Job test-job is already complete and will not retry further.");
        expect(jobFunction).toHaveBeenCalledTimes(1);
    });

    it("should not allow concurrent execution if allowConcurrent is false", async () => {
        jobFunction.mockResolvedValue("success");
        const job = new Job("test-job", jobFunction, { ...options, allowConcurrent: false });
        job.run(context); // Start the first run
        const result = await job.run(context); // Attempt to start a concurrent run
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe("Concurrent execution not allowed");
        expect(jobFunction).toHaveBeenCalledTimes(1);
    });

    it("should run concurrently if allowConcurrent is true", async () => {
        jobFunction.mockResolvedValue("success");
        const job = new Job("test-job", jobFunction, { ...options, allowConcurrent: true });
        const run1 = job.run(context);
        const run2 = job.run(context);
        const results = await Promise.all([run1, run2]);
        expect(results[0].success).toBe(true);
        expect(results[1].success).toBe(true);
        expect(jobFunction).toHaveBeenCalledTimes(2);
    });

    it("should timeout if job function takes too long", async () => {
        jobFunction.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve("success"), 2000)));
        const job = new Job("test-job", jobFunction, { ...options, timeout: 1000 });
        const result = await job.run(context);
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe("Job test-job timed out after 1000ms");
    });

    it("should run based on cron schedule", () => {
        const job = new Job("test-job", jobFunction, options);
        const date = new Date();
        expect(job.shouldRun(date)).toBe(true);
    });

    it("should not run if cron schedule does not match", () => {
        const job = new Job("test-job", jobFunction, { ...options, cron: "0 0 * * *" });
        const date = new Date();
        expect(job.shouldRun(date)).toBe(false);
    });
});
