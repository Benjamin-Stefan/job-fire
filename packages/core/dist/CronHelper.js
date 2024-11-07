"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldRunCron = shouldRunCron;
const cron_parser_1 = __importDefault(require("cron-parser"));
/**
 * Determines if a job should run at a given date and time based on a cron pattern.
 * @param {string} cronExpression - The cron expression representing the schedule, in the format "minute hour day month weekday".
 * @param {Date} date - The current date and time to check against the cron pattern.
 * @returns {boolean} `true` if the cron pattern matches the current date and time, `false` otherwise.
 */
function shouldRunCron(cronExpression, date) {
    try {
        const interval = cron_parser_1.default.parseExpression(cronExpression, { currentDate: date });
        const nextDate = interval.next().toDate();
        return nextDate.getFullYear() === date.getFullYear() && nextDate.getMonth() === date.getMonth() && nextDate.getDate() === date.getDate() && nextDate.getHours() === date.getHours() && nextDate.getMinutes() === date.getMinutes();
    }
    catch (_a) {
        return false;
    }
}
