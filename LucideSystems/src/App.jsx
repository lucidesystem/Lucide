import { useState, useEffect, useRef } from "react";
import "./App.css";
import Login from "./pages/Login";
import Greeting from "./pages/Greeting";
 
const SERVICES = [
  {
    title: "Web Design",
    desc: "Interfaces built around how your customers actually think, not a template pulled off a shelf.",
    icon: (
      <path
        d="M4 4h16v16H4z M4 9h16 M9 9v11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Web Development",
    desc: "Fast, accessible, maintainable code — React, Node, or whatever the job actually calls for.",
    icon: (
      <path
        d="M8 6 2 12l6 6 M16 6l6 6-6 6 M13 4l-2 16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "E-Commerce",
    desc: "Storefronts that convert — Shopify, headless commerce, or a custom checkout built from scratch.",
    icon: (
      <path
        d="M3 6h18l-2 12H5L3 6z M8 6V4a4 4 0 0 1 8 0v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Web Applications",
    desc: "Dashboards, portals, and internal tools that hold up under real, daily use.",
    icon: (
      <path
        d="M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "SEO & Performance",
    desc: "Sites that load fast and get found — Core Web Vitals, structured data, real optimization.",
    icon: (
      <path
        d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.35-4.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Ongoing Support",
    desc: "Monitoring, updates, and a team that picks up the phone after launch day, too.",
    icon: (
      <path
        d="M12 2v4 M12 18v4 M4.9 4.9l2.8 2.8 M16.3 16.3l2.8 2.8 M2 12h4 M18 12h4 M4.9 19.1l2.8-2.8 M16.3 7.7l2.8-2.8"
        strokeLinecap="round"
      />
    ),
  },
];
 
const STATS_URL = "https://stats.lucidesystems.com/stats";
const POLL_MS = 1500;
 
function formatUptime(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
 
// Polls STATS_URL on an interval, timing each request itself so "latency"
// reflects what an actual visitor experiences, not a server-side ping.
function useServerStats() {
  const [state, setState] = useState({
    status: "connecting", // connecting | online | degraded | offline
    stats: null,
    latencyMs: null,
  });
