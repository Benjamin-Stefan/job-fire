import { Scheduler } from "../src/Scheduler";
import { Logger } from "../src/Logger";
import { InMemoryStore } from "../src/InMemoryStore";
import { JobOptions } from "../src/types";

describe("Scheduler", () => {
    let scheduler: Scheduler;
    let mockLogger: Logger;
    let mockStore: InMemoryStore;

    beforeEach(() => {
        jest.useFakeTimers();
        mockLogger = {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
        mockStore = new InMemoryStore();
        scheduler = new Scheduler({ maxConcurrentJobs: 2, adapter: mockStore }, mockLogger);
    });

    afterEach(() => {
        scheduler.clearAllTimers();
        jest.clearAllTimers();
    });

    test("should initialize with default values", () => {
        expect(scheduler).toBeDefined();
        expect(scheduler["maxConcurrentJobs"]).toBe(2);
        expect(scheduler["store"]).toBe(mockStore);
        expect(scheduler["logger"]).toBe(mockLogger);
    });

    test("should add a job with interval", async () => {
        const jobFunction = jest.fn().mockResolvedValue({ success: true });
        const jobOptions: JobOptions = { interval: 1000 };

        scheduler.addJob("job1", jobFunction, jobOptions);

        expect(scheduler["intervalJobs"].has("job1")).toBe(true);
        expect(scheduler["cronJobs"].has("job1")).toBe(false);
    });

    test("should add a job with cron", async () => {
        const jobFunction = jest.fn().mockResolvedValue({ success: true });
        const jobOptions: JobOptions = { cron: "* * * * *", interval: null };

        scheduler.addJob("job2", jobFunction, jobOptions);

        expect(scheduler["cronJobs"].has("job2")).toBe(true);
        expect(scheduler["intervalJobs"].has("job2")).toBe(false);
    });

    test("should throw error if job with same ID already exists", () => {
        const jobFunction = jest.fn().mockResolvedValue({ success: true });
        const jobOptions: JobOptions = { interval: 1000 };

        scheduler.addJob("job3", jobFunction, jobOptions);

        expect(() => {
            scheduler.addJob("job3", jobFunction, jobOptions);
        }).toThrowError("Job with ID job3 already exists");
    });

    test("should process job queue based on concurrency limit", async () => {
        const jobFunction = jest.fn().mockImplementation(() => {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
        });
        const jobOptions: JobOptions = { interval: null };

        scheduler.addJob("job4", jobFunction, jobOptions);
        scheduler.addJob("job5", jobFunction, jobOptions);
        scheduler.addJob("job6", jobFunction, jobOptions);

        jest.advanceTimersByTime(1000);

        await scheduler["processQueue"]();

        expect(scheduler["runningJobs"].size).toBe(2);
    });

    test("should execute job and log result", async () => {
        const jobFunction = jest.fn().mockResolvedValue({ success: true });
        const jobOptions: JobOptions = { interval: 1000 };

        scheduler.addJob("job7", jobFunction, jobOptions);

        const job = scheduler["intervalJobs"].get("job7");
        if (job) {
            await scheduler["executeJob"](job);
        }

        expect(jobFunction).toHaveBeenCalled();
        expect(mockStore.getJobHistory("job7")).toBeDefined();
    });

    test("should retrieve undefinded job history", async () => {
        const jobHistory = await scheduler.getJobHistory("job23423423423427");
        expect(jobHistory).toBeUndefined();
    });
});
