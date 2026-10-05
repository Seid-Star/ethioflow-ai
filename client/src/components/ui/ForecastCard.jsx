import { AlertTriangle, TrendingDown } from "lucide-react";

const statusStyles = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-700",
    icon: "text-red-500",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
    icon: "text-amber-500",
  },
  low_stock_no_velocity: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    icon: "text-gray-400",
  },
};

export default function ForecastCard({ forecast }) {
  const style =
    statusStyles[forecast.status] || statusStyles.low_stock_no_velocity;

  return (
    <div className={`rounded-xl border p-4 ${style.bg} ${style.border}`}>
      <div className="mb-1 flex items-center gap-2">
        <AlertTriangle size={15} className={style.icon} />
        <p className={`text-sm font-semibold ${style.text}`}>{forecast.name}</p>
      </div>

      {forecast.daysUntilStockout !== null ? (
        <>
          <p className={`text-xs ${style.text}`}>
            May run out in approximately{" "}
            <strong>
              {forecast.daysUntilStockout} day
              {forecast.daysUntilStockout !== 1 ? "s" : ""}
            </strong>
            . Average daily sales: {forecast.avgDailySales} units. Current
            stock: {forecast.currentStock} units.
          </p>
          <p
            className={`mt-1 flex items-center gap-1 text-xs font-medium ${style.text}`}
          >
            <TrendingDown size={12} /> Recommended order:{" "}
            {forecast.recommendedOrder} units
          </p>
        </>
      ) : (
        <p className="text-xs text-gray-500">
          Stock is at or below minimum ({forecast.currentStock}/
          {forecast.minStock}), but not enough sales history yet to predict a
          stockout date.
        </p>
      )}
    </div>
  );
}
