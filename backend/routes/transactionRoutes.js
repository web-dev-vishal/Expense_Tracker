import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addTransaction, getDeshboardInformation, getTransactions, transferMoneyToAccount } from "../controllers/transactionContoller.js";

const router = express.Router();

router.get("/",authMiddleware, getTransactions);
router.get("/dashboard", authMiddleware, getDeshboardInformation);
router.post("/add-transaction/:account_id",authMiddleware,addTransaction);
router.put("/trasfer-money",authMiddleware, transferMoneyToAccount);

export default router;