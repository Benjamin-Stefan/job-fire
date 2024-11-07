/**
 * Determines if a job should run at a given date and time based on a cron pattern.
 * @param {string} cronExpression - The cron expression representing the schedule, in the format "minute hour day month weekday".
 * @param {Date} date - The current date and time to check against the cron pattern.
 * @returns {boolean} `true` if the cron pattern matches the current date and time, `false` otherwise.
 */
export declare function shouldRunCron(cronExpression: string, date: Date): boolean;
