import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, "../data/skills.json");

const DEFAULT_SKILLS = {
  languages: ["Java", "Python", "C#", "JavaScript", "HTML", "CSS"],
  frameworks: ["Spring", "React", "GitHub", "Docker", "Postman", "REST", "Jira", "Agile/Scrum", "Unity"],
  databases: ["PostgreSQL", "MySQL", "MongoDB"],
  design: ["UML", "Figma", "Photoshop"],
};

async function readSkills() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    return { ...DEFAULT_SKILLS, ...data };
  } catch (err) {
    if (err.code === "ENOENT") return DEFAULT_SKILLS;
    throw err;
  }
}

async function writeSkills(skills) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(skills, null, 2), "utf-8");
}

export async function getSkills(req, res, next) {
  try {
    const skills = await readSkills();
    res.status(200).json(skills);
  } catch (err) {
    next(err);
  }
}

export async function addSkillItem(req, res, next) {
  try {
    const { category, value } = req.body;
    const skills = await readSkills();
    const list = skills[category] || [];
    if (!list.includes(value)) list.push(value);
    skills[category] = list;
    await writeSkills(skills);
    res.status(201).json({ category, value });
  } catch (err) {
    next(err);
  }
}

export async function updateSkillItem(req, res, next) {
  try {
    const { category, oldValue, newValue } = req.body;
    const skills = await readSkills();
    const list = skills[category] || [];
    const idx = list.indexOf(oldValue);
    if (idx === -1) return res.status(404).json({ error: "Item not found" });
    list[idx] = newValue;
    skills[category] = list;
    await writeSkills(skills);
    res.status(200).json({ category, value: newValue });
  } catch (err) {
    next(err);
  }
}

export async function deleteSkillItem(req, res, next) {
  try {
    const { category, value } = req.body;
    const skills = await readSkills();
    const list = skills[category] || [];
    const nextList = list.filter((v) => v !== value);
    if (nextList.length === list.length) return res.status(404).json({ error: "Item not found" });
    skills[category] = nextList;
    await writeSkills(skills);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}