import express from "express";
import cors from "cors";
import dotenv from "dotenv"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors("*"))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))