/**
 * Interface for logging messages at various levels of severity.
 * Defines methods for logging debug, warning, and error messages.
 */
export interface ILogger {
    /**
     * Logs a debug message, typically used for detailed troubleshooting information.
     *
     * @param {string} message - The debug message to log.
     * @returns {void} No return value.
     */
    debug(message: string): void;
    /**
     * Logs a warning message, indicating a potential issue or important notice.
     *
     * @param {string} message - The warning message to log.
     * @returns {void} No return value.
     */
    warn(message: string): void;
    /**
     * Logs an error message, indicating a failure or problem that needs attention.
     *
     * @param {string} message - The error message to log.
     * @returns {void} No return value.
     */
    error(message: string): void;
}
