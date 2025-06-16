import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const healthcheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, "OK", "Health check passed"));
});

export { healthcheck };

// this above is controller for healthcheck
//controller is a function that is used to handle the request and return the response to the client
