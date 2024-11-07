import { shouldRunCron } from "./CronHelper";
import { JobContext, JobOptions, JobResult } from "./types/custom";

/**
 * Represents a job that can be scheduled and executed with retry and concurrency options.
 * Provides functionality for setting retries, timeouts, and concurrency handling.
 */
export class Job {
    private retriesLeft: number;
    private isComplete: boolean = false;
    private isRunning: boolean = false;

    /**
     * Creates an instance of Job.
     * @param {string} id - Unique identifier for the job.
     * @param {(params: any, context: JobContext) => Promise<any>} jobFunction - The function to execute for the job.
     * @param {JobOptions} options - Configuration options for the job, such as retries, concurrency, and timeout.
     */
    constructor(public readonly id: string, private jobFunction: (context: JobContext, params: any) => Promise<any>, private options: JobOptions) {
        this.retriesLeft = options.retries || 0;
        this.options.repeat = options.repeat ?? true;
        this.options.allowConcurrent = options.allowConcurrent ?? false;
    }

    /**
     * Determines if the job should run based on a cron schedule.
     * @param {Date} date - The date to check for cron scheduling.
     * @returns {boolean} Returns `true` if the job should run at the given date, otherwise `false`.
     */
    shouldRun(date: Date): boolean {
        if (this.options.cron) {
            return shouldRunCron(this.options.cron, date);
        }

        return false;
    }

    /**
     * Executes the job with retry and timeout capabilities.
     * @param {JobContext} context - Context information for the job execution, including logging.
     * @returns {Promise<JobResult>} The result of the job execution, including success status and any result or error.
     */
    async run(context: JobContext): Promise<JobResult> {
        if (this.isComplete && !this.options.repeat) {
            context.logger?.warn(`Job ${context.jobId} is already complete.`);
            return {
                success: false,
                error: new Error(`Job ${context.jobId} is already complete and will not retry further.`),
            };
        }

        if (this.isRunning && !this.options.allowConcurrent) {
            context.logger?.warn(`Job ${context.jobId} is already running. Skipping this execution.`);
            return { success: false, error: new Error("Concurrent execution not allowed") };
        }

        this.isRunning = true;
        try {
            let retryCount = this.retriesLeft;
            while (retryCount >= 0) {
                try {
                    const result = await this.executeWithTimeout(context);

                    if (!this.options.repeat) {
                        this.isComplete = true;
                    }

                    return { success: true, result };
                } catch (error) {
                    context.logger?.error(`Job ${context.jobId} failed with error: ${error}. Retries left: ${retryCount}`);
                    if (retryCount > 0) {
                        context.logger?.warn(`Job ${context.jobId} retrying...`);
                        retryCount--;
                    } else {
                        context.logger?.warn(`Job ${context.jobId} failed after max retries`);
                        if (!this.options.repeat) {
                            this.isComplete = true;
                        }

                        return {
                            success: false,
                            error: error instanceof Error ? error : new Error(String(error)),
                        };
                    }
                }
            }
        } finally {
            this.isRunning = false;
        }

        if (!this.options.repeat) {
            this.isComplete = true;
        }

        return {
            success: false,
            error: new Error(`Job ${context.jobId} failed after max retries`),
        };
    }

    /**
     * Executes the job function with a timeout.
     * @private
     * @param {JobContext} context - Context for the job execution.
     * @returns {Promise<any>} Resolves with the job result or rejects if it times out.
     */
    private async executeWithTimeout(context: JobContext): Promise<any> {
        const timeout = this.options.timeout || 0;
        if (timeout <= 0) {
            return this.jobFunction(context, this.options.params);
        }

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`Job ${context.jobId} timed out after ${timeout}ms`)), timeout));
        return Promise.race([this.jobFunction(context, this.options.params), timeoutPromise]);
    }

    /**
     * The execution interval for the job, or `null` if it should only run once.
     * @property {number | null} interval
     */
    get interval(): number | null {
        return this.options.interval;
    }

    /**
     * Indicates if the job has completed.
     * @property {boolean} isJobComplete
     */
    get isJobComplete(): boolean {
        return this.isComplete;
    }

    /**
     * Determines if the job should repeat after completion.
     * @property {boolean|undefined} repeat
     */
    get repeat(): boolean | undefined {
        return this.options.repeat;
    }

    /**
     * Indicates if the job is currently running.
     * @property {boolean} isJobRunning
     */
    get isJobRunning(): boolean {
        return this.isRunning;
    }

    /**
     * Specifies if the job can be executed concurrently.
     * @property {boolean|undefined} allowConcurrent
     */
    get allowConcurrent(): boolean | undefined {
        return this.options.allowConcurrent;
    }
}
