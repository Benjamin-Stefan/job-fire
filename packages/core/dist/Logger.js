"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/**
 * Logger class implementing the ILogger interface for standardized logging at different levels.
 */
class Logger {
    /**
     * Logs an informational message.
     * @param {string} message - The information to log.
     * @returns {void} No return value.
     */
    debug(message) {
        console.log(`[DEBUG] ${message}`);
    }
    /**
     * Logs a warning message.
     * @param {string} message - The warning to log.
     * @returns {void} No return value.
     */
    warn(message) {
        console.warn(`[WARN] ${message}`);
    }
    /**
     * Logs an error message.
     * @param {string} message - The error to log.
     * @returns {void} No return value.
     */
    error(message) {
        console.error(`[ERROR] ${message}`);
    }
}
exports.Logger = Logger;
