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
 */
class InMemoryStore {
    constructor() {
        this.jobStats = new Map();
    }
    /**
     * Saves the result of a job execution, updating job statistics including success, failure, and duration.
     * @param {string} jobId - Unique identifier of the job.
     * @param {JobResult} result - The result of the job execution, including success status and any error details.
     * @param {number} duration - Duration of the job execution in milliseconds.
     * @returns {void} No return value.
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
            jobStat.executions.push({
                timestamp: new Date(),
                duration,
                result,
            });
            jobStat.totalDuration += duration;
            if (result.success) {
                jobStat.successCount += 1;
            }
            else {
                jobStat.failureCount += 1;
                if (result.error && result.error.message.includes("timed out")) {
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
     * @param {string} jobId - Unique identifier of the job to retrieve history for.
     * @returns {JobExecutionStats | undefined} The statistics and execution history of the job, or `undefined` if no history exists.
     */
    getJobHistory(jobId) {
        return Promise.resolve(this.jobStats.get(jobId));
    }
}
exports.InMemoryStore = InMemoryStore;
