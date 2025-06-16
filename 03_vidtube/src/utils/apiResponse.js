class apiResponse {
  constructor(statusCode, data, message = "Sucess") {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export default apiResponse;