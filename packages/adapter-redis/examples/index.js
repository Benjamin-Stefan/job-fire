const { RedisStore } = require("../dist/index.js");
const { Scheduler } = require("job-fire");

async function main() {
    // RedisStore options are the same as ioredis options (RedisOptions type from ioredis)
    // {
    //     port: 6379, // Redis port
    //     host: "127.0.0.1", // Redis host
    //     username: "default", // needs Redis >= 6
    //     password: "my-top-secret",
    //     db: 0, // Defaults to 0
    // }
    const store = new RedisStore();

    const scheduler = new Scheduler({ adapter: store });

    scheduler.addJob("job1", () => console.log("Job 1 executed"), { interval: 1000 });

    setInterval(async () => {
        scheduler.removeJob("job1");
        scheduler.clearAllTimers();

        const jobStats = await scheduler.getJobHistory("job1");
        console.log(jobStats);
    }, 2000);
}

main().catch(console.error);
