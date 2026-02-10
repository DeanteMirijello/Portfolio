import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/contact-items.json");

function readItems() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

function writeItems(items) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2));
}

export function listItems(req, res) {
  const items = readItems();
  res.json(items);
}

export function addItem(req, res) {
  const items = readItems();
  const { title, titleEn, titleFr, value } = req.body;
  const id = String(Date.now());
  const baseTitle = (title && title.trim()) || (titleEn && titleEn.trim()) || "";
  const newItem = {
    id,
    title: baseTitle,
    titleEn: (titleEn && titleEn.trim()) || baseTitle,
    titleFr: (titleFr && titleFr.trim()) || baseTitle,
    value,
  };
  items.push(newItem);
  writeItems(items);
  res.status(201).json(newItem);
}

export function updateItem(req, res) {
  const items = readItems();
  const { id } = req.params;
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Item not found" });
  const { title, titleEn, titleFr, value } = req.body;
  const current = items[idx];
  const next = {
    ...current,
    title: (title && title.trim()) || current.title || current.titleEn || "",
    titleEn: (titleEn && titleEn.trim()) || current.titleEn || current.title || "",
    titleFr: (titleFr && titleFr.trim()) || current.titleFr || current.title || "",
    value: value ?? current.value,
  };
  items[idx] = next;
  writeItems(items);
  res.json(items[idx]);
}

export function deleteItem(req, res) {
  const items = readItems();
  const { id } = req.params;
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Item not found" });
  const [removed] = items.splice(idx, 1);
  writeItems(items);
  res.json(removed);
}
