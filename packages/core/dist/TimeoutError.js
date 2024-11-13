"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = void 0;
/**
 * Custom error class representing a timeout error during an operation.
 * Extends the built-in Error class to provide a specific error type for timeouts.
 */
class TimeoutError extends Error {
    /**
     * Creates an instance of TimeoutError.
     *
     * @param {string} message - The error message describing the timeout.
     */
    constructor(message) {
        super(message);
        this.name = "TimeoutError";
    }
}
exports.TimeoutError = TimeoutError;
