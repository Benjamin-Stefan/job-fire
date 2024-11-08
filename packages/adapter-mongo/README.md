# Job-Fire Mongo

A MongoDB adapter for the [Job-Fire](https://github.com/benjamin-stefan/job-fire) scheduler, enabling job execution history and statistics storage in Redis.

## Installation

Install the module by running:

```bash
npm install job-fire.mongo
```

## 🚀 Usage

Here’s a quick example of how to use the package:

```typescript
const { MongoStore } = require("job-fire.mongo");
const { Scheduler } = require("job-fire");

async function main() {
    // Connection details
    const uri = "mongodb://localhost:27017";
    const dbName = "jobFireDB";
    const collectionName = "jobExecutions";

    const store = new MongoStore(uri, dbName, collectionName);

    // Connect to MongoDB
    await store.connect();

    const scheduler = new Scheduler({ adapter: store });

    scheduler.addJob("job1", () => console.log("Job 1 executed"), { interval: 1000 });

    setInterval(async () => {
        scheduler.removeJob("job1");
        scheduler.clearAllTimers();

        const jobStats = await scheduler.getJobHistory("job1");
        console.log(jobStats);
    }, 2000);

    // Close the connection when done
    await store.close();
}

main().catch(console.error);
```

## 🧪 Examples

Explore more examples in the [examples](./examples) folder.

## 📖 Documentation

### MongoStore

`MongoStore` is an implementation of the `IJobStore` interface from `job-fire`, built on top of `mongodb`. This class provides functionality for storing job execution results and retrieving job statistics in MongoDB.

#### Constructor

```typescript
constructor(uri: string, dbName: string, collectionName: string);
```

-   `uri`: The connection URI for MongoDB.
-   `dbName`: The name of the database to use.
-   `collectionName`: The name of the collection where job data is stored.

#### Methods

-   `connect(): Promise<void>`
    -   Establishes a connection to the MongoDB instance.
    -   **Throws:** An error if the connection fails.
-   `close(): Promise<void>`
    -   Closes the connection to MongoDB.
    -   **Throws:** An error if closing the connection fails.

## 🤝 Contributing

Contributions are welcome! Please check out the [CONTRIBUTING.md](/CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](/CODE_OF_CONDUCT.md) for details.

## 📜 License

This project is licensed under the [MIT License](./LICENSE).

## 🔗 Links

-   [Job-Fire GitHub Repository](https://github.com/benjamin-stefan/job-fire)
-   [MongoDB Documentation](https://www.mongodb.com/docs/)
