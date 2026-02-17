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
  school: {
    en: {
      program: "Computer Science Program",
      date: "Current studies",
      bullets: [
        "Developing strong foundations in software design, object-oriented programming, and data structures.",
        "Building team projects using Agile/Scrum, Git workflows, and API-first development.",
        "Applying classroom concepts to full-stack projects and practical problem solving.",
      ],
    },
    fr: {
      program: "Programme d’informatique",
      date: "Études en cours",
      bullets: [
        "Développer de solides bases en conception logicielle, programmation orientée objet et structures de données.",
        "Réaliser des projets d’équipe avec Agile/Scrum, des workflows Git et une approche API-first.",
        "Appliquer les concepts appris en classe à des projets full-stack et à la résolution de problèmes concrets.",
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
      school: {
        en: {
          program: data.school?.en?.program || DEFAULT_ABOUT.school.en.program,
          date: data.school?.en?.date || DEFAULT_ABOUT.school.en.date,
          bullets: Array.isArray(data.school?.en?.bullets)
            ? data.school.en.bullets
            : DEFAULT_ABOUT.school.en.bullets,
        },
        fr: {
          program: data.school?.fr?.program || DEFAULT_ABOUT.school.fr.program,
          date: data.school?.fr?.date || DEFAULT_ABOUT.school.fr.date,
          bullets: Array.isArray(data.school?.fr?.bullets)
            ? data.school.fr.bullets
            : DEFAULT_ABOUT.school.fr.bullets,
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
    const nextAbout = { work: nextWork, school: current.school };
    await writeAbout(nextAbout);
    res.status(200).json(nextWork);
  } catch (err) {
    next(err);
  }
}

export async function getSchool(req, res, next) {
  try {
    const about = await readAbout();
    res.status(200).json(about.school);
  } catch (err) {
    next(err);
  }
}

export async function updateSchool(req, res, next) {
  try {
    const current = await readAbout();
    const body = req.body || {};
    const nextSchool = {
      en: {
        program: body.en?.program ?? current.school.en.program,
        date: body.en?.date ?? current.school.en.date,
        bullets: Array.isArray(body.en?.bullets) ? body.en.bullets : current.school.en.bullets,
      },
      fr: {
        program: body.fr?.program ?? current.school.fr.program,
        date: body.fr?.date ?? current.school.fr.date,
        bullets: Array.isArray(body.fr?.bullets) ? body.fr.bullets : current.school.fr.bullets,
      },
    };

    const nextAbout = { work: current.work, school: nextSchool };
    await writeAbout(nextAbout);
    res.status(200).json(nextSchool);
  } catch (err) {
    next(err);
  }
}
