import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Connect to MongoDB database using Mongoose library 
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
          `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error", error);
        process.exit(1); // Exit the process with failure
    }
}

export {connectDB};

