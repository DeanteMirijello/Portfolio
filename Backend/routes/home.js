import express from "express";
import { body, validationResult } from "express-validator";
import { getHome, updateHome } from "../controllers/homeController.js";

const router = express.Router();

const validateHome = [
  body("image").optional().isString().trim(),
  body("en").optional().isObject(),
  body("fr").optional().isObject(),
  body("en.title").optional().isString().trim(),
  body("en.subtitle").optional().isString().trim(),
  body("en.current").optional().isString().trim(),
  body("en.li1").optional().isString().trim(),
  body("en.li2").optional().isString().trim(),
  body("en.li3").optional().isString().trim(),
  body("fr.title").optional().isString().trim(),
  body("fr.subtitle").optional().isString().trim(),
  body("fr.current").optional().isString().trim(),
  body("fr.li1").optional().isString().trim(),
  body("fr.li2").optional().isString().trim(),
  body("fr.li3").optional().isString().trim(),
];

router.get("/", (req, res, next) => getHome(req, res, next));

router.put("/", validateHome, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return updateHome(req, res, next);
});

export default router;
