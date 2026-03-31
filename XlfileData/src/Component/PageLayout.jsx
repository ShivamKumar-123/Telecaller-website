import React from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Wave from "./Wave/Wave";

/**
 * Shared shell: nav, mesh background, glass content card, footer.
 */
function PageLayout({ title, subtitle, children, maxWidthClass = "max-w-3xl" }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 dark:bg-night-950 dark:text-slate-100">
      <Header />
      <div className="relative z-20 -mb-px">
        <Wave />
      </div>

      <main className="relative flex flex-1 flex-col">
        <div
          className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-fuchsia-50/50 dark:hidden"
          aria-hidden
        />
        <div className="absolute inset-0 hidden bg-mesh-brand opacity-90 dark:block" aria-hidden />
        <div
          className="absolute inset-0 bg-grid-subtle bg-grid opacity-[0.2] dark:opacity-[0.35]"
          aria-hidden
        />

        <div
          className={`relative z-10 mx-auto w-full flex-1 px-4 py-10 sm:px-6 lg:px-8 ${maxWidthClass}`}
        >
          {(title || subtitle) && (
            <header className="animate-fade-in-up mb-8 text-center">
              {title && (
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                  {subtitle}
                </p>
              )}
            </header>
          )}

          <div className="glass-panel animate-scale-in p-6 sm:p-8">{children}</div>
        </div>
      </main>

      <div className="relative z-20 -mt-px">
        <Wave flip />
      </div>
      <Footer />
    </div>
  );
}

export default PageLayout;
