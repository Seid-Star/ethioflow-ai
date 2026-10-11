import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { CheckCircle2, AlertCircle, CameraOff } from "lucide-react";
import Modal from "./Modal";

const FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
];

function friendlyCameraError(err) {
  const msg = String(err?.message || err || "");
  if (!window.isSecureContext) {
    return "Camera access needs a secure (HTTPS) connection. It works on localhost and on the deployed site.";
  }
  if (/NotAllowed|Permission/i.test(msg)) {
    return "Camera permission was denied. Allow camera access in your browser settings, then try again.";
  }
  if (/NotFound|Requested device not found|no camera/i.test(msg)) {
    return "No camera was found on this device.";
  }
  return "Could not start the camera.";
}

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 90);
  } catch {
    // sound is a nice-to-have, never block scanning on it
  }
}

// Owns the camera. Each mount creates its own container so React's dev double-mount can't clash.
function ScannerView({ onCode, onError }) {
  const hostRef = useRef(null);
  const onCodeRef = useRef(onCode);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCodeRef.current = onCode;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const mount = document.createElement("div");
    mount.id = `scanner-${Math.random().toString(36).slice(2)}`;
    hostRef.current.appendChild(mount);

    const scanner = new Html5Qrcode(mount.id, {
      formatsToSupport: FORMATS,
      verbose: false,
    });
    let stopped = false;

    const startPromise = scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (vw, vh) => ({
            width: Math.floor(vw * 0.85),
            height: Math.floor(Math.min(vh * 0.75, vw * 0.55)),
          }),
        },
        (text) => onCodeRef.current(text),
        () => {}, // per-frame "nothing found" noise, ignore
      )
      .catch((err) => {
        if (!stopped) onErrorRef.current(friendlyCameraError(err));
      });

    return () => {
      stopped = true;
      startPromise
        .then(() => scanner.stop())
        .then(() => scanner.clear())
        .catch(() => {})
        .finally(() => mount.remove());
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="min-h-[220px] w-full overflow-hidden rounded-xl bg-black"
    />
  );
}

function ScannerBody({ onClose, onScan }) {
  const [result, setResult] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const last = useRef({ code: "", time: 0 });
  const closing = useRef(false);

  function handleCode(code) {
    if (closing.current) return;
    const now = Date.now();
    // The camera sees the same code many times a second; ignore repeats for ~2 seconds
    if (code === last.current.code && now - last.current.time < 2000) return;
    last.current = { code, time: now };

    const outcome = onScan(code) || { ok: true };
    setResult({ code, ...outcome });

    if (outcome.ok) {
      navigator.vibrate?.(50);
      beep();
    }
    if (outcome.close) {
      closing.current = true;
      setTimeout(onClose, 700);
    }
  }

  if (cameraError) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CameraOff size={32} className="text-ink-900/30" />
        <p className="text-sm text-ink-900/70">{cameraError}</p>
        <button
          onClick={onClose}
          className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-forest-950 hover:bg-gold-600"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div>
      <ScannerView onCode={handleCode} onError={setCameraError} />

      <p className="mt-3 text-center text-xs text-ink-900/50">
        Point the camera at a barcode or QR code
      </p>

      {result && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm ${
            result.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {result.ok ? (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
          )}
          <span>{result.message || result.code}</span>
        </div>
      )}

      <button
        onClick={onClose}
        className="mt-4 w-full rounded-full border border-black/10 py-2.5 text-sm font-medium text-forest-950 hover:bg-black/5"
      >
        Done
      </button>
    </div>
  );
}

// onScan(code) may return { ok, message, close }. It decides what the scan means for each page.
export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
  title = "Scan Barcode",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <ScannerBody onClose={onClose} onScan={onScan} />
    </Modal>
  );
}
