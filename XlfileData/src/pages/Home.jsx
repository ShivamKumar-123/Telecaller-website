import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../Component/Header/Header";
import Footer from "../Component/Footer/Footer";
import Wave from "../Component/Wave/Wave";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getApiBase } from "../config/api";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatTimeAgo(iso) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const TAG_COLORS = {
  interested:{ bg:"rgba(52,211,153,.15)",  border:"rgba(52,211,153,.3)",  text:"#34d399" },
  callback:  { bg:"rgba(56,189,248,.15)",  border:"rgba(56,189,248,.3)",  text:"#38bdf8" },
  converted: { bg:"rgba(167,139,250,.15)", border:"rgba(167,139,250,.3)", text:"#a78bfa" },
  cold:      { bg:"rgba(244,114,182,.15)", border:"rgba(244,114,182,.3)", text:"#f472b6" },
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Returns [ref, isVisible] — fires once when element enters viewport */
function useReveal(threshold = 0.15, rootMargin = "80px 0px 120px 0px") {
  const ref  = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold, rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);
  return [ref, visible];
}

/** Parallax: translates an element by `speed * scrollY` */
function useParallax(speed = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (ref.current) ref.current.style.transform = `translateY(${window.scrollY * speed}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return ref;
}

/** Animated counter — counts from 0 → end on first visibility */
function AnimCount({ end, duration = 1400, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3); // cubic ease-out
        setVal(Math.floor(ease * end));
        if (p < 1) requestAnimationFrame(step); else setVal(end);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/** Bar chart — bars grow up when visible */
function BarChart({ data, labels, color = "#38bdf8", height = 120 }) {
  const [ref, visible] = useReveal(0.05, "100px 0px 100px 0px");
  const max = Math.max(...data, 1);
  const n = Math.max(data.length, 1);
  const innerMinW = n * 36 + (n - 1) * 8;
  return (
    <div ref={ref} className="chart-bar-scroll">
      <div
        className="chart-bar-scroll-inner"
        style={{ height, minWidth: `max(100%, ${innerMinW}px)` }}
      >
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, minWidth: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              title={`${labels[i]}: ${v}`}
              style={{
                width: "100%",
                maxWidth: 56,
                borderRadius: 4,
                background: `linear-gradient(to top,${color},${color}88)`,
                height: visible ? `${(v / max) * (height - 22)}px` : "0px",
                minHeight: visible && v > 0 ? 3 : 0,
                transition: `height 0.9s cubic-bezier(.4,0,.2,1) ${i * 60}ms`,
                cursor: "pointer",
                boxShadow: `0 0 8px ${color}44`,
              }}
            />
            <span className="chart-bar-label">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** SVG line chart with animated path draw */
function LineChart({ data, color = "#a78bfa", h = 100, w = 400 }) {
  const [ref, visible] = useReveal(0.05, "100px 0px 100px 0px");
  const pathRef = useRef(null);
  const max = Math.max(...data), min = Math.min(...data);
  const padX = 22;
  const padY = 14;
  const denom = Math.max(data.length - 1, 1);
  const xs  = data.map((_, i) => padX + (i / denom) * (w - padX * 2));
  const ys  = data.map((v) => padY + ((max - v) / (max - min || 1)) * (h - padY * 2));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const area = `${line} L ${xs[xs.length - 1]} ${h} L ${xs[0]} ${h} Z`;

  // Animate stroke-dashoffset to draw the line
  useEffect(() => {
    const p = pathRef.current;
    if (!p || !visible) return;
    const len = p.getTotalLength();
    p.style.strokeDasharray  = `${len}`;
    p.style.strokeDashoffset = `${len}`;
    // Force reflow then animate
    requestAnimationFrame(() => {
      p.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)";
      p.style.strokeDashoffset = "0";
    });
  }, [visible]);

  return (
    <div className="chart-line-outer">
      <svg ref={ref} viewBox={`0 0 ${w} ${h}`} className="chart-line-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={visible ? 0.25 : 0} style={{ transition:"stop-opacity 1.4s ease" }}/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)" style={{ transition:"opacity 1s ease", opacity: visible ? 1 : 0 }}/>
        <path ref={pathRef} d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="3.5" fill={color} stroke="#0f172a" strokeWidth="1.5"
            style={{ opacity: visible ? 1 : 0, transition:`opacity .3s ease ${0.8 + i * 0.07}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

/** SVG donut that draws its arcs on visibility */
function DonutChart({ slices, size = 140, theme = "dark" }) {
  const [ref, visible] = useReveal(0.2);
  const r = 52, cx = 70, cy = 70, circ = 2*Math.PI*r;
  const total = slices.reduce((a,s) => a+s.value, 0);
  const trackStroke = theme === "light" ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,.06)";
  const centerFill = theme === "light" ? "#0f172a" : "#fff";
  let offset = 0;
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackStroke} strokeWidth="20"/>
      {total === 0 && (
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#64748b" fontSize="12">No data</text>
      )}
      {total > 0 && slices.map((s,i) => {
        const full = (s.value/total)*circ;
        const dash = visible ? full : 0;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth="20"
            strokeDasharray={`${dash} ${circ-dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition:`stroke-dasharray 1s cubic-bezier(.4,0,.2,1) ${i*140}ms` }}
          />
        );
        offset += full;
        return el;
      })}
      {total > 0 && (
        <>
      <text x={cx} y={cy-6}  textAnchor="middle" fill={centerFill} fontSize="22" fontWeight="700">{total}</text>
      <text x={cx} y={cy+14} textAnchor="middle" fill="#64748b" fontSize="11">total leads</text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVEAL WRAPPER — wraps any section with fade+slide on scroll
// ─────────────────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, direction = "up", className = "", style = {} }) {
  const [ref, visible] = useReveal(0.1);
  const fromY  = direction === "up"   ? 36  : direction === "down" ? -36 : 0;
  const fromX  = direction === "left" ? 40  : direction === "right"? -40 : 0;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "none" : `translate(${fromX}px,${fromY}px)`,
        transition: `opacity .65s ease ${delay}ms, transform .65s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Staggered children — wraps each child in its own Reveal with offset delays */
function StaggerReveal({ children, baseDelay = 0, step = 80, direction = "up", style = {} }) {
  return (
    <div style={style}>
      {React.Children.map(children, (child, i) => (
        <Reveal key={i} delay={baseDelay + i*step} direction={direction}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────────────────────────
const features = [
  {
    title:"Upload & organize",
    desc:"Import lead spreadsheets and keep records structured in one place.",
    icon:(
      <svg style={{width:24,height:24}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
      </svg>
    ),
  },
  {
    title:"Track responses",
    desc:"Log interest, callbacks, and outcomes so your team stays aligned.",
    icon:(
      <svg style={{width:24,height:24}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      </svg>
    ),
  },
  {
    title:"Insights at a glance",
    desc:"Open the dashboard for trends, conversion, and daily performance.",
    icon:(
      <svg style={{width:24,height:24}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────────────────────
function Home() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const orb1 = useParallax(0.12);
  const orb2 = useParallax(-0.08);

  const [homeData, setHomeData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiBase()}/home-stats/`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        if (!cancelled) {
          setHomeData(json);
          setDataError("");
        }
      } catch (e) {
        if (!cancelled) setDataError(e?.message || "Could not load live stats.");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const h = homeData || {};
  const total = Number(h.total_records) || 0;
  const interested = Number(h.interested) || 0;
  const notInterested = Number(h.not_interested) || 0;
  const pending = Number(h.pending) || 0;
  const convRate = Number(h.conversion_rate) || 0;
  const weekly = Array.isArray(h.weekly_by_day) && h.weekly_by_day.length === 7
    ? h.weekly_by_day.map((n) => Number(n) || 0)
    : [0, 0, 0, 0, 0, 0, 0];
  const weekLabels = h.weekday_labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthly = Array.isArray(h.monthly_totals) && h.monthly_totals.length === 12
    ? h.monthly_totals.map((n) => Number(n) || 0)
    : Array(12).fill(0);
  const yearLabel = h.monthly_year || new Date().getFullYear();
  const funnel = Array.isArray(h.funnel) && h.funnel.length ? h.funnel : [
    { label: "Total in database", value: total, color: "#38bdf8", pct: 100 },
    { label: "Interested", value: interested, color: "#a78bfa", pct: 0 },
    { label: "Pending", value: pending, color: "#f472b6", pct: 0 },
    { label: "Not interested", value: notInterested, color: "#34d399", pct: 0 },
  ];
  const donutSlices = [
    { value: interested, color: "#34d399" },
    { value: pending, color: "#38bdf8" },
    { value: notInterested, color: "#f472b6" },
  ];
  const donutLegend = [
    { label: "Interested", val: interested, color: "#34d399" },
    { label: "Pending", val: pending, color: "#38bdf8" },
    { label: "Not interested", val: notInterested, color: "#f472b6" },
  ];
  const recentList = Array.isArray(h.recent_activity) ? h.recent_activity : [];
  const topCallers = Array.isArray(h.top_telecallers) ? h.top_telecallers : [];
  const teamInterested = Number(h.team_interested_total) || interested;

  const weekSum = weekly.reduce((a, b) => a + b, 0);
  const dowJs = new Date().getDay();
  const monIndex = dowJs === 0 ? 6 : dowJs - 1;
  const daysElapsed = monIndex + 1;
  const weekAvg = daysElapsed ? (weekSum / daysElapsed).toFixed(1) : "0";
  const weekMax = Math.max(...weekly, 0);
  const todayStr = h.today?.total != null ? `${h.today.total} today` : "Live";

  const kpiCards = [
    { label: "Total leads", val: total, suffix: "", icon: "👥", color: "#38bdf8", delta: todayStr },
    { label: "Interested", val: interested, suffix: "", icon: "✅", color: "#34d399", delta: "won" },
    { label: "Pending", val: pending, suffix: "", icon: "📞", color: "#f472b6", delta: "queue" },
    {
      label: "Conversion rate",
      val: Math.round(convRate),
      suffix: "%",
      icon: "📈",
      color: "#a78bfa",
      delta: "contacted→yes",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-slate-100 text-slate-900 dark:bg-night-950 dark:text-white">
      <Header />
      <div className="relative z-20 -mb-px">
        <Wave />
      </div>

      <div
        className="home-body relative flex-1 text-slate-900 dark:text-white"
        data-theme={theme}
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        .home-body { background:#060d1a; color:#e2e8f0; }
        .home-body[data-theme="light"] {
          background:#f1f5f9 !important;
          color:#1e293b !important;
        }
        .home-body[data-theme="light"] ::-webkit-scrollbar-track { background:#e2e8f0; }
        .home-body[data-theme="light"] ::-webkit-scrollbar-thumb { background:#94a3b8; border-radius:3px; }
        .home-body[data-theme="light"] .glass,
        .home-body[data-theme="light"] .stat-card,
        .home-body[data-theme="light"] .feat-card {
          background:rgba(255,255,255,0.94);
          border:1px solid rgba(15,23,42,0.1);
        }
        .home-body[data-theme="light"] .stat-card:hover { box-shadow:0 12px 40px rgba(15,23,42,0.1); }
        .home-body[data-theme="light"] .feat-card:hover { box-shadow:0 20px 48px rgba(15,23,42,0.08); }
        .home-body[data-theme="light"] .home-kpi-value { color:#0f172a !important; }
        .home-body[data-theme="light"] .home-hero-plain { color:#0f172a !important; }
        .home-body[data-theme="light"] .home-chart-title { color:#0f172a !important; }
        .home-body[data-theme="light"] .qa-btn {
          color:#334155 !important;
        }
        .home-body[data-theme="light"] .home-secondary-link {
          background:rgba(15,23,42,0.06) !important;
          border:1px solid rgba(15,23,42,0.14) !important;
          color:#334155 !important;
        }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#060d1a; }
        ::-webkit-scrollbar-thumb { background:#1e3050; border-radius:3px; }

        .glass {
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.08);
          border-radius:16px;
          backdrop-filter:blur(12px);
        }
        .grad-text {
          background:linear-gradient(120deg,#f472b6,#c084fc,#38bdf8);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .stat-card {
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
          border-radius:16px; padding:22px 24px; position:relative; overflow:hidden;
          transition:border-color .25s, transform .2s, box-shadow .25s;
        }
        .stat-card:hover { border-color:rgba(56,189,248,.35); transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,.4); }
        .stat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(56,189,248,.4),transparent);
        }
        .feat-card {
          background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.07);
          border-radius:16px; padding:28px;
          transition:border-color .25s, transform .25s, box-shadow .25s;
        }
        .feat-card:hover { border-color:rgba(244,114,182,.3); transform:translateY(-4px); box-shadow:0 20px 56px rgba(0,0,0,.45); }
        .act-tag { display:inline-flex; align-items:center; padding:2px 9px; border-radius:20px; font-size:11px; font-weight:600; border:1px solid; }
        .caller-bar { height:5px; border-radius:3px; background:linear-gradient(90deg,#38bdf8,#a78bfa); }
        .funnel-bar { height:10px; border-radius:5px; }

        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        .pulse-dot { animation:pulse 2s ease-in-out infinite; }

        /* hero orb — base position only; JS does the translateY via parallax */
        .hero-orb {
          position:absolute; border-radius:50%; pointer-events:none; will-change:transform;
        }

        /* scroll-reveal: handled via inline styles in <Reveal> */

        /* floating entrance for hero badge */
        @keyframes floatIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .hero-badge-anim { animation: floatIn .7s ease both; }
        .hero-h-anim     { animation: floatIn .7s .12s ease both; }
        .hero-p-anim     { animation: floatIn .7s .22s ease both; }
        .hero-btns-anim  { animation: floatIn .7s .34s ease both; }

        /* quick action button */
        .qa-btn {
          background:var(--c)0f; border:1px solid var(--c)25; border-radius:12px;
          padding:16px 12px; cursor:pointer; font-family:inherit; text-align:center;
          transition:background .2s, transform .2s, box-shadow .2s; color:#e2e8f0; width:100%;
        }
        .qa-btn:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(0,0,0,.35); }

        @media(max-width:900px){
          .g3{grid-template-columns:1fr !important;}
          .g2{grid-template-columns:1fr !important;}
          .g4{grid-template-columns:1fr 1fr !important;}
        }
        @media(max-width:600px){
          .g4{grid-template-columns:1fr !important;}
          .hero-h{font-size:30px !important;}
        }

        .home-metrics-inner { max-width:1200px; margin:0 auto; padding:0 14px 56px; }
        @media (min-width: 640px) {
          .home-metrics-inner { padding: 0 24px 80px; }
        }
        .home-hero-section { padding: 64px 16px 48px !important; }
        @media (min-width: 640px) {
          .home-hero-section { padding: 88px 32px 64px !important; }
        }
        .glass.glass-chart-pad { padding: 16px !important; overflow: visible; }
        @media (min-width: 640px) {
          .glass.glass-chart-pad { padding: 24px !important; }
        }
        .chart-bar-scroll {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin: 0 -2px;
          padding: 0 2px 6px;
          scrollbar-width: thin;
        }
        .chart-bar-scroll-inner {
          display: flex;
          align-items: flex-end;
          gap: clamp(6px, 2vw, 10px);
        }
        .chart-bar-label {
          font-size: clamp(9px, 2.4vw, 10px);
          color: #64748b;
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
        }
        .home-body[data-theme="light"] .chart-bar-label { color: #64748b; }
        .chart-line-outer {
          width: 100%;
          padding: 0 clamp(4px, 2.5vw, 14px);
          box-sizing: border-box;
          overflow: visible;
        }
        .chart-line-svg {
          display: block;
          width: 100%;
          height: auto;
          min-height: 100px;
          overflow: visible;
        }
        .chart-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 10px 12px;
          margin-bottom: 20px;
        }
        .week-stats-footer {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px 16px;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .home-body[data-theme="light"] .week-stats-footer {
          border-top-color: rgba(15,23,42,.08);
        }
        .week-stats-footer > div {
          flex: 1 1 72px;
          text-align: center;
          min-width: 0;
        }
        .month-strip-grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 2px 4px;
          margin-top: 10px;
          text-align: center;
          font-size: clamp(8px, 2.1vw, 10px);
          line-height: 1.2;
        }
        .month-strip-muted { color: #94a3b8; font-weight: 500; }
        .month-strip-current { color: #a78bfa; font-weight: 700; }
        .home-body[data-theme="light"] .month-strip-muted { color: #64748b; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="home-hero-section" style={{ position:"relative", textAlign:"center", overflow:"hidden" }}>
        {/* Parallax orbs */}
        <div ref={orb1} className="hero-orb" style={{ width:640, height:640, top:-220, left:"50%", marginLeft:-320, background:"radial-gradient(circle,rgba(167,139,250,.13),transparent 68%)" }}/>
        <div ref={orb2} className="hero-orb" style={{ width:400, height:400, bottom:-180, right:"8%", background:"radial-gradient(circle,rgba(244,114,182,.1),transparent 70%)" }}/>

        <div className="hero-badge-anim" style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(56,189,248,.08)", border:"1px solid rgba(56,189,248,.2)", borderRadius:99, padding:"6px 16px", fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#38bdf8", marginBottom:28 }}>
          <span className="pulse-dot" style={{ width:6, height:6, borderRadius:"50%", background:"#38bdf8", display:"inline-block" }}/>
          Lead operations platform
        </div>

        <h1 className="hero-h hero-h-anim" style={{ fontSize:54, fontWeight:800, lineHeight:1.1, letterSpacing:"-.02em", marginBottom:20 }}>
          <span className="home-hero-plain">Solar solutions,</span>{" "}
          <span className="grad-text">powered by clarity</span>
        </h1>

        <p className="hero-p-anim" style={{ fontSize:18, color:"#64748b", maxWidth:540, margin:"0 auto 36px", lineHeight:1.75 }}>
          Manage leads, Excel workflows, and telecaller follow-ups from one workspace.
        </p>

        <div className="hero-btns-anim" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Link to="/dashboard" style={{ background:"linear-gradient(135deg,#f472b6,#a78bfa)", borderRadius:10, color:"#fff", padding:"12px 28px", fontSize:14, fontWeight:600, textDecoration:"none", boxShadow:"0 8px 24px rgba(167,139,250,.35)", display:"inline-block", transition:"transform .15s, box-shadow .15s" }}
            onMouseEnter={(e)=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 14px 32px rgba(167,139,250,.5)"}}
            onMouseLeave={(e)=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 8px 24px rgba(167,139,250,.35)"}}>
            View Dashboard →
          </Link>
          {isAuthenticated ? (
            <Link className="home-secondary-link" to="/add-excel" style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:10, color:"#e2e8f0", padding:"12px 28px", fontSize:14, fontWeight:500, textDecoration:"none", display:"inline-block" }}>
              Go to tools
            </Link>
          ) : (
            <Link className="home-secondary-link" to="/login" style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:10, color:"#e2e8f0", padding:"12px 28px", fontSize:14, fontWeight:500, textDecoration:"none", display:"inline-block" }}>
              Staff login
            </Link>
          )}
        </div>
      </section>

      <Wave compact />

      <div className="home-metrics-inner">

        {dataError && (
          <div style={{ marginBottom:20, borderRadius:12, border:"1px solid rgba(251,191,36,.35)", background:"rgba(251,191,36,.1)", padding:"12px 16px", fontSize:13, color:"#fcd34d" }}>
            {dataError} Charts below show zeros until the API is reachable.
          </div>
        )}
        {dataLoading && (
          <div style={{ marginBottom:20, display:"flex", alignItems:"center", gap:10, fontSize:13, color:"#64748b" }}>
            <span className="pulse-dot" style={{ width:8, height:8, borderRadius:"50%", background:"#38bdf8", display:"inline-block" }} />
            Loading live data from database…
          </div>
        )}

        {/* ── KPI STATS (staggered left→right) ─────────────── */}
        <div className="g4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
          {kpiCards.map((s,i) => (
            <Reveal key={s.label} delay={i*90} direction="up">
              <div className="stat-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <span style={{ fontSize:22 }}>{s.icon}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:s.color, background:`${s.color}18`, border:`1px solid ${s.color}30`, borderRadius:99, padding:"2px 9px" }}>{s.delta}</span>
                </div>
                <div className="home-kpi-value" style={{ fontSize:32, fontWeight:800, color:"#fff", lineHeight:1, marginBottom:6 }}>
                  <AnimCount end={s.val} suffix={s.suffix}/>
                </div>
                <div style={{ fontSize:12.5, color:"#64748b", fontWeight:500 }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── CHARTS ROW 1 ─────────────────────────────────── */}
        <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <Reveal delay={0} direction="left">
            <div className="glass glass-chart-pad" style={{ height:"100%" }}>
              <div className="chart-card-header">
                <div>
                  <div className="home-chart-title" style={{ fontSize:15, fontWeight:700 }}>This week (Mon–Sun)</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>New records by upload date</div>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:"#38bdf8", background:"rgba(56,189,248,.1)", border:"1px solid rgba(56,189,248,.2)", borderRadius:99, padding:"3px 11px", flexShrink:0 }}>This week</span>
              </div>
              <BarChart data={weekly} labels={weekLabels} color="#38bdf8" height={140}/>
              <div className="week-stats-footer">
                {[
                  [String(weekSum), "Week total", "#38bdf8"],
                  [String(weekAvg), "Daily avg", "#34d399"],
                  [String(weekMax), "Best day", "#f472b6"],
                ].map(([v,l,c])=>(
                  <div key={l} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:700, color:c }}>{v}</div>
                    <div style={{ fontSize:11, color:"#64748b" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} direction="right">
            <div className="glass glass-chart-pad" style={{ height:"100%" }}>
              <div className="chart-card-header">
                <div>
                  <div className="home-chart-title" style={{ fontSize:15, fontWeight:700 }}>Monthly uploads</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>Records added per month ({yearLabel})</div>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:"#a78bfa", background:"rgba(167,139,250,.1)", border:"1px solid rgba(167,139,250,.2)", borderRadius:99, padding:"3px 11px", flexShrink:0 }}>{yearLabel}</span>
              </div>
              <LineChart key={monthly.join("-")} data={monthly} color="#a78bfa" h={120} w={500}/>
              <div className="month-strip-grid">
                {MONTHS.map((m, i) => (
                  <div key={m}>
                    <div className={i === new Date().getMonth() ? "month-strip-current" : "month-strip-muted"}>{m}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── CHARTS ROW 2 ─────────────────────────────────── */}
        <div className="g2" style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:16, marginBottom:16 }}>
          <Reveal delay={0} direction="up">
            <div className="glass" style={{ padding:24, height:"100%" }}>
              <div className="home-chart-title" style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>Lead Status Mix</div>
              <div style={{ fontSize:12, color:"#64748b", marginBottom:20 }}>Distribution by outcome</div>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
                <DonutChart slices={donutSlices} size={160} theme={theme} />
              </div>
              {donutLegend.map((s,i) => (
                <Reveal key={s.label} delay={i*60} direction="left">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:s.color }}/>
                      <span style={{ fontSize:13, color:"#94a3b8" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.val}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal delay={140} direction="up">
            <div className="glass" style={{ padding:24, height:"100%" }}>
              <div className="home-chart-title" style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>Conversion Funnel</div>
              <div style={{ fontSize:12, color:"#64748b", marginBottom:24 }}>Lead journey from contact to close</div>
              <FunnelBars data={funnel}/>
              <div style={{ marginTop:24, padding:14, background:"rgba(52,211,153,.06)", border:"1px solid rgba(52,211,153,.15)", borderRadius:10 }}>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:4 }}>Conversion rate (interested ÷ contacted)</div>
                <div style={{ fontSize:24, fontWeight:800, color:"#34d399" }}>{convRate}%</div>
                <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>From live database totals</div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── ACTIVITY + LEADERBOARD ───────────────────────── */}
        <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <Reveal delay={0} direction="left">
            <div className="glass" style={{ padding:24, height:"100%" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div>
                  <div className="home-chart-title" style={{ fontSize:15, fontWeight:700 }}>Recent Activity</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>Latest telecaller updates</div>
                </div>
                <div className="pulse-dot" style={{ width:8, height:8, borderRadius:"50%", background:"#34d399" }}/>
              </div>
              {recentList.length === 0 && !dataLoading && (
                <p style={{ fontSize:13, color:"#64748b", padding:"12px 0" }}>No recent updates yet.</p>
              )}
              {recentList.map((a,i) => {
                const tc = TAG_COLORS[a.tag] || TAG_COLORS.callback;
                return (
                  <Reveal key={`${a.name}-${a.updated_at}`} delay={i*55} direction="up">
                    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:i<recentList.length-1?"1px solid rgba(255,255,255,.05)":"none" }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,rgba(167,139,250,.3),rgba(56,189,248,.3))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#e2e8f0", flexShrink:0 }}>{a.avatar}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.name}</div>
                        <div style={{ fontSize:12, color:"#64748b" }}>{a.action}</div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                        <span className="act-tag" style={{ background:tc.bg, borderColor:tc.border, color:tc.text }}>{a.tag}</span>
                        <span style={{ fontSize:10, color:"#3a4a5a" }}>{formatTimeAgo(a.updated_at)}</span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={130} direction="right">
            <div className="glass" style={{ padding:24, height:"100%" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div>
                  <div className="home-chart-title" style={{ fontSize:15, fontWeight:700 }}>Top Performers</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>Telecallers this month</div>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:"#f472b6", background:"rgba(244,114,182,.1)", border:"1px solid rgba(244,114,182,.2)", borderRadius:99, padding:"3px 11px" }}>🏆 Ranked</span>
              </div>
              <CallerBars callers={topCallers}/>
              <div style={{ marginTop:20, padding:"12px 14px", background:"rgba(56,189,248,.05)", border:"1px solid rgba(56,189,248,.12)", borderRadius:10, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:"#64748b" }}>Total “Interested” in database</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#38bdf8" }}>{teamInterested}</span>
              </div>
            </div>
          </Reveal>
        </div>

        <Wave compact flip />

        {/* ── FEATURE CARDS ─────────────────────────────────── */}
        <div className="g3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:16 }}>
          {features.map((f,i) => (
            <Reveal key={f.title} delay={i*100} direction="up">
              <div className="feat-card" style={{ height:"100%" }}>
                <div style={{ width:48, height:48, borderRadius:12, background:"linear-gradient(135deg,rgba(244,114,182,.2),rgba(56,189,248,.2))", display:"flex", alignItems:"center", justifyContent:"center", color:"#38bdf8", marginBottom:18, border:"1px solid rgba(255,255,255,.08)" }}>
                  {f.icon}
                </div>
                <h2 className="home-chart-title" style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{f.title}</h2>
                <p style={{ fontSize:13.5, color:"#64748b", lineHeight:1.7 }}>{f.desc}</p>
                <div style={{ marginTop:18 }}>
                  <Link
                    to={i === 0 ? "/add-excel" : i === 1 ? "/see-data" : "/dashboard"}
                    style={{ fontSize:13, fontWeight:600, color:"#a78bfa", textDecoration:"none" }}
                  >
                    Explore →
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── QUICK ACTIONS ─────────────────────────────────── */}
        <div className="g4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
          {[
            { icon:"📤", label:"Upload Excel",     color:"#38bdf8", to:"/add-excel" },
            { icon:"📋", label:"View All Leads",   color:"#a78bfa", to:"/see-data" },
            { icon:"📞", label:"Schedule Callback",color:"#f472b6", to:"/update-interest" },
            { icon:"📊", label:"Export Report",    color:"#34d399", to:"/download-excel" },
          ].map((a,i) => (
            <Reveal key={a.label} delay={i*70} direction="up">
              <Link
                to={a.to}
                className="qa-btn"
                style={{ "--c": a.color }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${a.color}1a`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${a.color}0f`;
                }}
              >
                <div style={{ fontSize:26, marginBottom:10 }}>{a.icon}</div>
                <div style={{ fontSize:13, fontWeight:600, color:a.color }}>{a.label}</div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* ── CTA BANNER ────────────────────────────────────── */}
        <Reveal delay={0} direction="up">
          <div style={{ borderRadius:20, padding:"40px 36px", background:"linear-gradient(135deg,rgba(167,139,250,.12),rgba(6,13,26,.8),rgba(244,114,182,.1))", border:"1px solid rgba(255,255,255,.08)", textAlign:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(167,139,250,.5),transparent)" }}/>
            <h3 className="home-chart-title" style={{ fontSize:22, fontWeight:700, marginBottom:10 }}>Telecallers &amp; Operations</h3>
            <p style={{ fontSize:14.5, color:"#64748b", maxWidth:480, margin:"0 auto 22px", lineHeight:1.75 }}>
              After login: update customer interest, add or download Excel, and browse assigned data.
              The <Link to="/dashboard" style={{ color:"#38bdf8", textDecoration:"none", fontWeight:600 }}>dashboard</Link> is available after you sign in.
            </p>
            <Link to="/update-interest" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13.5, fontWeight:600, color:"#f472b6", textDecoration:"none", background:"rgba(244,114,182,.1)", border:"1px solid rgba(244,114,182,.2)", borderRadius:99, padding:"8px 20px" }}>
              Update customer interest →
            </Link>
          </div>
        </Reveal>

      </div>
      </div>

      <div className="relative z-20 -mt-px">
        <Wave flip />
      </div>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNNEL BARS — animated width on visibility
// ─────────────────────────────────────────────────────────────────────────────
function FunnelBars({ data }) {
  const [ref, visible] = useReveal(0.2);
  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {data.map((s,i) => (
        <div key={i}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:13.5, color:"#e2e8f0", fontWeight:500 }}>{s.label}</span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:11, color:"#64748b" }}>{s.pct}%</span>
              <span style={{ fontSize:15, fontWeight:700, color:s.color }}>{s.value}</span>
            </div>
          </div>
          <div style={{ height:10, background:"rgba(255,255,255,.06)", borderRadius:5, overflow:"hidden" }}>
            <div className="funnel-bar" style={{
              width: visible ? `${s.pct}%` : "0%",
              background: s.color, opacity:.85,
              transition: `width 1s cubic-bezier(.4,0,.2,1) ${i*120}ms`,
            }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALLER BARS — animated on visibility
// ─────────────────────────────────────────────────────────────────────────────
function CallerBars({ callers }) {
  const [ref, visible] = useReveal(0.2);
  if (!callers?.length) {
    return (
      <p style={{ fontSize:13, color:"#64748b", textAlign:"center", padding:"20px 0" }}>
        No telecaller updates in the database yet.
      </p>
    );
  }
  const topCalls = Math.max(callers[0].calls, 1);
  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {callers.map((c,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:i===0?"#f472b6":i===1?"#a78bfa":"#64748b", width:18, textAlign:"center", flexShrink:0 }}>#{i+1}</div>
          <div style={{ width:34, height:34, borderRadius:"50%", background:i===0?"linear-gradient(135deg,#f472b6,#a78bfa)":"rgba(255,255,255,.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:i===0?"#fff":"#94a3b8", flexShrink:0 }}>{c.avatar}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{c.name}</span>
              <span style={{ fontSize:12, color:"#64748b" }}>{c.calls} calls</span>
            </div>
            <div style={{ height:5, background:"rgba(255,255,255,.06)", borderRadius:3, overflow:"hidden" }}>
              <div className="caller-bar" style={{
                width: visible ? `${(c.calls/topCalls)*100}%` : "0%",
                transition:`width 1s cubic-bezier(.4,0,.2,1) ${i*100}ms`,
              }}/>
            </div>
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:"#34d399", flexShrink:0, width:40, textAlign:"right" }}>{c.converted} ✓</div>
        </div>
      ))}
    </div>
  );
}

export default Home;