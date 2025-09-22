import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors"; 
import morgan from "morgan"; 

import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); 
app.use(cors()); 
app.use(morgan("dev")); 

// Routes
app.use("/auth", authRoutes); 
app.use("/payment", paymentRoutes); 
app.use("/webhook", webhookRoutes); 
app.use("/transactions", transactionRoutes); 

const PORT = process.env.PORT || 8000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB error:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));