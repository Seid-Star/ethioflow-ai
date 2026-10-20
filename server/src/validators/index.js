import { body } from "express-validator";

export const validateRegister = [
  body("businessName")
    .trim()
    .notEmpty()
    .withMessage("Business name is required"),
  body("ownerName").trim().notEmpty().withMessage("Owner name is required"),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address"),
  body("phone").optional({ values: "falsy" }).trim(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const validateLogin = [
  body("password").notEmpty().withMessage("Password is required"),
];

export const validateProduct = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("costPrice")
    .isFloat({ min: 0 })
    .withMessage("Cost price must be 0 or more"),
  body("sellingPrice")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be 0 or more"),
  body("currentStock")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Stock cannot be negative"),
  body("minStock")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min stock cannot be negative"),
];

export const validateCustomer = [
  body("name").trim().notEmpty().withMessage("Customer name is required"),
  body("phone").optional().trim(),
];

export const validateSupplier = [
  body("name").trim().notEmpty().withMessage("Supplier name is required"),
];

export const validateExpense = [
  body("category")
    .isIn([
      "Rent",
      "Electricity",
      "Salary",
      "Transport",
      "Internet",
      "Maintenance",
      "Other",
    ])
    .withMessage("Invalid expense category"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
];

export const validateSaleCheckout = [
  body("items").isArray({ min: 1 }).withMessage("Cart cannot be empty"),
  body("items.*.productId").notEmpty().withMessage("Each item needs a product"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("payments")
    .isArray({ min: 1 })
    .withMessage("At least one payment is required"),
  body("payments.*.amount")
    .isFloat({ min: 0.01 })
    .withMessage("Payment amount must be greater than 0"),
];

export const validatePayment = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Payment amount must be greater than 0"),
];
