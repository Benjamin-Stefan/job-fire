import { ILogger, JobContext, JobExecutionStats, ScheduleOptions, JobOptions } from "./types/custom";
/**
 * Scheduler for managing and executing jobs with concurrency control and optional database storage.
 * Provides functionality to add, remove, and manage scheduled and interval-based jobs.
 */
export declare class Scheduler {
    private intervalJobs;
    private cronJobs;
    private jobQueue;
    private runningJobs;
    private maxConcurrentJobs;
    private store;
    private logger;
    private isProcessing;
    private activeTimers;
    private jobTimers;
    private debug;
    /**
     * Constructs a new Scheduler instance.
     * @param {ScheduleOptions} options - Configuration options for scheduling jobs, including concurrency limits.
     * @param {ILogger} [logger=new Logger()] - Optional logger instance for logging messages.
     */
    constructor(options?: ScheduleOptions, logger?: ILogger);
    /**
     * Clears all active timers, halting all scheduled jobs.
     */
    clearAllTimers(): void;
    /**
     * Adds a new job to the scheduler.
     * @param {string} id - Unique identifier for the job.
     * @param {(context: JobContext, params: any) => Promise<any>} jobFunction - The function to execute for the job.
     * @param {JobOptions} options - Options specifying the job's behavior, schedule, and concurrency settings.
     * @throws {Error} If a job with the given ID already exists.
     */
    addJob(id: string, jobFunction: (context: JobContext, params: any) => Promise<any>, options: JobOptions): void;
    /**
     * Removes a job from the scheduler.
     * @param {string} id - Unique identifier for the job.
     * @throws {Error} If a job with the given ID does not exist.
     */
    removeJob(id: string): void;
    /**
     * Executes all scheduled cron jobs at the designated intervals.
     * This method is called internally at regular intervals to trigger scheduled cron jobs.
     * @private
     * @returns {Promise<void>} Resolves when all eligible jobs are enqueued.
     */
    private tick;
    /**
     * Schedules a job to run at regular intervals.
     * @param {Job} job - The job to schedule.
     * @private
     * @returns {Promise<void>} Resolves when the job is successfully enqueued.
     */
    private scheduleIntervalJob;
    /**
     * Adds a job to the queue for processing.
     * @param {Job} job - The job to enqueue.
     * @private
     * @returns {Promise<void>} Resolves when the job is added to the queue.
     */
    private enqueueJob;
    /**
     * Processes jobs in the queue based on the concurrency limit.
     * @private
     * @returns {Promise<void>} Resolves when all eligible jobs are processed.
     */
    private processQueue;
    /**
     * Executes a specified job, logging the result and updating job execution stats.
     * @param {Job} job - The job to execute.
     * @private
     * @returns {Promise<void>} Resolves when the job has completed execution.
     */
    private executeJob;
    /**
     * Logs debug information if debug mode is enabled.
     * @param {string} message - The debug message to log.
     * @private
     */
    private logDebug;
    /**
     * Retrieves the execution history of a specified job.
     * @param {string} jobId - The unique identifier of the job whose history is requested.
     * @returns {JobExecutionStats|undefined} The job's execution history, or undefined if no history is available.
     */
    getJobHistory(jobId: string): Promise<JobExecutionStats | undefined>;
}
