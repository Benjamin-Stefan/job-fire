import Redis, { RedisOptions } from "ioredis";
import { RedisStore } from "../src/RedisStore";
import { JobResult } from "job-fire/src/types";

jest.mock("ioredis");

describe("RedisStore", () => {
    let redisStore: RedisStore;
    let redisClient: jest.Mocked<Redis>;

    beforeEach(() => {
        redisClient = new Redis() as jest.Mocked<Redis>;
        (Redis as unknown as jest.Mock).mockImplementation(() => redisClient);
        redisStore = new RedisStore();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("RedisStore Initialization Tests", () => {
        test("should create a Redis client with the provided connection string", () => {
            const connectionString: RedisOptions = { host: "redis://localhost", port: 6379 };
            redisStore = new RedisStore(connectionString);
            expect(Redis).toHaveBeenCalledWith(connectionString);
        });

        test("should create a Redis client with the default configuration if no connection string is provided", () => {
            redisStore = new RedisStore();
            expect(Redis).toHaveBeenCalledWith();
        });
    });

    describe("Job Result Saving Tests", () => {
        test("should save job result and update job statistics", async () => {
            const jobId = "job1";
            const result: JobResult = { success: true };
            const duration = 1000;

            redisClient.hgetall.mockResolvedValue({
                successCount: "1",
                failureCount: "0",
                timeoutCount: "0",
                retryFailures: "0",
                totalDuration: "1000",
            });

            await redisStore.saveJobResult(jobId, result, duration);

            expect(redisClient.rpush).toHaveBeenCalledWith(`job:${jobId}:stats:executions`, expect.any(String));
            expect(redisClient.hmset).toHaveBeenCalledWith(`job:${jobId}:stats`, {
                successCount: "2",
                failureCount: "0",
                timeoutCount: "0",
                retryFailures: "0",
                totalDuration: "2000",
            });
        });

        test("should handle job result with failure and update job statistics", async () => {
            const jobId = "job2";
            const result: JobResult = { success: false, error: { message: "Some error" } };
            const duration = 500;

            redisClient.hgetall.mockResolvedValue({
                successCount: "0",
                failureCount: "1",
                timeoutCount: "0",
                retryFailures: "0",
                totalDuration: "500",
            });

            await redisStore.saveJobResult(jobId, result, duration);

            expect(redisClient.rpush).toHaveBeenCalledWith(`job:${jobId}:stats:executions`, expect.any(String));
            expect(redisClient.hmset).toHaveBeenCalledWith(`job:${jobId}:stats`, {
                successCount: "0",
                failureCount: "2",
                timeoutCount: "0",
                retryFailures: "1",
                totalDuration: "1000",
            });
        });
    });

    describe("Job History Retrieval Tests", () => {
        test("should return job history and statistics if they exist", async () => {
            const jobId = "job1";

            redisClient.hgetall.mockResolvedValue({
                successCount: "1",
                failureCount: "0",
                timeoutCount: "0",
                retryFailures: "0",
                totalDuration: "1000",
            });

            redisClient.lrange.mockResolvedValue([
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    duration: 1000,
                    result: JSON.stringify({ success: true }),
                }),
            ]);

            const jobHistory = await redisStore.getJobHistory(jobId);

            expect(jobHistory).toEqual({
                jobId,
                successCount: 1,
                failureCount: 0,
                timeoutCount: 0,
                retryFailures: 0,
                totalDuration: 1000,
                executions: [
                    {
                        timestamp: expect.any(String),
                        duration: 1000,
                        result: JSON.stringify({ success: true }),
                    },
                ],
            });
        });

        test("should return undefined if no job history exists", async () => {
            const jobId = "job1";

            redisClient.hgetall.mockResolvedValue({});
            const jobHistory = await redisStore.getJobHistory(jobId);

            expect(jobHistory).toBeUndefined();
        });
    });
});
