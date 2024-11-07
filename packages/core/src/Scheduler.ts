import { Job } from "./Job";
import { Logger } from "./Logger";
import { InMemoryStore } from "./InMemoryStore";
import { ILogger, JobContext, IJobStore, JobExecutionStats, ScheduleOptions, JobOptions } from "./types/custom";

/**
 * Scheduler for managing and executing jobs with concurrency control and optional database storage.
 * Provides functionality to add, remove, and manage scheduled and interval-based jobs.
 */
export class Scheduler {
    private intervalJobs: Map<string, Job> = new Map();
    private cronJobs: Map<string, Job> = new Map();
    private jobQueue: Job[] = [];
    private runningJobs: Set<string> = new Set();
    private maxConcurrentJobs: number;
    private store: IJobStore;
    private logger: ILogger | null;
    private isProcessing = false;
    private activeTimers: NodeJS.Timeout[] = [];
    private jobTimers: Map<string, NodeJS.Timeout> = new Map();
    private debug: boolean = false;

    /**
     * Constructs a new Scheduler instance.
     * @param {ScheduleOptions} options - Configuration options for scheduling jobs, including concurrency limits.
     * @param {ILogger} [logger=new Logger()] - Optional logger instance for logging messages.
     */
    constructor(options: ScheduleOptions = {}, logger: ILogger = new Logger()) {
        this.logger = logger;
        this.maxConcurrentJobs = options.maxConcurrentJobs || 10;
        this.store = options.adapter || new InMemoryStore();
        this.debug = options.debug || false;

        const mainInterval = setInterval(() => this.tick(), 1000);
        this.activeTimers.push(mainInterval);
    }

    /**
     * Clears all active timers, halting all scheduled jobs.
     */
    clearAllTimers() {
        this.activeTimers.forEach((timer) => clearInterval(timer));
        this.activeTimers = [];
        this.jobTimers.forEach((jodId, timer) => clearInterval(timer));
        this.jobTimers = new Map();
    }

    /**
     * Adds a new job to the scheduler.
     * @param {string} id - Unique identifier for the job.
     * @param {(context: JobContext, params: any) => Promise<any>} jobFunction - The function to execute for the job.
     * @param {JobOptions} options - Options specifying the job's behavior, schedule, and concurrency settings.
     * @throws {Error} If a job with the given ID already exists.
     */
    addJob(id: string, jobFunction: (context: JobContext, params: any) => Promise<any>, options: JobOptions): void {
        if (this.intervalJobs.has(id) || this.cronJobs.has(id)) {
            throw new Error(`Job with ID ${id} already exists`);
        }

        const job = new Job(id, jobFunction, options);

        if (options.cron) {
            this.cronJobs.set(id, job);
            this.logDebug(`Scheduled Cron Job ${id} with pattern "${options.cron}"`);
        } else if (options.interval === null || (options.interval && options.interval > 0)) {
            this.intervalJobs.set(id, job);
            this.scheduleIntervalJob(job);
        } else {
            throw new Error("Job must specify either an interval or a cron pattern.");
        }

        this.processQueue();
    }

    /**
     * Removes a job from the scheduler.
     * @param {string} id - Unique identifier for the job.
     * @throws {Error} If a job with the given ID does not exist.
     */
    removeJob(id: string): void {
        if (this.jobTimers.has(id)) {
            clearInterval(this.jobTimers.get(id)!);
            this.jobTimers.delete(id);
        }

        if (this.intervalJobs.delete(id) || this.cronJobs.delete(id)) {
            this.logDebug(`Job with ID ${id} has been removed.`);
            return;
        }

        throw new Error(`Job with ID ${id} does not exist`);
    }

    /**
     * Executes all scheduled cron jobs at the designated intervals.
     * This method is called internally at regular intervals to trigger scheduled cron jobs.
     * @private
     * @returns {Promise<void>} Resolves when all eligible jobs are enqueued.
     */
    private async tick(): Promise<void> {
        const now = new Date();
        for (const job of this.cronJobs.values()) {
            if (job.shouldRun(now)) {
                await this.enqueueJob(job);
            }
        }
    }

    /**
     * Schedules a job to run at regular intervals.
     * @param {Job} job - The job to schedule.
     * @private
     * @returns {Promise<void>} Resolves when the job is successfully enqueued.
     */
    private async scheduleIntervalJob(job: Job): Promise<void> {
        if (job.interval === null || job.interval <= 0) {
            await this.enqueueJob(job);
        } else {
            const intervalId = setInterval(async () => {
                if (job.isJobComplete && !job.repeat) {
                    clearInterval(intervalId);
                    this.logDebug(`Job ${job.id} has completed and will no longer be scheduled.`);
                } else if (!job.isJobRunning || job.allowConcurrent) {
                    await this.enqueueJob(job);
                } else {
                    this.logger?.warn(`Job ${job.id} is currently running and concurrent execution is disabled.`);
                }
            }, job.interval);
            this.jobTimers.set(job.id, intervalId);
        }
    }

    /**
     * Adds a job to the queue for processing.
     * @param {Job} job - The job to enqueue.
     * @private
     * @returns {Promise<void>} Resolves when the job is added to the queue.
     */
    private async enqueueJob(job: Job): Promise<void> {
        if (!this.jobQueue.includes(job)) {
            this.jobQueue.push(job);
            await this.processQueue();
        }
    }

    /**
     * Processes jobs in the queue based on the concurrency limit.
     * @private
     * @returns {Promise<void>} Resolves when all eligible jobs are processed.
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;

        try {
            while (this.jobQueue.length > 0 && this.runningJobs.size < this.maxConcurrentJobs) {
                const job = this.jobQueue.shift();
                if (job) {
                    if (job.allowConcurrent || !job.isJobRunning) {
                        this.executeJob(job);
                    } else {
                        this.logger?.warn(`Job ${job.id} is already running and concurrent execution is disabled.`);
                    }
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Executes a specified job, logging the result and updating job execution stats.
     * @param {Job} job - The job to execute.
     * @private
     * @returns {Promise<void>} Resolves when the job has completed execution.
     */
    private async executeJob(job: Job): Promise<void> {
        this.runningJobs.add(job.id);
        const context: JobContext = { jobId: job.id, logger: this.logger };

        this.logDebug(`Executing job ${job.id}`);
        const startTime = Date.now();
        const result = await job.run(context);
        const duration = Date.now() - startTime;

        this.store.saveJobResult(job.id, result, duration);

        if (result.success) {
            this.logDebug(`Job ${job.id} completed successfully in ${duration} ms`);
        } else {
            this.logger?.error(`Job ${job.id} failed in ${duration} ms: ${result.error}`);
        }

        this.runningJobs.delete(job.id);
        this.processQueue();
    }

    /**
     * Logs debug information if debug mode is enabled.
     * @param {string} message - The debug message to log.
     * @private
     */
    private logDebug(message: string): void {
        if (!this.debug) {
            return;
        }
        this.logger?.debug(message);
    }

    /**
     * Retrieves the execution history of a specified job.
     * @param {string} jobId - The unique identifier of the job whose history is requested.
     * @returns {JobExecutionStats|undefined} The job's execution history, or undefined if no history is available.
     */
    getJobHistory(jobId: string): JobExecutionStats | undefined {
        return this.store.getJobHistory(jobId);
    }
}
