// import { Mongoose, Schema } from "mongoose";
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
  const { username, password, email, firstName, lastName, bio, expertise } =
    req.body;

  if (
    [username, password, email, firstName].some(
      (item) => item == "" || item == undefined
    )
  ) {
    throw new APIError(
      404,
      "Username, Password, Email, Avatar and First Name cannot be empty"
    );
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

  if (!insertedUser)
    throw new APIError(404, "Could not get user, try logging in");

  res.status(200).json({ mssg: "Registration Succesful", user: insertedUser });
});

const loginUser = asyncHandler(async function (req, res, next) {
  const { username, email, password } = req.body;

  if (!username && !email)
    throw new APIError(401, "Must enter username or email");
  if (!password) throw new APIError(401, "Cannot login without a password");

  const userSearched = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (!userSearched) throw new APIError(401, "User not found");

  const check = await userSearched?.isCorrectPassword(password);

  if (!check)
    throw new APIError(
      401,
      "Authentication Error. User password does not match."
    );

  //   const updatedTokenUser = await User.findOneAndUpdate(
  //     { _id: userSearched._id },
  //     { $set: { _refreshToken } },
  //     { validateBeforeSave: false }
  //   ).select("-password -_refreshToken -userType -status");
  const { _refreshToken, _accessToken } = await generateAccessAndRefreshTokens(
    userSearched._id
  );

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

const regenerateExpiredAccessToken = asyncHandler(
  async function (req, res, next) {
    try {
      const refreshToken =
        req.cookies?._refreshToken || req.body?._refreshToken;

      if (!refreshToken)
        throw new APIError(
          401,
          "Refresh token does not exist. May have expired."
        );

      const decodedToken = jwt.verify(
        refreshToken,
        process.env.SIGNED_JWT_REFRESH_KEY
      );

      const user = await User.findById(decodedToken._id);

      if (!user)
        throw new APIError(
          401,
          "User not found. Unauthorized access to tokens."
        );

      if (!(refreshToken === user?._refreshToken))
        throw new APIError("Refresh tokens do not match. Critical error.");

      const { _accessToken, _refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

      const cookieOptions = {
        httpOnly: true,
        secure: true,
      };

      res
        .status(200)
        .cookie("_refreshToken", _refreshToken, cookieOptions)
        .cookie("_accessToken", _accessToken, cookieOptions)
        .json(
          new APIResponse(
            200,
            { _accessToken, _refreshToken },
            "Access token regenerated succesfully"
          )
        );
    } catch (error) {
      throw new APIError(500, `Something went wrong ${e}`);
    }
  }
);

const updatePassword = asyncHandler(async function (req, res, next) {
  const userId = req.user?._id;

  if (!userId) throw new APIError(401, "User not logged in");

  const user = await User.findOne({ _id: userId });

  if (!user)
    throw new APIError(
      404,
      "User not found. Register before updating password."
    );

  const { oldPassword, newPassword, verifyNewPassword } = req.body;

  const passCheck = await user?.isCorrectPassword(oldPassword);

  if (!passCheck) throw new APIError(401, "Old and new passwords do not match");

  if (
    [newPassword, verifyNewPassword].some(
      (pass) => pass == "" || pass == undefined
    )
  )
    throw new APIError(404, "Must enter new password and verify password");

  if (newPassword !== verifyNewPassword)
    throw new APIError(
      "New password fields do not match. Make sure both fields are same"
    );

  // user.password = password;

  await User.updateOne({ _id: userId }, { $set: { password: newPassword } });

  res
    .status(200)
    .json(
      new APIResponse(
        200,
        { user: user.username, action: "Update Password" },
        "Password changed successfully"
      )
    );
});

const updateUsername = asyncHandler(async function (req, res, next) {
  const userId = req.user?._id;

  if (!userId) throw new APIError(401, "User not logged in");

  const user = await User.findOne({ _id: userId });

  if (!user)
    throw new APIError(
      404,
      "User not found. Register before updating username"
    );

  const { newUsername } = req.body;

  if (!newUsername) throw new APIError(404, "Please enter a new username");

  const doesExist = await User.findOne({
    username: newUsername?.trim()?.toLowerCase(),
  });

  if (doesExist) throw new APIError(401, "Username already taken");

  user.username = newUsername?.toLowerCase()?.trim();

  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new APIResponse(
        200,
        { user: user.username, action: "Update Username" },
        "Username changed successfully"
      )
    );
});

const updateAvatar = asyncHandler(async function (req, res, next) {
  const { avatar } = req.body;
  if (!avatar)
    throw new APIError(404, "Missing avatar image from the request body");
  if (!req.user?._id) throw new APIError(401, "User not logged in");
  if (!req.file?.path)
    throw new APIError(404, "Something went wrong uploading the avatar");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { avatar: req.file?.path },
    { new: true }
  ).select(
    "-password -_refreshToken -userType -status -expertise -bio -coverImage"
  );

  if (!user) throw new APIError(500, "User not found, could not update avatar");

  res.status(200).json(new APIResponse(200, user, "Avatar update successful"));
});

const updateCoverImage = asyncHandler(async function (req, res, next) {
  const { coverImage } = req.body;
  if (!coverImage)
    throw new APIError(404, "Missing cover image from the request body");
  if (!req.user?._id) throw new APIError(401, "User not logged in");
  if (!req.file?.path)
    throw new APIError(404, "Something went wrong uploading the avatar");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { coverImage: req.file?.path },
    { new: true }
  ).select(
    "-password -_refreshToken -userType -status -expertise -bio -avatar"
  );

  if (!user)
    throw new APIError(500, "User not found, could not update cover image");

  res
    .status(200)
    .json(new APIResponse(200, user, "Cover Image update successful"));
});

const updateUserDetails = asyncHandler(async function (req, res, next) {
  if (!req.user?._id) throw new APIError(401, "User not logged in");

  const { firstName, lastName, expertise, bio } = req.body;

  if (!firstName)
    throw new APIError("First Name cannot be empty while updating user");

  if (expertise instanceof Array && expertise.length > 0) {
    const checkInvalidExpertise = expertise.some(
      (obj) =>
        isNaN(Date.parse(obj.to)) ||
        isNaN(
          Date.parse(obj.from) ||
            obj.name == "" ||
            Date.parse(obj.from) > Date.parse(obj.to)
        )
    );
    if (checkInvalidExpertise)
      throw new APIError(
        400,
        "Expertise fields must be an array with valid to and from dates"
      );
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { firstName, lastName: lastName || "", bio: bio || "" },
      $push: { expertise: { ...expertise } },
    },
    { new: true }
  ).select("-password -_refreshToken -status -userType");

  res
    .status(200)
    .json(new APIResponse(200, { user }, "Fields updated succesfully"));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  regenerateExpiredAccessToken,
  updatePassword,
  updateUsername,
  updateCoverImage,
  updateAvatar,
  updateUserDetails,
};
