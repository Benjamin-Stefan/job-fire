import { IJobStore } from "./interfaces/IJobStore";
import { JobExecutionStats, JobResult, SerializedError } from "./types";

/**
 * In-memory implementation of the IJobStore interface for storing and retrieving job execution statistics.
 * Provides methods to save job execution results and retrieve job history.
 */
export class InMemoryStore implements IJobStore {
    private jobStats: Map<string, JobExecutionStats> = new Map();

    /**
     * Saves the result of a job execution, updating job statistics such as success, failure, and total duration.
     *
     * @param {string} jobId - Unique identifier of the job.
     * @param {JobResult} result - The result of the job execution, indicating success or failure and including any error details.
     * @param {number} duration - The duration of the job execution in milliseconds.
     * @returns {Promise<void>} A promise that resolves with no return value.
     */
    async saveJobResult(jobId: string, result: JobResult, duration: number): Promise<void> {
        const jobStat = this.jobStats.get(jobId) || {
            jobId,
            successCount: 0,
            failureCount: 0,
            timeoutCount: 0,
            retryFailures: 0,
            totalDuration: 0,
            executions: [],
        };

        const serializedResult: JobResult = {
            ...result,
            error: result.error instanceof Error ? { message: result.error.message, stack: result.error.stack } : result.error,
        };

        jobStat.executions.push({
            timestamp: new Date(),
            duration,
            result: serializedResult,
        });

        jobStat.totalDuration += duration;

        if (result.success) {
            jobStat.successCount += 1;
        } else {
            jobStat.failureCount += 1;
            if (serializedResult.error && (serializedResult.error as SerializedError).message.includes("timed out")) {
                jobStat.timeoutCount += 1;
            } else {
                jobStat.retryFailures += 1;
            }
        }

        this.jobStats.set(jobId, jobStat);
        return Promise.resolve();
    }

    /**
     * Retrieves the execution history and statistics for a specified job.
     *
     * @param {string} jobId - Unique identifier of the job to retrieve the history for.
     * @returns {Promise<JobExecutionStats | undefined>} A promise that resolves to the job's execution statistics and history,
     * or `undefined` if no history exists for the given job ID.
     */
    getJobHistory(jobId: string): Promise<JobExecutionStats | undefined> {
        return Promise.resolve(this.jobStats.get(jobId));
    }
}
