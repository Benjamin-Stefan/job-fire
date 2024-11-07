"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const CronHelper_1 = require("./CronHelper");
/**
 * Represents a job that can be scheduled and executed with retry and concurrency options.
 * Provides functionality for setting retries, timeouts, and concurrency handling.
 */
class Job {
    /**
     * Creates an instance of Job.
     * @param {string} id - Unique identifier for the job.
     * @param {(params: any, context: JobContext) => Promise<any>} jobFunction - The function to execute for the job.
     * @param {JobOptions} options - Configuration options for the job, such as retries, concurrency, and timeout.
     */
    constructor(id, jobFunction, options) {
        var _a, _b;
        this.id = id;
        this.jobFunction = jobFunction;
        this.options = options;
        this.isComplete = false;
        this.isRunning = false;
        this.retriesLeft = options.retries || 0;
        this.options.repeat = (_a = options.repeat) !== null && _a !== void 0 ? _a : true;
        this.options.allowConcurrent = (_b = options.allowConcurrent) !== null && _b !== void 0 ? _b : false;
    }
    /**
     * Determines if the job should run based on a cron schedule.
     * @param {Date} date - The date to check for cron scheduling.
     * @returns {boolean} Returns `true` if the job should run at the given date, otherwise `false`.
     */
    shouldRun(date) {
        if (this.options.cron) {
            return (0, CronHelper_1.shouldRunCron)(this.options.cron, date);
        }
        return false;
    }
    /**
     * Executes the job with retry and timeout capabilities.
     * @param {JobContext} context - Context information for the job execution, including logging.
     * @returns {Promise<JobResult>} The result of the job execution, including success status and any result or error.
     */
    run(context) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            if (this.isComplete && !this.options.repeat) {
                (_a = context.logger) === null || _a === void 0 ? void 0 : _a.warn(`Job ${context.jobId} is already complete.`);
                return {
                    success: false,
                    error: new Error(`Job ${context.jobId} is already complete and will not retry further.`),
                };
            }
            if (this.isRunning && !this.options.allowConcurrent) {
                (_b = context.logger) === null || _b === void 0 ? void 0 : _b.warn(`Job ${context.jobId} is already running. Skipping this execution.`);
                return { success: false, error: new Error("Concurrent execution not allowed") };
            }
            this.isRunning = true;
            try {
                let retryCount = this.retriesLeft;
                while (retryCount >= 0) {
                    try {
                        const result = yield this.executeWithTimeout(context);
                        if (!this.options.repeat) {
                            this.isComplete = true;
                        }
                        return { success: true, result };
                    }
                    catch (error) {
                        (_c = context.logger) === null || _c === void 0 ? void 0 : _c.error(`Job ${context.jobId} failed with error: ${error}. Retries left: ${retryCount}`);
                        if (retryCount > 0) {
                            (_d = context.logger) === null || _d === void 0 ? void 0 : _d.warn(`Job ${context.jobId} retrying...`);
                            retryCount--;
                        }
                        else {
                            (_e = context.logger) === null || _e === void 0 ? void 0 : _e.warn(`Job ${context.jobId} failed after max retries`);
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
            finally {
                this.isRunning = false;
            }
            if (!this.options.repeat) {
                this.isComplete = true;
            }
            return {
                success: false,
                error: new Error(`Job ${context.jobId} failed after max retries`),
            };
        });
    }
    /**
     * Executes the job function with a timeout.
     * @private
     * @param {JobContext} context - Context for the job execution.
     * @returns {Promise<any>} Resolves with the job result or rejects if it times out.
     */
    executeWithTimeout(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeout = this.options.timeout || 0;
            if (timeout <= 0) {
                return this.jobFunction(context, this.options.params);
            }
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`Job ${context.jobId} timed out after ${timeout}ms`)), timeout));
            return Promise.race([this.jobFunction(context, this.options.params), timeoutPromise]);
        });
    }
    /**
     * The execution interval for the job, or `null` if it should only run once.
     * @property {number | null} interval
     */
    get interval() {
        return this.options.interval;
    }
    /**
     * Indicates if the job has completed.
     * @property {boolean} isJobComplete
     */
    get isJobComplete() {
        return this.isComplete;
    }
    /**
     * Determines if the job should repeat after completion.
     * @property {boolean|undefined} repeat
     */
    get repeat() {
        return this.options.repeat;
    }
    /**
     * Indicates if the job is currently running.
     * @property {boolean} isJobRunning
     */
    get isJobRunning() {
        return this.isRunning;
    }
    /**
     * Specifies if the job can be executed concurrently.
     * @property {boolean|undefined} allowConcurrent
     */
    get allowConcurrent() {
        return this.options.allowConcurrent;
    }
}
exports.Job = Job;
