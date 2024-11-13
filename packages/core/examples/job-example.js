const { Job } = require("../dist/Job");

async function main() {
    const jobFunction = async () => {
        console.log("my simple job 1 start");
    };

    const options = {
        interval: null,
        retries: 3,
        timeout: 1000,
        params: {},
        repeat: false,
        allowConcurrent: false,
    };

    const job = new Job("test-job", jobFunction, options);
    const result = await job.run();

    console.log(result);
}

main().catch(console.error);
