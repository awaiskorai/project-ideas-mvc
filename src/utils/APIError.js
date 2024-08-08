function APIError(
  statusCode = 500,
  message = "Something went wrong",
  errors = [],
  stack = ""
) {
  Error.call(this, message);
  this.name = this.constructor.name;

  this.statusCode = statusCode;
  this.data = null;
  this.success = false;
  this.message = message;
  this.errors = errors;

  if (!stack) {
    this.stack = Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = stack;
  }
}

APIError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: APIError,
    enumerable: true,
    configurable: true,
  },
});

export { APIError };
