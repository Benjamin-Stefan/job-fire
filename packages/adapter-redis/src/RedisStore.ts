import Redis from "ioredis";
import { IJobStore, JobExecutionStats, JobResult } from "job-fire/src/types/custom";

export class RedisStore implements IJobStore {
    private redisClient: Redis;

    /**
     * Constructor that optionally accepts a connection string to establish a connection to Redis.
     * @param {string} [connectionString] - Optional connection string for Redis.
     * If not provided, a default Redis instance is created.
     */
    constructor(connectionString?: string) {
        if (connectionString) {
            this.redisClient = new Redis(connectionString);
        } else {
            this.redisClient = new Redis();
        }
    }

    /**
     * Stores the result of a job execution in Redis.
     * @param {string} jobId - The unique identifier of the job.
     * @param {JobResult} result - The result of the job execution, containing success status and any potential error messages.
     * @param {number} duration - The duration of the job execution in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the job result is successfully stored.
     */
    async saveJobResult(jobId: string, result: JobResult, duration: number): Promise<void> {
        const jobStatKey = `job:${jobId}:stats`;

        const executionEntry = {
            timestamp: new Date().toISOString(),
            duration,
            result: JSON.stringify(result),
        };

        // Save the execution entry in a Redis list
        await this.redisClient.rpush(`${jobStatKey}:executions`, JSON.stringify(executionEntry));

        // Update overall job statistics
        const stats = await this.redisClient.hgetall(jobStatKey);
        const updatedStats: JobExecutionStats = {
            jobId,
            successCount: (parseInt(stats.successCount, 10) || 0) + (result.success ? 1 : 0),
            failureCount: (parseInt(stats.failureCount, 10) || 0) + (result.success ? 0 : 1),
            timeoutCount: (parseInt(stats.timeoutCount, 10) || 0) + (result.error?.message?.includes("timed out") ? 1 : 0),
            retryFailures: (parseInt(stats.retryFailures, 10) || 0) + (result.success || !result.error ? 0 : 1),
            totalDuration: (parseInt(stats.totalDuration, 10) || 0) + duration,
            executions: [],
        };

        await this.redisClient.hmset(jobStatKey, {
            successCount: updatedStats.successCount.toString(),
            failureCount: updatedStats.failureCount.toString(),
            timeoutCount: updatedStats.timeoutCount.toString(),
            retryFailures: updatedStats.retryFailures.toString(),
            totalDuration: updatedStats.totalDuration.toString(),
        });
    }

    /**
     * Retrieves the execution history and statistics for a given job.
     * @param {string} jobId - The unique identifier of the job.
     * @returns {Promise<JobExecutionStats | undefined>} The statistics and execution history of the job, or `undefined` if none exist.
     */
    async getJobHistory(jobId: string): Promise<JobExecutionStats | undefined> {
        const jobStatKey = `job:${jobId}:stats`;
        const stats = await this.redisClient.hgetall(jobStatKey);

        if (!stats || Object.keys(stats).length === 0) {
            return undefined;
        }

        const executions = await this.redisClient.lrange(`${jobStatKey}:executions`, 0, -1);
        const parsedExecutions = executions.map((exec: string) => JSON.parse(exec));

        return {
            jobId,
            successCount: parseInt(stats.successCount, 10) || 0,
            failureCount: parseInt(stats.failureCount, 10) || 0,
            timeoutCount: parseInt(stats.timeoutCount, 10) || 0,
            retryFailures: parseInt(stats.retryFailures, 10) || 0,
            totalDuration: parseInt(stats.totalDuration, 10) || 0,
            executions: parsedExecutions,
        };
    }
}
