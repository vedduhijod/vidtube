import { Router } from "express"; // Router is a class in express that allows you to create modular, mountable route handlers.
import { healthcheck } from "../controllers/healthcheck.controllers.js"; // Import the healthcheck controller


const router = Router() // Create a new Router instance

router.route("/").get(healthcheck) // Define a route for the router


export default router // Export the router;