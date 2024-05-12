const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    status: { type: String },
    source: { type: String },
    taskCode: { type: String },
    robotCode: { type: String },
    destination: { type: String },
    priority: {
      type: String,
      default: "normal",
      required: [true, "Title can not be empty!"],
    },
    taskTemplate: {
      type: String,
      required: [true, "Task template can not be empty!"],
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
