import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, "../data/about.json");

const DEFAULT_ABOUT = {
  work: {
    company: "Costco",
    en: {
      role: "Stocker",
      date: "Jun 2023 – Present",
      bullets: [
        "Collaborated on inventory and aisle organization.",
        "Helped customers in English and French.",
        "Supported and guided new team members.",
      ],
    },
    fr: {
      role: "Commis de stock",
      date: "juin 2023 – présent",
      bullets: [
        "Collaboré à l’inventaire et à l’organisation des allées.",
        "Aidé les clients en anglais et en français.",
        "Soutenu et guidé les nouveaux membres.",
      ],
    },
  },
};

async function readAbout() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    return {
      work: {
        company: data.work?.company || DEFAULT_ABOUT.work.company,
        en: {
          role: data.work?.en?.role || DEFAULT_ABOUT.work.en.role,
          date: data.work?.en?.date || DEFAULT_ABOUT.work.en.date,
          bullets: Array.isArray(data.work?.en?.bullets) ? data.work.en.bullets : DEFAULT_ABOUT.work.en.bullets,
        },
        fr: {
          role: data.work?.fr?.role || DEFAULT_ABOUT.work.fr.role,
          date: data.work?.fr?.date || DEFAULT_ABOUT.work.fr.date,
          bullets: Array.isArray(data.work?.fr?.bullets) ? data.work.fr.bullets : DEFAULT_ABOUT.work.fr.bullets,
        },
      },
    };
  } catch (err) {
    if (err.code === "ENOENT") return DEFAULT_ABOUT;
    throw err;
  }
}

async function writeAbout(about) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(about, null, 2), "utf-8");
}

export async function getWork(req, res, next) {
  try {
    const about = await readAbout();
    res.status(200).json(about.work);
  } catch (err) {
    next(err);
  }
}

export async function updateWork(req, res, next) {
  try {
    const current = await readAbout();
    const body = req.body || {};
    const nextWork = {
      company: typeof body.company === "string" && body.company.trim() ? body.company.trim() : current.work.company,
      en: {
        role: body.en?.role ?? current.work.en.role,
        date: body.en?.date ?? current.work.en.date,
        bullets: Array.isArray(body.en?.bullets) ? body.en.bullets : current.work.en.bullets,
      },
      fr: {
        role: body.fr?.role ?? current.work.fr.role,
        date: body.fr?.date ?? current.work.fr.date,
        bullets: Array.isArray(body.fr?.bullets) ? body.fr.bullets : current.work.fr.bullets,
      },
    };
    const nextAbout = { work: nextWork };
    await writeAbout(nextAbout);
    res.status(200).json(nextWork);
  } catch (err) {
    next(err);
  }
}
