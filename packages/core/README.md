# Job-Fire

A powerful scheduler for Node.js applications, designed to manage and execute jobs with support for concurrency, cron and interval scheduling, logging, and optional storage.

## Features

-   **Concurrency Control**: Limit the number of concurrent job executions.
-   **Cron and Interval Scheduling**: Schedule jobs using cron expressions or fixed intervals.
-   **In-Memory Storage**: Store job statistics and results.
-   **Extensible Logging**: Integrate a custom logger for more control over logging.
-   **Retry Mechanism**: Automatically retry failed jobs.
-   **Timeout Support**: Set a timeout for each job execution.

## Installation

Install the module by running:

```bash
npm install job-fire
```

## 🚀 Usage

Here’s a quick example of how to use the package:

```typescript
import { Scheduler } from "job-fire";

const scheduler = new Scheduler();
scheduler.addJob(
    "myJob",
    () => {
        console.log("Job is running!");
    },
    { interval: 1000 }
);
```

## 🧪 Examples

Explore more examples in the [examples](./examples) folder.
For a deeper look, check out the [tests](./tests) folder.

## 📖 Documentation

### Scheduler

`new Scheduler(options: ScheduleOptions, logger?: ILogger)`

Creates a new instance of the Scheduler.

-   `options`: Configuration options for the scheduler, such as `maxConcurrentJobs` and `adapter`.
-   `logger`: An optional logger implementing the `ILogger` interface.

`addJob(id: string, jobFunction: (params: any, context: JobContext) => Promise<any>, options: JobOptions)`

Adds a new job, with either a cron-based or interval-based schedule.

-   `id`: Unique identifier for the job.
-   `jobFunction`: The function to execute for the job.
-   `options`: Options such as `interval`, `cron`, `retries`, and `allowConcurrent`.

`removeJob(id: string)`

Removes a job by its ID.

`getJobHistory(jobId: string): JobExecutionStats | undefined`

Returns the execution history of a specific job.

### JobOptions

-   `interval`: Execution interval in milliseconds.
-   `cron`: Cron expression for scheduled execution.
-   `retries`: Number of retry attempts in case of failure.
-   `timeout`: Maximum duration for job execution.
-   `allowConcurrent`: Allows concurrent execution of the job.

## 🤝 Contributing

Contributions are welcome! Please check out the [CONTRIBUTING.md](/CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](/CODE_OF_CONDUCT.md) for details.

## 📜 License

This project is licensed under the [MIT License](./LICENSE).
