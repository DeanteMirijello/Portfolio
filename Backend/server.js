import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import contactRoutes from "./routes/contact.js";
import testimonialsRoutes from "./routes/testimonials.js";
import skillsRoutes from "./routes/skills.js";
import homeRoutes from "./routes/home.js";
import projectsRoutes from "./routes/projects.js";
import contactItemsRoutes from "./routes/contactItems.js";
import aboutRoutes from "./routes/about.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "http://localhost:4321"; // Astro dev default
const ALLOW_ORIGINS = (process.env.ALLOW_ORIGINS || "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  // Allow non-browser requests
  if (!origin) return true;
  if (origin === ALLOW_ORIGIN) return true;
  if (ALLOW_ORIGINS.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    // Allow all Vercel subdomains (preview + prod)
    if (hostname.endsWith(".vercel.app")) return true;
    // Allow common local dev hosts and ports
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0"
    ) {
      return true;
    }
  } catch {}
  return false;
}

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const ok = isAllowedOrigin(origin);
      callback(null, ok);
    },
    optionsSuccessStatus: 200,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get(["/", "/health"], (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/contact", contactRoutes);
app.use("/contact/items", contactItemsRoutes);
app.use("/testimonials", testimonialsRoutes);
app.use("/skills", skillsRoutes);
app.use("/home", homeRoutes);
app.use("/projects", projectsRoutes);
app.use("/about", aboutRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
