import express from "express";
import { body, validationResult } from "express-validator";
import { listItems, addItem, updateItem, deleteItem } from "../controllers/contactItemsController.js";

const router = express.Router();

const validators = [
  body("title").isString().trim().notEmpty().withMessage("title is required"),
  body("value").isString().trim().notEmpty().withMessage("value is required"),
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
