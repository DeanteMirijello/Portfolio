import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, "../data/testimonials.json");

async function readAll() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(items) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), "utf-8");
}

export async function listTestimonials(req, res, next) {
  try {
    const items = await readAll();
    const visible = items.filter((t) => t.approved === true || t.approved === undefined);
    res.status(200).json(visible);
  } catch (err) {
    next(err);
  }
}

export async function listAllTestimonials(req, res, next) {
  try {
    const items = await readAll();
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
}

export async function createTestimonial(req, res, next) {
  try {
    const { author, role, quote } = req.body;
    const accountSub = req.auth?.payload?.sub;
    const payload = req.auth?.payload || {};
    const emailClaim = process.env.AUTH0_EMAIL_CLAIM || "email";
    const email = payload[emailClaim] || payload.email || payload["https://your.app/email"];
    if (!accountSub) return res.status(401).json({ error: "Unauthorized" });
    if (!email) return res.status(400).json({ error: "Account email is required." });

    const items = await readAll();
    const alreadySubmitted = items.some((t) => t.accountSub === accountSub);
    if (alreadySubmitted) {
      return res.status(409).json({ error: "You can only submit one testimonial per account." });
    }

    const item = {
      id: randomUUID(),
      accountSub,
      email,
      author,
      role: role || "",
      quote,
      approved: false,
      createdAt: new Date().toISOString(),
    };
    items.push(item);
    await writeAll(items);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const { author, role, quote } = req.body;
    const items = await readAll();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not Found" });
    items[idx] = { ...items[idx], author, role: role || "", quote };
    await writeAll(items);
    res.status(200).json(items[idx]);
  } catch (err) {
    next(err);
  }
}

export async function approveTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const items = await readAll();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not Found" });
    items[idx] = { ...items[idx], approved: true, approvedAt: new Date().toISOString() };
    await writeAll(items);
    res.status(200).json(items[idx]);
  } catch (err) {
    next(err);
  }
}

export async function deleteTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const items = await readAll();
    const nextItems = items.filter((t) => t.id !== id);
    if (nextItems.length === items.length) return res.status(404).json({ error: "Not Found" });
    await writeAll(nextItems);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function canSubmitTestimonial(req, res, next) {
  try {
    const accountSub = req.auth?.payload?.sub;
    if (!accountSub) return res.status(401).json({ error: "Unauthorized" });

    const items = await readAll();
    const alreadySubmitted = items.some((t) => t.accountSub === accountSub);
    if (alreadySubmitted) {
      return res.status(200).json({
        allowed: false,
        reason: "You already submitted a testimonial with this account.",
      });
    }

    return res.status(200).json({ allowed: true });
  } catch (err) {
    next(err);
  }
}