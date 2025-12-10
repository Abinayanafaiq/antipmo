import jwt from "jsonwebtoken";

export function getUserIdFromRequest(req) {
  // req adalah instance NextRequest di app route
  const token = req.cookies.get("auth")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (e) {
    return null;
  }
}
