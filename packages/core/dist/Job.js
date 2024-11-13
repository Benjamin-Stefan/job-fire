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
const TimeoutError_1 = require("./TimeoutError");
/**
 * Represents a job that can be scheduled and executed with options for retry, timeout, and concurrency handling.
 * Provides methods to check cron schedule, execute with retries, and handle timeout scenarios.
 */
class Job {
    /**
     * Creates an instance of the Job class.
     *
     * @param {string} id - Unique identifier for the job.
     * @param {(context: JobContext, params: any) => Promise<any>} jobFunction - The function to be executed as the job.
     * @param {JobOptions} options - Configuration options for the job, such as retries, timeout, and concurrency control.
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
     * Checks if the job should run based on its cron schedule.
     *
     * @param {Date} date - The date to evaluate against the cron expression.
     * @returns {boolean} Returns `true` if the job should run on the specified date, otherwise `false`.
     */
    shouldRun(date) {
        if (this.options.cron) {
            return (0, CronHelper_1.shouldRunCron)(this.options.cron, date);
        }
        return false;
    }
    /**
     * Executes the job with retry and timeout handling, updating its status and recording the outcome.
     *
     * @param {JobContext} context - Contextual information for the job execution, including logging.
     * @returns {Promise<JobResult>} A promise that resolves to the result of the job execution, containing success status and any result or error.
     */
    run(context) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            if (this.isComplete && !this.options.repeat) {
                (_a = context.logger) === null || _a === void 0 ? void 0 : _a.warn(`Job ${context.jobId} is already complete.`);
                return { success: false, error: new Error(`Job ${context.jobId} is already complete and will not retry further.`) };
            }
            if (this.isRunning && !this.options.allowConcurrent) {
                (_b = context.logger) === null || _b === void 0 ? void 0 : _b.warn(`Job ${context.jobId} is already running. Skipping this execution.`);
                return { success: false, error: new Error("Concurrent execution not allowed") };
            }
            this.isRunning = true;
            //this.retriesLeft = this.options.retries || 0;
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
                        if (error instanceof TimeoutError_1.TimeoutError) {
                            (_c = context.logger) === null || _c === void 0 ? void 0 : _c.error(`Job ${context.jobId} timed out.`);
                            return {
                                success: false,
                                error: new Error(error.message),
                            };
                        }
                        else {
                            (_d = context.logger) === null || _d === void 0 ? void 0 : _d.error(`Job ${context.jobId} failed with error: ${error}. Retries left: ${retryCount}`);
                            if (retryCount > 0) {
                                (_e = context.logger) === null || _e === void 0 ? void 0 : _e.warn(`Job ${context.jobId} retrying...`);
                                retryCount--;
                            }
                            else {
                                (_f = context.logger) === null || _f === void 0 ? void 0 : _f.warn(`Job ${context.jobId} failed after max retries`);
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
     * Executes the job function with a specified timeout.
     *
     * @private
     * @param {JobContext} context - Context for the job execution.
     * @returns {Promise<any>} A promise that resolves to the result of the job or rejects if the execution times out.
     *
     * @throws {TimeoutError} If the job execution exceeds the specified timeout duration.
     */
    executeWithTimeout(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeout = this.options.timeout || 0;
            if (timeout <= 0) {
                return this.jobFunction(context, this.options.params);
            }
            let timeoutId;
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    var _a;
                    (_a = context.abortController) === null || _a === void 0 ? void 0 : _a.abort();
                    reject(new TimeoutError_1.TimeoutError(`Job ${context.jobId} timed out after ${timeout}ms`));
                }, timeout);
                context.abortController.signal.addEventListener("abort", () => clearTimeout(timeoutId));
            });
            try {
                return yield Promise.race([this.jobFunction(context, this.options.params), timeoutPromise]);
            }
            finally {
                if (timeoutId !== undefined) {
                    clearTimeout(timeoutId);
                }
            }
        });
    }
    /**
     * The execution interval for the job, or `null` if the job should only run once.
     *
     * @property {number | null} interval
     */
    get interval() {
        return this.options.interval;
    }
    /**
     * Indicates whether the job has completed all executions.
     *
     * @property {boolean} isJobComplete
     */
    get isJobComplete() {
        return this.isComplete;
    }
    /**
     * Indicates if the job is set to repeat after each completion.
     *
     * @property {boolean|undefined} repeat
     */
    get repeat() {
        return this.options.repeat;
    }
    /**
     * Indicates if the job is currently running.
     *
     * @property {boolean} isJobRunning
     */
    get isJobRunning() {
        return this.isRunning;
    }
    /**
     * Specifies if the job can be executed concurrently.
     *
     * @property {boolean|undefined} allowConcurrent
     */
    get allowConcurrent() {
        return this.options.allowConcurrent;
    }
}
exports.Job = Job;
