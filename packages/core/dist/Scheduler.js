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
exports.Scheduler = void 0;
const Job_1 = require("./Job");
const Logger_1 = require("./Logger");
const InMemoryStore_1 = require("./InMemoryStore");
/**
 * Scheduler for managing and executing jobs with options for concurrency control and optional database storage.
 * Provides methods to add, remove, and manage scheduled and interval-based jobs.
 */
class Scheduler {
    /**
     * Constructs a new Scheduler instance with optional configuration for concurrency limits and debugging.
     *
     * @param {ScheduleOptions} options - Configuration options for scheduling jobs, including concurrency limits and storage options.
     * @param {ILogger} [logger=new Logger()] - Optional logger instance for logging messages; defaults to a new Logger instance if not provided.
     */
    constructor(options = {}, logger = new Logger_1.Logger()) {
        this.intervalJobs = new Map();
        this.cronJobs = new Map();
        this.jobQueue = [];
        this.runningJobs = new Set();
        this.isProcessing = false;
        this.activeTimers = [];
        this.jobTimers = new Map();
        this.debug = false;
        this.logger = logger;
        this.maxConcurrentJobs = options.maxConcurrentJobs || 10;
        this.store = options.adapter || new InMemoryStore_1.InMemoryStore();
        this.debug = options.debug || false;
        const mainInterval = setInterval(() => this.tick(), 1000);
        this.activeTimers.push(mainInterval);
    }
    /**
     * Clears all active timers, stopping all scheduled jobs.
     */
    clearAllTimers() {
        this.activeTimers.forEach((timer) => clearInterval(timer));
        this.activeTimers = [];
        this.jobTimers.forEach((jodId, timer) => clearInterval(timer));
        this.jobTimers = new Map();
    }
    /**
     * Adds a new job to the scheduler.
     *
     * @param {string} id - Unique identifier for the job.
     * @param {(context: JobContext, params: any) => Promise<any>} jobFunction - The function to execute for the job.
     * @param {JobOptions} options - Options specifying the job's behavior, including schedule, retry settings, and concurrency control.
     * @throws {Error} If a job with the given ID already exists.
     */
    addJob(id, jobFunction, options) {
        if (this.intervalJobs.has(id) || this.cronJobs.has(id)) {
            throw new Error(`Job with ID ${id} already exists`);
        }
        const job = new Job_1.Job(id, jobFunction, options);
        if (options.cron) {
            this.cronJobs.set(id, job);
            this.logDebug(`Scheduled Cron Job ${id} with pattern "${options.cron}"`);
        }
        else if (options.interval === null || (options.interval && options.interval > 0)) {
            this.intervalJobs.set(id, job);
            this.scheduleIntervalJob(job);
        }
        else {
            throw new Error("Job must specify either an interval or a cron pattern.");
        }
        this.processQueue();
    }
    /**
     * Removes a job from the scheduler.
     *
     * @param {string} id - Unique identifier for the job.
     * @throws {Error} If a job with the given ID does not exist.
     */
    removeJob(id) {
        if (this.jobTimers.has(id)) {
            clearInterval(this.jobTimers.get(id));
            this.jobTimers.delete(id);
        }
        if (this.intervalJobs.delete(id) || this.cronJobs.delete(id)) {
            this.logDebug(`Job with ID ${id} has been removed.`);
            return;
        }
        throw new Error(`Job with ID ${id} does not exist`);
    }
    /**
     * Executes all scheduled cron jobs at their designated intervals.
     * This method is called internally at regular intervals to trigger cron-based job executions.
     *
     * @private
     * @returns {Promise<void>} Resolves when all eligible jobs are enqueued.
     */
    tick() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            for (const job of this.cronJobs.values()) {
                if (job.shouldRun(now)) {
                    yield this.enqueueJob(job);
                }
            }
        });
    }
    /**
     * Schedules a job to run at regular intervals based on its specified interval property.
     *
     * @param {Job} job - The job to schedule.
     * @private
     * @returns {Promise<void>} Resolves when the job is successfully enqueued.
     */
    scheduleIntervalJob(job) {
        return __awaiter(this, void 0, void 0, function* () {
            if (job.interval === null || job.interval <= 0) {
                yield this.enqueueJob(job);
            }
            else {
                const intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    if (job.isJobComplete && !job.repeat) {
                        clearInterval(intervalId);
                        this.logDebug(`Job ${job.id} has completed and will no longer be scheduled.`);
                    }
                    else if (!job.isJobRunning || job.allowConcurrent) {
                        yield this.enqueueJob(job);
                    }
                    else {
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn(`Job ${job.id} is currently running and concurrent execution is disabled.`);
                    }
                }), job.interval);
                this.jobTimers.set(job.id, intervalId);
            }
        });
    }
    /**
     * Adds a job to the processing queue.
     *
     * @param {Job} job - The job to enqueue.
     * @private
     * @returns {Promise<void>} Resolves when the job is added to the queue.
     */
    enqueueJob(job) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.jobQueue.includes(job)) {
                this.jobQueue.push(job);
                yield this.processQueue();
            }
        });
    }
    /**
     * Processes jobs in the queue based on the maximum concurrency limit, executing eligible jobs.
     *
     * @private
     * @returns {Promise<void>} Resolves when all eligible jobs have been processed.
     */
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
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
                        }
                        else {
                            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn(`Job ${job.id} is already running and concurrent execution is disabled.`);
                        }
                    }
                }
            }
            finally {
                this.isProcessing = false;
            }
        });
    }
    /**
     * Executes a specified job, logging the outcome and updating execution statistics.
     *
     * @param {Job} job - The job to execute.
     * @private
     * @returns {Promise<void>} Resolves when the job has completed execution.
     */
    executeJob(job) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.runningJobs.add(job.id);
            const abortController = new AbortController();
            const context = { jobId: job.id, abortController: abortController, logger: this.logger };
            this.logDebug(`Executing job ${job.id}`);
            const startTime = Date.now();
            const result = yield job.run(context);
            const duration = Date.now() - startTime;
            this.store.saveJobResult(job.id, result, duration);
            if (result.success) {
                this.logDebug(`Job ${job.id} completed successfully in ${duration} ms`);
            }
            else {
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error(`Job ${job.id} failed in ${duration} ms: ${result.error}`);
            }
            this.runningJobs.delete(job.id);
            this.processQueue();
        });
    }
    /**
     * Logs debug information if debug mode is enabled.
     *
     * @param {string} message - The debug message to log.
     * @private
     */
    logDebug(message) {
        var _a;
        if (!this.debug) {
            return;
        }
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(message);
    }
    /**
     * Retrieves the execution history of a specified job.
     *
     * @param {string} jobId - The unique identifier of the job whose history is requested.
     * @returns {Promise<JobExecutionStats | undefined>} The job's execution history, or `undefined` if no history is available.
     */
    getJobHistory(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.store.getJobHistory(jobId);
        });
    }
}
exports.Scheduler = Scheduler;
