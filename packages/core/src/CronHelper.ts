import cronParser from "cron-parser";

/**
 * Determines if a job should run at a given date and time based on a cron pattern.
 * @param {string} cronExpression - The cron expression representing the schedule, in the format "minute hour day month weekday".
 * @param {Date} date - The current date and time to check against the cron pattern.
 * @returns {boolean} `true` if the cron pattern matches the current date and time, `false` otherwise.
 */
export function shouldRunCron(cronExpression: string, date: Date): boolean {
    try {
        const interval = cronParser.parseExpression(cronExpression, { currentDate: date });
        const nextDate = interval.next().toDate();

        return nextDate.getFullYear() === date.getFullYear() && nextDate.getMonth() === date.getMonth() && nextDate.getDate() === date.getDate() && nextDate.getHours() === date.getHours() && nextDate.getMinutes() === date.getMinutes();
    } catch {
        return false;
    }
}
