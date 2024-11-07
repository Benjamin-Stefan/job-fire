const { Scheduler } = require("../dist/Scheduler");

const SchedulerInstance = new Scheduler({ debug: true });

SchedulerInstance.addJob(
    "simpleJob1",
    async () => {
        console.log("my simple job 1 start");
    },
    { interval: 1000 }
);

SchedulerInstance.addJob(
    "simpleJob2",
    async (context) => {
        console.log(`my ${context.jobId} start`);
    },
    { interval: 2000 }
);

SchedulerInstance.addJob(
    "simpleJob3",
    async (context, params) => {
        console.log(`my ${context.jobId} start with params: ${JSON.stringify(params)}`);
        if (params.remove) {
            SchedulerInstance.removeJob(context.jobId);
        }
    },
    { interval: 3000, params: { test: "test", remove: true } }
);

setTimeout(() => {
    printStats(SchedulerInstance.getJobHistory("simpleJob1"));
    printStats(SchedulerInstance.getJobHistory("simpleJob2"));
    printStats(SchedulerInstance.getJobHistory("simpleJob3"));

    SchedulerInstance.removeJob("simpleJob1");
    SchedulerInstance.removeJob("simpleJob2");

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
