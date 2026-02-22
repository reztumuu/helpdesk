import Link from "next/link";
import {
  MessageSquare,
  Zap,
  Shield,
  Code2,
  ArrowRight,
  Terminal,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function LandingPage() {
  return (
    <div
      className={`min-h-screen bg-background text-foreground overflow-x-hidden ${display.className} selection:bg-foreground selection:text-background`}
    >
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-between px-6 md:px-12 max-w-[1600px] mx-auto opacity-[0.03] dark:opacity-[0.05]">
        <div className="w-px h-full bg-foreground"></div>
        <div className="w-px h-full bg-foreground"></div>
        <div className="w-px h-full bg-foreground hidden md:block"></div>
        <div className="w-px h-full bg-foreground hidden lg:block"></div>
      </div>

      <nav className="relative z-50 border-b-2 border-foreground bg-background">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border-2 border-foreground bg-foreground text-background flex items-center justify-center shadow-[4px_4px_0_0_currentColor] transition-transform hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_currentColor]">
              <MessageSquare className="w-6 h-6 fill-current" />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter uppercase">
              BantuanQu_
            </span>
          </div>
          <div
            className={`flex items-center gap-6 lg:gap-8 ${mono.className} text-sm uppercase font-bold tracking-widest`}
          >
            <Link
              href="/docs"
              className="hidden md:block hover:underline decoration-2 underline-offset-8"
            >
              [ Docs ]
            </Link>
            <ThemeToggle />
            <Link
              href="/admin/login"
              className="hidden sm:block hover:underline decoration-2 underline-offset-8"
            >
              Log In
            </Link>
            <Link
              href="/admin/signup"
              className="border-2 border-foreground px-6 py-2 bg-background text-foreground hover:bg-foreground hover:text-background transition-colors duration-200"
            >
              DEPLOY
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1600px] mx-auto">
        <section className="grid lg:grid-cols-12 min-h-[85vh] border-b-2 border-foreground">
          <div className="lg:col-span-7 flex flex-col justify-center px-6 md:px-12 py-20 lg:py-0 lg:border-r-2 border-foreground">
            <div
              className={`inline-flex items-center border-2 border-foreground px-4 py-1.5 mb-12 w-fit ${mono.className} text-sm font-bold shadow-[4px_4px_0_0_currentColor] bg-background`}
            >
              <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-3 border border-green-700" />
              SYSTEM.STATUS: OPERATIONAL
            </div>

            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[100px] font-extrabold leading-[0.85] tracking-tighter uppercase mb-8">
              Support
              <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "3px currentColor" }}
              >
                Widget
              </span>
              <br />
              Rebuilt.
            </h1>

            <p className="text-xl md:text-3xl max-w-xl font-medium leading-snug mb-12 opacity-90">
              ZERO BLOAT. 15KB BUNDLE SIZE.
              <br /> PURE WEBSOCKETS.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-6 ${mono.className} text-lg`}
            >
              <Link
                href="/admin/signup"
                className="group flex flex-1 items-center justify-between border-2 border-foreground bg-foreground text-background px-8 py-4 hover:bg-background hover:text-foreground transition-all duration-300"
              >
                <span className="font-bold uppercase tracking-wider">
                  Initialize
                </span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                href="/widget-demo"
                className="group flex flex-1 items-center justify-between border-2 border-foreground bg-background text-foreground px-8 py-4 hover:shadow-[8px_8px_0_0_currentColor] transition-all duration-300"
              >
                <span className="font-bold uppercase tracking-wider">
                  View Demo
                </span>
                <Terminal className="w-6 h-6" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-foreground/5 flex items-center justify-center p-6 md:p-12">
            <div className="w-full border-2 border-foreground shadow-[16px_16px_0_0_currentColor] bg-background relative transition-transform hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[24px_24px_0_0_currentColor] duration-300">
              <div className="border-b-2 border-foreground p-4 flex justify-between items-center bg-foreground text-background">
                <div
                  className={`text-xs font-bold tracking-widest uppercase ${mono.className}`}
                >
                  install.ts
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-background rounded-full" />
                  <div className="w-3 h-3 bg-background/50 rounded-full" />
                  <div className="w-3 h-3 border border-background rounded-full" />
                </div>
              </div>
              <div
                className={`p-6 md:p-8 ${mono.className} text-sm md:text-base leading-relaxed overflow-x-auto`}
              >
                <div className="opacity-50 mb-4 select-none">
                  {"// Install via package manager"}
                </div>
                <div>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    npm
                  </span>{" "}
                  install @bantuanqu/core
                </div>
                <br />
                <div className="opacity-50 mb-4 select-none">
                  {"// Initialize socket connection"}
                </div>
                <div>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    import
                  </span>{" "}
                  {"{ BantuanQu }"}{" "}
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    from
                  </span>{" "}
                  '@bantuanqu/core'
                  <br />
                  <br />
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    const
                  </span>{" "}
                  widget ={" "}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    new
                  </span>{" "}
                  BantuanQu({"{"}
                  <br />
                  &nbsp;&nbsp;apiKey:{" "}
                  <span className="text-orange-600 dark:text-orange-400">
                    "hd_live_92x..."
                  </span>
                  ,<br />
                  &nbsp;&nbsp;theme:{" "}
                  <span className="text-orange-600 dark:text-orange-400">
                    "system"
                  </span>
                  <br />
                  {"}"});
                  <br />
                  <br />
                  widget.
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    mount
                  </span>
                  ();
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`grid grid-cols-2 md:grid-cols-4 border-b-2 border-foreground ${mono.className} divide-x-2 divide-y-2 md:divide-y-0 divide-foreground`}
        >
          <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center bg-background hover:bg-foreground hover:text-background transition-colors duration-300">
            <div className="text-4xl lg:text-6xl font-bold mb-3">
              15<span className="text-2xl lg:text-3xl">kb</span>
            </div>
            <div className="text-xs font-bold tracking-widest uppercase opacity-70">
              Bundle Size
            </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center bg-background hover:bg-foreground hover:text-background transition-colors duration-300">
            <div className="text-4xl lg:text-6xl font-bold mb-3">
              0<span className="text-2xl lg:text-3xl">ms</span>
            </div>
            <div className="text-xs font-bold tracking-widest uppercase opacity-70">
              Blocking Time
            </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center bg-background hover:bg-foreground hover:text-background transition-colors duration-300">
            <div className="text-4xl lg:text-6xl font-bold mb-3">I/O</div>
            <div className="text-xs font-bold tracking-widest uppercase opacity-70">
              Socket Native
            </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center bg-background hover:bg-foreground hover:text-background transition-colors duration-300">
            <div className="text-4xl lg:text-6xl font-bold mb-3">MIT</div>
            <div className="text-xs font-bold tracking-widest uppercase opacity-70">
              Open Source
            </div>
          </div>
        </section>

        <section className="p-6 md:p-12 lg:p-24 border-b-2 border-foreground bg-[linear-gradient(45deg,transparent_25%,rgba(150,150,150,0.05)_25%,rgba(150,150,150,0.05)_50%,transparent_50%,transparent_75%,rgba(150,150,150,0.05)_75%,rgba(150,150,150,0.05)_100%)] bg-size-[20px_20px]">
          <h2 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter mb-16 max-w-4xl">
            Everything you need.
            <br />
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "2px currentColor" }}
            >
              Nothing you don't.
            </span>
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="border-2 border-foreground p-8 md:p-10 bg-background group hover:bg-foreground hover:text-background transition-colors duration-300 shadow-[8px_8px_0_0_currentColor]">
              <Zap className="w-12 h-12 mb-8 group-hover:animate-pulse" />
              <h3 className="text-3xl font-bold mb-4 uppercase">Real-Time</h3>
              <p
                className={`text-lg opacity-80 ${mono.className} leading-relaxed`}
              >
                Powered by pure WebSockets for millisecond-latency messaging. No
                polling, no artificial delays.
              </p>
            </div>

            <div className="border-2 border-foreground p-8 md:p-10 bg-background group hover:bg-foreground hover:text-background transition-colors duration-300 shadow-[8px_8px_0_0_currentColor] lg:translate-y-8">
              <Shield className="w-12 h-12 mb-8 group-hover:animate-pulse" />
              <h3 className="text-3xl font-bold mb-4 uppercase">Secure</h3>
              <p
                className={`text-lg opacity-80 ${mono.className} leading-relaxed`}
              >
                End-to-end encryption. Granular role-based access control. SOC2
                compliant architecture out of the box.
              </p>
            </div>

            <div className="border-2 border-foreground p-8 md:p-10 bg-foreground text-background group shadow-[8px_8px_0_0_currentColor]">
              <Code2 className="w-12 h-12 mb-8" />
              <h3 className="text-3xl font-bold mb-4 uppercase">Dev First</h3>
              <p
                className={`text-lg opacity-80 ${mono.className} leading-relaxed`}
              >
                Fully typed SDKs, incoming webhooks, and exhaustive API access.
                Overwrite any component.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-[1600px] mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-foreground bg-foreground text-background flex items-center justify-center">
            <MessageSquare className="w-4 h-4 fill-current" />
          </div>
          <span className="font-extrabold text-xl tracking-tighter uppercase">
            BantuanQu_
          </span>
          <span
            className={`text-sm opacity-50 ml-4 hidden md:inline-block ${mono.className}`}
          >
            © 2026 STATUS: ONLINE
          </span>
        </div>

        <div
          className={`flex flex-wrap justify-center gap-6 md:gap-10 text-sm uppercase font-bold tracking-widest ${mono.className}`}
        >
          <Link href="#" className="hover:underline underline-offset-8">
            GitHub
          </Link>
          <Link href="#" className="hover:underline underline-offset-8">
            Documentation
          </Link>
          <Link href="#" className="hover:underline underline-offset-8">
            Changelog
          </Link>
          <Link href="#" className="hover:underline underline-offset-8">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
