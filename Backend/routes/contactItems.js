import express from "express";
import { body, validationResult } from "express-validator";
import { listItems, addItem, updateItem, deleteItem } from "../controllers/contactItemsController.js";
import { adminOnly } from "../middleware/auth.js";

const router = express.Router();

const validators = [
  body("value").isString().trim().notEmpty().withMessage("value is required"),
  body("title").optional().isString().trim(),
  body("titleEn").optional().isString().trim(),
  body("titleFr").optional().isString().trim(),
];

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).json({ errors: result.array() });
  next();
}

router.get("/", listItems);
router.post("/", adminOnly, validators, validate, addItem);
router.put("/:id", adminOnly, validators, validate, updateItem);
router.delete("/:id", adminOnly, deleteItem);

export default router;
