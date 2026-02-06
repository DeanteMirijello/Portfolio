import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, "../data/projects.json");

const FRONTEND_EN_PATH = path.resolve(__dirname, "../../Frontend/public/js/en.json");
const FRONTEND_FR_PATH = path.resolve(__dirname, "../../Frontend/public/js/fr.json");

function isValidId(id) {
  return typeof id === "string" && /^[a-z0-9-]{2,}$/i.test(id);
}

function pickProjectKeys(dict, id) {
  return {
    title: dict[`projects.${id}.title`] ?? "",
    date: dict[`projects.${id}.date`] ?? "",
    desc: dict[`projects.${id}.desc`] ?? "",
  };
}

async function getI18nDefaults(existingIds = []) {
  try {
    const enRaw = await fs.readFile(FRONTEND_EN_PATH, "utf-8");
    const frRaw = await fs.readFile(FRONTEND_FR_PATH, "utf-8");
    const en = JSON.parse(enRaw);
    const fr = JSON.parse(frRaw);
    const def = {};
    const ids = existingIds.length ? existingIds : Object.keys(en).filter(k => k.startsWith("projects.")).map(k => k.split(".")[1]);
    for (const id of ids) {
      def[id] = {
        image: "/assets/image1.png",
        en: pickProjectKeys(en, id),
        fr: pickProjectKeys(fr, id),
      };
    }
    return def;
  } catch {
    const def = {};
    const ids = existingIds.length ? existingIds : ["dm","pet","iot","bowling"];
    for (const id of ids) {
      def[id] = {
        image: "/assets/image1.png",
        en: { title: "", date: "", desc: "" },
        fr: { title: "", date: "", desc: "" },
      };
    }
    return def;
  }
}

async function readProjects() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    const ids = Object.keys(data);
    const defaults = await getI18nDefaults(ids);
    const merged = {};
    for (const id of ids) {
      merged[id] = {
        image: (data[id]?.image) || defaults[id]?.image || "/assets/image1.png",
        en: { ...(defaults[id]?.en || {}), ...(data[id]?.en || {}) },
        fr: { ...(defaults[id]?.fr || {}), ...(data[id]?.fr || {}) },
      };
    }
    return merged;
  } catch (err) {
    if (err.code === "ENOENT") return await getI18nDefaults();
    throw err;
  }
}

async function writeProjects(projects) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(projects, null, 2), "utf-8");
}

async function updateFrontendI18n(id, entry) {
  try {
    const enRaw = await fs.readFile(FRONTEND_EN_PATH, "utf-8");
    const frRaw = await fs.readFile(FRONTEND_FR_PATH, "utf-8");
    const en = JSON.parse(enRaw);
    const fr = JSON.parse(frRaw);

    en[`projects.${id}.title`] = entry.en.title;
    en[`projects.${id}.date`] = entry.en.date;
    en[`projects.${id}.desc`] = entry.en.desc;

    fr[`projects.${id}.title`] = entry.fr.title;
    fr[`projects.${id}.date`] = entry.fr.date;
    fr[`projects.${id}.desc`] = entry.fr.desc;

    await fs.writeFile(FRONTEND_EN_PATH, JSON.stringify(en, null, 2), "utf-8");
    await fs.writeFile(FRONTEND_FR_PATH, JSON.stringify(fr, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to update frontend i18n for projects:", err.message);
  }
}

export async function listProjects(req, res, next) {
  try {
    const projects = await readProjects();
    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const id = req.params.id;
    const projects = await readProjects();
    if (!projects[id]) return res.status(404).json({ error: "Invalid project id" });
    res.status(200).json(projects[id]);
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req, res, next) {
  try {
    const id = req.params.id;
    const projects = await readProjects();
    const curr = projects[id];
    if (!curr) return res.status(404).json({ error: "Invalid project id" });
    const { image, en, fr } = req.body;
    const nextEntry = {
      image: typeof image === "string" && image.trim() ? image.trim() : curr.image,
      en: {
        title: en?.title ?? curr.en.title,
        date: en?.date ?? curr.en.date,
        desc: en?.desc ?? curr.en.desc,
      },
      fr: {
        title: fr?.title ?? curr.fr.title,
        date: fr?.date ?? curr.fr.date,
        desc: fr?.desc ?? curr.fr.desc,
      },
    };

    projects[id] = nextEntry;
    await writeProjects(projects);
    await updateFrontendI18n(id, nextEntry);
    res.status(200).json(nextEntry);
  } catch (err) {
    next(err);
  }
}

export async function createProject(req, res, next) {
  try {
    const { id, image, en, fr } = req.body;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid id. Use letters, numbers, dashes." });
    let projects = {};
    try {
      const raw = await fs.readFile(DATA_PATH, "utf-8");
      projects = JSON.parse(raw);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
    if (projects[id]) return res.status(409).json({ error: "Project id already exists" });

    const entry = {
      image: typeof image === "string" && image.trim() ? image.trim() : "/assets/image1.png",
      en: {
        title: en?.title ?? "",
        date: en?.date ?? "",
        desc: en?.desc ?? "",
      },
      fr: {
        title: fr?.title ?? "",
        date: fr?.date ?? "",
        desc: fr?.desc ?? "",
      },
    };

    projects[id] = entry;
    await writeProjects(projects);
    await updateFrontendI18n(id, entry);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const id = req.params.id;
    let projects = {};
    try {
      const raw = await fs.readFile(DATA_PATH, "utf-8");
      projects = JSON.parse(raw);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
    if (!projects[id]) return res.status(404).json({ error: "Invalid project id" });
    delete projects[id];
    await writeProjects(projects);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
