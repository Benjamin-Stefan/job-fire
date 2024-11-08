/**
 * Interface for logging messages at various levels.
 */
export interface ILogger {
    /**
     * Logs an debug message.
     * @param {string} message - The debug to log.
     * @returns {void} No return value.
     */
    debug(message: string): void;
    /**
     * Logs a warning message.
     * @param {string} message - The warning to log.
     * @returns {void} No return value.
     */
    warn(message: string): void;
    /**
     * Logs an error message.
     * @param {string} message - The error to log.
     * @returns {void} No return value.
     */
    error(message: string): void;
}
