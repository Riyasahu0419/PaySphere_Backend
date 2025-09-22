import express from "express";
import axios from "axios"; // ⚠️ Import Axios here
import { authMiddleware } from "../middleware/auth.middleware.js";
import Order from "../models/order.model.js";
import OrderStatus from "../models/orderStatus.model.js";
const router = express.Router();

router.post("/create-payment", authMiddleware, async (req, res) => {
  try {
    const { school_id, trustee_id, student_info, order_amount, gateway_name } = req.body;
    
    // Create a unique custom order ID
    const custom_order_id = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Save initial Order in DB
    const newOrder = new Order({ school_id, trustee_id, student_info, gateway_name, custom_order_id });
    const savedOrder = await newOrder.save();

    // 2. Save initial OrderStatus (pending)
    const newOrderStatus = new OrderStatus({
      collect_id: savedOrder._id,
      order_amount,
      status: "pending",
    });
    await newOrderStatus.save();

    // 3. Call the payment gateway API
    // ⚠️ NOTE: This is a placeholder. You need to implement the actual API call here.
    // Use the provided credentials (pg_key, API_KEY, school_id) to create the collect request.
    const paymentApiPayload = {
      order_id: custom_order_id,
      amount: order_amount,
      // other details...
    };

    // Example of calling an external API
    // const response = await axios.post("https://payment-gateway-api.com/create-collect-request", paymentApiPayload, {
    //   headers: { "Authorization": `Bearer ${process.env.PAYMENT_API_KEY}` }
    // });
    
    // In a real scenario, the response would contain a redirect URL
    const redirectUrl = `https://payment-gateway.com/pay?id=${custom_order_id}`; // example

    res.status(200).json({
      message: "Payment request created",
      redirect_url: redirectUrl,
      order_id: custom_order_id,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create payment", error: error.message });
  }
});

export default router;