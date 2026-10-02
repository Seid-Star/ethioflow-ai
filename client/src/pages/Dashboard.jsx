import { useAuthStore } from "../store/authStore";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-forest-950">
        Good morning{user ? `, ${user.name}` : ""} 👋
      </h1>
      <p className="text-ink-900/60">
        Real KPIs and charts arrive on Day 16. Today: go to Products and add a
        few items.
      </p>
    </div>
  );
}
