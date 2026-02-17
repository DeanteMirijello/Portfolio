import express from "express";
import { body, validationResult } from "express-validator";
import {
  listTestimonials,
  listAllTestimonials,
  createTestimonial,
  canSubmitTestimonial,
  updateTestimonial,
  approveTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialsController.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = express.Router();

const validateCreate = [
  body("author").trim().isLength({ min: 2 }).withMessage("Author is required"),
  body("quote").trim().isLength({ min: 10 }).withMessage("Quote must be at least 10 characters"),
  body("role").optional().isString(),
];

const validateUpdate = [
  body("author").trim().isLength({ min: 2 }).withMessage("Author is required"),
  body("quote").trim().isLength({ min: 10 }).withMessage("Quote must be at least 10 characters"),
  body("role").optional().isString(),
];

router.get("/", (req, res, next) => listTestimonials(req, res, next));
router.get("/admin", adminOnly, (req, res, next) => listAllTestimonials(req, res, next));
router.get("/can-submit", authRequired, (req, res, next) => canSubmitTestimonial(req, res, next));

router.post("/", authRequired, validateCreate, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return createTestimonial(req, res, next);
});

router.put("/:id", adminOnly, validateUpdate, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return updateTestimonial(req, res, next);
});

router.put("/:id/approve", adminOnly, (req, res, next) => {
  return approveTestimonial(req, res, next);
});

router.delete("/:id", adminOnly, (req, res, next) => deleteTestimonial(req, res, next));

export default router;