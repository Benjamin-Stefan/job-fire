import { JobContext, JobOptions, JobResult } from "./types";
/**
 * Represents a job that can be scheduled and executed with retry and concurrency options.
 * Provides functionality for setting retries, timeouts, and concurrency handling.
 */
export declare class Job {
    readonly id: string;
    private jobFunction;
    private options;
    private retriesLeft;
    private isComplete;
    private isRunning;
    /**
     * Creates an instance of Job.
     * @param {string} id - Unique identifier for the job.
     * @param {(params: any, context: JobContext) => Promise<any>} jobFunction - The function to execute for the job.
     * @param {JobOptions} options - Configuration options for the job, such as retries, concurrency, and timeout.
     */
    constructor(id: string, jobFunction: (context: JobContext, params: any) => Promise<any>, options: JobOptions);
    /**
     * Determines if the job should run based on a cron schedule.
     * @param {Date} date - The date to check for cron scheduling.
     * @returns {boolean} Returns `true` if the job should run at the given date, otherwise `false`.
     */
    shouldRun(date: Date): boolean;
    /**
     * Executes the job with retry and timeout capabilities.
     * @param {JobContext} context - Context information for the job execution, including logging.
     * @returns {Promise<JobResult>} The result of the job execution, including success status and any result or error.
     */
    run(context: JobContext): Promise<JobResult>;
    /**
     * Executes the job function with a timeout.
     * @private
     * @param {JobContext} context - Context for the job execution.
     * @returns {Promise<any>} Resolves with the job result or rejects if it times out.
     */
    private executeWithTimeout;
    /**
     * The execution interval for the job, or `null` if it should only run once.
     * @property {number | null} interval
     */
    get interval(): number | null;
    /**
     * Indicates if the job has completed.
     * @property {boolean} isJobComplete
     */
    get isJobComplete(): boolean;
    /**
     * Determines if the job should repeat after completion.
     * @property {boolean|undefined} repeat
     */
    get repeat(): boolean | undefined;
    /**
     * Indicates if the job is currently running.
     * @property {boolean} isJobRunning
     */
    get isJobRunning(): boolean;
    /**
     * Specifies if the job can be executed concurrently.
     * @property {boolean|undefined} allowConcurrent
     */
    get allowConcurrent(): boolean | undefined;
}
