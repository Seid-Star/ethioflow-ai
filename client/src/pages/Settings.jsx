import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/axios";
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  Coins,
  LockKeyhole,
  CircleUserRound,
  Camera,
  ImagePlus,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function getInitials(name) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ProfileDetail({ icon: Icon, label, value, last = false }) {
  return (
    <div
      className={`flex items-start gap-3 py-4 sm:items-center ${
        last ? "" : "border-b border-slate-100"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-800">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-forest-950">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef(null);
  const [profilePicture, setProfilePicture] = useState("");
  const [pictureMessage, setPictureMessage] = useState("");
  const [pictureError, setPictureError] = useState("");
  const [savingPicture, setSavingPicture] = useState(false);

  const pictureStorageKey = `ethioflow-profile-picture-${user?._id || user?.id || user?.email || "current-user"}`;

  useEffect(() => {
    const savedPicture = window.localStorage.getItem(pictureStorageKey);
    setProfilePicture(
      savedPicture || user?.profilePicture || user?.avatar || "",
    );
  }, [pictureStorageKey, user?.profilePicture, user?.avatar]);

  function handlePictureSelect(event) {
    const file = event.target.files?.[0];
    setPictureMessage("");
    setPictureError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPictureError("Please choose an image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPictureError("Choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProfilePicture(String(reader.result || ""));
    reader.onerror = () =>
      setPictureError("The image could not be read. Please try another file.");
    reader.readAsDataURL(file);
  }

  function saveProfilePicture() {
    if (!profilePicture) {
      setPictureError("Choose a picture first.");
      return;
    }

    setPictureMessage("");
    setPictureError("");
    setSavingPicture(true);
    try {
      window.localStorage.setItem(pictureStorageKey, profilePicture);
      setPictureMessage("Profile picture saved on this browser.");
    } catch {
      setPictureError(
        "This image is too large to save in browser storage. Choose a smaller image.",
      );
    } finally {
      setSavingPicture(false);
    }
  }

  function cancelPictureChange() {
    const savedPicture = window.localStorage.getItem(pictureStorageKey);
    setProfilePicture(
      savedPicture || user?.profilePicture || user?.avatar || "",
    );
    setPictureMessage("");
    setPictureError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  const role = user?.role ? user.role.replace(/[_-]/g, " ") : "User";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            Account preferences
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-forest-950 sm:text-3xl">
            Profile & Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            View your account details and business configuration.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Account overview
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-forest-900 via-forest-700 to-gold-500" />
        <div className="p-5 sm:p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-forest-900 text-2xl font-bold text-white shadow-lg shadow-forest-900/15 ring-4 ring-forest-50 sm:text-3xl">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Choose profile picture"
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-gold-500 text-forest-950 shadow-md transition hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
              >
                <Camera size={17} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePictureSelect}
                className="hidden"
                aria-label="Upload profile picture"
              />
            </div>
            <div className="min-w-0 w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Your profile
              </p>
              <h2 className="mt-1 w-full break-words [overflow-wrap:anywhere] text-xl font-bold leading-tight text-forest-950 sm:text-2xl">
                {user?.name || "Account user"}
              </h2>
              <p className="mt-1 w-full break-words [overflow-wrap:anywhere] text-sm text-slate-500">
                {user?.email || "No email address added"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold capitalize text-forest-800">
                  <ShieldCheck size={14} /> {role}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  <LockKeyhole size={13} /> Account details
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 sm:pl-[116px]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-forest-900 transition hover:border-forest-300 hover:bg-forest-50"
            >
              <ImagePlus size={16} /> Choose photo
            </button>
            {profilePicture && (
              <button
                type="button"
                onClick={cancelPictureChange}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={15} /> Cancel
              </button>
            )}
            <button
              type="button"
              onClick={saveProfilePicture}
              disabled={savingPicture || !profilePicture}
              className="inline-flex items-center justify-center rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingPicture ? "Saving…" : "Save picture"}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400 sm:pl-[116px]">
            JPG, PNG, or other image formats · Maximum 5 MB
          </p>
          {pictureMessage && (
            <p
              className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700 sm:pl-[116px]"
              role="status"
            >
              <CheckCircle2 size={16} /> {pictureMessage}
            </p>
          )}
          {pictureError && (
            <p
              className="mt-3 flex items-start gap-2 text-sm font-medium text-red-600 sm:pl-[116px]"
              role="alert"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />{" "}
              {pictureError}
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-800">
              <UserRound size={20} />
            </div>
            <div>
              <h3 className="font-bold text-forest-950">
                Personal information
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                The account information currently associated with you
              </p>
            </div>
          </div>

          <div className="mt-4">
            <ProfileDetail
              icon={UserRound}
              label="Full name"
              value={user?.name}
            />
            {user?.email && (
              <ProfileDetail
                icon={Mail}
                label="Email address"
                value={user.email}
              />
            )}
            {user?.phone && (
              <ProfileDetail
                icon={Phone}
                label="Phone number"
                value={user.phone}
              />
            )}
            <ProfileDetail
              icon={ShieldCheck}
              label="Account role"
              value={role}
              last
            />
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
            <LockKeyhole size={17} className="mt-0.5 shrink-0 text-amber-700" />
            <p className="text-xs leading-5 text-amber-900/80">
              Profile details are displayed here for reference. Editing account
              information is not available in this version.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-gold-600">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-forest-950">Business settings</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Current business defaults
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-forest-800 shadow-sm ring-1 ring-slate-100">
                <Coins size={19} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Currency
                </p>
                <p className="mt-1 text-base font-bold text-forest-950">ETB</p>
                <p className="text-xs text-slate-500">Ethiopian Birr</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                Active
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4">
            <p className="text-sm font-semibold text-forest-950">
              More business controls
            </p>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Business name, branches, and tax rate editing are planned for a
              future release.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-500">
                Business name
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-500">
                Branches
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-500">
                Tax rate
              </span>
            </div>
          </div>
        </section>
      </div>

      <footer className="flex flex-col gap-1 border-t border-slate-200/80 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>EthioFlow AI · Profile settings</span>
        <span>Your account information at a glance</span>
      </footer>
    </div>
  );
}
