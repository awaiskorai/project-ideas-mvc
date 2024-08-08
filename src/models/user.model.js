import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
    },

    coverImage: {
      type: String,
    },

    bio: {
      type: String,
    },
    expertise: [
      {
        name: {
          type: String,
          default: "none",
        },
        experience: {
          to: { type: Date },
          from: { type: Date },
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    userType: {
      type: String,
      enum: ["regular", "teamHead", "admin"],
      default: "regular",
    },
    _refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const saltRounds = 10;

    this.password = await bcrypt.hash(this.password, saltRounds);
    //   = hashedPassword;
    next();
  } catch (e) {
    throw new Error("Could not hash password");
  }
});

userSchema.methods.isCorrectPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (e) {
    throw new Error("Could not compare the password");
  }
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.SIGNED_JWT_REFRESH_KEY,
    { algorithm: "HS256", expiresIn: process.env.REFRESH_KEY_EXPIRY }
  );
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      userType: this.userType,
    },
    process.env.SIGNED_JWT_ACCESS_KEY,
    { algorithm: "HS256", expiresIn: process.env.ACCESS_KEY_EXPIRY }
  );
};
export const User = mongoose.model("User", userSchema);
