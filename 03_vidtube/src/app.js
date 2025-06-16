import express from "express"; // Express is a minimal and flexible Node.js web framework that provides a robust set of features to develop web and mobile applications.
import cors from "cors"; // CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various option.
import cookieParser from "cookie-parser"; // cookie-parser is a small middleware that parses cookie header and populate req.cookies with an object keyed by the cookie names.

const app = express(); // Create an instance of express application


// Enable CORS
app.use(
    cors({
        origin : process.env.CORS_ORIGIN, // CORS_ORIGIN is an environment variable that contains the origin of the client application.
        credentials : true // This option indicates whether or not the response to the request can be exposed when the credentials flag is true.
    })
);

// Common middleware
// Parse JSON request body
app.use(express.json({limit : "16mb"}));
// Parse URL-encoded request body
app.use(express.urlencoded({extended : true, limit : "16mb"}));
// Serve static files from the public directory
app.use(express.static("public"));
// Parse cookies
app.use(cookieParser());

// import routes 
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import errorHandler from "./middlewares/error.middlewares.js";


//routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use(errorHandler);

export {app};
