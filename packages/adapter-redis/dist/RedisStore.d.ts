import { RedisOptions } from "ioredis";
import { IJobStore } from "job-fire/src/interfaces/IJobStore";
import { JobExecutionStats, JobResult } from "job-fire/src/types";
export declare class RedisStore implements IJobStore {
    private redisClient;
    /**
     * Constructor that optionally accepts a RedisOptions to establish a connection to Redis.
     * @param {RedisOptions} [redisOptions] - Optional redisOptions for Redis.
     * If not provided, a default Redis instance is created.
     */
    constructor(redisOptions?: RedisOptions);
    /**
     * Stores the result of a job execution in Redis.
     * @param {string} jobId - The unique identifier of the job.
     * @param {JobResult} result - The result of the job execution, containing success status and any potential error messages.
     * @param {number} duration - The duration of the job execution in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the job result is successfully stored.
     */
    saveJobResult(jobId: string, result: JobResult, duration: number): Promise<void>;
    /**
     * Retrieves the execution history and statistics for a given job.
     * @param {string} jobId - The unique identifier of the job.
     * @returns {Promise<JobExecutionStats | undefined>} The statistics and execution history of the job, or `undefined` if none exist.
     */
    getJobHistory(jobId: string): Promise<JobExecutionStats | undefined>;
}
