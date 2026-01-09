import express from "express";
// Import all middleware
import authMiddleware from "../middleware/authMiddleware.js";
// Import all controller
import { addMoneyToAccount, createAccount, getAccounts } from "../controllers/accountController.js";

const router = express.Router();

router.get("/:id", authMiddleware,getAccounts);
router.post("/create", authMiddleware,createAccount);
router.put("/add-money/:id", authMiddleware,addMoneyToAccount);

export default router;