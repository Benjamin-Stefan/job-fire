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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisStore = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisStore {
    /**
     * Constructor that optionally accepts a RedisOptions to establish a connection to Redis.
     * @param {RedisOptions} [redisOptions] - Optional redisOptions for Redis.
     * If not provided, a default Redis instance is created.
     */
    constructor(redisOptions) {
        if (redisOptions) {
            this.redisClient = new ioredis_1.default(redisOptions);
        }
        else {
            this.redisClient = new ioredis_1.default();
        }
    }
    /**
     * Stores the result of a job execution in Redis.
     * @param {string} jobId - The unique identifier of the job.
     * @param {JobResult} result - The result of the job execution, containing success status and any potential error messages.
     * @param {number} duration - The duration of the job execution in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the job result is successfully stored.
     */
    saveJobResult(jobId, result, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const jobStatKey = `job:${jobId}:stats`;
            const executionEntry = {
                timestamp: new Date().toISOString(),
                duration,
                result: JSON.stringify(result),
            };
            // Save the execution entry in a Redis list
            yield this.redisClient.rpush(`${jobStatKey}:executions`, JSON.stringify(executionEntry));
            // Update overall job statistics
            const stats = yield this.redisClient.hgetall(jobStatKey);
            const updatedStats = {
                jobId,
                successCount: (parseInt(stats.successCount, 10) || 0) + (result.success ? 1 : 0),
                failureCount: (parseInt(stats.failureCount, 10) || 0) + (result.success ? 0 : 1),
                timeoutCount: (parseInt(stats.timeoutCount, 10) || 0) + (((_b = (_a = result.error) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.includes("timed out")) ? 1 : 0),
                retryFailures: (parseInt(stats.retryFailures, 10) || 0) + (result.success || !result.error ? 0 : 1),
                totalDuration: (parseInt(stats.totalDuration, 10) || 0) + duration,
                executions: [],
            };
            yield this.redisClient.hmset(jobStatKey, {
                successCount: updatedStats.successCount.toString(),
                failureCount: updatedStats.failureCount.toString(),
                timeoutCount: updatedStats.timeoutCount.toString(),
                retryFailures: updatedStats.retryFailures.toString(),
                totalDuration: updatedStats.totalDuration.toString(),
            });
        });
    }
    /**
     * Retrieves the execution history and statistics for a given job.
     * @param {string} jobId - The unique identifier of the job.
     * @returns {Promise<JobExecutionStats | undefined>} The statistics and execution history of the job, or `undefined` if none exist.
     */
    getJobHistory(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobStatKey = `job:${jobId}:stats`;
            const stats = yield this.redisClient.hgetall(jobStatKey);
            if (!stats || Object.keys(stats).length === 0) {
                return undefined;
            }
            const executions = yield this.redisClient.lrange(`${jobStatKey}:executions`, 0, -1);
            const parsedExecutions = executions.map((exec) => JSON.parse(exec));
            return {
                jobId,
                successCount: parseInt(stats.successCount, 10) || 0,
                failureCount: parseInt(stats.failureCount, 10) || 0,
                timeoutCount: parseInt(stats.timeoutCount, 10) || 0,
                retryFailures: parseInt(stats.retryFailures, 10) || 0,
                totalDuration: parseInt(stats.totalDuration, 10) || 0,
                executions: parsedExecutions,
            };
        });
    }
}
exports.RedisStore = RedisStore;
