import cronParser from "cron-parser";

/**
 * Determines if a job should execute at a specified date and time based on a cron expression.
 * Parses the cron expression and checks if the specified date matches the scheduled time.
 *
 * @param {string} cronExpression - The cron expression defining the schedule, in the format "minute hour day month weekday".
 * @param {Date} date - The date and time to check against the cron schedule.
 * @returns {boolean} Returns `true` if the cron pattern matches the specified date and time, otherwise `false`.
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
