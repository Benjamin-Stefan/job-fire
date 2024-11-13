import { IJobStore } from "../interfaces/IJobStore";
import { ILogger } from "../interfaces/ILogger";
/**
 * Context object provided to a job during execution, containing information such as job ID and an optional logger.
 * This context may also hold additional properties as custom context data.
 *
 * @typedef {object} JobContext
 * @property {string} jobId - Unique identifier of the job.
 * @property {AbortController} abortController - Controller used to manage and signal abort requests.
 * @property {ILogger | null} [logger] - Optional logger instance for logging within the job context.
 * @property {any} [key: string] - Additional properties for custom context data.
 */
export type JobContext = {
    jobId: string;
    abortController: AbortController;
    logger?: ILogger | null;
    [key: string]: any;
};
/**
 * Execution statistics of a job, detailing the number of successes, failures, total duration, and individual executions.
 *
 * @typedef {object} JobExecutionStats
 * @property {string} jobId - Unique identifier of the job.
 * @property {number} successCount - Number of successful job executions.
 * @property {number} failureCount - Number of job executions that failed.
 * @property {number} timeoutCount - Number of job executions that timed out.
 * @property {number} retryFailures - Number of failed retry attempts.
 * @property {number} totalDuration - Total duration of all job executions in milliseconds.
 * @property {Array<{timestamp: Date, duration: number, result: JobResult}>} executions - Array of execution records, each containing a timestamp, duration, and result.
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
 * Options for configuring a job's schedule, including timing, retries, and concurrency settings.
 *
 * @typedef {object} JobOptions
 * @property {number | null} interval - Interval in milliseconds for repeated job execution, or null if not repeating.
 * @property {string} [cron] - Cron expression defining the job's schedule.
 * @property {number} [retries] - Number of retries allowed in case of job failure.
 * @property {any} [params] - Parameters to pass to the job function.
 * @property {boolean} [repeat] - Determines whether the job should repeat after completion.
 * @property {boolean} [allowConcurrent] - Allows the job to execute concurrently if set to true.
 * @property {number} [timeout] - Duration in milliseconds before the job times out.
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
 * Represents the result of a job execution, indicating whether the job was successful and providing the result or error if available.
 *
 * @typedef {object} JobResult
 * @property {boolean} success - Flag indicating if the job executed successfully.
 * @property {unknown} [result] - Result of the job execution if successful.
 * @property {Error | SerializedError} [error] - Error encountered during job execution, if any.
 */
export type JobResult = {
    success: boolean;
    result?: unknown;
    error?: Error | SerializedError;
};
/**
 * Serialized error structure used to represent error messages and stack traces for job results.
 *
 * @typedef {object} SerializedError
 * @property {string} message - Error message.
 * @property {string} [stack] - Stack trace of the error, if available.
 */
export type SerializedError = {
    message: string;
    stack?: string;
};
/**
 * Options for configuring the scheduler's setup, including storage preferences and concurrency limits.
 *
 * @typedef {object} ScheduleOptions
 * @property {boolean} [useDatabase] - Indicates if a database should be used for job storage.
 * @property {IJobStore} [adapter] - Custom storage adapter implementing the `IJobStore` interface.
 * @property {number} [maxConcurrentJobs] - Maximum number of jobs that can run concurrently.
 * @property {boolean} [debug] - Enables debug mode for additional logging during scheduling.
 */
export type ScheduleOptions = {
    useDatabase?: boolean;
    adapter?: IJobStore;
    maxConcurrentJobs?: number;
    debug?: boolean;
};
