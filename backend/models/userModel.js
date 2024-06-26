const { getSocket } = require("../controllers/socketController");

const mongoose = require("mongoose");
// Validator for email
const validator = require("validator");

// SECURITY: This way, the attacker can't at least  steal our users' passwords and also can't reset them.
// Strongly encrypt password with salt and hash Hashing is a one-way process that converts a password to ciphertext using hash algorithms. A hashed password cannot be decrypted, but a hacker can try to reverse engineer it. Password salting adds random characters before or after a password prior to hashing to obfuscate the actual password.
const bcrypt = require("bcryptjs");

// Strongly encrypt password with SHA 256, it's built-in module from node.js no need to install it. SHA-256 stands for Secure Hash Algorithm 256-bit and it's used for cryptographic security
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
      // if there is space after or before string will deleted
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please tell us your company name!'],
      // if there is space after or before string will deleted
      trim: true,
      default: 'Infinitigroup',
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      // validate the email with package validator
      // validate: [validator.isEmail, 'Please provide a valid email'],
    },
    logo: {
      type: String,
      default: "default.jpg",
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    // nik: {
    //   unique: true,
    //   // required: [true, 'Please provide your nik'],
    //   type: Number,
    // },
    dept: {
      type: String,
    },
    role: {
      type: String,
      default: "madcc-om",
      required: [true, "Please provide a role"],
      enum: [
        "user-ijc",
        "admin",
        "partroom-ijc",
        "partroom-lci",
        "user-lci",
        "operator",
        "super",
        "cama-so",
        "cama-sm",
        "cama-om",
        "madcc-so",
        "madcc-sm",
        "madcc-om",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works when save and create new object
        validator: function (el) {
          return el === this.password;
        },
        message: "Password are not the same!",
      },
    },
    passwordChangedAt: { type: Date },
    // To compare with reset token hash by crypto, so its saved here
    passwordResetToken: String,
    // To expire the reset after a time
    passwordResetExpires: Date,

    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    alias: { type: String },
    lineCode: { type: String },
    defaultPath: { type: String },
    defaultModel: { type: String },
    defaultDestinations: { type: [Number] },
  },
  {
    timestamps: true,
  }
);

// ENCRYPT PASSWORD
userSchema.pre("save", async function (next) {
  // Only run this func if pass was actually modified
  if (!this.isModified("password")) return next();

  // hash the pass with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //   Deleted passconfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.emitSocket = async function () {
  // await this.findOne(); does NOT work here, query has already executed
  getSocket().emit("usersData", this);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
