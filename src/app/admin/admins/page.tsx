"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  UserPlus,
  Database,
  Terminal,
  X,
  AlertTriangle,
} from "lucide-react";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

type UserItem = {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "agent";
  is_active: boolean;
  created_at: string;
};

export default function AdminsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "agent" | "super_admin",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      if (!u || u.role !== "super_admin") {
        router.replace("/admin/dashboard");
        return;
      }
    } catch {
      router.replace("/admin/dashboard");
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admins", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    } else {
      setError("System Error: Failed to load operator data.");
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      setShowModal(false);
      setNewUser({ name: "", email: "", password: "", role: "admin" });
      fetchUsers();
    } else {
      const err = await res
        .json()
        .catch(() => ({ error: "Failed to create operator." }));
      setError(err.error || "Failed to create operator.");
    }
  };

  return (
    <div className={`space-y-8 relative ${display.className}`}>
      {/* Structural Lines Background */}
      <div className="absolute inset-0 pointer-events-none z-0 flex flex-col justify-between py-12 opacity-[0.03] dark:opacity-[0.05]">
        <div className="h-px w-full bg-foreground"></div>
        <div className="h-px w-full bg-foreground"></div>
        <div className="h-px w-full bg-foreground hidden md:block"></div>
        <div className="h-px w-full bg-foreground hidden lg:block"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-foreground pb-8 mb-8 gap-6 relative z-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-none">
            Security_
          </h1>
          <p
            className={`text-lg md:text-xl font-bold uppercase tracking-widest bg-foreground text-background inline-flex items-center gap-2 px-3 py-1 mt-2 w-fit ${mono.className}`}
          >
            <Shield className="w-5 h-5" /> IAM / Operators
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className={`flex mr-6 items-center gap-2 border-4 border-foreground bg-blue-500 text-white px-6 py-3 font-bold uppercase tracking-widest shadow-[6px_6px_0_0_currentColor] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_currentColor] transition-all focus:outline-none focus:ring-4 focus:ring-foreground/20 active:translate-y-1 active:translate-x-1 active:shadow-none ${mono.className}`}
        >
          <UserPlus className="w-5 h-5" /> New Operator
        </button>
      </div>

      {error && (
        <div
          className={`border-4 border-red-500 bg-red-500/10 text-red-600 p-4 flex items-center gap-4 font-bold uppercase tracking-widest shadow-[6px_6px_0_0_#ef4444] ${mono.className}`}
        >
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <span>ERR: {error}</span>
        </div>
      )}

      <div className="relative z-10">
        <div className="border-4 border-foreground bg-background shadow-[12px_12px_0_0_currentColor]">
          <div className="border-b-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center">
            <h2
              className={`font-bold uppercase tracking-widest flex items-center gap-2 text-sm ${mono.className}`}
            >
              <Database className="w-4 h-4" /> Identity Access Management Table
            </h2>
            <span
              className={`text-xs font-bold uppercase tracking-widest ${mono.className}`}
            >
              {users.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b-4 border-foreground bg-foreground/5 text-xs font-bold uppercase tracking-widest ${mono.className}`}
                >
                  <th className="p-4 border-r-4 border-foreground">
                    Operator_ID
                  </th>
                  <th className="p-4 border-r-4 border-foreground w-1/4">
                    Name
                  </th>
                  <th className="p-4 border-r-4 border-foreground w-1/4">
                    Email_Address
                  </th>
                  <th className="p-4 border-r-4 border-foreground">
                    Privilege_Lvl
                  </th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y-4 divide-foreground font-medium ${mono.className}`}
              >
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center bg-[linear-gradient(45deg,transparent_25%,rgba(150,150,150,0.05)_25%,rgba(150,150,150,0.05)_50%,transparent_50%,transparent_75%,rgba(150,150,150,0.05)_75%,rgba(150,150,150,0.05)_100%)] bg-size-[20px_20px]"
                    >
                      <span className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-background px-4 py-2 font-bold uppercase tracking-widest shadow-[4px_4px_0_0_currentColor]">
                        <span className="w-2 h-2 bg-foreground animate-ping" />{" "}
                        Querying DB...
                      </span>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-12 text-center bg-[linear-gradient(45deg,transparent_25%,rgba(150,150,150,0.05)_25%,rgba(150,150,150,0.05)_50%,transparent_50%,transparent_75%,rgba(150,150,150,0.05)_75%,rgba(150,150,150,0.05)_100%)] bg-size-[20px_20px] text-foreground/50"
                    >
                      EMPTY SET_
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-foreground/5 transition-colors group"
                    >
                      <td className="p-4 border-r-4 border-foreground text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                        {u.id.split("-")[0]}
                      </td>
                      <td className="p-4 border-r-4 border-foreground font-bold text-sm">
                        {u.name}
                      </td>
                      <td className="p-4 border-r-4 border-foreground text-sm opacity-80">
                        {u.email}
                      </td>
                      <td className="p-4 border-r-4 border-foreground">
                        <span
                          className={`inline-flex items-center text-xs font-bold uppercase tracking-widest border-2 border-foreground px-2 py-0.5 ${
                            u.role === "super_admin"
                              ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500"
                              : u.role === "admin"
                                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500"
                                : "bg-foreground/10 text-foreground"
                          }`}
                        >
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-widest border-2 border-green-600 dark:border-green-500 px-2 py-0.5 bg-green-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-widest border-2 border-red-600 dark:border-red-500 px-2 py-0.5 bg-red-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{" "}
                            Offline
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <div
          className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${display.className}`}
        >
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(150,150,150,0.05)_25%,rgba(150,150,150,0.05)_50%,transparent_50%,transparent_75%,rgba(150,150,150,0.05)_75%,rgba(150,150,150,0.05)_100%)] bg-size-[20px_20px]" />

          <div className="border-4 border-foreground bg-background shadow-[16px_16px_0_0_currentColor] w-full max-w-lg relative z-10 flex flex-col max-h-[90vh]">
            <div className="border-b-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center shrink-0">
              <h2
                className={`font-bold uppercase tracking-widest flex items-center gap-2 text-sm ${mono.className}`}
              >
                <Terminal className="w-4 h-4" /> Provisioning_Interface
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:scale-110 active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-background" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-4">
                  <label
                    className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${mono.className}`}
                  >
                    Name
                  </label>
                  <input
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                    className={`w-full border-4 border-foreground bg-background p-4 font-bold text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all placeholder:opacity-30 ${mono.className}`}
                    placeholder="Operator Name"
                  />
                </div>
                <div className="space-y-4">
                  <label
                    className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${mono.className}`}
                  >
                    Email_Address
                  </label>
                  <input
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                    type="email"
                    className={`w-full border-4 border-foreground bg-background p-4 font-bold text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all placeholder:opacity-30 ${mono.className}`}
                    placeholder="operator@system.local"
                  />
                </div>
                <div className="space-y-4">
                  <label
                    className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${mono.className}`}
                  >
                    Password
                  </label>
                  <input
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                    minLength={6}
                    type="password"
                    className={`w-full border-4 border-foreground bg-background p-4 font-bold text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all placeholder:opacity-30 ${mono.className}`}
                    placeholder="Assign password (min 6 chars)"
                  />
                </div>
                <div className="space-y-4">
                  <label
                    className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${mono.className}`}
                  >
                    Privilege_Lvl
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value as
                          | "admin"
                          | "agent"
                          | "super_admin",
                      })
                    }
                    className={`w-full border-4 border-foreground bg-background p-4 font-bold md:text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all uppercase tracking-widest cursor-pointer appearance-none ${mono.className}`}
                  >
                    <option value="agent">Agent (Basic Comm Access)</option>
                    <option value="admin">Admin (Configuration Access)</option>
                    <option value="super_admin">
                      Super_Admin (System Override)
                    </option>
                  </select>
                </div>

                <div className="pt-8 border-t-4 border-foreground flex justify-end gap-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`font-bold uppercase tracking-widest transition-opacity hover:opacity-70 ${mono.className}`}
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className={`flex items-center gap-2 border-4 border-foreground bg-green-500 text-white px-6 py-3 font-bold uppercase tracking-widest shadow-[6px_6px_0_0_currentColor] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_currentColor] transition-all focus:outline-none focus:ring-4 focus:ring-foreground/20 active:translate-y-1 active:translate-x-1 active:shadow-none flex-1 justify-center ${mono.className}`}
                  >
                    Initialize Operator
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
