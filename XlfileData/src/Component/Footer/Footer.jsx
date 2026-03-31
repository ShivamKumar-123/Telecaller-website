import React from "react";

const offices = [
  {
    label: "Regional Office",
    lines: [
      "JIVAN BIMA MARG, ADVANCE INTERNATIONAL, PANDRI, RAIPUR",
      "Chhattisgarh — 492001",
    ],
  },
  {
    label: "City Office",
    lines: ["Lavish Life Building, Beside Mowa Bridge, Near Lodhipara Chowk", "Mowa, Raipur, CG"],
  },
  {
    label: "Technical Office",
    lines: ["IIS Campus, Kavilas Nagar, Bhanpuri, Raipur, CG"],
  },
  {
    label: "Warehouse",
    lines: ["Near RSPL, Kanhera Road, Urla, Raipur, CG"],
  },
];

function Footer() {
  return (
    <footer className="relative border-t border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-night-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent dark:via-amber-400/30" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-300/90">
              Advance Solar
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Our offices</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Reach us at any of our locations across Raipur. We’re here for installations,
              service, and business enquiries.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-500">Phone</p>
                <p className="mt-1 font-medium text-sky-600 dark:text-sky-300">9109969116</p>
                <p className="font-medium text-sky-600 dark:text-sky-300">9109969107</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Email</p>
                <a
                  href="mailto:solaradvance4@gmail.com"
                  className="mt-1 block text-sky-600 transition hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-200"
                >
                  solaradvance4@gmail.com
                </a>
              </div>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {offices.map((o) => (
              <li
                key={o.label}
                className="hover-lift rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-shadow duration-300 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/40 dark:ring-white/5 dark:hover:border-white/15 dark:hover:shadow-lg"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                  {o.label}
                </p>
                {o.lines.map((line) => (
                  <p key={line} className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {line}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 dark:border-white/10 sm:flex-row">
          <div className="flex gap-3">
            {["in", "f", "yt"].map((s) => (
              <span
                key={s}
                className="flex h-10 w-10 cursor-default items-center justify-center rounded-full border border-slate-200 text-xs font-semibold uppercase text-slate-500 transition hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:text-slate-400 dark:hover:border-sky-500/40 dark:hover:text-sky-300"
                title="Social"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="text-center text-sm text-slate-600 dark:text-slate-500 sm:text-right">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-amber-400/90">ADVANCE SOLAR</span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
