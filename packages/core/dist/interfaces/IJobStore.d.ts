import { JobExecutionStats, JobResult } from "../types";
/**
 * Interface for storing and retrieving job execution results and statistics.
 */
export interface IJobStore {
    /**
     * Saves the result of a job execution, including its duration.
     * @param {string} jobId - Unique identifier of the job.
     * @param {JobResult} result - The result of the job execution, including success status and error if any.
     * @param {number} duration - Duration of the job execution in milliseconds.
     * @returns {void} No return value.
     */
    saveJobResult(jobId: string, result: JobResult, duration: number): Promise<void>;
    /**
     * Retrieves the execution history and statistics of a specified job.
     * @param {string} jobId - Unique identifier of the job.
     * @returns {JobExecutionStats | undefined} The job execution statistics, or `undefined` if no history exists.
     */
    getJobHistory(jobId: string): Promise<JobExecutionStats | undefined>;
}
