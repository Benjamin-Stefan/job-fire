import { InMemoryStore } from "../src/InMemoryStore";
import { JobResult } from "../src/types/custom";

describe("InMemoryStore", () => {
    let store: InMemoryStore;

    beforeEach(() => {
        store = new InMemoryStore();
    });

    it("should save job result and update statistics for a successful job", () => {
        const jobId = "job1";
        const result: JobResult = { success: true };
        const duration = 100;

        store.saveJobResult(jobId, result, duration);

        const jobHistory = store.getJobHistory(jobId);
        expect(jobHistory).toBeDefined();
        expect(jobHistory?.jobId).toBe(jobId);
        expect(jobHistory?.successCount).toBe(1);
        expect(jobHistory?.failureCount).toBe(0);
        expect(jobHistory?.totalDuration).toBe(duration);
        expect(jobHistory?.executions.length).toBe(1);
        expect(jobHistory?.executions[0].result).toBe(result);
        expect(jobHistory?.executions[0].duration).toBe(duration);
    });

    it("should save job result and update statistics for a failed job", () => {
        const jobId = "job2";
        const result: JobResult = { success: false, error: new Error("Some error") };
        const duration = 200;

        store.saveJobResult(jobId, result, duration);

        const jobHistory = store.getJobHistory(jobId);
        expect(jobHistory).toBeDefined();
        expect(jobHistory?.jobId).toBe(jobId);
        expect(jobHistory?.successCount).toBe(0);
        expect(jobHistory?.failureCount).toBe(1);
        expect(jobHistory?.totalDuration).toBe(duration);
        expect(jobHistory?.executions.length).toBe(1);
        expect(jobHistory?.executions[0].result).toBe(result);
        expect(jobHistory?.executions[0].duration).toBe(duration);
    });

    it("should update timeout count for a job that timed out", () => {
        const jobId = "job3";
        const result: JobResult = { success: false, error: new Error("Job timed out") };
        const duration = 300;

        store.saveJobResult(jobId, result, duration);

        const jobHistory = store.getJobHistory(jobId);
        expect(jobHistory).toBeDefined();
        expect(jobHistory?.timeoutCount).toBe(1);
    });

    it("should update retry failures count for a job that failed without timeout", () => {
        const jobId = "job4";
        const result: JobResult = { success: false, error: new Error("Some other error") };
        const duration = 400;

        store.saveJobResult(jobId, result, duration);

        const jobHistory = store.getJobHistory(jobId);
        expect(jobHistory).toBeDefined();
        expect(jobHistory?.retryFailures).toBe(1);
    });

    it("should return undefined for a job with no history", () => {
        const jobId = "job5";
        const jobHistory = store.getJobHistory(jobId);
        expect(jobHistory).toBeUndefined();
    });
});
