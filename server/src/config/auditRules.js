const money = (n) => `${Number(n || 0).toLocaleString()} ETB`;
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export const AUDIT_CATEGORIES = [
  "auth",
  "product",
  "inventory",
  "sale",
  "customer",
  "supplier",
  "purchase",
  "expense",
  "employee",
  "subscription",
];

// Each rule: which request to watch, what to call it, and how to describe it in plain words.
// describe({ req, body, match }) gets the request, the JSON the server replied with, and the URL match.
export const AUDIT_RULES = [
  {
    method: "POST",
    path: /^\/api\/auth\/login$/,
    action: "auth.login",
    describe: ({ body }) => ({
      summary: `Logged in as ${body?.user?.name || "user"}`,
      entityType: "user",
      entityId: body?.user?.id,
    }),
  },
  {
    method: "POST",
    path: /^\/api\/auth\/register$/,
    action: "auth.register",
    describe: ({ body }) => ({
      summary: "Created the business account",
      entityType: "user",
      entityId: body?.user?.id,
    }),
  },

  {
    method: "POST",
    path: /^\/api\/products$/,
    action: "product.create",
    describe: ({ req, body }) => ({
      summary: `Added product "${body?.name || req.body?.name}"`,
      entityType: "product",
      entityId: body?._id,
    }),
  },
  {
    method: "PUT",
    path: /^\/api\/products\/([^/]+)$/,
    action: "product.update",
    describe: ({ body, match }) => ({
      summary: `Updated product "${body?.name || "item"}"`,
      entityType: "product",
      entityId: match[1],
    }),
  },
  {
    method: "DELETE",
    path: /^\/api\/products\/([^/]+)$/,
    action: "product.delete",
    describe: ({ match }) => ({
      summary: "Removed a product from the catalogue",
      entityType: "product",
      entityId: match[1],
    }),
  },

  {
    method: "POST",
    path: /^\/api\/inventory\/stock-in$/,
    action: "inventory.stock_in",
    describe: ({ body }) => ({
      summary: `Stock in: +${body?.movement?.change} x ${body?.product?.name}${body?.movement?.reason ? ` (${body.movement.reason})` : ""}`,
      entityType: "product",
      entityId: body?.product?._id,
    }),
  },
  {
    method: "POST",
    path: /^\/api\/inventory\/adjust$/,
    action: "inventory.adjust",
    describe: ({ body }) => {
      const change = body?.movement?.change;
      return {
        summary: `Stock adjustment: ${change > 0 ? "+" : ""}${change} x ${body?.product?.name}${body?.movement?.reason ? ` (${body.movement.reason})` : ""}`,
        entityType: "product",
        entityId: body?.product?._id,
      };
    },
  },

  {
    method: "POST",
    path: /^\/api\/sales$/,
    action: "sale.create",
    describe: ({ body }) => ({
      summary: `Sale of ${money(body?.total)} - ${plural(body?.items?.length || 0, "item")}`,
      entityType: "sale",
      entityId: body?._id,
    }),
  },
  {
    method: "POST",
    path: /^\/api\/sales\/([^/]+)\/refund$/,
    action: "sale.refund",
    describe: ({ req, body, match }) => ({
      summary: `Refunded ${money(body?.amount)}${req.body?.reason ? ` (${req.body.reason})` : ""}`,
      entityType: "sale",
      entityId: match[1],
    }),
  },
  {
    method: "POST",
    path: /^\/api\/sync\/sales$/,
    action: "sale.sync_offline",
    describe: ({ body }) => {
      const results = body?.results || [];
      const synced = results.filter((r) =>
        String(r.status).startsWith("synced"),
      ).length;
      const conflicts = results.filter(
        (r) => r.status === "synced_with_conflict",
      ).length;
      return {
        summary: `Synced ${plural(synced, "offline sale")}${conflicts ? ` (${conflicts} with stock conflicts)` : ""}`,
      };
    },
  },

  {
    method: "POST",
    path: /^\/api\/customers$/,
    action: "customer.create",
    describe: ({ body }) => ({
      summary: `Added customer "${body?.name}"`,
      entityType: "customer",
      entityId: body?._id,
    }),
  },
  {
    method: "POST",
    path: /^\/api\/customers\/([^/]+)\/payments$/,
    action: "customer.payment",
    describe: ({ req, body, match }) => ({
      summary: `Received ${money(req.body?.amount)} from ${body?.name || "a customer"}`,
      entityType: "customer",
      entityId: match[1],
    }),
  },

  {
    method: "POST",
    path: /^\/api\/suppliers$/,
    action: "supplier.create",
    describe: ({ body }) => ({
      summary: `Added supplier "${body?.name}"`,
      entityType: "supplier",
      entityId: body?._id,
    }),
  },
  {
    method: "POST",
    path: /^\/api\/suppliers\/([^/]+)\/payments$/,
    action: "supplier.payment",
    describe: ({ req, body, match }) => ({
      summary: `Paid ${money(req.body?.amount)} to ${body?.name || "a supplier"}`,
      entityType: "supplier",
      entityId: match[1],
    }),
  },

  {
    method: "POST",
    path: /^\/api\/purchases$/,
    action: "purchase.create",
    describe: ({ body }) => ({
      summary: `Purchase of ${money(body?.totalAmount)} - ${plural(body?.items?.length || 0, "item")}`,
      entityType: "purchase",
      entityId: body?._id,
    }),
  },

  {
    method: "POST",
    path: /^\/api\/expenses$/,
    action: "expense.create",
    describe: ({ req, body }) => ({
      summary: `Expense: ${req.body?.category} ${money(body?.amount)}`,
      entityType: "expense",
      entityId: body?._id,
    }),
  },
  {
    method: "DELETE",
    path: /^\/api\/expenses\/([^/]+)$/,
    action: "expense.delete",
    describe: ({ match }) => ({
      summary: "Deleted an expense",
      entityType: "expense",
      entityId: match[1],
    }),
  },

  {
    method: "POST",
    path: /^\/api\/employees$/,
    action: "employee.create",
    describe: ({ body }) => ({
      summary: `Added employee "${body?.name}"`,
      entityType: "employee",
      entityId: body?._id,
    }),
  },
  {
    method: "PUT",
    path: /^\/api\/employees\/([^/]+)$/,
    action: "employee.update",
    describe: ({ body, match }) => ({
      summary: `Updated employee "${body?.name}"`,
      entityType: "employee",
      entityId: match[1],
    }),
  },
  {
    method: "DELETE",
    path: /^\/api\/employees\/([^/]+)$/,
    action: "employee.deactivate",
    describe: ({ body, match }) => ({
      summary: `Deactivated employee "${body?.name}"`,
      entityType: "employee",
      entityId: match[1],
    }),
  },
  {
    method: "POST",
    path: /^\/api\/employees\/leave-requests\/([^/]+)\/review$/,
    action: "employee.leave_review",
    describe: ({ body, match }) => ({
      summary: `Leave request ${body?.status}`,
      entityType: "leave",
      entityId: match[1],
    }),
  },

  {
    method: "POST",
    path: /^\/api\/subscription\/checkout$/,
    action: "subscription.change",
    describe: ({ body }) => ({
      summary: `Switched to the ${cap(body?.invoice?.plan)} plan (${body?.invoice?.billingCycle}) - ${money(body?.invoice?.amount)}`,
      entityType: "subscription",
    }),
  },
  {
    method: "POST",
    path: /^\/api\/subscription\/cancel$/,
    action: "subscription.cancel",
    describe: () => ({
      summary: "Cancelled the subscription",
      entityType: "subscription",
    }),
  },
];
