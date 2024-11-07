const { Scheduler } = require("../dist/Scheduler");

const SchedulerInstance = new Scheduler();

SchedulerInstance.addJob(
    "simpleJob1",
    async () => {
        console.log("my simple job 1 start");
    },
    { cron: "*/2 * * * * *" }
);

setTimeout(() => {
    printStats(SchedulerInstance.getJobHistory("simpleJob1"));

    SchedulerInstance.removeJob("simpleJob1");

    // remove all
    SchedulerInstance.clearAllTimers();
}, 5000);

function printStats(stats) {
    const outPut = {
        jobId: stats.jobId,
        successCount: stats.successCount,
        totalDuration: stats.totalDuration,
        executions: [],
    };

    stats.executions.forEach((execution) => {
        outPut.executions.push({
            timestamp: execution.timestamp,
            duration: execution.duration,
            result: JSON.stringify(execution.result),
        });
    });

    console.log(outPut);
}
