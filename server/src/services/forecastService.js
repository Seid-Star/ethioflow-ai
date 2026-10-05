import InventoryMovement from "../models/InventoryMovement.js";
import Product from "../models/Product.js";

const LOOKBACK_DAYS = 14; // how far back we average sales velocity from

// Average daily units sold for one product, over the lookback window
async function getAverageDailySales(businessId, productId) {
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);

  const movements = await InventoryMovement.find({
    business: businessId,
    product: productId,
    type: "sale",
    createdAt: { $gte: since },
  });

  if (movements.length === 0) return 0;

  const totalSold = movements.reduce((sum, m) => sum + Math.abs(m.change), 0);

  // Use the actual number of days since the earliest sale in-window, not always 14 —
  // a product only 3 days old in the system shouldn't have its velocity diluted by
  // 11 days where it couldn't possibly have sold anything yet.
  const earliestDate = movements.reduce(
    (earliest, m) => (m.createdAt < earliest ? m.createdAt : earliest),
    movements[0].createdAt,
  );
  const daysElapsed = Math.max(
    1,
    Math.ceil((Date.now() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return totalSold / daysElapsed;
}

// One product's forecast: days until stockout, and a recommended reorder quantity
export async function getProductForecast(businessId, product) {
  const avgDailySales = await getAverageDailySales(businessId, product._id);

  if (avgDailySales === 0) {
    return {
      productId: product._id,
      name: product.name,
      currentStock: product.currentStock,
      minStock: product.minStock,
      avgDailySales: 0,
      daysUntilStockout: null, // unknown — not enough sales history to predict
      recommendedOrder: null,
      status:
        product.currentStock <= product.minStock
          ? "low_stock_no_velocity"
          : "ok",
    };
  }

  const daysUntilStockout = Math.floor(product.currentStock / avgDailySales);

  // Reorder enough to cover 14 days of expected demand, topped up to clear the minStock buffer
  const recommendedOrder = Math.ceil(avgDailySales * LOOKBACK_DAYS);

  let status = "ok";
  if (daysUntilStockout <= 3) status = "critical";
  else if (daysUntilStockout <= 7) status = "warning";

  return {
    productId: product._id,
    name: product.name,
    currentStock: product.currentStock,
    minStock: product.minStock,
    avgDailySales: Math.round(avgDailySales * 10) / 10,
    daysUntilStockout,
    recommendedOrder,
    status,
  };
}

// Forecasts for every active product, sorted so the most urgent appears first
export async function getAllForecasts(businessId) {
  const products = await Product.find({ business: businessId, isActive: true });
  const forecasts = await Promise.all(
    products.map((p) => getProductForecast(businessId, p)),
  );

  const statusRank = {
    critical: 0,
    warning: 1,
    low_stock_no_velocity: 2,
    ok: 3,
  };
  return forecasts.sort((a, b) => statusRank[a.status] - statusRank[b.status]);
}
