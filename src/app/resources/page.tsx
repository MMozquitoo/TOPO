"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  resources,
  Resource,
  ResourceCategory,
  DeviceTag,
  TechniqueTag,
  Difficulty,
} from "@/lib/resources";
import { getProgress } from "@/lib/progress";
import { weeks } from "@/lib/curriculum";
import AnimatedPage from "@/components/AnimatedPage";
import { spring, fadeUp, micro, tapScale, staggerContainer, staggerItem } from "@/lib/motion";

const READ_KEY = "cybersec-daily-resources-read";

function getReadResources(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function toggleReadResource(id: string): string[] {
  const current = getReadResources();
  const next = current.includes(id)
    ? current.filter((r) => r !== id)
    : [...current, id];
  localStorage.setItem(READ_KEY, JSON.stringify(next));
  return next;
}

const categoryLabels: Record<ResourceCategory, string> = {
  book: "Book",
  blog: "Blog",
  video: "Video",
  writeup: "Pwn2Own",
  tool: "Tool",
  lab: "Lab",
  paper: "Paper",
  talk: "Talk",
};

const deviceLabels: Record<DeviceTag, string> = {
  router: "Router",
  camera: "Camera",
  "smart-home": "Smart Home",
  automotive: "Automotive",
  console: "Console",
  "payment-terminal": "Payment Terminal",
  microcontroller: "MCU",
  industrial: "Industrial",
  printer: "Printer",
  phone: "Phone",
  general: "General",
};

const techniqueLabels: Record<TechniqueTag, string> = {
  "hardware-interfaces": "Hardware Interfaces",
  "firmware-extraction": "Firmware Extraction",
  "reverse-engineering": "Reverse Engineering",
  emulation: "Emulation",
  fuzzing: "Fuzzing",
  exploitation: "Exploitation",
  "fault-injection": "Fault Injection",
  wireless: "Wireless",
  general: "General",
};

const difficultyColors: Record<Difficulty, string> = {
  beginner: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  intermediate: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
  advanced: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
};

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={tapScale}
      transition={micro}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black border-neutral-900 dark:border-neutral-100"
          : "border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-400"
      }`}
    >
      {label}
    </motion.button>
  );
}

function getSuggestedResources(completedDays: number[]): Resource[] {
  const lastDay = Math.max(...completedDays, 0);
  const week = weeks.find((w) => w.days.some((d) => d.day === lastDay));
  if (!week || week.id < 2) return [];

  const techniqueMap: Record<number, TechniqueTag[]> = {
    8: ["hardware-interfaces"],
    9: ["hardware-interfaces"],
    10: ["hardware-interfaces"],
    11: ["firmware-extraction"],
    12: ["firmware-extraction"],
    13: ["reverse-engineering", "exploitation"],
    14: ["reverse-engineering", "exploitation", "firmware-extraction"],
    15: ["emulation"],
    16: ["emulation"],
    17: ["emulation"],
    18: ["emulation", "fuzzing"],
    19: ["emulation"],
    20: ["emulation", "exploitation"],
    21: ["emulation", "reverse-engineering"],
    22: ["reverse-engineering"],
    23: ["reverse-engineering"],
    24: ["reverse-engineering"],
    25: ["reverse-engineering", "exploitation"],
    26: ["reverse-engineering"],
    27: ["reverse-engineering", "exploitation"],
    28: ["reverse-engineering", "exploitation"],
    29: ["fuzzing"],
    30: ["fuzzing"],
    31: ["fuzzing"],
    32: ["fuzzing", "emulation"],
    33: ["fuzzing"],
    34: ["fuzzing", "exploitation"],
    35: ["fuzzing", "exploitation"],
    36: ["exploitation"],
    37: ["exploitation"],
    38: ["exploitation"],
    39: ["exploitation", "reverse-engineering"],
    40: ["exploitation"],
    41: ["exploitation"],
    42: ["exploitation", "reverse-engineering"],
    43: ["wireless"],
    44: ["wireless"],
    45: ["wireless", "hardware-interfaces"],
    46: ["hardware-interfaces", "exploitation"],
    47: ["wireless", "exploitation"],
    48: ["fault-injection"],
    49: ["wireless", "hardware-interfaces", "exploitation"],
    50: ["reverse-engineering", "exploitation"],
    51: ["reverse-engineering", "exploitation"],
    52: ["exploitation", "firmware-extraction"],
    53: ["exploitation"],
    54: ["exploitation", "reverse-engineering"],
    55: ["exploitation", "reverse-engineering"],
    56: ["general"],
  };

  const relevant = techniqueMap[lastDay] || [];
  if (relevant.length === 0) return [];

  return resources
    .filter((r) => r.technique.some((t) => relevant.includes(t)))
    .slice(0, 3);
}

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ResourceCategory | null>(null);
  const [deviceFilter, setDeviceFilter] = useState<DeviceTag | null>(null);
  const [techniqueFilter, setTechniqueFilter] = useState<TechniqueTag | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  useEffect(() => {
    setReadIds(getReadResources());
    setCompletedDays(getProgress().completedDays);
  }, []);

  const suggested = useMemo(() => getSuggestedResources(completedDays), [completedDays]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (deviceFilter && !r.device.includes(deviceFilter)) return false;
      if (techniqueFilter && !r.technique.includes(techniqueFilter)) return false;
      if (difficultyFilter && r.difficulty !== difficultyFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${r.title} ${r.description} ${r.source} ${r.device.join(" ")} ${r.technique.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [search, categoryFilter, deviceFilter, techniqueFilter, difficultyFilter]);

  const handleToggleRead = (id: string) => {
    setReadIds(toggleReadResource(id));
  };

  const activeFilters = [categoryFilter, deviceFilter, techniqueFilter, difficultyFilter].filter(Boolean).length;

  const usedCategories = useMemo(() => Array.from(new Set(resources.map((r) => r.category))), []);
  const usedDevices = useMemo(() => Array.from(new Set(resources.flatMap((r) => r.device))).filter((d): d is DeviceTag => d !== "general"), []);
  const usedTechniques = useMemo(() => Array.from(new Set(resources.flatMap((r) => r.technique))).filter((t): t is TechniqueTag => t !== "general"), []);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <AnimatedPage>
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4 inline-block"
            >
              ← Home
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              Resource Library
            </h1>
            <p className="text-neutral-500">
              {resources.length} curated resources from the embedded security research community.
            </p>
          </div>

          {/* Suggestions */}
          {suggested.length > 0 && (
            <motion.section
              className="mb-10 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={spring}
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                Recommended for you
              </h2>
              <div className="space-y-2">
                {suggested.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    {r.title} <span className="text-neutral-400">— {r.source} ↗</span>
                  </a>
                ))}
              </div>
            </motion.section>
          )}

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm outline-none focus:border-neutral-400"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3 mb-8">
            <div>
              <p className="text-xs text-neutral-400 mb-2">Format</p>
              <div className="flex flex-wrap gap-2">
                {usedCategories.map((cat: ResourceCategory) => (
                  <FilterChip
                    key={cat}
                    label={categoryLabels[cat]}
                    active={categoryFilter === cat}
                    onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-2">Device</p>
              <div className="flex flex-wrap gap-2">
                {usedDevices.map((dev: DeviceTag) => (
                  <FilterChip
                    key={dev}
                    label={deviceLabels[dev]}
                    active={deviceFilter === dev}
                    onClick={() => setDeviceFilter(deviceFilter === dev ? null : dev)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-2">Technique</p>
              <div className="flex flex-wrap gap-2">
                {usedTechniques.map((tech: TechniqueTag) => (
                  <FilterChip
                    key={tech}
                    label={techniqueLabels[tech]}
                    active={techniqueFilter === tech}
                    onClick={() => setTechniqueFilter(techniqueFilter === tech ? null : tech)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-2">Difficulty</p>
              <div className="flex flex-wrap gap-2">
                {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((diff) => (
                  <FilterChip
                    key={diff}
                    label={diff.charAt(0).toUpperCase() + diff.slice(1)}
                    active={difficultyFilter === diff}
                    onClick={() => setDifficultyFilter(difficultyFilter === diff ? null : diff)}
                  />
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setCategoryFilter(null);
                  setDeviceFilter(null);
                  setTechniqueFilter(null);
                  setDifficultyFilter(null);
                }}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="text-xs text-neutral-400 mb-4">
            {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
            {activeFilters > 0 || search ? " matching" : ""}
          </p>

          {/* Resource cards */}
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((r) => {
                const isRead = readIds.includes(r.id);
                return (
                  <motion.div
                    key={r.id}
                    variants={staggerItem}
                    layout
                    initial={fadeUp.initial}
                    animate={fadeUp.animate}
                    exit={fadeUp.exit}
                    transition={spring}
                    className={`p-4 rounded-xl border transition-colors ${
                      isRead
                        ? "border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/30"
                        : "border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          {r.title} <span className="text-neutral-400">↗</span>
                        </a>
                        <p className="text-xs text-neutral-500 mt-1">{r.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs text-neutral-400">{r.source}</span>
                          <span className="text-neutral-300 dark:text-neutral-700">·</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[r.difficulty]}`}>
                            {r.difficulty}
                          </span>
                          <span className="text-xs text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800">
                            {categoryLabels[r.category]}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleRead(r.id)}
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-colors ${
                          isRead
                            ? "bg-green-100 dark:bg-green-900 text-green-600 border-green-200 dark:border-green-800"
                            : "text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                        }`}
                        title={isRead ? "Mark as unread" : "Mark as read"}
                      >
                        {isRead ? "✓" : "○"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500 text-sm">No resources match your filters.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter(null);
                  setDeviceFilter(null);
                  setTechniqueFilter(null);
                  setDifficultyFilter(null);
                }}
                className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mt-2"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </AnimatedPage>
    </main>
  );
}
