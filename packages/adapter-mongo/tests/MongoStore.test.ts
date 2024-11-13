import { MongoClient, Db, Collection, Document, InsertOneResult, UpdateResult, ObjectId } from "mongodb";
import { MongoStore } from "../src/MongoStore";
import { JobExecutionStats, JobResult } from "job-fire/src/types";

jest.mock("mongodb", () => {
    const originalModule = jest.requireActual("mongodb");
    return {
        ...originalModule,
        MongoClient: jest.fn().mockImplementation(() => ({
            connect: jest.fn().mockResolvedValue(undefined),
            db: jest.fn().mockReturnValue({
                collection: jest.fn(),
            }),
            close: jest.fn().mockResolvedValue(undefined),
        })),
    };
});

describe("MongoStore", () => {
    let mongoStore: MongoStore;
    let mockClient: jest.Mocked<MongoClient>;
    let mockDb: jest.Mocked<Db>;
    let mockCollection: jest.Mocked<Collection<JobExecutionStats>>;

    const uri = "mongodb://localhost:27017";
    const dbName = "testDb";
    const collectionName = "jobs";

    beforeEach(() => {
        mockClient = new MongoClient(uri) as jest.Mocked<MongoClient>;
        mockDb = { collection: jest.fn() } as unknown as jest.Mocked<Db>;
        mockCollection = {
            findOne: jest.fn(),
            insertOne: jest.fn(),
            updateOne: jest.fn(),
            find: jest.fn(),
            bulkWrite: jest.fn(),
        } as unknown as jest.Mocked<Collection<JobExecutionStats>>;

        mockDb.collection.mockReturnValue(mockCollection as unknown as Collection<Document>);
        mockClient.db.mockReturnValue(mockDb);

        mongoStore = new MongoStore(uri, dbName, collectionName);
        mongoStore["client"] = mockClient;
        mongoStore["db"] = mockDb;
        mongoStore["collection"] = mockCollection;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Connection Tests", () => {
        test("should connect to the MongoDB database", async () => {
            await mongoStore.connect();
            expect(mockClient.connect).toHaveBeenCalled();
        });

        test("should close the MongoDB connection", async () => {
            await mongoStore.close();
            expect(mockClient.close).toHaveBeenCalled();
        });
    });

    describe("Job Result Storage Tests", () => {
        test("should save a new job result", async () => {
            const jobId = "job1";
            const result: JobResult = { success: true };
            const duration = 1000;

            mockCollection.findOne.mockResolvedValue(null);
            mockCollection.insertOne.mockResolvedValue({
                insertedId: new ObjectId(),
                acknowledged: true,
            } as InsertOneResult<JobExecutionStats>);

            await mongoStore.saveJobResult(jobId, result, duration);

            expect(mockCollection.insertOne).toHaveBeenCalledWith({
                jobId,
                successCount: 1,
                failureCount: 0,
                timeoutCount: 0,
                retryFailures: 0,
                totalDuration: duration,
                executions: [
                    {
                        timestamp: expect.any(Date),
                        duration,
                        result,
                    },
                ],
            });
        });

        test("should update an existing job result", async () => {
            const jobId = "job1";
            const result: JobResult = {
                success: false,
                error: {
                    name: "CustomError",
                    message: "error",
                },
            };
            const duration = 1000;

            const existingJobStat: JobExecutionStats = {
                jobId,
                successCount: 1,
                failureCount: 0,
                timeoutCount: 0,
                retryFailures: 0,
                totalDuration: 500,
                executions: [],
            };

            mockCollection.findOne.mockResolvedValue(existingJobStat as unknown as Document);
            mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 } as UpdateResult);

            await mongoStore.saveJobResult(jobId, result, duration);

            expect(mockCollection.updateOne).toHaveBeenCalledWith(
                { jobId },
                {
                    $push: { executions: { timestamp: expect.any(Date), duration, result } },
                    $inc: {
                        totalDuration: duration,
                        successCount: 0,
                        failureCount: 1,
                        timeoutCount: 0,
                        retryFailures: 1,
                    },
                }
            );
        });

        // Edge case test for database error during saveJobResult
        test("should handle error if MongoDB fails during saveJobResult", async () => {
            const jobId = "job1";
            const result: JobResult = { success: true };
            const duration = 1000;

            mockCollection.findOne.mockRejectedValue(new Error("MongoDB error"));

            await expect(mongoStore.saveJobResult(jobId, result, duration)).rejects.toThrow("MongoDB error");
        });
    });

    describe("Job History Retrieval Tests", () => {
        test("should retrieve job history", async () => {
            const jobId = "job1";
            const jobStat: JobExecutionStats = {
                jobId,
                successCount: 1,
                failureCount: 0,
                timeoutCount: 0,
                retryFailures: 0,
                totalDuration: 500,
                executions: [],
            };

            mockCollection.findOne.mockResolvedValue(jobStat);

            const result = await mongoStore.getJobHistory(jobId);

            expect(result).toEqual(jobStat);
            expect(mockCollection.findOne).toHaveBeenCalledWith({ jobId });
        });

        test("should return null if no job history is found", async () => {
            const jobId = "nonexistentJob";

            mockCollection.findOne.mockResolvedValue(null);

            const result = await mongoStore.getJobHistory(jobId);

            expect(result).toBeUndefined();
            expect(mockCollection.findOne).toHaveBeenCalledWith({ jobId });
        });

        // Edge case test for database error during getJobHistory
        test("should handle error if MongoDB fails during getJobHistory", async () => {
            const jobId = "job1";
            mockCollection.findOne.mockRejectedValue(new Error("MongoDB error"));

            await expect(mongoStore.getJobHistory(jobId)).rejects.toThrow("MongoDB error");
        });
    });
});
