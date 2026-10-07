import { useAuthStore } from "../store/authStore";

export default function Settings() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-forest-950">Settings</h1>

      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6">
        <p className="mb-4 text-sm font-semibold text-forest-950">Account</p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-black/5 pb-3">
            <span className="text-ink-900/60">Name</span>
            <span className="font-medium text-forest-950">{user?.name}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-3">
            <span className="text-ink-900/60">Email</span>
            <span className="font-medium text-forest-950">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-900/60">Role</span>
            <span className="font-medium capitalize text-forest-950">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <p className="mb-2 text-sm font-semibold text-forest-950">Business</p>
        <p className="text-sm text-ink-900/60">Currency: ETB</p>
        <p className="mt-1 text-xs text-ink-900/40">
          Business name, branches, and tax rate editing are planned for a future
          release.
        </p>
      </div>
    </div>
  );
}
