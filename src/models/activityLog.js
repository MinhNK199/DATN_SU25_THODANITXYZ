import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    content: { type: String, required: true }, 
    userName: { type: String, required: true }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }, 
  },
  { versionKey: false }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;