import { IJobStore } from "../interfaces/IJobStore";
import { ILogger } from "../interfaces/ILogger";

/**
 * Context object provided to a job during execution, including the job's ID and an optional logger.
 * @typedef {object} JobContext
 * @property {string} jobId - Unique identifier of the job.
 * @property {ILogger | null} [logger] - Optional logger for logging within the job context.
 * @property {any} [key: string] - Additional properties for custom context data.
 */
export type JobContext = {
    jobId: string;
    logger?: ILogger | null;
    [key: string]: any;
};

/**
 * Represents the execution statistics of a job, including success and failure counts, total duration, and individual executions.
 * @typedef {object} JobExecutionStats
 * @property {string} jobId - Unique identifier of the job.
 * @property {number} successCount - Number of successful executions of the job.
 * @property {number} failureCount - Number of failed executions of the job.
 * @property {number} timeoutCount - Number of times the job timed out.
 * @property {number} retryFailures - Number of retry attempts that failed.
 * @property {number} totalDuration - Cumulative duration of all executions in milliseconds.
 * @property {Array<{timestamp: Date, duration: number, result: JobResult}>} executions - Array of individual execution records, each with a timestamp, duration, and result.
 */
export type JobExecutionStats = {
    jobId: string;
    successCount: number;
    failureCount: number;
    timeoutCount: number;
    retryFailures: number;
    totalDuration: number;
    executions: Array<{
        timestamp: Date;
        duration: number;
        result: JobResult;
    }>;
};

/**
 * Configuration options for scheduling a job, including timing, retry behavior, and concurrency settings.
 * @typedef {object} JobOptions
 * @property {number | null} interval - Interval in milliseconds for repeating the job (null if not interval-based).
 * @property {string} [cron] - Cron expression defining the job's schedule.
 * @property {number} [retries] - Number of retry attempts allowed for the job.
 * @property {any} [params] - Parameters to be passed to the job function.
 * @property {boolean} [repeat] - Whether the job should repeat after completion.
 * @property {boolean} [allowConcurrent] - If true, allows concurrent job execution.
 * @property {number} [timeout] - Timeout duration for the job in milliseconds.
 */
export type JobOptions = {
    interval: number | null;
    cron?: string;
    retries?: number;
    params?: any;
    repeat?: boolean;
    allowConcurrent?: boolean;
    timeout?: number;
};

/**
 * Represents the result of a job execution.
 * @typedef {object} JobResult
 * @property {boolean} success - Indicates if the job execution was successful.
 * @property {unknown} [result] - The result of the job execution, if successful.
 * @property {Error} [error] - The error encountered during execution, if any.
 */
export type JobResult = {
    success: boolean;
    result?: unknown;
    error?: Error;
};

/**
 * Configuration options for setting up the scheduler, including storage options and concurrency limits.
 * @typedef {object} ScheduleOptions
 * @property {boolean} [useDatabase] - Specifies whether to use a database for job storage.
 * @property {IJobStore} [adapter] - Custom storage adapter implementing `IJobStore`.
 * @property {number} [maxConcurrentJobs] - Maximum number of jobs allowed to run concurrently.
 * @property {boolean} [debug] - Enables debug mode for additional logging.
 */
export type ScheduleOptions = {
    useDatabase?: boolean;
    adapter?: IJobStore;
    maxConcurrentJobs?: number;
    debug?: boolean;
};
