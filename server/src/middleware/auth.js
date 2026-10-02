import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// Checks the access token and attaches { id, business, role } to req.auth
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = decoded;
    next();
  } catch {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

// Restricts a route to specific roles, e.g. authorize('owner', 'manager')
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth || !allowedRoles.includes(req.auth.role)) {
      res.status(403);
      throw new Error("Forbidden: your role cannot do this");
    }
    next();
  };
}
