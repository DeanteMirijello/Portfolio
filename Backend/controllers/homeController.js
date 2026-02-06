import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, "../data/home.json");

// Paths to frontend i18n files to keep translations in sync
const FRONTEND_EN_PATH = path.resolve(__dirname, "../../Frontend/public/js/en.json");
const FRONTEND_FR_PATH = path.resolve(__dirname, "../../Frontend/public/js/fr.json");

const DEFAULT_HOME = {
  image: "/assets/image1.png",
  en: {
    title: "Hello, I’m Deante",
    subtitle: "I am a computer science student interested in software development and building practical applications.",
    li1: "Information about me and my background",
    li2: "Projects I have worked on during my studies",
    li3: "Ways to contact me",
  },
  fr: {
    title: "Salut, moi c’est Deante",
    subtitle: "Je suis étudiant en informatique et je m’intéresse au développement logiciel et aux applications concrètes.",
    li1: "Des infos sur moi et mon parcours",
    li2: "Des projets réalisés pendant mes études",
    li3: "Comment me contacter",
  },
};

async function readHome() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    // Merge defaults to ensure all fields exist
    return {
      image: data.image || DEFAULT_HOME.image,
      en: { ...DEFAULT_HOME.en, ...(data.en || {}) },
      fr: { ...DEFAULT_HOME.fr, ...(data.fr || {}) },
    };
  } catch (err) {
    if (err.code === "ENOENT") return DEFAULT_HOME;
    throw err;
  }
}

async function writeHome(home) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(home, null, 2), "utf-8");
}

async function updateFrontendI18n(home) {
  // Update home.* keys in en.json and fr.json to reflect admin edits
  try {
    const enRaw = await fs.readFile(FRONTEND_EN_PATH, "utf-8");
    const frRaw = await fs.readFile(FRONTEND_FR_PATH, "utf-8");
    const enDict = JSON.parse(enRaw);
    const frDict = JSON.parse(frRaw);

    enDict["home.title"] = home.en.title;
    enDict["home.subtitle"] = home.en.subtitle;
    enDict["home.li1"] = home.en.li1;
    enDict["home.li2"] = home.en.li2;
    enDict["home.li3"] = home.en.li3;

    frDict["home.title"] = home.fr.title;
    frDict["home.subtitle"] = home.fr.subtitle;
    frDict["home.li1"] = home.fr.li1;
    frDict["home.li2"] = home.fr.li2;
    frDict["home.li3"] = home.fr.li3;

    await fs.writeFile(FRONTEND_EN_PATH, JSON.stringify(enDict, null, 2), "utf-8");
    await fs.writeFile(FRONTEND_FR_PATH, JSON.stringify(frDict, null, 2), "utf-8");
  } catch (err) {
    // If i18n files are missing, ignore; site will still use backend data if needed
    console.warn("Failed to update frontend i18n:", err.message);
  }
}

export async function getHome(req, res, next) {
  try {
    const home = await readHome();
    res.status(200).json(home);
  } catch (err) {
    next(err);
  }
}

export async function updateHome(req, res, next) {
  try {
    const { image, en, fr } = req.body;
    const nextHome = {
      image: typeof image === "string" && image.trim() ? image.trim() : DEFAULT_HOME.image,
      en: {
        title: en?.title ?? DEFAULT_HOME.en.title,
        subtitle: en?.subtitle ?? DEFAULT_HOME.en.subtitle,
        li1: en?.li1 ?? DEFAULT_HOME.en.li1,
        li2: en?.li2 ?? DEFAULT_HOME.en.li2,
        li3: en?.li3 ?? DEFAULT_HOME.en.li3,
      },
      fr: {
        title: fr?.title ?? DEFAULT_HOME.fr.title,
        subtitle: fr?.subtitle ?? DEFAULT_HOME.fr.subtitle,
        li1: fr?.li1 ?? DEFAULT_HOME.fr.li1,
        li2: fr?.li2 ?? DEFAULT_HOME.fr.li2,
        li3: fr?.li3 ?? DEFAULT_HOME.fr.li3,
      },
    };

    await writeHome(nextHome);
    await updateFrontendI18n(nextHome);
    res.status(200).json(nextHome);
  } catch (err) {
    next(err);
  }
}
