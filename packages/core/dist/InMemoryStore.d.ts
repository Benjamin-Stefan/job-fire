import { IJobStore } from "./interfaces/IJobStore";
import { JobExecutionStats, JobResult } from "./types";
/**
 * In-memory implementation of the IJobStore interface for storing and retrieving job execution statistics.
 * Provides methods to save job execution results and retrieve job history.
 */
export declare class InMemoryStore implements IJobStore {
    private jobStats;
    /**
     * Saves the result of a job execution, updating job statistics such as success, failure, and total duration.
     *
     * @param {string} jobId - Unique identifier of the job.
     * @param {JobResult} result - The result of the job execution, indicating success or failure and including any error details.
     * @param {number} duration - The duration of the job execution in milliseconds.
     * @returns {Promise<void>} A promise that resolves with no return value.
     */
    saveJobResult(jobId: string, result: JobResult, duration: number): Promise<void>;
    /**
     * Retrieves the execution history and statistics for a specified job.
     *
     * @param {string} jobId - Unique identifier of the job to retrieve the history for.
     * @returns {Promise<JobExecutionStats | undefined>} A promise that resolves to the job's execution statistics and history,
     * or `undefined` if no history exists for the given job ID.
     */
    getJobHistory(jobId: string): Promise<JobExecutionStats | undefined>;
}
