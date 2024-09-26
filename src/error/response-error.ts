class ResponseError extends Error {
  constructor(
    public status: number,
    public statusCode: number,
    public message: string,
  ) {
    super(message);
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
  }
}

export { ResponseError };
