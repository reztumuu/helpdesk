import Link from "next/link";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Terminal,
  Code2,
  BookOpen,
  Layers,
  Zap,
  Settings,
  ArrowRight,
  Home,
} from "lucide-react";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function DocsPage() {
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

      <nav className="fixed top-0 w-full border-b-4 border-foreground bg-background/90 backdrop-blur-sm z-50">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 border-2 border-foreground bg-foreground text-background flex items-center justify-center shadow-[4px_4px_0_0_currentColor] group-hover:shadow-[6px_6px_0_0_currentColor] transition-shadow">
              <Terminal className="w-5 h-5 fill-current" />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter uppercase">
              BantuanQu_
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-widest bg-foreground text-background px-2 py-0.5 ml-2 ${mono.className}`}
            >
              SYS.DOCS
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className={`font-bold uppercase tracking-widest hidden md:flex items-center gap-2 hover:opacity-70 transition-opacity ${mono.className}`}
            >
              <Home className="w-4 h-4" /> Return to Base
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto relative z-10 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-64 shrink-0 hidde md:block">
          <div className="sticky top-32 flex flex-col gap-4">
            <div className="border-4 border-foreground bg-foreground text-background font-bold uppercase tracking-widest p-4 text-center">
              Index_
            </div>
            <nav className={`flex flex-col gap-2 ${mono.className}`}>
              <a
                href="#init"
                className="border-l-4 border-transparent hover:border-foreground pl-4 py-2 opacity-70 hover:opacity-100 transition-all font-bold uppercase tracking-widest text-sm"
              >
                System.Init
              </a>
              <a
                href="#integration"
                className="border-l-4 border-transparent hover:border-foreground pl-4 py-2 opacity-70 hover:opacity-100 transition-all font-bold uppercase tracking-widest text-sm"
              >
                Sys.Integration
              </a>
              <a
                href="#admin"
                className="border-l-4 border-transparent hover:border-foreground pl-4 py-2 opacity-70 hover:opacity-100 transition-all font-bold uppercase tracking-widest text-sm"
              >
                Sys.Admin
              </a>
              <a
                href="#telemetry"
                className="border-l-4 border-transparent hover:border-foreground pl-4 py-2 opacity-70 hover:opacity-100 transition-all font-bold uppercase tracking-widest text-sm"
              >
                Sys.Telemetry
              </a>
            </nav>
          </div>
        </div>

        <div className="flex-1 max-w-4xl space-y-24">
          <section id="hero" className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter uppercase leading-none wrap-break-words">
              Manual_
            </h1>
            <p
              className={`text-lg md:text-xl font-bold uppercase tracking-widest opacity-80 leading-relaxed max-w-2xl ${mono.className}`}
            >
              Comprehensive technical documentation for BantuanQu_ Operator and
              Integration protocols.
            </p>
          </section>

          <section id="init" className="space-y-8 relative">
            <div className="absolute -left-12 top-0 bottom-0 w-px bg-foreground/20 hidden md:block" />
            <div className="absolute -left-13 top-2 w-4 h-4 bg-background border-4 border-foreground hidden md:block" />

            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase flex items-center gap-4">
              <span
                className={`text-sm shrink-0 bg-foreground text-background px-3 py-1 ${mono.className}`}
              >
                01
              </span>
              System.Init
            </h2>
            <div className="text-lg opacity-80 leading-relaxed font-medium">
              Initialize the BantuanQu runtime environment. Requires Node.js and
              a functional MySQL instance.
            </div>

            <div className="border-4 border-foreground bg-background shadow-[8px_8px_0_0_currentColor] flex flex-col">
              <div className="border-b-4 border-foreground bg-foreground text-background p-3 flex justify-between items-center">
                <div
                  className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${mono.className}`}
                >
                  <Terminal className="w-4 h-4" /> Env_Variables
                </div>
              </div>
              <div
                className={`p-6 bg-foreground/5 ${mono.className} text-sm whitespace-pre-wrap leading-relaxed`}
              >
                <span className="text-purple-600 dark:text-purple-400">
                  DATABASE_URL
                </span>
                ="mysql://user:pass@localhost:3306/bantuanqu"
                <span className="text-purple-600 dark:text-purple-400">
                  JWT_SECRET
                </span>
                ="your-secret-key"
                <span className="text-purple-600 dark:text-purple-400">
                  NEXTAUTH_URL
                </span>
                ="http://localhost:3000"
              </div>
            </div>

            <div className="border-4 border-foreground bg-background shadow-[8px_8px_0_0_currentColor] flex flex-col">
              <div className="border-b-4 border-foreground bg-foreground text-background p-3 flex justify-between items-center">
                <div
                  className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${mono.className}`}
                >
                  <Terminal className="w-4 h-4" /> Boot_Sequence
                </div>
              </div>
              <div
                className={`p-6 bg-foreground/5 ${mono.className} text-sm whitespace-pre-wrap leading-relaxed`}
              >
                <span className="opacity-50"># Install Dependencies</span>
                <span className="text-green-600 dark:text-green-400">
                  npm
                </span>{" "}
                install
                <span className="opacity-50"># Sync Prisma Schema</span>
                <span className="text-green-600 dark:text-green-400">
                  npx
                </span>{" "}
                prisma db push
                <span className="text-green-600 dark:text-green-400">
                  npx
                </span>{" "}
                prisma db seed
                <span className="opacity-50">
                  # Launch Socket.IO & Next.js Server
                </span>
                <span className="text-green-600 dark:text-green-400">npm</span>{" "}
                run dev
              </div>
            </div>
          </section>

          <section id="integration" className="space-y-8 relative">
            <div className="absolute -left-12 top-0 bottom-0 w-px bg-foreground/20 hidden md:block" />
            <div className="absolute -left-13 top-2 w-4 h-4 bg-background border-4 border-foreground hidden md:block" />

            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase flex items-center gap-4">
              <span
                className={`text-sm shrink-0 bg-foreground text-background px-3 py-1 ${mono.className}`}
              >
                02
              </span>
              Sys.Integration
            </h2>
            <div className="text-lg opacity-80 leading-relaxed font-medium">
              Mount the client widget onto any external DOM tree. Requires an
              active Domain registration via the operator dashboard to acquire a
              valid API Key.
            </div>

            <div className="border-4 border-foreground bg-background shadow-[8px_8px_0_0_currentColor] flex flex-col">
              <div className="border-b-4 border-foreground bg-foreground text-background p-3 flex justify-between items-center">
                <div
                  className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${mono.className}`}
                >
                  <Code2 className="w-4 h-4" /> Embed_Payload
                </div>
              </div>
              <div
                className={`p-6 bg-foreground/5 ${mono.className} text-sm whitespace-pre-wrap leading-relaxed overflow-x-auto`}
              >
                <span className="text-blue-600 dark:text-blue-400">
                  &lt;script
                </span>{" "}
                <span className="text-purple-600 dark:text-purple-400">
                  src
                </span>
                =
                <span className="text-green-600 dark:text-green-400">
                  "http://localhost:3000/widget.js"
                </span>{" "}
                <span className="text-purple-600 dark:text-purple-400">
                  data-key
                </span>
                =
                <span className="text-green-600 dark:text-green-400">
                  "YOUR_API_KEY"
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  &gt;&lt;/script&gt;
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border-4 border-foreground p-6 bg-background shadow-[4px_4px_0_0_currentColor]">
                <Zap className="w-8 h-8 mb-4" />
                <h3 className="font-extrabold tracking-tighter uppercase text-xl mb-2">
                  Non-Blocking
                </h3>
                <p className={`text-sm font-bold opacity-70 ${mono.className}`}>
                  The script executes asynchronously. It will not halt document
                  rendering.
                </p>
              </div>
              <div className="border-4 border-foreground p-6 bg-background shadow-[4px_4px_0_0_currentColor]">
                <Layers className="w-8 h-8 mb-4" />
                <h3 className="font-extrabold tracking-tighter uppercase text-xl mb-2">
                  Encapsulated
                </h3>
                <p className={`text-sm font-bold opacity-70 ${mono.className}`}>
                  CSS properties are strictly scoped. Zero bleed into host
                  domain stylesheets.
                </p>
              </div>
            </div>
          </section>

          <section id="admin" className="space-y-8 relative">
            <div className="absolute -left-12 top-0 bottom-0 w-px bg-foreground/20 hidden md:block" />
            <div className="absolute -left-13 top-2 w-4 h-4 bg-background border-4 border-foreground hidden md:block" />

            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase flex items-center gap-4">
              <span
                className={`text-sm shrink-0 bg-foreground text-background px-3 py-1 ${mono.className}`}
              >
                03
              </span>
              Sys.Admin
            </h2>

            <div className="space-y-6">
              <div className="border-4 border-foreground p-6 bg-background hover:-translate-y-1 hover:shadow-[8px_8px_0_0_currentColor] transition-all">
                <h3
                  className={`font-bold uppercase tracking-widest text-lg mb-2 flex items-center gap-2 ${mono.className}`}
                >
                  <BookOpen className="w-5 h-5" /> Domains
                </h3>
                <p className="font-medium opacity-80">
                  Register host URLs to deploy the widget. You must whitelist
                  the exact origin to establish WebSocket connections.
                </p>
              </div>

              <div className="border-4 border-foreground p-6 bg-background hover:-translate-y-1 hover:shadow-[8px_8px_0_0_currentColor] transition-all">
                <h3
                  className={`font-bold uppercase tracking-widest text-lg mb-2 flex items-center gap-2 ${mono.className}`}
                >
                  <Terminal className="w-5 h-5" /> Comms_Feed (Chats)
                </h3>
                <p className="font-medium opacity-80">
                  The central relay for operator-to-visitor communication.
                  Features raw socket events, active typing status, and
                  real-time active visitor counts.
                </p>
              </div>

              <div className="border-4 border-foreground p-6 bg-background hover:-translate-y-1 hover:shadow-[8px_8px_0_0_currentColor] transition-all">
                <h3
                  className={`font-bold uppercase tracking-widest text-lg mb-2 flex items-center gap-2 ${mono.className}`}
                >
                  <Settings className="w-5 h-5" /> Config (Settings)
                </h3>
                <p className="font-medium opacity-80">
                  Override widget parameters per registered domain. Features
                  primary color adjustments, avatar replacement, and coordinate
                  offsets.
                </p>
              </div>
            </div>
          </section>

          <section id="telemetry" className="space-y-8 relative">
            <div className="absolute -left-12 top-0 bottom-0 w-px bg-foreground/20 hidden md:block" />
            <div className="absolute -left-13 top-2 w-4 h-4 bg-background border-4 border-foreground hidden md:block" />

            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase flex items-center gap-4">
              <span
                className={`text-sm shrink-0 bg-foreground text-background px-3 py-1 ${mono.className}`}
              >
                04
              </span>
              Sys.Telemetry
            </h2>
            <div className="text-lg opacity-80 leading-relaxed font-medium">
              Continuous performance tracking and real-time metrics.
            </div>

            <div className="border-4 border-background bg-foreground text-background shadow-[8px_8px_0_0_currentColor] p-8">
              <h3 className="text-2xl font-extrabold uppercase tracking-tighter mb-4">
                Core Insights
              </h3>
              <ul
                className={`space-y-4 font-bold uppercase tracking-widest text-sm opacity-80 ${mono.className}`}
              >
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-background drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" />
                  Live Visitor Tracking
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-background drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" />
                  Active Session Counts
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-background drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" />
                  Traffic & Engagement Trends (7D)
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-background drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" />
                  Operator Latency Metrics
                </li>
              </ul>
            </div>
          </section>

          <div className="pt-24 flex justify-between items-center border-t-4 border-foreground">
            <span
              className={`font-bold uppercase tracking-widest text-sm opacity-50 ${mono.className}`}
            >
              END OF SEQUENCE
            </span>
            <Link
              href="/admin/login"
              className={`flex items-center gap-2 border-4 border-foreground bg-foreground text-background px-6 py-3 font-bold uppercase tracking-widest shadow-[6px_6px_0_0_currentColor] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_currentColor] transition-all focus:outline-none ${mono.className}`}
            >
              Init Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
