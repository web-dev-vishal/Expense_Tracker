import express from "express";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// import all controllers


// Add routes
router.get('/', authMiddleware,getUser);
router.put('/change-password',authMiddleware, changePassword );
// router.post('/', SessionController.store);
// router.delete('/', SessionController.store);

export default router;