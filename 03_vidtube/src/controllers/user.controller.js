import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import { mongo, trusted } from "mongoose";
import jwt from "jsonwebtoken";
import apiError from "../utils/apiError.js";


//generate access and refresh token 
const generateAccessandRefreshToken = async(user) => {
  try {
    const user = await User.findById(userId)
    //small check for user existence
  
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
  
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})
    return {accessToken, refreshToken}
  } catch (error) {
    throw new apiError(500, "Something went wrong while generating access and refresh token") 
    
  }

}

const registerUser = asyncHandler(async (req, res) => {
  try {
  const { fullname, email, username, password } = req.body;

  //validation
  //if any of the fields are empty
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }
  //check if user with email or username already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  })
  if (existedUser) {
    throw new apiError(409, "User with email or username already exists");
  }
  //upload avatar and cover image on cloudinary
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is missing");
  }

  //upload avatar and cover image on cloudinary
  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // let coverImage = "";
  // if (coverLocalPath) {
  //   coverImage = await uploadOnCloudinary(coverLocalPath);
  // }

  let avatar;
  try {
  avatar =await uploadOnCloudinary(avatarLocalPath)
  console.log("Avatar uploaded on cloudinary. File src" + avatar.url);
  } catch (error) {
    console.log("Error uploading avatar image", error);
    throw new apiError(500, "Error uploading avatar image");
  }
  let coverImage;
  try {
    coverImage = await uploadOnCloudinary(coverLocalPath);
    console.log("Cover image uploaded on cloudinary.");
  } catch (error) {
    console.log("Error uploading cover image", error);
    throw new apiError(500, "Failed uploading coverimage");
  }
  //create user
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  //send response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"))
  } catch (error) {
  console.log("User Creation failed")
  if (avatar) {
    await deleteFromCloudinary(avatar.public_id);
  }
  if (coverImage) {
    await deleteFromCloudinary(coverImage.public_id);
  }
  throw new apiError(500, "Something went wrong while registering user and images were deleted");
  }
})

const loginUser = asyncHandler(async (req, res) => {
//get data from req.body
  const {email, username, password} = req.body

  //validation
  //check if email or username is empty
  if(!email && !username) {
    throw new apiError(400, "Email or username is required")
  }
  //check if password is empty
  if(!password) {
    throw new apiError(400, "Password is required")
  }

    const user = await User.findOne({
      $or: [{ username }, { email }],
    })

    if(!user) {
      throw new apiError(404, "User not found")
    }
    //validate password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
      throw new apiError(401, "Invalid password")
    }

    const {accessToken, refreshToken} = await generateAccessandRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(
      200, 
    {
      user : loggedInUser,
      accessToken,
      refreshToken
    },
    "User logged in successfully"
  ))
})  

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:  //set refresh token to null
    {refreshToken : null,
    }
  },
  {
    new: true
  }
  )

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  }
  return res
    .status(200)
    .clearCookie("accessToken", "", options)
    .clearCookie("refreshToken", "", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!refreshToken) {
    throw new apiError(401, "Refresh token is required")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    )
    const user = await User.findById(decodedToken?._id)
    //check if user exists
    if(!user) {
      throw new apiError(404, "Invalid refresh token")
    }
    // check if refresh token is valid
    if(incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Invalid refresh token")
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }
   const {accessToken, refreshToken : newRefreshToken} = 
   await generateAccessandRefreshToken (user._id)

   return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(
      200,
      {
        accessToken,
        refreshToken : newRefreshToken
      },
      "Access token refreshed successfully"
    ))
  } catch (error) {
    throw new apiError(500, "Something went wrong while refreshing access token")  
  }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body

  const user = await User.findByIdAndUpdate(req.user?._id)

  const isPasswordValid = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordValid) {
    throw new apiError(401, "Invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave : false})
  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
    
  })

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user details"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const {fullname, email} = req.body

  if(!fullname || !email) {
    throw new apiError(400, "Fullname or email is required")
  }
  //update user details 
  const user = await User.findByIdAndUpdate(req.user._id, 
    req.user?._id,
    {
      $set: {
        fullname,
        email
      }
    },
    {new: true}
  ).select("-password -refreshToken")

  return res.status(200).json(new apiResponse(200, user, "Account details updated successfully"))
})

const updateUseravatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new apiError(500, "Something went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res.status(200).json(new ApiResponse(200, {}, "Avatar updated successfully"));
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new apiError(400, "File is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!coverImage.url) {
    throw new apiError(500, "Something went wrong while uploading cover image");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken")

  returnres.status(200).json(new ApiResponse(200, {}, "Cover image updated successfully"));
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const {username} = req.params

  if(!username?.trim()) {
    throw new apiError(400, "Username is required")
  }
  const channel = await User.aggregate(
    [
      {
        $match: {
          username : username?.toLowerCase()
        }
      },
      {
        $lookup: {
          from : "subscriptions",
          localField : "_id",
          foreignField : "channel",
          as : "subscriber"
        }
      },
      {
        $lookup: {
          from : "subscriptions",
          localField : "_id",
          foreignField : "subscriber",
          as : "subscribedTo"
        }
      },
      {
        $addFields: {
          subscribersCount: { $size: "$subscriber" },
          channelsSubscribedToCount: { $size: "$subscribedTo" },
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, "$subscribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        }
      },
      //project only the necessary data 
      $project, {
        fullname: 1,
        username: 1,
        avatar: 1,  
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        coverImage: 1,
        email: 1
      }
  ])

  if (channel?.length) {
    throw new apiError(404, "Channel not found");
  }
  return res.status(200).json(new apiResponse(200, channel[0], "Channel profile fetched successfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from : "users",
              localField : "owner",
              foreignField : "_id",
              as : "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: { $first: "$owner" }
            }
          }
        ]
      }
    } 
  ])
  return res.status(200).json(new apiResponse(200, user[0]?.watchHistory, "Watch history fetched successfully"))
})
export { registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUseravatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
