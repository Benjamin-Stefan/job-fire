import { ILogger } from "./interfaces/ILogger";
/**
 * Logger class implementing the ILogger interface for standardized logging at different levels.
 */
export declare class Logger implements ILogger {
    /**
     * Logs an informational message.
     *
     * @param {string} message - The information to log.
     * @returns {void} No return value.
     */
    debug(message: string): void;
    /**
     * Logs a warning message.
     *
     * @param {string} message - The warning to log.
     * @returns {void} No return value.
     */
    warn(message: string): void;
    /**
     * Logs an error message.
     *
     * @param {string} message - The error to log.
     * @returns {void} No return value.
     */
    error(message: string): void;
}
