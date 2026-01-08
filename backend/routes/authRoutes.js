import express from "express";
import router from ".";

const router = express.Router();

router.post('/sign-up', signupUser);
router.post('/sign-in',signinUser);