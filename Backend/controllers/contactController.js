import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, "../data/contact.json");
const MESSAGES_PATH = path.resolve(__dirname, "../data/contact-messages.json");

async function readMessages() {
  try {
    const raw = await fs.readFile(MESSAGES_PATH, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === "ENOENT") return [];
    if (err.name === "SyntaxError") return [];
    throw err;
  }
}

async function writeMessages(items) {
  await fs.mkdir(path.dirname(MESSAGES_PATH), { recursive: true });
  await fs.writeFile(MESSAGES_PATH, JSON.stringify(items, null, 2), "utf-8");
}

export async function handleContact(req, res, next) {
  try {
    const { name, message } = req.body;
    const accountSub = req.auth?.payload?.sub;
    const payload = req.auth?.payload || {};
    const emailClaim = process.env.AUTH0_EMAIL_CLAIM || "email";
    const tokenEmail = payload[emailClaim] || payload.email || payload["https://your.app/email"];
    const bodyEmail = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const email = tokenEmail || bodyEmail;
    if (!accountSub) return res.status(401).json({ error: "Unauthorized" });

    const items = await readMessages();
    const today = new Date().toISOString().slice(0, 10);
    const alreadySentToday = items.some(
      (m) => m.accountSub === accountSub && String(m.createdAt || "").slice(0, 10) === today
    );
    if (alreadySentToday) {
      return res.status(429).json({ error: "You can only send one message per day." });
    }

    const entry = {
      id: randomUUID(),
      accountSub,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };
    items.push(entry);
    await writeMessages(items);

    console.log("Contact request:", { name, email, message });

    return res.status(201).json({ success: true, id: entry.id });
  } catch (err) {
    next(err);
  }
}

export async function listContactMessages(req, res, next) {
  try {
    const items = await readMessages();
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json(items);
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