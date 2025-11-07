import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { checkSymptoms } from "./health.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/health", async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms) {
    return res.status(400).json({ error: "Symptoms are required." });
  }
  try {
    const result = await checkSymptoms(symptoms, true); // true = return result
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error processing request." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});