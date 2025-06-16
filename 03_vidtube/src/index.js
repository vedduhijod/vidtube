import { app } from "./app.js"; 
import dotenv from "dotenv"; // dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
import { connectDB } from "./db/index.js"; // Import the connectDB function from the db module

dotenv.config({ 
    path: "./.env"
});

const PORT = process.env.PORT || 7000; 

// Connect to MongoDB database and start the server 
connectDB()
.then(() => { // If the database connection is successful
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((err) => { // If the database connection fails
    console.log("MongoDB connection error", err);
});

// The above code is a simple Node.js application that connects to a MongoDB database using Mongoose and starts an Express server.