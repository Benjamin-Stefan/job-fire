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
exports.InMemoryStore = void 0;
/**
 * In-memory implementation of the IJobStore interface for storing and retrieving job execution statistics.
 * Provides methods to save job execution results and retrieve job history.
 */
class InMemoryStore {
    constructor() {
        this.jobStats = new Map();
    }
    /**
     * Saves the result of a job execution, updating job statistics such as success, failure, and total duration.
     *
     * @param {string} jobId - Unique identifier of the job.
     * @param {JobResult} result - The result of the job execution, indicating success or failure and including any error details.
     * @param {number} duration - The duration of the job execution in milliseconds.
     * @returns {Promise<void>} A promise that resolves with no return value.
     */
    saveJobResult(jobId, result, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobStat = this.jobStats.get(jobId) || {
                jobId,
                successCount: 0,
                failureCount: 0,
                timeoutCount: 0,
                retryFailures: 0,
                totalDuration: 0,
                executions: [],
            };
            const serializedResult = Object.assign(Object.assign({}, result), { error: result.error instanceof Error ? { message: result.error.message, stack: result.error.stack } : result.error });
            jobStat.executions.push({
                timestamp: new Date(),
                duration,
                result: serializedResult,
            });
            jobStat.totalDuration += duration;
            if (result.success) {
                jobStat.successCount += 1;
            }
            else {
                jobStat.failureCount += 1;
                if (serializedResult.error && serializedResult.error.message.includes("timed out")) {
                    jobStat.timeoutCount += 1;
                }
                else {
                    jobStat.retryFailures += 1;
                }
            }
            this.jobStats.set(jobId, jobStat);
            return Promise.resolve();
        });
    }
    /**
     * Retrieves the execution history and statistics for a specified job.
     *
     * @param {string} jobId - Unique identifier of the job to retrieve the history for.
     * @returns {Promise<JobExecutionStats | undefined>} A promise that resolves to the job's execution statistics and history,
     * or `undefined` if no history exists for the given job ID.
     */
    getJobHistory(jobId) {
        return Promise.resolve(this.jobStats.get(jobId));
    }
}
exports.InMemoryStore = InMemoryStore;
