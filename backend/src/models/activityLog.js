import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    content: { type: String, required: true }, 
    userName: { type: String, required: true }, // Người bị tác động
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, required: false }, // Người thực hiện hành động
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    createdAt: { type: Date, default: Date.now }, 
  },
  { versionKey: false }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;