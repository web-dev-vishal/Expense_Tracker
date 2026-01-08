import express from "express";

const router = express.Router();

router.post('/sign-up', signupUser);
router.post('/sign-in',signinUser);