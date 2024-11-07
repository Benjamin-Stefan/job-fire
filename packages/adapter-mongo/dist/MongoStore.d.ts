import { IJobStore, JobExecutionStats, JobResult } from "job-fire/src/types/custom";
export declare class MongoStore implements IJobStore {
    private client;
    private db;
    private collection;
    /**
     * Constructor that establishes a connection to a MongoDB instance.
     * @param {string} uri - The connection URI for MongoDB.
     * @param {string} dbName - The name of the database to use.
     * @param {string} collectionName - The name of the collection where job data is stored.
     */
    constructor(uri: string, dbName: string, collectionName: string);
    /**
     * Connects to the MongoDB database.
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     * @throws Will throw an error if the connection fails.
     */
    connect(): Promise<void>;
    /**
     * Stores the result of a job execution in MongoDB.
     * @param {string} jobId - The unique identifier of the job.
     * @param {JobResult} result - The result of the job execution.
     * @param {number} duration - The duration of the job execution in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the job result is successfully stored.
     */
    saveJobResult(jobId: string, result: JobResult, duration: number): Promise<void>;
    /**
     * Retrieves the execution history and statistics for a specified job.
     * @param {string} jobId - The unique identifier of the job.
     * @returns {Promise<JobExecutionStats | undefined>} The job statistics or `undefined` if not found.
     */
    getJobHistory(jobId: string): Promise<JobExecutionStats | undefined>;
    /**
     * Closes the connection to MongoDB.
     * @returns {Promise<void>} A promise that resolves when the connection is closed.
     * @throws Will throw an error if closing the connection fails.
     */
    close(): Promise<void>;
}
