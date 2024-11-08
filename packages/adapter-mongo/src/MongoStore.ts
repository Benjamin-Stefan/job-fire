import { MongoClient, Collection, Db } from "mongodb";
import { JobExecutionStats, JobResult } from "job-fire/src/types";
import { IJobStore } from "job-fire/src/interfaces/IJobStore";

export class MongoStore implements IJobStore {
    private client: MongoClient;
    private db: Db;
    private collection: Collection<JobExecutionStats>;

    /**
     * Constructor that establishes a connection to a MongoDB instance.
     * @param {string} uri - The connection URI for MongoDB.
     * @param {string} dbName - The name of the database to use.
     * @param {string} collectionName - The name of the collection where job data is stored.
     */
    constructor(uri: string, dbName: string, collectionName: string) {
        this.client = new MongoClient(uri);
        this.db = this.client.db(dbName);
        this.collection = this.db.collection<JobExecutionStats>(collectionName);
    }

    /**
     * Connects to the MongoDB database.
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     * @throws Will throw an error if the connection fails.
     */
    async connect(): Promise<void> {
        await this.client.connect();
    }

    /**
     * Stores the result of a job execution in MongoDB.
     * @param {string} jobId - The unique identifier of the job.
     * @param {JobResult} result - The result of the job execution.
     * @param {number} duration - The duration of the job execution in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the job result is successfully stored.
     */
    async saveJobResult(jobId: string, result: JobResult, duration: number): Promise<void> {
        const jobStat = await this.collection.findOne({ jobId });

        const executionEntry = {
            timestamp: new Date(),
            duration,
            result,
        };

        const isTimeout = result.error?.message?.includes("timed out") ?? false;
        const retryFailure = result.success || !result.error ? 0 : 1;

        if (jobStat) {
            const updateFields = {
                $push: { executions: executionEntry },
                $inc: {
                    totalDuration: duration,
                    successCount: result.success ? 1 : 0,
                    failureCount: result.success ? 0 : 1,
                    timeoutCount: isTimeout ? 1 : 0,
                    retryFailures: retryFailure,
                },
            };
            await this.collection.updateOne({ jobId }, updateFields);
        } else {
            const newJobStat: JobExecutionStats = {
                jobId,
                successCount: result.success ? 1 : 0,
                failureCount: result.success ? 0 : 1,
                timeoutCount: isTimeout ? 1 : 0,
                retryFailures: retryFailure,
                totalDuration: duration,
                executions: [executionEntry],
            };
            await this.collection.insertOne(newJobStat);
        }
    }

    /**
     * Retrieves the execution history and statistics for a specified job.
     * @param {string} jobId - The unique identifier of the job.
     * @returns {Promise<JobExecutionStats | undefined>} The job statistics or `undefined` if not found.
     */
    async getJobHistory(jobId: string): Promise<JobExecutionStats | undefined> {
        const jobStat = await this.collection.findOne({ jobId });
        return jobStat || undefined;
    }

    /**
     * Closes the connection to MongoDB.
     * @returns {Promise<void>} A promise that resolves when the connection is closed.
     * @throws Will throw an error if closing the connection fails.
     */
    async close(): Promise<void> {
        await this.client.close();
    }
}
