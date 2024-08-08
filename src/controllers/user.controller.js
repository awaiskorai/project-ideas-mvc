import { Mongoose, Schema } from "mongoose";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async function (userId) {
  try {
    const user = await User.findById(userId);

    if (!user) throw APIError(404, "User Not found. Token generation failed.");

    const _refreshToken = user?.generateRefreshToken();

    const _accessToken = user?.generateAccessToken();

    user._refreshToken = _refreshToken;

    await user.save({ validateBeforeSave: false });

    return { _accessToken, _refreshToken };

    //prettier-ignore
  } catch (e) {
    throw new APIError(500, `Something went wrong while generating user tokens: ${e}`);
    //prettier-ignore
  }
};

const registerUser = asyncHandler(async function (req, res, next) {
  const { username, password, email, firstName, lastName, bio, expertise } = req.body;

  if ([username, password, email, firstName].some((item) => item == "" || item == undefined)) {
    throw new APIError(404, "Username, Password, Email, Avatar and First Name cannot be empty");
  }

  const avatar = req?.files?.avatar?.[0]?.path;
  if (!avatar) throw new APIError(404, "Avatar must be uploaded");

  const coverImage = req.files?.coverImage?.[0]?.path;
  if (!coverImage) coverImage = "";

  const user = await User.create({
    username,
    password,
    email,
    firstName,
    lastName: lastName || "",
    avatar,
    bio: bio || "",
    expertise: expertise || [],
    coverImage: coverImage || "",
  });

  if (!user) throw new APIError(404, "Failed to register user, try again");

  const insertedUser = await User.find({ username: username }).select(
    "-password -refreshToken -email -status -userType"
  );

  if (!insertedUser) throw new APIError(404, "Could not get user, try logging in");

  res.status(200).json({ mssg: "Registration Succesful", user: insertedUser });
});

const loginUser = asyncHandler(async function (req, res, next) {
  const { username, email, password } = req.body;

  if (!username && !email) throw new APIError(401, "Must enter username or email");
  if (!password) throw new APIError(401, "Cannot login without a password");

  const userSearched = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (!userSearched) throw new APIError(401, "User not found");

  const check = await userSearched?.isCorrectPassword(password);

  if (!check) throw new APIError(401, "Authentication Error. User password does not match.");

  //   const updatedTokenUser = await User.findOneAndUpdate(
  //     { _id: userSearched._id },
  //     { $set: { _refreshToken } },
  //     { validateBeforeSave: false }
  //   ).select("-password -_refreshToken -userType -status");
  const { _refreshToken, _accessToken } = await generateAccessAndRefreshTokens(userSearched._id);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("_accessToken", _accessToken, cookieOptions)
    .cookie("_refreshToken", _refreshToken, cookieOptions)
    .json(
      new APIResponse(
        200,
        {
          username: userSearched.username,
          _refreshToken,
          _accessToken,
        },
        "User Logged in Succesfully"
      )
    );
});

const logoutUser = asyncHandler(async function (req, res, next) {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        _refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("_accessToken", cookieOptions)
    .clearCookie("_refreshToken", cookieOptions)
    .json(new APIResponse(200, null, "User logged out"));
});

export { registerUser, loginUser, logoutUser };
