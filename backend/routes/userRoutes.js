import express from "express";
// import all middleware
import authMiddleware from "../middleware/authMiddleware";
// import all controllers
import { changePassword, getUser, updateUser } from "../controllers/userContoller";

const router = express.Router();

// Add routes
router.get('/', authMiddleware,getUser);
router.put('/change-password',authMiddleware, changePassword );
router.post('/:id',authMiddleware,updateUser );
// router.delete('/', SessionController.store);

export default router;