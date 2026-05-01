import { week1 } from "@/data/week1";
import { week2 } from "@/data/week2";
import { week3 } from "@/data/week3";
import { week4 } from "@/data/week4";
import { week5 } from "@/data/week5";
import { week6 } from "@/data/week6";
import { week7 } from "@/data/week7";
import { week8 } from "@/data/week8";
import { WeekMeta, DayData } from "@/lib/types";

export const weeks: WeekMeta[] = [
  {
    id: 1,
    title: "Cybersecurity Fundamentals",
    subtitle: "7 days. 7 skills. One concept at a time.",
    days: week1,
    skills: [
      "Phishing URL Detection",
      "Social Engineering Defense",
      "Password Hashing & Salting",
      "TLS Certificate Analysis",
      "Terminal Navigation",
      "Network Reconnaissance",
      "Firewall Configuration",
    ],
  },
  {
    id: 2,
    title: "Hardware Hacking Fundamentals",
    subtitle: "7 days. Open the device. Read the firmware.",
    days: week2,
    skills: [
      "Embedded System Anatomy",
      "UART Serial Interfaces",
      "JTAG & SWD Debugging",
      "SPI Flash Dumping",
      "Firmware Extraction",
      "Secret Hunting in Firmware",
      "Full Firmware Analysis",
    ],
  },
  {
    id: 3,
    title: "Emulation & Dynamic Analysis",
    subtitle: "7 days. No hardware needed. Run firmware from your laptop.",
    days: week3,
    skills: [
      "Firmware Emulation Concepts",
      "QEMU User Mode",
      "QEMU System Mode",
      "Qiling Framework",
      "GDB Remote Debugging",
      "Network Traffic Analysis",
      "Full Emulation Pipeline",
    ],
  },
  {
    id: 4,
    title: "Reverse Engineering with Ghidra",
    subtitle: "7 days. Read the code. Find the bugs.",
    days: week4,
    skills: [
      "Reverse Engineering Fundamentals",
      "Binary Format Analysis",
      "ARM Assembly Reading",
      "MIPS Assembly Reading",
      "Vulnerability Discovery",
      "CGI Binary Analysis",
      "Bug Report Writing",
    ],
  },
  {
    id: 5,
    title: "Fuzzing Firmware",
    subtitle: "7 days. Break software with random inputs.",
    days: week5,
    skills: [
      "Fuzzing Theory",
      "AFL++ Coverage Fuzzing",
      "QEMU-Mode Fuzzing",
      "Unicorn-Mode Fuzzing",
      "Crash Triage & Analysis",
      "Symbolic Execution",
      "Full Fuzzing Pipeline",
    ],
  },
  {
    id: 6,
    title: "Exploit Development",
    subtitle: "7 days. From crash to code execution.",
    days: week6,
    skills: [
      "Memory Layout & Corruption",
      "ARM Buffer Overflows",
      "MIPS Buffer Overflows",
      "Return-Oriented Programming",
      "ROP Chain Construction",
      "Embedded Shellcode",
      "Full Exploit Pipeline",
    ],
  },
  {
    id: 7,
    title: "Wireless, Automotive & IoT Protocols",
    subtitle: "7 days. Attack the invisible connections.",
    days: week7,
    skills: [
      "BLE Hacking",
      "WiFi Security Analysis",
      "CAN Bus Attacks",
      "NFC & Smart Home Protocols",
      "Automotive ECU Hacking",
      "Fault Injection & Glitching",
      "IoT Protocol Analysis",
    ],
  },
  {
    id: 8,
    title: "Professional Methodology & Case Studies",
    subtitle: "7 days. Think like a researcher. Ship like a professional.",
    days: week8,
    skills: [
      "IoT Security Methodology",
      "Pwn2Own Case Analysis",
      "EV Charger Exploitation",
      "0-day Discovery Process",
      "Responsible Disclosure",
      "Lab Setup & Tooling",
      "Research Roadmap Planning",
    ],
  },
];

export const allDays: DayData[] = weeks.flatMap((w) => w.days);

export function getDayData(dayNum: number): DayData | undefined {
  return allDays.find((d) => d.day === dayNum);
}

export function getWeekForDay(dayNum: number): WeekMeta | undefined {
  return weeks.find((w) => w.days.some((d) => d.day === dayNum));
}

export function getWeekDayIndex(dayNum: number): { weekIndex: number; dayIndex: number } | undefined {
  for (let wi = 0; wi < weeks.length; wi++) {
    const di = weeks[wi].days.findIndex((d) => d.day === dayNum);
    if (di !== -1) return { weekIndex: wi, dayIndex: di };
  }
  return undefined;
}
