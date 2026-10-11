import AuditLog from "../models/AuditLog.js";
import { AUDIT_RULES } from "../config/auditRules.js";

async function record(rule, req, body) {
  const url = req.originalUrl.split("?")[0];
  const match = rule.path.exec(url);

  // Most routes know who is acting from the login token; login/register know it from their own response
  const actor = req.auth
    ? { user: req.auth.id, business: req.auth.business, role: req.auth.role }
    : body?.user
      ? {
          user: body.user.id,
          business: body.user.businessId,
          role: body.user.role,
        }
      : null;
  if (!actor?.business) return;

  let details = {};
  try {
    details = rule.describe({ req, body, match }) || {};
  } catch {
    // a describing hiccup must never lose the event itself
  }

  await AuditLog.create({
    business: actor.business,
    user: actor.user,
    role: actor.role,
    action: rule.action,
    entityType: details.entityType,
    entityId: details.entityId ? String(details.entityId) : undefined,
    summary: details.summary || rule.action,
    ip: req.ip,
  });
}

export function auditTrail(req, res, next) {
  const url = req.originalUrl.split("?")[0];
  const rule = AUDIT_RULES.find(
    (r) => r.method === req.method && r.path.test(url),
  );
  if (!rule) return next();

  // Remember what the server replies, so summaries can mention totals and names
  let responseBody;
  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    responseBody = payload;
    return originalJson(payload);
  };

  res.on("finish", () => {
    if (res.statusCode >= 400) return; // only successful actions are logged
    record(rule, req, responseBody).catch((err) =>
      console.error("Audit log write failed:", err.message),
    );
  });

  next();
}
