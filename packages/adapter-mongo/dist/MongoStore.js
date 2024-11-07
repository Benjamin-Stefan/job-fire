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
exports.MongoStore = void 0;
const mongodb_1 = require("mongodb");
class MongoStore {
    /**
     * Constructor that establishes a connection to a MongoDB instance.
     * @param {string} uri - The connection URI for MongoDB.
     * @param {string} dbName - The name of the database to use.
     * @param {string} collectionName - The name of the collection where job data is stored.
     */
    constructor(uri, dbName, collectionName) {
        this.client = new mongodb_1.MongoClient(uri);
        this.db = this.client.db(dbName);
        this.collection = this.db.collection(collectionName);
    }
    /**
     * Connects to the MongoDB database.
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     * @throws Will throw an error if the connection fails.
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.connect();
        });
    }
    /**
     * Stores the result of a job execution in MongoDB.
     * @param {string} jobId - The unique identifier of the job.
     * @param {JobResult} result - The result of the job execution.
     * @param {number} duration - The duration of the job execution in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the job result is successfully stored.
     */
    saveJobResult(jobId, result, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const jobStat = yield this.collection.findOne({ jobId });
            const executionEntry = {
                timestamp: new Date(),
                duration,
                result,
            };
            const isTimeout = (_c = (_b = (_a = result.error) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.includes("timed out")) !== null && _c !== void 0 ? _c : false;
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
                yield this.collection.updateOne({ jobId }, updateFields);
            }
            else {
                const newJobStat = {
                    jobId,
                    successCount: result.success ? 1 : 0,
                    failureCount: result.success ? 0 : 1,
                    timeoutCount: isTimeout ? 1 : 0,
                    retryFailures: retryFailure,
                    totalDuration: duration,
                    executions: [executionEntry],
                };
                yield this.collection.insertOne(newJobStat);
            }
        });
    }
    /**
     * Retrieves the execution history and statistics for a specified job.
     * @param {string} jobId - The unique identifier of the job.
     * @returns {Promise<JobExecutionStats | undefined>} The job statistics or `undefined` if not found.
     */
    getJobHistory(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobStat = yield this.collection.findOne({ jobId });
            return jobStat || undefined;
        });
    }
    /**
     * Closes the connection to MongoDB.
     * @returns {Promise<void>} A promise that resolves when the connection is closed.
     * @throws Will throw an error if closing the connection fails.
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.close();
        });
    }
}
exports.MongoStore = MongoStore;
