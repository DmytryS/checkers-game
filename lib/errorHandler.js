export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.status = 404;
        this.name = 'NotFoundErrror';
        Error.captureStackTrace(this, 'NotFoundErrror');
    }
}

export class ValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.status = 400;
        this.name = 'ValidationError';
        this.details = details;
        Error.captureStackTrace(this, 'ValidationError');
    }
}

export class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.status = 500;
        this.name = 'DatabaseError';
    }
}

export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.status = 401;
        this.name = 'UnauthorizedError';
    }
}
