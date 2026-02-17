import express from "express";
import { body, validationResult } from "express-validator";
import { handleContact, getContact, updateContact, listContactMessages } from "../controllers/contactController.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = express.Router();

const validateContactMessage = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
  body("message")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters"),
];

const validateContactInfo = [
  body("location").optional().isString().isLength({ min: 2 }).withMessage("Location too short"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("github")
    .optional()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("GitHub URL invalid"),
  body("linkedin")
    .optional()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("LinkedIn URL invalid"),
];

// Read contact info
router.get("/", (req, res, next) => {
  return getContact(req, res, next);
});

// Update contact info (admin-like edit, no auth yet)
router.put("/", adminOnly, validateContactInfo, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return updateContact(req, res, next);
});

// Submit a contact message
router.post("/message", authRequired, validateContactMessage, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return handleContact(req, res, next);
});

// List incoming contact messages (requires authenticated user)
router.get("/messages", authRequired, (req, res, next) => {
  return listContactMessages(req, res, next);
});

export default router;