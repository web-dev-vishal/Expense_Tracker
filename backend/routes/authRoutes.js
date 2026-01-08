import express from "express";
import { signinUser, signupUser } from "../controllers/authController.js";

const router = express.Router();

router.post('/sign-up', signinUser);
router.post('/sign-in', signupUser);

export default router;