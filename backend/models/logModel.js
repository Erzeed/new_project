const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    activity: {
      type: String,
      enum: ['Create User', "login", "logout", "resetPassword", "updatePassword", "signUp", "forgotPassword"]
    },
    ipAddress: String,
  },
  {
    timestamps: true,
  }
);

logSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email",
  });
  next();
});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
