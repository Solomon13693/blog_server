class ErrorResponse extends Error {
  constructor(message, statusCode, error = null) {
    super(message);
    this.statusCode = statusCode;
    if (error) {
      this.error = error;
    }
  }
}

module.exports = ErrorResponse;
