import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Contact route
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  console.log("Contact request:", name, email, message);

  res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
