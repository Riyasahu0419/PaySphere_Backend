import express from "express";
import Order from "../models/order.model.js"; // Import the Order model
import OrderStatus from "../models/orderStatus.model.js";
import WebhookLog from "../models/webhookLog.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    // 1. Log the incoming webhook payload for debugging
    const newLog = new WebhookLog({ payload });
    await newLog.save();

    const order_info = payload.order_info;
    const { order_id, transaction_amount, status, payment_mode, payment_details, bank_reference, payment_message, payment_time, error_message } = order_info;

    // 2. Find the Order document using the custom_order_id from the webhook payload
    const order = await Order.findOne({ custom_order_id: order_id });

    if (!order) {
      console.log(`Webhook received for unknown custom_order_id: ${order_id}`);
      return res.status(404).json({ message: "Order not found" });
    }

    // 3. Use the found Order's _id to update the corresponding OrderStatus
    const updatedStatus = await OrderStatus.findOneAndUpdate(
      { collect_id: order._id }, // Query by the ObjectId, not the custom_order_id
      {
        transaction_amount,
        payment_mode,
        payment_details,
        bank_reference,
        status,
        payment_message,
        payment_time,
        error_message,
      },
      { new: true }
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: "Order Status not found for this order" });
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    res.status(500).json({ message: "Webhook processing failed", error: error.message });
  }
});

export default router;



// git rm -r EDVIRON_BACKEND
// git commit -m "Remove folder_name from repo"
// git push origin main


// git rm -r --cached EDVIRON_BACKEND
// git commit -m "Stop tracking folder_name"
// git push origin main
