import express from "express";
import { body, validationResult } from "express-validator";
import { listItems, addItem, updateItem, deleteItem } from "../controllers/contactItemsController.js";

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
router.post("/", validators, validate, addItem);
router.put("/:id", validators, validate, updateItem);
router.delete("/:id", deleteItem);

export default router;
