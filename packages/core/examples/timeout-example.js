const { Scheduler } = require("../dist/Scheduler");

const SchedulerInstance = new Scheduler({ debug: true });

SchedulerInstance.addJob(
    "simpleJob1",
    async (context) => {
        console.log("my simple job 1 start");
        await new Promise((resolve) =>
            setTimeout(() => {
                if (context.abortController.signal.aborted) {
                    console.log("Aborted simpleJob1");
                    return resolve();
                }
                console.log("my simple job 1 end");
                resolve();
            }, 3000)
        );
    },
    { interval: 1000, timeout: 500 }
);

SchedulerInstance.addJob(
    "simpleJob2",
    async (context) => {
        console.log("my simple job 2 start");

        for (let i = 0; i < 1000; i++) {
            // Prüfen, ob das Signal zum Abbrechen gesendet wurde
            if (context.abortController.signal.aborted) {
                console.log("Aborted simpleJob2");
                break; // Bricht die Schleife ab
            }

            // Andernfalls die Aufgabe fortsetzen
            await new Promise((resolve) => setTimeout(resolve, 100));

            console.log("Iteration:", i, "my simple job 2 end");
        }
    },
    { interval: 1000, timeout: 500 }
);

setTimeout(async () => {
    printStats(await SchedulerInstance.getJobHistory("simpleJob1"));
    printStats(await SchedulerInstance.getJobHistory("simpleJob2"));

    SchedulerInstance.removeJob("simpleJob1");
    SchedulerInstance.removeJob("simpleJob2");

    // remove all
    SchedulerInstance.clearAllTimers();
}, 5000);

function printStats(stats) {
    console.log("Stats:", stats);
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
