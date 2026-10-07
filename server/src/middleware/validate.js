import { validationResult } from "express-validator";

// Runs after express-validator's check(...) rules; turns failures into a clean 400
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg); // surface the first, clearest error
  }
  next();
}
