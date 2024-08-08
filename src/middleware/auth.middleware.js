import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
const jwtVerify = asyncHandler(async function (req, res, next) {
  try {
    const accessToken =
      req.cookies?._accessToken || req.header("Authorization")?.replace(" Bearer", "");

    if (!accessToken) throw new APIError(401, "User does not bear access tokens. Unauthorized");

    const decodedToken = jwt.verify(accessToken, process.env.SIGNED_JWT_ACCESS_KEY);

    const user = await User.findOne({ _id: decodedToken._id }).select(
      "-_refreshToken -status -password"
    );

    if (!user) throw new APIError(401, "User not found. Token Verification Failed.");

    req.user = user;

    next();
  } catch (error) {
    throw new APIError(500, `Something went wrong ${error}`);
  }
});

export { jwtVerify };
