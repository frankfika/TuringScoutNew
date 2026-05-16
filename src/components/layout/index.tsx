import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@lib/api";
import { WalletConnect } from "@components/WalletConnect";

type TickerItem = {
  id: string;
  text: string;
  link: string | null;
  priority: number;
};

type HealthInfo = { version?: string };

const REFRESH_MS = 30_000;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function DanmakuContainer() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiFetch<TickerItem[]>("/api/ticker");
        if (!cancelled) setItems(data);
      } catch {
        // ignore — danmaku is decorative
      }
    }
    load();
    const refresh = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, []);

  const [active, setActive] = useState<{ id: string; text: string; link: string | null; top: string; duration: number; key: number }[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    if (reducedMotion || items.length === 0) return;
    const interval = setInterval(() => {
      const itemData = items[Math.floor(Math.random() * items.length)];
      const top = Math.floor(Math.random() * 80) + 10 + "%";
      const duration = Math.floor(Math.random() * 8) + 12;
      setActive((prev) => {
        const next = [
          ...prev,
          { id: itemData.id, text: itemData.text, link: itemData.link, top, duration, key: counterRef.current++ },
        ];
        return next.length > 20 ? next.slice(next.length - 20) : next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [items, reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-20 hidden md:block">
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100vw); }
        }
        .animate-scroll-left {
          animation-name: scroll-left;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
      {active.map((item) => {
        const className =
          "absolute left-0 whitespace-nowrap text-[#141414] font-sans font-bold text-sm bg-white/70 backdrop-blur-md px-4 py-1.5 border border-[#141414] rounded-full animate-scroll-left shadow-sm flex items-center gap-2";
        const style = { top: item.top, animationDuration: `${item.duration}s` };
        if (item.link) {
          return (
            <a
              key={item.key}
              href={item.link}
              target={item.link.startsWith("http") ? "_blank" : undefined}
              rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`${className} hover:!bg-white hover:scale-110 !transition-transform cursor-pointer pointer-events-auto`}
              style={style}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
              {item.text}
              <span className="opacity-50 text-[10px]">→</span>
            </a>
          );
        }
        return (
          <span key={item.key} className={className} style={style}>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
            {item.text}
          </span>
        );
      })}
    </div>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[#141414] flex items-center justify-between px-4 bg-[#D1CFCA] z-40 relative">
      <div className="mx-auto w-full max-w-[1400px] flex justify-between items-center px-2 sm:px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            aria-label="TuringScout home"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <span className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-bold rounded-sm" aria-hidden="true">
              TS
            </span>
            <span className="font-serif italic font-bold text-xl tracking-tight text-[#141414]">
              TuringScout
            </span>
          </Link>
        </div>

        <nav className="hidden sm:flex gap-6 text-[10px] uppercase tracking-widest font-bold items-center">
          <Link to="/agents" className="flex flex-col hover:opacity-70 transition-opacity">
            <span className="opacity-50 font-mono">A2A</span>
            <span>Agents</span>
          </Link>
          <Link to="/methodology" className="flex flex-col hover:opacity-70 transition-opacity">
            <span className="opacity-50 font-mono">Docs</span>
            <span>Methodology</span>
          </Link>
          <Link to="/admin" className="flex flex-col hover:opacity-70 transition-opacity">
            <span className="opacity-50 font-mono">Ops</span>
            <span>Admin</span>
          </Link>
          <span className="flex flex-col">
            <span className="opacity-50 font-mono">Status</span>
            <span className="tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" aria-hidden="true" /> Active
            </span>
          </span>
          <div className="ml-4 pl-4 border-l border-[#141414]">
            <WalletConnect />
          </div>
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="sm:hidden border border-[#141414] rounded-sm px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest font-bold bg-white"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        {menuOpen && (
          <div className="absolute top-full right-2 mt-2 bg-white border border-[#141414] rounded-md shadow-[4px_4px_0_0_#141414] py-2 sm:hidden flex flex-col text-[11px] font-mono uppercase tracking-widest font-bold min-w-[140px]">
            <Link to="/" className="px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
              Radar
            </Link>
            <Link to="/agents" className="px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
              Agents
            </Link>
            <Link to="/methodology" className="px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
              Methodology
            </Link>
            <Link to="/admin" className="px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  const [version, setVersion] = useState<string>("1.0.0");

  useEffect(() => {
    let cancelled = false;
    apiFetch<HealthInfo>("/api/health")
      .then((d) => {
        if (!cancelled && d.version) setVersion(d.version);
      })
      .catch(() => {
        // keep default
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="h-10 border-t border-[#141414] bg-[#DCDAD5] text-[#141414] flex items-center justify-center text-[10px] font-mono uppercase tracking-widest z-40 relative">
      <div className="max-w-[1400px] w-full flex justify-between px-4">
        <div>Sync: Synchronized</div>
        <div className="animate-pulse opacity-50 hidden sm:block">Monitoring network…</div>
        <div>Ver: {version}</div>
      </div>
    </footer>
  );
}
