import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    payload: { type: Object, required: true },
    received_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const WebhookLog = mongoose.model("WebhookLog", webhookLogSchema);
export default WebhookLog;