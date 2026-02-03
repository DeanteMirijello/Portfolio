import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, "../data/contact.json");

export async function handleContact(req, res, next) {
  try {
    const { name, email, message } = req.body;

    console.log("Contact request:", { name, email, message });

    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function getContact(req, res, next) {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    return res.status(200).json(data);
  } catch (err) {
    // If file missing, return sensible defaults
    if (err.code === "ENOENT") {
      return res.status(200).json({
        location: "",
        email: "",
        github: "",
        linkedin: "",
      });
    }
    next(err);
  }
}

export async function updateContact(req, res, next) {
  try {
    const { location, email, github, linkedin } = req.body;
    const payload = { location, email, github, linkedin };
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(payload, null, 2), "utf-8");
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}