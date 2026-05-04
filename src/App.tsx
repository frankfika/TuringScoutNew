import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { SiteHeader, Footer, DanmakuContainer } from "./components/layout";
import { HomePage } from "./pages/HomePage";
import { OpportunityDetail } from "./pages/OpportunityDetail";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Methodology } from "./pages/Methodology";
import { AgentMarketplace } from "./pages/AgentMarketplace";
import { AgentDetail } from "./pages/AgentDetail";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminLogin } from "./pages/AdminLogin";
import { apiFetch } from "./lib/api";

function AdminGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ authenticated: boolean }>("/api/admin/me")
      .then((res) => {
        if (cancelled) return;
        setStatus(res.authenticated ? "ok" : "denied");
      })
      .catch(() => {
        if (!cancelled) setStatus("denied");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs uppercase tracking-widest opacity-60">
        Authenticating...
      </div>
    );
  }
  if (status === "denied") {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] text-[#141414] flex flex-col font-sans border-[8px] md:border-[16px] lg:border-[24px] border-[#141414] box-border relative overflow-hidden">
        <DanmakuContainer />
        <SiteHeader />
        <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col overflow-hidden border-x border-[#141414] z-10 relative bg-[#E4E3E0]">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] flex flex-col font-sans border-[8px] md:border-[16px] lg:border-[24px] border-[#141414] box-border relative overflow-hidden">
      <DanmakuContainer />
      <SiteHeader />
      <main className="flex-1 w-full flex overflow-hidden z-10 relative">
        <section className="flex-1 flex flex-col overflow-y-auto bg-[#F2F2F0]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/opportunities/:slug" element={<OpportunityDetail />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/agents" element={<AgentMarketplace />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
          </Routes>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
