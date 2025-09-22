import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import Order from "../models/order.model.js";

const router = express.Router();

// Helper function for aggregation pipeline
const getTransactionsPipeline = (matchConditions = {}) => [
  { $match: matchConditions },
  {
    $lookup: {
      from: "orderstatuses",
      localField: "_id",
      foreignField: "collect_id",
      as: "status_info",
    },
  },
  { $unwind: "$status_info" },
  {
    $project: {
      _id: 0,
      collect_id: "$status_info.collect_id",
      school_id: "$school_id",
      gateway: "$gateway_name",
      order_amount: "$status_info.order_amount",
      transaction_amount: "$status_info.transaction_amount",
      status: "$status_info.status",
      custom_order_id: "$custom_order_id",
      payment_time: "$status_info.payment_time",
    },
  },
];

// 1. GET /transactions (Fetch All Transactions with Pagination & Sorting)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "payment_time";
    const order = req.query.order === "asc" ? 1 : -1;

    const pipeline = getTransactionsPipeline();
    pipeline.push({ $sort: { [sort]: order } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const transactions = await Order.aggregate(pipeline);
    const totalCount = await Order.countDocuments();

    res.status(200).json({
      transactions,
      total: totalCount,
      page,
      pages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
});

router.get("/transactions/school/:schoolId", authMiddleware, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const pipeline = getTransactionsPipeline({ school_id: schoolId });
    const transactions = await Order.aggregate(pipeline);

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found for this school" });
    }
    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch school transactions", error: error.message });
  }
});

router.get("/transaction-status/:custom_order_id", authMiddleware, async (req, res) => {
  try {
    const { custom_order_id } = req.params;
    const pipeline = getTransactionsPipeline({ custom_order_id });
    const transaction = await Order.aggregate(pipeline);

    if (transaction.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ status: transaction[0].status });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transaction status", error: error.message });
  }
});

export default router;