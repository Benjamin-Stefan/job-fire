const { Scheduler } = require("../dist/Scheduler");

const Logger = require("../dist/Logger");

const SchedulerInstance = new Scheduler({ debug: true }, new Logger());

SchedulerInstance.addJob(
    "simpleJob1",
    async () => {
        console.log("my simple job 1 start");
    },
    { interval: 1000 }
);

setTimeout(async () => {
    printStats(await SchedulerInstance.getJobHistory("simpleJob1"));

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
