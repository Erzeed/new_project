const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    reqCode: {
      type: String,
      required: [true, 'Request Code can not be empty!'],
    },
    taskCode: { type: String, required: [true, 'Task Code can not be empty!'] },
    taskType: { type: String, required: [true, 'Task Type can not be empty!'] },
    robotCode: { type: String },
    robotStatus: { type: String },
    jobStatus: {
      type: String,
      // enum: ["process", "pending", "finish", "waiting", "cancel"], required: [true, 'Job Status can not be empty!']
    },
    pendingStatus: { type: String },
    positionCode: { type: Object },
    callingType: {
      type: String,
      enum: ['push', 'pull', 'point to point', 'abnormal'],
      required: [true, 'Flow can not be empty!'],
    },
    storage: { type: String },
    destination: { type: String },
    priority: { type: Number },
    part: { type: String, required: [true, 'Part can not be empty!'] },
    execTime: { type: Date },
    reqTime: { type: String },
    positionGate: { type: String },
    sequence: { type: Boolean },
    specialPart: { type: String },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
