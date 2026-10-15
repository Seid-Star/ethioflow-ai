import { useCallback, useEffect, useRef, useState } from "react";

const Recognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const voiceInputSupported = Boolean(Recognition);
export const voiceOutputSupported =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

const LOCALES = { en: "en-US", am: "am-ET" };

const ERRORS = {
  "not-allowed":
    "Microphone access was blocked. Allow the microphone in your browser settings, then try again.",
  "service-not-allowed":
    "Microphone access was blocked. Allow the microphone in your browser settings, then try again.",
  "no-speech": "I didn't hear anything. Tap the mic and try again.",
  "audio-capture": "No microphone was found on this device.",
  network: "Voice recognition needs an internet connection.",
  "language-not-supported":
    "This browser can't understand that language by voice. Try English.",
};

// Strip formatting characters so the voice doesn't read them out
export function cleanForSpeech(text) {
  return String(text)
    .replace(/[*_`#>~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Browsers cut off long utterances, so we speak one sentence at a time (including the Amharic full stop)
function toChunks(text) {
  const pieces = text.match(/[^.!?\u1362\u1367]+[.!?\u1362\u1367]*/g) || [text];
  return pieces.map((p) => p.trim()).filter(Boolean);
}

export function useVoice({ lang = "en", onFinalTranscript } = {}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  const recognitionRef = useRef(null);
  const finalTextRef = useRef("");
  const speakRunRef = useRef(0);
  const onFinalRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  });

  // Voices load asynchronously in most browsers
  useEffect(() => {
    if (!voiceOutputSupported) return;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener("voiceschanged", load);
    return () => synth.removeEventListener("voiceschanged", load);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!voiceOutputSupported) return;
    speakRunRef.current += 1;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const findVoice = useCallback(
    (code) => {
      const prefix = (LOCALES[code] || code).slice(0, 2).toLowerCase();
      const matches = voices.filter((v) =>
        v.lang.toLowerCase().startsWith(prefix),
      );
      if (matches.length === 0) return null;
      // Prefer the natural-sounding online voices when the browser offers them
      return (
        matches.find((v) => /natural|online|google/i.test(v.name)) || matches[0]
      );
    },
    [voices],
  );

  const canSpeak = useCallback(
    (code) => voiceOutputSupported && Boolean(findVoice(code)),
    [findVoice],
  );

  // Returns false when this device has no voice for the language, so the caller can say so
  const speak = useCallback(
    (text, code = "en") => {
      if (!voiceOutputSupported) return false;
      const voice = findVoice(code);
      if (!voice) return false;

      let clean = cleanForSpeech(text);
      if (code === "en") clean = clean.replace(/\bETB\b/g, "birr");
      if (!clean) return false;

      const synth = window.speechSynthesis;
      const run = ++speakRunRef.current;
      synth.cancel();

      const chunks = toChunks(clean);
      chunks.forEach((chunk, i) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        if (i === 0) {
          utterance.onstart = () => {
            if (speakRunRef.current === run) setSpeaking(true);
          };
        }
        const finish = () => {
          if (speakRunRef.current === run && i === chunks.length - 1)
            setSpeaking(false);
        };
        utterance.onend = finish;
        utterance.onerror = finish;
        synth.speak(utterance);
      });
      return true;
    },
    [findVoice],
  );

  const startListening = useCallback(() => {
    if (!Recognition) {
      setError(
        "Voice input isn't supported in this browser. Try Chrome or Edge.",
      );
      return;
    }

    stopSpeaking();
    setError("");
    setInterim("");
    finalTextRef.current = "";

    const rec = new Recognition();
    rec.lang = LOCALES[lang] || lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);

    rec.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalTextRef.current += result[0].transcript;
        else interimText += result[0].transcript;
      }
      setInterim(finalTextRef.current + interimText);
    };

    rec.onerror = (event) => {
      if (event.error !== "aborted")
        setError(
          ERRORS[event.error] ||
            "Voice input stopped unexpectedly. Please try again.",
        );
    };

    rec.onend = () => {
      setListening(false);
      setInterim("");
      recognitionRef.current = null;
      const text = finalTextRef.current.trim();
      if (text) onFinalRef.current?.(text);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      setError("Could not start the microphone. Please try again.");
    }
  }, [lang, stopSpeaking]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // Never leave the mic open or a voice talking after leaving the page
  useEffect(
    () => () => {
      const rec = recognitionRef.current;
      if (rec) {
        rec.onend = null;
        rec.abort();
      }
      if (voiceOutputSupported) window.speechSynthesis.cancel();
    },
    [],
  );

  return {
    listening,
    interim,
    error,
    clearError: () => setError(""),
    speaking,
    speak,
    stopSpeaking,
    canSpeak,
    startListening,
    stopListening,
  };
}
