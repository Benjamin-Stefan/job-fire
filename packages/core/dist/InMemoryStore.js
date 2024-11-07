"use strict";
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
    }
    /**
     * Retrieves the execution history and statistics for a specified job.
     * @param {string} jobId - Unique identifier of the job to retrieve history for.
     * @returns {JobExecutionStats | undefined} The statistics and execution history of the job, or `undefined` if no history exists.
     */
    getJobHistory(jobId) {
        return this.jobStats.get(jobId);
    }
}
exports.InMemoryStore = InMemoryStore;
