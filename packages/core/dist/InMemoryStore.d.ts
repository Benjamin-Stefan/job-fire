import { JobExecutionStats, IJobStore, JobResult } from "./types/custom";
/**
 * In-memory implementation of the IJobStore interface for storing and retrieving job execution statistics.
 */
export declare class InMemoryStore implements IJobStore {
    private jobStats;
    /**
     * Saves the result of a job execution, updating job statistics including success, failure, and duration.
     * @param {string} jobId - Unique identifier of the job.
     * @param {JobResult} result - The result of the job execution, including success status and any error details.
     * @param {number} duration - Duration of the job execution in milliseconds.
     * @returns {void} No return value.
     */
    saveJobResult(jobId: string, result: JobResult, duration: number): Promise<void>;
    /**
     * Retrieves the execution history and statistics for a specified job.
     * @param {string} jobId - Unique identifier of the job to retrieve history for.
     * @returns {JobExecutionStats | undefined} The statistics and execution history of the job, or `undefined` if no history exists.
     */
    getJobHistory(jobId: string): Promise<JobExecutionStats | undefined>;
}
