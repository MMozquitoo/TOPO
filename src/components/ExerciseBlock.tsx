"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/lib/types";
import { micro, spring, fadeUp, staggerContainer, staggerItem, tapScale } from "@/lib/motion";

interface TerminalLine {
  type: "input" | "output";
  text: string;
  id: number;
}

let lineId = 0;

function TerminalSimulator({ exercise }: { exercise: Exercise }) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const processCommand = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    const inputLine: TerminalLine = { type: "input", text: `$ ${trimmed}`, id: ++lineId };
    setLines((prev) => [...prev, inputLine]);

    if (cmd === "clear") {
      setLines([]);
      return;
    }

    const commands = exercise.terminalCommands || {};
    const handler = commands[cmd];

    if (handler) {
      const output = handler(args);
      if (output) {
        const outputLines = output.split("\n").map((text) => ({
          type: "output" as const,
          text,
          id: ++lineId,
        }));
        setLines((prev) => [...prev, ...outputLines]);
      }
    } else {
      setLines((prev) => [
        ...prev,
        { type: "output", text: `${cmd}: command not found. Type 'help' for available commands.`, id: ++lineId },
      ]);
    }
  }, [exercise.terminalCommands]);

  return (
    <div
      className="bg-neutral-950 rounded-xl p-4 font-mono text-sm h-80 flex flex-col cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex gap-1.5 mb-3">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <motion.div
        className="flex-1 overflow-y-auto space-y-0.5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {lines.length === 0 && (
          <p className="text-neutral-600">Type a command and press Enter...</p>
        )}
        <AnimatePresence>
          {lines.map((line) => (
            <motion.pre
              key={line.id}
              variants={staggerItem}
              initial="initial"
              animate="animate"
              className={`whitespace-pre-wrap ${
                line.type === "input" ? "text-green-400" : "text-neutral-300"
              }`}
            >
              {line.text}
            </motion.pre>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </motion.div>
      <div className="flex items-center gap-2 mt-2 border-t border-neutral-800 pt-2">
        <span className="text-green-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              processCommand(input);
              setInput("");
            }
          }}
          className="flex-1 bg-transparent text-neutral-100 outline-none caret-transparent"
          autoFocus
          spellCheck={false}
        />
        <motion.span
          className="w-2 h-4 bg-green-400"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        />
      </div>
    </div>
  );
}

export default function ExerciseBlock({
  exercise,
  onComplete,
}: {
  exercise: Exercise;
  onComplete: () => void;
}) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; hint: string } | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = () => {
    const result = exercise.validator(input);
    setFeedback(result);
    if (result.correct && !completed) {
      setCompleted(true);
      onComplete();
    }
  };

  if (exercise.type === "terminal") {
    return (
      <motion.section
        className="space-y-4"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={spring}
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Practice
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
          {exercise.prompt}
        </p>
        <TerminalSimulator exercise={exercise} />
        <AnimatePresence mode="wait">
          {!completed ? (
            <motion.button
              key="continue"
              onClick={() => { setCompleted(true); onComplete(); }}
              whileTap={tapScale}
              transition={micro}
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              exit={fadeUp.exit}
              className="px-5 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-lg text-sm font-medium"
            >
              I&apos;ve explored the terminal — continue
            </motion.button>
          ) : (
            <motion.p
              key="done"
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={spring}
              className="text-green-600 dark:text-green-400 text-sm font-medium"
            >
              ✓ Exercise complete
            </motion.p>
          )}
        </AnimatePresence>
      </motion.section>
    );
  }

  const isChoice = exercise.type === "choice";

  return (
    <motion.section
      className="space-y-4"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={spring}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Practice
      </h2>
      <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
        {exercise.prompt}
      </p>
      {isChoice ? (
        <div className="space-y-2">
          {(exercise.choices || ["A", "B", "C", "D"]).map((text, i) => {
            const label = String.fromCharCode(65 + i);
            return (
              <motion.button
                key={label}
                whileTap={tapScale}
                transition={micro}
                onClick={() => {
                  setInput(label);
                  const result = exercise.validator(label);
                  setFeedback(result);
                  if (result.correct && !completed) {
                    setCompleted(true);
                    onComplete();
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm ${
                  input === label
                    ? feedback?.correct
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : "border-red-500 bg-red-50 dark:bg-red-950"
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <span className="font-semibold">{label}.</span> {text}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={exercise.placeholder}
            className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm outline-none focus:border-neutral-400"
          />
          <motion.button
            onClick={handleSubmit}
            whileTap={tapScale}
            transition={micro}
            className="px-5 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-lg text-sm font-medium"
          >
            Check
          </motion.button>
        </div>
      )}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            exit={fadeUp.exit}
            transition={spring}
            className={`p-4 rounded-lg text-sm ${
              feedback.correct
                ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
            }`}
          >
            {feedback.hint}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
