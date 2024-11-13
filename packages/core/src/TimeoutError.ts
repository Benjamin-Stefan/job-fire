/**
 * Custom error class representing a timeout error during an operation.
 * Extends the built-in Error class to provide a specific error type for timeouts.
 */
export class TimeoutError extends Error {
    /**
     * Creates an instance of TimeoutError.
     *
     * @param {string} message - The error message describing the timeout.
     */
    constructor(message: string) {
        super(message);
        this.name = "TimeoutError";
    }
}
