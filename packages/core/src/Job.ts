import { shouldRunCron } from "./CronHelper";
import { JobContext, JobOptions, JobResult } from "./types";
import { TimeoutError } from "./TimeoutError";

/**
 * Represents a job that can be scheduled and executed with options for retry, timeout, and concurrency handling.
 * Provides methods to check cron schedule, execute with retries, and handle timeout scenarios.
 */
export class Job {
    private retriesLeft: number;
    private isComplete: boolean = false;
    private isRunning: boolean = false;

    /**
     * Creates an instance of the Job class.
     *
     * @param {string} id - Unique identifier for the job.
     * @param {(context: JobContext, params: any) => Promise<any>} jobFunction - The function to be executed as the job.
     * @param {JobOptions} options - Configuration options for the job, such as retries, timeout, and concurrency control.
     */
    constructor(public readonly id: string, private jobFunction: (context: JobContext, params: any) => Promise<any>, private options: JobOptions) {
        this.retriesLeft = options.retries || 0;
        this.options.repeat = options.repeat ?? true;
        this.options.allowConcurrent = options.allowConcurrent ?? false;
    }

    /**
     * Checks if the job should run based on its cron schedule.
     *
     * @param {Date} date - The date to evaluate against the cron expression.
     * @returns {boolean} Returns `true` if the job should run on the specified date, otherwise `false`.
     */
    shouldRun(date: Date): boolean {
        if (this.options.cron) {
            return shouldRunCron(this.options.cron, date);
        }

        return false;
    }

    /**
     * Executes the job with retry and timeout handling, updating its status and recording the outcome.
     *
     * @param {JobContext} context - Contextual information for the job execution, including logging.
     * @returns {Promise<JobResult>} A promise that resolves to the result of the job execution, containing success status and any result or error.
     */
    async run(context: JobContext): Promise<JobResult> {
        if (this.isComplete && !this.options.repeat) {
            context.logger?.warn(`Job ${context.jobId} is already complete.`);
            return { success: false, error: new Error(`Job ${context.jobId} is already complete and will not retry further.`) };
        }

        if (this.isRunning && !this.options.allowConcurrent) {
            context.logger?.warn(`Job ${context.jobId} is already running. Skipping this execution.`);
            return { success: false, error: new Error("Concurrent execution not allowed") };
        }

        this.isRunning = true;
        //this.retriesLeft = this.options.retries || 0;

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
                    if (error instanceof TimeoutError) {
                        context.logger?.error(`Job ${context.jobId} timed out.`);

                        return {
                            success: false,
                            error: new Error(error.message),
                        };
                    } else {
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
     * Executes the job function with a specified timeout.
     *
     * @private
     * @param {JobContext} context - Context for the job execution.
     * @returns {Promise<any>} A promise that resolves to the result of the job or rejects if the execution times out.
     *
     * @throws {TimeoutError} If the job execution exceeds the specified timeout duration.
     */
    private async executeWithTimeout(context: JobContext): Promise<any> {
        const timeout = this.options.timeout || 0;
        if (timeout <= 0) {
            return this.jobFunction(context, this.options.params);
        }

        let timeoutId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                context.abortController?.abort();
                reject(new TimeoutError(`Job ${context.jobId} timed out after ${timeout}ms`));
            }, timeout);

            context.abortController.signal.addEventListener("abort", () => clearTimeout(timeoutId));
        });

        try {
            return await Promise.race([this.jobFunction(context, this.options.params), timeoutPromise]);
        } finally {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
        }
    }

    /**
     * The execution interval for the job, or `null` if the job should only run once.
     *
     * @property {number | null} interval
     */
    get interval(): number | null {
        return this.options.interval;
    }

    /**
     * Indicates whether the job has completed all executions.
     *
     * @property {boolean} isJobComplete
     */
    get isJobComplete(): boolean {
        return this.isComplete;
    }

    /**
     * Indicates if the job is set to repeat after each completion.
     *
     * @property {boolean|undefined} repeat
     */
    get repeat(): boolean | undefined {
        return this.options.repeat;
    }

    /**
     * Indicates if the job is currently running.
     *
     * @property {boolean} isJobRunning
     */
    get isJobRunning(): boolean {
        return this.isRunning;
    }

    /**
     * Specifies if the job can be executed concurrently.
     *
     * @property {boolean|undefined} allowConcurrent
     */
    get allowConcurrent(): boolean | undefined {
        return this.options.allowConcurrent;
    }
}
