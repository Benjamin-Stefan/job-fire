const { MongoStore } = require("../dist/index.js");
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

        // Close the connection when done
        await store.close();
    }, 2000);
}

main().catch(console.error);
