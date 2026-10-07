import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // No backend endpoint for this yet — intentionally a stub for the competition build.
    // Wiring this to a real email service is listed as future work, not faked here.
    setSubmitted(true);
  }

  return (
    <section id="contact" className="bg-forest-950 py-24 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-gold-500">
            CONTACT
          </p>
          <h2 className="mb-5 text-3xl font-bold sm:text-4xl">
            Let's talk about your business
          </h2>
          <p className="mb-8 max-w-md text-white/70">
            Questions about EthioFlow AI, or want a walkthrough? Reach out and
            we'll get back to you.
          </p>
          <div className="space-y-4 text-sm text-white/80">
            <p className="flex items-center gap-3">
              <Mail size={16} className="text-gold-500" /> sjrd02911@gmail.com
            </p>
            <p className="flex items-center gap-3">
              <Phone size={16} className="text-gold-500" /> +251 966109762
            </p>
            <p className="flex items-center gap-3">
              <MapPin size={16} className="text-gold-500" /> Addis Ababa,
              Ethiopia
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
        >
          {submitted ? (
            <p className="py-10 text-center text-white/80">
              Thanks — we'll be in touch soon.
            </p>
          ) : (
            <>
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-white/60">
                  Name
                </label>
                <input
                  required
                  className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold-500"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-white/60">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold-500"
                />
              </div>
              <div className="mb-5">
                <label className="mb-1 block text-xs font-medium text-white/60">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold-500"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
              >
                Send Message
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
