# Job-Fire Redis

A Redis adapter for the [Job-Fire](https://github.com/benjamin-stefan/job-fire) scheduler, enabling job execution history and statistics storage in Redis.

## Installation

Install the module by running:

```bash
npm install job-fire.redis
```

## 🚀 Usage

Here’s a quick example of how to use the package:

```typescript
const { RedisStore } = require("job-fire.redis");
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
```

## 🧪 Examples

Explore more examples in the [examples](./examples) folder.

## 📖 Documentation

### RedisStore

`RedisStore` is an implementation of the `IJobStore` interface from `job-fire`, built on top of `ioredis`. This class provides functionality for storing job execution results and retrieving job statistics.

#### Constructor

```typescript
constructor(redisOptions?: RedisOptions);
```

-   `redisOptions` (optional): Configuration options for the Redis client as defined by the `RedisOptions` type from `ioredis`.
-   If no options are provided, the constructor will attempt to connect to Redis using the default configuration.

## 🤝 Contributing

Contributions are welcome! Please check out the [CONTRIBUTING.md](/CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](/CODE_OF_CONDUCT.md) for details.

## 📜 License

This project is licensed under the [MIT License](./LICENSE).

## 🔗 Links

-   [Job-Fire GitHub Repository](https://github.com/benjamin-stefan/job-fire)
-   [ioredis Documentation](https://github.com/redis/ioredis)
