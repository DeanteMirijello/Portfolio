import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, "../data/skills.json");
const TITLES_PATH = path.resolve(__dirname, "../data/skills-titles.json");

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

async function readTitles() {
  try {
    const raw = await fs.readFile(TITLES_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
}

async function writeTitles(titles) {
  await fs.mkdir(path.dirname(TITLES_PATH), { recursive: true });
  await fs.writeFile(TITLES_PATH, JSON.stringify(titles, null, 2), "utf-8");
}

export async function getSkills(req, res, next) {
  try {
    const skills = await readSkills();
    res.status(200).json(skills);
  } catch (err) {
    next(err);
  }
}

export async function getSkillTitles(req, res, next) {
  try {
    const titles = await readTitles();
    res.status(200).json(titles);
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

// Type management
export async function addSkillType(req, res, next) {
  try {
    const { name } = req.body;
    const skills = await readSkills();
    if (!skills[name]) skills[name] = [];
    const titles = await readTitles();
    if (!titles[name]) titles[name] = { en: name, fr: name };
    await writeSkills(skills);
    await writeTitles(titles);
    res.status(201).json({ name });
  } catch (err) {
    next(err);
  }
}

export async function renameSkillType(req, res, next) {
  try {
    const { name } = req.params;
    const { newName } = req.body;
    const skills = await readSkills();
    if (!skills[name]) return res.status(404).json({ error: "Type not found" });
    if (skills[newName]) return res.status(400).json({ error: "New name already exists" });
    skills[newName] = skills[name];
    delete skills[name];
    const titles = await readTitles();
    if (titles[name]) {
      titles[newName] = titles[name];
      delete titles[name];
    }
    await writeSkills(skills);
    await writeTitles(titles);
    res.status(200).json({ name: newName });
  } catch (err) {
    next(err);
  }
}

export async function deleteSkillType(req, res, next) {
  try {
    const { name } = req.params;
    const skills = await readSkills();
    if (!skills[name]) return res.status(404).json({ error: "Type not found" });
    delete skills[name];
    const titles = await readTitles();
    if (titles[name]) delete titles[name];
    await writeSkills(skills);
    await writeTitles(titles);
    res.status(204).end();
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

export async function updateSkillTypeTitles(req, res, next) {
  try {
    const { name } = req.params;
    const { en, fr } = req.body;
    const skills = await readSkills();
    if (!skills[name]) return res.status(404).json({ error: "Type not found" });
    const titles = await readTitles();
    titles[name] = { en: en || name, fr: fr || name };
    await writeTitles(titles);
    res.status(200).json({ name, titles: titles[name] });
  } catch (err) {
    next(err);
  }
}