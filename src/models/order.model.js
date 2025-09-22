import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    school_id: { type: String, required: true, index: true },
    trustee_id: { type: String, required: true },
    student_info: {
      name: { type: String, required: true },
      id: { type: String, required: true },
      email: { type: String, required: true },
    },
    gateway_name: { type: String, required: true },
    custom_order_id: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;