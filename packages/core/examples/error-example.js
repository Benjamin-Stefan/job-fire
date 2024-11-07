const { Scheduler } = require("../dist/Scheduler");

const SchedulerInstance = new Scheduler();

// SchedulerInstance.addJob(
//     "simpleRetryErrorJob",
//     async () => {
//         console.log("error");
//         throw new Error("my simple retry error job start");
//     },
//     { interval: 5000, retries: 3 }
// );
function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time || 1000);
    });
}

SchedulerInstance.addJob(
    "simpleTimeoutJob",
    async (context) => {
        console.log(`my ${context.jobId} start`);
        await sleep(10000);
        console.log(`my ${context.jobId} end`);
    },
    { interval: 3000, timeout: 2000 }
);
