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
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
}

export async function createTestimonial(req, res, next) {
  try {
    const { author, role, quote } = req.body;
    const items = await readAll();
    const item = { id: randomUUID(), author, role: role || "", quote, createdAt: new Date().toISOString() };
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