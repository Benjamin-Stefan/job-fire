import { JobExecutionStats, JobResult } from "../types";
/**
 * Interface for storing and retrieving job execution results and statistics.
 * Defines methods to save execution results and retrieve the historical statistics of jobs.
 */
export interface IJobStore {
    /**
     * Saves the result of a job execution, recording its duration and success or failure details.
     *
     * @param {string} jobId - Unique identifier of the job.
     * @param {JobResult} result - The result of the job execution, including success status and any error details.
     * @param {number} duration - The duration of the job execution in milliseconds.
     * @returns {Promise<void>} A promise that resolves with no return value.
     */
    saveJobResult(jobId: string, result: JobResult, duration: number): Promise<void>;
    /**
     * Retrieves the execution history and statistics for a specified job.
     *
     * @param {string} jobId - Unique identifier of the job to retrieve statistics for.
     * @returns {Promise<JobExecutionStats | undefined>} A promise that resolves to the job's execution statistics,
     * or `undefined` if no history is available for the specified job ID.
     */
    getJobHistory(jobId: string): Promise<JobExecutionStats | undefined>;
}
