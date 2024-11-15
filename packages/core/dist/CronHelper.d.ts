/**
 * Determines if a job should execute at a specified date and time based on a cron expression.
 * Parses the cron expression and checks if the specified date matches the scheduled time.
 *
 * @param {string} cronExpression - The cron expression defining the schedule, in the format "minute hour day month weekday".
 * @param {Date} date - The date and time to check against the cron schedule.
 * @returns {boolean} Returns `true` if the cron pattern matches the specified date and time, otherwise `false`.
 */
export declare function shouldRunCron(cronExpression: string, date: Date): boolean;
/**
 * Containing predefined cron expressions for common scheduling intervals.
 *
 * @property {string} EveryMinute - Runs every minute. `"*\/1 * * * *"`
 * @property {string} Every2Minutes - Runs every two minutes. `"*\/2 * * * *"`
 * @property {string} Every5Minutes - Runs every five minutes. `"*\/5 * * * *"`
 * @property {string} Every10Minutes - Runs every ten minutes. `"*\/10 * * * *"`
 * @property {string} Every15Minutes - Runs every fifteen minutes. `"*\/15 * * * *"`
 * @property {string} Every30Minutes - Runs every thirty minutes. `"*\/30 * * * *"`
 * @property {string} EveryHour - Runs every hour. `"0 * * * *"`
 * @property {string} Every2Hours - Runs every two hours. `"0 *\/2 * * *"`
 * @property {string} Every6Hours - Runs every six hours. `"0 *\/6 * * *"`
 * @property {string} Every12Hours - Runs every twelve hours. `"0 *\/12 * * *"`
 * @property {string} EveryDay - Runs every day at midnight. `"0 0 * * *"`
 * @property {string} EveryWeekday - Runs every weekday at midnight. `"0 0 * * 1-5"`
 * @property {string} EveryWeekend - Runs every weekend at midnight. `"0 0 * * 6,0"`
 * @property {string} EverySunday - Runs every Sunday at midnight. `"0 0 * * 0"`
 * @property {string} EveryMonday - Runs every Monday at midnight. `"0 0 * * 1"`
 * @property {string} EveryTuesday - Runs every Tuesday at midnight. `"0 0 * * 2"`
 * @property {string} EveryWednesday - Runs every Wednesday at midnight. `"0 0 * * 3"`
 * @property {string} EveryThursday - Runs every Thursday at midnight. `"0 0 * * 4"`
 * @property {string} EveryFriday - Runs every Friday at midnight. `"0 0 * * 5"`
 * @property {string} EverySaturday - Runs every Saturday at midnight. `"0 0 * * 6"`
 * @property {string} EveryWeek - Runs every week on Sunday at midnight. `"0 0 * * 0"`
 * @property {string} EveryMonth - Runs every month on the first day at midnight. `"0 0 1 * *"`
 * @property {string} EveryQuarter - Runs every quarter on the first day at midnight. `"0 0 1 *\/3 *"`
 * @property {string} EveryYear - Runs every year on January 1st at midnight. `"0 0 1 1 *"`
 */
export declare const CronExpression: {
    EveryMinute: string;
    Every2Minutes: string;
    Every5Minutes: string;
    Every10Minutes: string;
    Every15Minutes: string;
    Every30Minutes: string;
    EveryHour: string;
    Every2Hours: string;
    Every6Hours: string;
    Every12Hours: string;
    EveryDay: string;
    EveryWeekday: string;
    EveryWeekend: string;
    EverySunday: string;
    EveryMonday: string;
    EveryTuesday: string;
    EveryWednesday: string;
    EveryThursday: string;
    EveryFriday: string;
    EverySaturday: string;
    EveryWeek: string;
    EveryMonth: string;
    EveryQuarter: string;
    EveryYear: string;
};
