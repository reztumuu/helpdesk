"use client";

import Link from "next/link";
import { ArrowLeft, Terminal, Code2, Copy, CheckCircle2 } from "lucide-react";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { useState } from "react";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function WidgetDemoPage() {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="http://localhost:3000/widget.js" data-key="YOUR_API_KEY"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`min-h-screen bg-background text-foreground relative overflow-hidden ${display.className} selection:bg-foreground selection:text-background p-6 md:p-12`}
    >
      {/* Structural Lines Background */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-between px-6 md:px-12 max-w-[1600px] mx-auto opacity-[0.03] dark:opacity-[0.05]">
        <div className="w-px h-full bg-foreground"></div>
        <div className="w-px h-full bg-foreground"></div>
        <div className="w-px h-full bg-foreground hidden md:block"></div>
        <div className="w-px h-full bg-foreground hidden lg:block"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-12 border-b-2 border-foreground pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group hover:-translate-x-1 transition-transform"
          >
            <div className="w-10 h-10 border-2 border-foreground bg-foreground text-background flex items-center justify-center shadow-[4px_4px_0_0_currentColor] group-hover:shadow-[6px_6px_0_0_currentColor] transition-shadow">
              <ArrowLeft className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter uppercase">
              Return
            </span>
          </Link>
          <div
            className={`text-sm font-bold tracking-widest uppercase ${mono.className} border-2 border-foreground px-4 py-2 bg-foreground text-background`}
          >
            Demo Environment
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-12 flex-1">
          <div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase mb-6 leading-none">
              Widget
              <br />
              Sandbox_
            </h1>
            <p
              className={`text-xl opacity-80 ${mono.className} max-w-2xl leading-relaxed border-l-4 border-foreground pl-6`}
            >
              This environment simulates a client space. Follow the integration
              sequence below to mount the support widget on this page.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Steps */}
            <div className="border-2 border-foreground bg-background shadow-[8px_8px_0_0_currentColor] p-8">
              <div className="flex items-center gap-4 mb-8">
                <Terminal className="w-8 h-8" />
                <h2 className="text-2xl font-bold uppercase tracking-tight">
                  Integration Sequence
                </h2>
              </div>

              <ol className="space-y-6">
                {[
                  {
                    title: "Initialize Admin",
                    desc: "Log in to the administrator portal.",
                  },
                  {
                    title: "Register Domain",
                    desc: "Create a new website profile.",
                  },
                  {
                    title: "Extract Token",
                    desc: "Copy the generated API Key.",
                  },
                  { title: "Mount Element", desc: "Inject the script below." },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <div
                      className={`shrink-0 w-8 h-8 flex items-center justify-center border-2 border-foreground bg-foreground text-background font-bold ${mono.className} group-hover:-translate-y-1 transition-transform`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg uppercase tracking-tight">
                        {step.title}
                      </h3>
                      <p className={`text-sm opacity-70 ${mono.className}`}>
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Code Block */}
            <div className="border-2 border-foreground bg-foreground text-background shadow-[8px_8px_0_0_currentColor] flex flex-col hover:-translate-y-1 hover:-translate-x-1 group transition-transform">
              <div className="border-b-2 border-background p-4 flex justify-between items-center bg-background text-foreground">
                <div
                  className={`text-sm font-bold tracking-widest uppercase flex items-center gap-2 ${mono.className}`}
                >
                  <Code2 className="w-4 h-4" /> index.html
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-foreground rounded-full drop-shadow-[2px_2px_0_currentColor]" />
                  <div className="w-3 h-3 bg-foreground/50 rounded-full drop-shadow-[2px_2px_0_currentColor]" />
                  <div className="w-3 h-3 border border-foreground rounded-full drop-shadow-[2px_2px_0_currentColor]" />
                </div>
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col relative overflow-hidden">
                <p
                  className={`text-sm opacity-70 mb-6 ${mono.className} uppercase tracking-wider`}
                >
                  {"// Inject into <body>"}
                </p>
                <pre
                  className={`${mono.className} text-sm whitespace-pre-wrap word-break-all leading-relaxed relative z-10`}
                >
                  <span className="text-blue-400">{"<script"}</span>{" "}
                  <span className="text-purple-400">src</span>=
                  <span className="text-green-400">
                    "http://localhost:3000/widget.js"
                  </span>{" "}
                  <span className="text-purple-400">data-key</span>=
                  <span className="text-green-400">"YOUR_API_KEY"</span>
                  <span className="text-blue-400">{">"}</span>
                  <span className="text-blue-400">{"</script>"}</span>
                </pre>

                <div className="mt-auto pt-8">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-2 w-full border-2 border-background bg-background text-foreground py-3 font-bold uppercase tracking-widest ${mono.className} hover:bg-foreground hover:text-background transition-colors outline-none focus-visible:ring-4 focus-visible:ring-background/20`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" /> Copy Snippet
                      </>
                    )}
                  </button>
                </div>

                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 text-[10rem] opacity-5 pointer-events-none font-bold">
                  {"{ }"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
