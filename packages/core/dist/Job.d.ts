import { JobContext, JobOptions, JobResult } from "./types";
/**
 * Represents a job that can be scheduled and executed with options for retry, timeout, and concurrency handling.
 * Provides methods to check cron schedule, execute with retries, and handle timeout scenarios.
 */
export declare class Job {
    readonly id: string;
    private jobFunction;
    private options;
    private retriesLeft;
    private isComplete;
    private isRunning;
    /**
     * Creates an instance of the Job class.
     *
     * @param {string} id - Unique identifier for the job.
     * @param {(context: JobContext, params: any) => Promise<any>} jobFunction - The function to be executed as the job.
     * @param {JobOptions} options - Configuration options for the job, such as retries, timeout, and concurrency control.
     */
    constructor(id: string, jobFunction: (context: JobContext, params: any) => Promise<any>, options: JobOptions);
    /**
     * Checks if the job should run based on its cron schedule.
     *
     * @param {Date} date - The date to evaluate against the cron expression.
     * @returns {boolean} Returns `true` if the job should run on the specified date, otherwise `false`.
     */
    shouldRun(date: Date): boolean;
    /**
     * Executes the job with retry and timeout handling, updating its status and recording the outcome.
     *
     * @param {JobContext} context - Contextual information for the job execution, including logging.
     * @returns {Promise<JobResult>} A promise that resolves to the result of the job execution, containing success status and any result or error.
     */
    run(context: JobContext): Promise<JobResult>;
    /**
     * Executes the job function with a specified timeout.
     *
     * @private
     * @param {JobContext} context - Context for the job execution.
     * @returns {Promise<any>} A promise that resolves to the result of the job or rejects if the execution times out.
     *
     * @throws {TimeoutError} If the job execution exceeds the specified timeout duration.
     */
    private executeWithTimeout;
    /**
     * The execution interval for the job, or `null` if the job should only run once.
     *
     * @property {number | null} interval
     */
    get interval(): number | null;
    /**
     * Indicates whether the job has completed all executions.
     *
     * @property {boolean} isJobComplete
     */
    get isJobComplete(): boolean;
    /**
     * Indicates if the job is set to repeat after each completion.
     *
     * @property {boolean|undefined} repeat
     */
    get repeat(): boolean | undefined;
    /**
     * Indicates if the job is currently running.
     *
     * @property {boolean} isJobRunning
     */
    get isJobRunning(): boolean;
    /**
     * Specifies if the job can be executed concurrently.
     *
     * @property {boolean|undefined} allowConcurrent
     */
    get allowConcurrent(): boolean | undefined;
}
