class ResponseError extends Error {
  constructor(
    public status: string,
    public statusCode: number,
    public message: any,
  ) {
    super(message);
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
  }
}

export { ResponseError };
