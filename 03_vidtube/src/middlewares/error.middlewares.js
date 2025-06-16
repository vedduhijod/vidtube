import mongoose from "mongoose";
import apiError from "../utils/apiError.js";


const errorHandler = (err, req, res, next) => {
    let error = err;
    //if error is not instance of apiError 
    if (!(err instanceof apiError)) { 
        const statusCode = err.statusCode || error instanceof mongoose.Error ? 400 : 500

        const message = err.message || "Something went wrong";  
        error = new apiError(statusCode, message, error?.errors || [], err.stack)
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})

    }
    return res.status(error.statusCode).json(response)
} 


export default errorHandler;

// this is error handler middleware that is used to handle errors 
//This can be copy pasted as it is written as it is 