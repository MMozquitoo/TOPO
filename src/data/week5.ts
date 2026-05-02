import { DayData } from "@/lib/types";

export const week5: DayData[] = [
  {
    day: 29,
    title: "What Is Fuzzing? — Breaking Software with Random Inputs",
    hook: "In 2016, a security researcher pointed AFL — an automated fuzzing tool — at ImageMagick, one of the most widely used image processing libraries on the internet. Within hours, AFL had discovered a critical heap buffer overflow that had been hiding in the codebase for over 20 years. Thousands of developers had reviewed that code. Static analyzers had scanned it. Unit tests had passed. None of them found what a program throwing random bytes at a function found in a single afternoon. The bug, later assigned CVE-2016-8862, could be triggered by any user uploading a crafted image to a web server — and millions of servers ran ImageMagick. Fuzzing doesn't think like a human. It doesn't assume inputs will be well-formed. It throws chaos at your code and watches what breaks. Today you'll learn why this approach finds bugs that nothing else can.",
    lesson: [
      "Fuzzing is an automated testing technique that feeds random, unexpected, or malformed inputs into a program to trigger crashes, hangs, or unexpected behavior. Instead of carefully crafting test cases by hand, a fuzzer generates millions of inputs per second, exploring code paths that human testers would never think to try. Every crash is a potential vulnerability — a buffer overflow, a null pointer dereference, a use-after-free.",
      "There are two main categories of fuzzers. Dumb fuzzers generate purely random data with no knowledge of the target's input format — they're easy to set up but slow to find deep bugs. Coverage-guided fuzzers like AFL++ and libFuzzer instrument the target binary, tracking which code branches each input reaches. When a mutated input triggers a new code path, the fuzzer saves it and mutates it further, systematically exploring deeper into the program's logic.",
      "Why does fuzzing find bugs that code review misses? Human reviewers follow the happy path — they think about intended inputs. Fuzzers explore the unhappy path at machine speed: null bytes in the middle of strings, integers at MAX_INT, files truncated at random offsets, nested structures a thousand levels deep. The combinatorial explosion of possible inputs is something only automation can explore.",
      "For firmware security, fuzzing is especially powerful. Embedded binaries are compiled for MIPS or ARM, often without source code available. Tools like AFL++ with QEMU mode can fuzz these cross-architecture binaries on your x86 workstation. You'll learn exactly how to do this over the next several days. Today you'll build the conceptual foundation: what fuzzing is, why it works, and when to use it."
    ],
    exercise: {
      type: "choice",
      prompt: "A coverage-guided fuzzer like AFL++ discovers a new input that causes the target program to execute a previously-unseen code branch. What does the fuzzer do next?",
      choices: [
        "Discards the input because it didn't cause a crash",
        "Saves the input to its corpus and mutates it to explore deeper paths",
        "Stops fuzzing because it has achieved full coverage",
        "Sends the input to the developer as a bug report"
      ],
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "B") {
          return { correct: true, hint: "Correct! Coverage-guided fuzzers save inputs that trigger new code paths to their corpus, then mutate them further. This is the evolutionary feedback loop that makes them so effective — each interesting input becomes the seed for exploring even deeper program states." };
        }
        if (choice === "A") {
          return { correct: false, hint: "A coverage-guided fuzzer doesn't only care about crashes. New code coverage is valuable because it means the fuzzer is exploring uncharted territory where crashes may lurk. The input is saved and mutated further." };
        }
        if (choice === "C") {
          return { correct: false, hint: "Full coverage is practically impossible for real-world programs. The fuzzer keeps running, continuously mutating inputs to find new branches. It never declares 'done' on its own." };
        }
        if (choice === "D") {
          return { correct: false, hint: "Fuzzers operate autonomously — they don't send reports. They save interesting inputs to a corpus directory for the researcher to analyze later." };
        }
        return { correct: false, hint: "Choose A, B, C, or D." };
      },
    },
    quiz: {
      question: "Why does fuzzing often find vulnerabilities that static analysis and code review miss?",
      options: [
        { label: "A", value: "Fuzzers can read source code better than humans" },
        { label: "B", value: "Fuzzers explore millions of unexpected input combinations at machine speed, triggering edge cases humans would never think to test" },
        { label: "C", value: "Fuzzers use AI to understand program logic" },
        { label: "D", value: "Fuzzers only work on programs with known vulnerabilities" },
      ],
      correct: "B",
      explanation: "Human reviewers and static analyzers follow expected patterns. Fuzzers explore the space of all possible inputs — including malformed, truncated, oversized, and adversarial data — at millions of executions per second. This brute-force exploration of edge cases is why fuzzing discovers bugs that survive decades of manual review, like the ImageMagick vulnerability that hid for 20+ years.",
    },
    output: "Today you learned what fuzzing is, the difference between dumb and coverage-guided fuzzing, and why automated input generation finds bugs that humans consistently miss.",
    homework: [
      {
        title: "Firmware Fuzzing 101",
        url: "https://www.mayhem.security/blog/firmware-fuzzing-101",
        description: "Mayhem Security's introduction to fuzzing firmware — covers setup, tooling, and the unique challenges of embedded targets."
      },
      {
        title: "Practical IoT Hacking",
        url: "https://nostarch.com/practical-iot-hacking",
        description: "The definitive hands-on reference for IoT security — includes chapters on fuzzing network services and embedded binaries."
      }
    ],
  },
  {
    day: 30,
    title: "AFL++ — Your First Fuzzer",
    hook: "AFL++ is the most prolific vulnerability-finding tool ever created. Its predecessor AFL, written by Michal Zalewski at Google, has been credited with discovering thousands of CVEs across every category of software: image parsers, audio codecs, compression libraries, PDF readers, font renderers, network protocols, and yes — embedded firmware. AFL++ builds on that legacy with QEMU mode for binary-only fuzzing, custom mutators, and persistent mode that can execute millions of test cases per second. It has been used to win Pwn2Own competitions, secure critical infrastructure, and has been adopted by Google's OSS-Fuzz to continuously test over 1,000 open-source projects. Today you'll set it up and run your first fuzzing campaign.",
    lesson: [
      "AFL++ (American Fuzzy Lop plus plus) is a coverage-guided fuzzer that instruments your target binary to track which code paths each input explores. When you compile a program with afl-cc (AFL's compiler wrapper), it inserts lightweight instrumentation at every branch point. As the fuzzer runs, it monitors which branches are taken, building a coverage map that guides mutation toward unexplored code.",
      "Setting up a fuzzing campaign requires three things: a compiled target binary (instrumented with afl-cc or running in QEMU mode for binary-only targets), an input corpus (a directory of small sample inputs that represent valid data for the target), and an output directory where AFL++ will save crashes, hangs, and interesting inputs. The command looks like: 'afl-fuzz -i input_corpus/ -o output/ -- ./target_binary @@'.",
      "The '@@' placeholder tells AFL++ where to insert the test file path in the command line. For programs that read from stdin instead, you omit it. The input corpus should contain small, diverse examples — for an image parser, include a tiny valid PNG, JPEG, and GIF. AFL++ will mutate these seeds through bit flips, byte insertions, arithmetic operations, and splicing between corpus entries.",
      "While fuzzing runs, AFL++ displays a real-time status screen showing: total executions, execution speed (execs/sec), corpus size, coverage stability, and most importantly — unique crashes found. Each crash is saved to the output/crashes/ directory with the exact input that triggered it. A healthy campaign runs at thousands of executions per second and discovers new coverage steadily over time."
    ],
    exercise: {
      type: "terminal",
      prompt: "Today you'll set up and run AFL++ against a simple parser binary. Walk through the full workflow:\n• afl-cc -o target_parser target_parser.c\n• mkdir -p corpus && echo 'seed' > corpus/seed.txt\n• afl-fuzz -i corpus -o output -- ./target_parser @@\n• ls output/crashes/\n• cat output/fuzzer_stats\n• afl-whatsup output/",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        "afl-cc": (args: string) => {
          if (args.includes("target_parser")) return "afl-cc++4.09a by Michal Zalewski, Andrea Fioraldi, Dominik Maier\n[+] Instrumented 847 locations (64-bit, non-hardened mode, ratio 100%).\n[+] Compiling target_parser.c -> target_parser\n[+] Done. Binary ready for fuzzing.";
          return "afl-cc: usage: afl-cc -o <output> <source.c>";
        },
        mkdir: () => "",
        echo: () => "",
        "afl-fuzz": (args: string) => {
          if (args.includes("-i") && args.includes("-o")) return "afl-fuzz++4.09a based on afl by Michal Zalewski and target_parser\n[+] Loaded 1 seed from corpus/\n[+] No auto-generated dictionary tokens.\n[+] Starting fuzzing (Ctrl-C to stop)...\n\n┌─ process timing ─────────────────────────────────────────┐\n│        run time : 0 days, 0 hrs, 12 min, 34 sec          │\n│   last new find : 0 days, 0 hrs, 0 min, 3 sec            │\n│ last uniq crash : 0 days, 0 hrs, 2 min, 15 sec           │\n│  last uniq hang : none yet                                │\n├─ overall results ────────────────────────────────────────┤\n│  cycles done : 42                                         │\n│ corpus count : 237                                        │\n│   saved crashes : 5   (5 unique)                          │\n│    saved hangs : 0                                        │\n├─ cycle progress ─────────────────────────────────────────┤\n│  now processing : 118.7 (49.8%)                           │\n│  paths timed out : 0 (0.00%)                              │\n├─ stage progress ─────────────────────────────────────────┤\n│  now trying : havoc                                       │\n│ stage execs : 3127/4096 (76.3%)                           │\n│ total execs : 1.24M                                       │\n│  exec speed : 1,643/sec                                   │\n├─ path geometry ──────────────────────────────────────────┤\n│    levels : 8                                             │\n│   pending : 34                                            │\n│  pend fav : 12                                            │\n│ own finds : 236                                           │\n│  imported : 0                                             │\n│ stability : 98.73%                                        │\n└──────────────────────────────────────────────────────────┘\n[!] 5 unique crashes found! Check output/crashes/";
          return "afl-fuzz: usage: afl-fuzz -i <input_dir> -o <output_dir> -- <target> [args]";
        },
        ls: (args: string) => {
          if (args.includes("crashes")) return "README.txt\nid:000000,sig:11,src:000023,time:14523,execs:8721,op:havoc,rep:4\nid:000001,sig:11,src:000045,time:28901,execs:17234,op:havoc,rep:2\nid:000002,sig:06,src:000102,time:45678,execs:31205,op:splice,rep:1\nid:000003,sig:11,src:000156,time:89012,execs:52341,op:havoc,rep:8\nid:000004,sig:06,src:000201,time:134567,execs:78902,op:arith,rep:1";
          if (args.includes("output")) return "crashes/  hangs/  queue/  fuzzer_stats  plot_data  fuzz_bitmap  cmdline";
          if (args.includes("corpus")) return "seed.txt";
          return "target_parser  target_parser.c  corpus/  output/";
        },
        cat: (args: string) => {
          if (args.includes("fuzzer_stats")) return "start_time        : 1714500000\nlast_update       : 1714500754\nfuzzer_pid        : 48231\ncycles_done       : 42\ncycles_wo_finds   : 3\nexecs_done        : 1240567\nexecs_per_sec     : 1643.20\ncorpus_count      : 237\ncorpus_found      : 236\ncorpus_imported   : 0\nmax_depth         : 8\ncur_item          : 118\npending_favs      : 12\npending_total     : 34\nstability         : 98.73%\nbitmap_cvg        : 14.23%\nsaved_crashes     : 5\nsaved_hangs       : 0\nlast_find         : 1714500751\nlast_crash        : 1714500619\nexec_timeout      : 1000";
          if (args.includes("id:000000")) return "\x00\x00\xff\xff\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41\x41 [binary crash input]";
          return `cat: ${args}: No such file or directory`;
        },
        "afl-whatsup": (args: string) => {
          if (args.includes("output")) return "status check tool for afl-fuzz by Michal Zalewski\n\nSummary stats\n=============\n\n       Fuzzers alive : 1\n      Total run time : 0 days, 0 hours, 12 min\n         Total execs : 1.24 million\n    Cumulative speed : 1643 execs/sec\n       Total crashes : 5 (5 unique)\n        Total hangs  : 0 (0 unique)\n     Pending paths   : 34\n     Pending favs    : 12\n  Coverage achieved  : 14.23%\n\nAll fuzzers running normally.";
          return "afl-whatsup: usage: afl-whatsup <sync_dir>";
        },
        hexdump: (args: string) => {
          if (args.includes("id:000000")) return "00000000  00 00 ff ff 41 41 41 41  41 41 41 41 41 41 41 41  |....AAAAAAAAAAAA|\n00000010  41 41 41 41 41 41 41 41  41 41 41 41 41 41 41 41  |AAAAAAAAAAAAAAAA|\n00000020  41 41 41 41 41 41 41 41  41 41 41 41 41 41 41 41  |AAAAAAAAAAAAAAAA|\n00000030  41 41 41 41 00 00 00 00                           |AAAA....|";
          return `hexdump: ${args}: No such file or directory`;
        },
        help: () => "Available commands: afl-cc, afl-fuzz, afl-whatsup, mkdir, echo, ls, cat, hexdump, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You start an AFL++ fuzzing campaign and see 'exec speed: 12/sec' on the status screen. This is very slow. What is the most likely cause?",
      options: [
        { label: "A", value: "The target binary is working perfectly — 12/sec is normal" },
        { label: "B", value: "The target is doing heavy I/O, network calls, or the input corpus contains oversized files slowing down each execution" },
        { label: "C", value: "AFL++ needs more RAM to run faster" },
        { label: "D", value: "The instrumentation was applied incorrectly and needs recompilation" },
      ],
      correct: "B",
      explanation: "AFL++ should typically run at hundreds to thousands of executions per second. 12/sec usually means the target is doing slow operations: disk I/O, network connections, sleeping, or processing very large inputs. Fix: minimize the corpus (use afl-cmin), remove network calls if possible, use AFL_NO_FORKSRV for debugging, or switch to persistent mode for speed.",
    },
    output: "Today you learned to set up AFL++ from scratch — compiling an instrumented target, creating a seed corpus, running a fuzzing campaign, and reading the output statistics.",
    homework: [
      {
        title: "AFL++",
        url: "https://github.com/AFLplusplus/AFLplusplus",
        description: "The official AFL++ repository — includes documentation, tutorials, and examples for getting started with coverage-guided fuzzing."
      },
      {
        title: "Fuzzing Embedded Systems Part 1",
        url: "https://blog.sparrrgh.me/fuzzing/embedded/2024/06/05/fuzzing-embedded-systems-1.html",
        description: "Practical guide to fuzzing embedded firmware binaries — covers challenges unique to cross-architecture targets."
      }
    ],
  },
  {
    day: 31,
    title: "Fuzzing with QEMU — Testing Firmware Binaries",
    hook: "You've extracted a MIPS binary from a router's firmware. You don't have the source code. You can't recompile it with AFL's instrumentation. Does that mean you can't fuzz it? Not at all. AFL++ includes QEMU mode — it wraps the target binary in a CPU emulator that provides coverage feedback without any source code or recompilation. This is the technique that makes fuzzing firmware practical: you can take any ARM or MIPS binary ripped from a flash chip and fuzz it on your x86 laptop. Researchers at CENSUS Labs used exactly this approach to discover critical vulnerabilities in Netgear and D-Link router binaries that had never been audited — all without access to a single line of source code.",
    lesson: [
      "AFL++ QEMU mode (-Q flag) uses the QEMU CPU emulator to execute foreign-architecture binaries while collecting coverage information. When you run 'afl-fuzz -Q -i corpus/ -o output/ -- ./mips_binary @@', QEMU translates each MIPS instruction to x86 on the fly, and AFL++ instruments QEMU's translation blocks to track which code paths each input exercises. The result: coverage-guided fuzzing of any architecture QEMU supports — MIPS, ARM, ARM64, PowerPC, and more.",
      "Setting up QEMU mode requires building AFL++ with QEMU support. The build process compiles a patched version of QEMU user-mode that integrates with AFL's feedback mechanism. You also need the target binary's shared libraries — the same ones extracted from the firmware filesystem. Set LD_LIBRARY_PATH or use qemu-mipsel -L <sysroot> to point at the extracted rootfs so the binary finds its dependencies.",
      "Cross-architecture fuzzing has unique challenges. MIPS and ARM binaries may depend on specific kernel interfaces, /proc filesystem entries, or device files that don't exist on your host. Common workarounds: create mock /proc entries, use LD_PRELOAD to intercept problematic syscalls, or patch the binary to remove hardware-dependent initialization. The goal is to isolate the parsing logic you want to fuzz from the rest of the system.",
      "Performance in QEMU mode is typically 5-10x slower than native instrumented fuzzing because every instruction goes through the emulator. To compensate, use persistent mode (QEMU persistent) which keeps the target process alive between test cases, and minimize your corpus with afl-cmin to remove redundant seeds. Even at reduced speed, QEMU mode fuzzing finds real bugs — the Netgear and D-Link vulnerabilities mentioned earlier were all discovered this way."
    ],
    exercise: {
      type: "terminal",
      prompt: "You've extracted a MIPS CGI binary from router firmware. Set up QEMU-mode fuzzing:\n• file cgi_handler\n• qemu-mipsel -L ./squashfs-root ./squashfs-root/usr/bin/cgi_handler\n• mkdir -p corpus && echo 'GET /index.html HTTP/1.1' > corpus/seed.txt\n• afl-fuzz -Q -i corpus -o output -- qemu-mipsel -L ./squashfs-root ./squashfs-root/usr/bin/cgi_handler @@\n• ls output/crashes/\n• afl-cmin -Q -i output/queue -o minimized -- qemu-mipsel -L ./squashfs-root ./squashfs-root/usr/bin/cgi_handler @@",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        file: (args: string) => {
          if (args.includes("cgi_handler")) return "cgi_handler: ELF 32-bit LSB executable, MIPS, MIPS32 rel2 version 1 (SYSV), dynamically linked, interpreter /lib/ld-uClibc.so.0, stripped";
          return `${args}: data`;
        },
        "qemu-mipsel": (args: string) => {
          if (args.includes("cgi_handler")) return "Content-Type: text/html\n\n<html><head><title>Router Config</title></head>\n<body><h1>404 Not Found</h1></body></html>\n\n[Process exited with code 0]";
          return "qemu-mipsel: usage: qemu-mipsel [-L <sysroot>] <binary> [args]";
        },
        mkdir: () => "",
        echo: () => "",
        "afl-fuzz": (args: string) => {
          if (args.includes("-Q")) return "afl-fuzz++4.09a — QEMU mode enabled\n[+] QEMU binary: qemu-mipsel (MIPS little-endian)\n[+] Sysroot: ./squashfs-root\n[+] Loaded 1 seed from corpus/\n[+] QEMU persistent mode: disabled (use AFL_QEMU_PERSISTENT_ADDR for speed)\n[+] Starting fuzzing in QEMU mode...\n\n┌─ process timing ─────────────────────────────────────────┐\n│        run time : 0 days, 1 hrs, 23 min, 45 sec          │\n│   last new find : 0 days, 0 hrs, 0 min, 12 sec           │\n│ last uniq crash : 0 days, 0 hrs, 15 min, 33 sec          │\n├─ overall results ────────────────────────────────────────┤\n│  cycles done : 7                                          │\n│ corpus count : 189                                        │\n│   saved crashes : 3   (3 unique)                          │\n│    saved hangs : 1                                        │\n├─ stage progress ─────────────────────────────────────────┤\n│  now trying : splice                                      │\n│ total execs : 412,305                                     │\n│  exec speed : 82/sec (QEMU overhead)                      │\n├─ path geometry ──────────────────────────────────────────┤\n│    levels : 6                                             │\n│   pending : 22                                            │\n│ own finds : 188                                           │\n│ stability : 96.41%                                        │\n└──────────────────────────────────────────────────────────┘\n[!] 3 unique crashes found! Saved to output/crashes/";
          return "afl-fuzz: usage: afl-fuzz -Q -i <input> -o <output> -- <command>";
        },
        ls: (args: string) => {
          if (args.includes("crashes")) return "README.txt\nid:000000,sig:11,src:000034,time:89234,execs:7201,op:havoc,rep:4\nid:000001,sig:11,src:000089,time:234567,execs:19234,op:splice,rep:2\nid:000002,sig:06,src:000134,time:456789,execs:37892,op:havoc,rep:1";
          if (args.includes("output")) return "crashes/  hangs/  queue/  fuzzer_stats  plot_data  cmdline";
          if (args.includes("squashfs-root")) return "bin  dev  etc  lib  usr  var  www";
          return "cgi_handler  squashfs-root/  corpus/  output/";
        },
        "afl-cmin": (args: string) => {
          if (args.includes("-Q")) return "corpus minimization tool for afl-fuzz by Michal Zalewski\n\n[*] Testing the target binary...\n[+] Target binary OK (QEMU mode).\n[*] Obtaining traces for 189 input files in 'output/queue/'...\n[*] Processing traces for input files...\n[+] Found 8247 unique tuples across 189 files.\n[*] Narrowing down to unique tuples...\n[+] Narrowed down to 43 files (77% reduction).\n[*] Writing minimized corpus to 'minimized/'...\n[+] Done! 43 seeds written (was 189, reduced by 77.2%).";
          return "afl-cmin: usage: afl-cmin -Q -i <input_dir> -o <output_dir> -- <command>";
        },
        help: () => "Available commands: file, qemu-mipsel, afl-fuzz, afl-cmin, mkdir, echo, ls, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You're fuzzing a MIPS binary with AFL++ QEMU mode and getting 82 execs/sec. How can you significantly improve performance?",
      options: [
        { label: "A", value: "Switch to dumb fuzzing mode — it's faster without coverage tracking" },
        { label: "B", value: "Enable QEMU persistent mode with AFL_QEMU_PERSISTENT_ADDR to reuse the process across test cases" },
        { label: "C", value: "Use a larger input corpus — more seeds means faster fuzzing" },
        { label: "D", value: "Compile the binary with debug symbols — it makes QEMU run faster" },
      ],
      correct: "B",
      explanation: "QEMU persistent mode avoids the overhead of forking a new process and re-initializing QEMU for every test case. By setting AFL_QEMU_PERSISTENT_ADDR to a function entry point, the fuzzer loops back to that address after each execution instead of restarting. This can improve throughput 5-20x, turning 82 execs/sec into 400-1,600 execs/sec.",
    },
    output: "Today you learned to use AFL++ QEMU mode to fuzz cross-architecture firmware binaries without source code — the key technique for testing real-world embedded targets.",
    homework: [
      {
        title: "Fuzzing Embedded Systems Part 2: Writing a Fuzzer with LibAFL",
        url: "https://blog.sparrrgh.me/fuzzing/embedded/2025/01/26/fuzzing-embedded-systems-2.html",
        description: "Extends the embedded fuzzing series with LibAFL — a Rust-based fuzzing framework for building custom fuzzers tailored to firmware targets."
      },
      {
        title: "Evaluating IoT Firmware Through Emulation and Fuzzing",
        url: "https://web.archive.org/web/2024/https://www.jtsec.es/blog-entry/113/evaluating-iot-firmware-through-emulation-and-fuzzing",
        description: "jtsec's end-to-end walkthrough of emulating and fuzzing IoT firmware — covers QEMU setup, library dependencies, and crash analysis."
      }
    ],
  },
  {
    day: 32,
    title: "afl-unicorn — Fuzzing Without Full Emulation",
    hook: "Full-system emulation with QEMU is powerful, but sometimes it's overkill. What if you only want to fuzz one function — a packet parser buried inside a 5MB binary that depends on hardware peripherals, kernel modules, and a custom init system? Setting all of that up in QEMU could take weeks. Enter Unicorn Engine: a lightweight CPU emulator that lets you load a function into memory, set up its registers and stack, and execute just that function — nothing else. Combined with AFL, this becomes afl-unicorn: you can fuzz a single function ripped from a firmware binary, in complete isolation, at speeds approaching native execution. Researchers at Battelle National Laboratory built afl-unicorn specifically for this use case, and it has since been used to find vulnerabilities in industrial control systems, automotive ECUs, and military-grade radio firmware.",
    lesson: [
      "Unicorn Engine is a CPU emulator based on QEMU's core, but stripped down to run individual functions rather than entire operating systems. You give it a block of machine code, set up registers (stack pointer, program counter, arguments), map memory regions, and hit 'run'. It executes the code in isolation with no OS, no filesystem, no syscalls — just pure computation. This makes it perfect for testing parsing functions that don't need the rest of the system.",
      "A Unicorn harness is a Python or C script that sets up the emulation environment for your target function. The typical workflow: (1) load the target binary into memory at its expected base address, (2) allocate and initialize a stack, (3) set up function arguments in the correct registers (following the target's calling convention — MIPS uses $a0-$a3, ARM uses r0-r3), (4) map any data regions the function reads from, and (5) hook any external function calls the target makes (like printf or malloc).",
      "afl-unicorn connects AFL's mutation engine to a Unicorn harness. AFL generates mutated inputs, the harness loads each input into the emulated memory as the function's argument, Unicorn executes the function, and coverage feedback is reported back to AFL. Because there's no OS boot, no process initialization, and no fork overhead, this runs significantly faster than full QEMU emulation.",
      "The tradeoff is setup complexity: you need to understand the target function's calling convention, memory layout, and dependencies. But for deeply embedded functions — think a CAN bus message parser in an automotive ECU, or a proprietary protocol handler in an industrial PLC — this targeted approach is often the only way to fuzz effectively. It also lets you test functions that never receive external input directly, but process data passed internally from other components."
    ],
    exercise: {
      type: "terminal",
      prompt: "Set up afl-unicorn to fuzz a packet parsing function extracted from firmware:\n• python3 unicorn_harness.py --info parse_packet\n• python3 unicorn_harness.py --test corpus/valid_packet.bin\n• mkdir -p corpus output\n• afl-fuzz -U -i corpus -o output -- python3 unicorn_harness.py @@\n• ls output/crashes/\n• python3 unicorn_harness.py --debug output/crashes/id:000000*",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        python3: (args: string) => {
          if (args.includes("--info")) return "afl-unicorn Harness Info\n========================\nTarget binary: firmware_httpd (MIPS32 little-endian)\nTarget function: parse_packet @ 0x00403C20\nFunction size: 892 bytes\nCalling convention: MIPS o32 (args in $a0-$a3)\n  $a0 = pointer to input buffer\n  $a1 = input length\nStack allocated: 0x7fff0000 - 0x80000000 (64KB)\nHooked functions:\n  malloc  @ 0x004012A0 -> emulated\n  free    @ 0x004012E0 -> emulated\n  printf  @ 0x00401180 -> no-op\n  strlen  @ 0x00401200 -> emulated\nMemory regions:\n  .text   0x00400000 - 0x00420000 (RX)\n  .data   0x00430000 - 0x00440000 (RW)\n  .bss    0x00440000 - 0x00450000 (RW)\n  input   0x00500000 - 0x00510000 (RW)";
          if (args.includes("--test")) return "afl-unicorn Harness Test\n========================\n[+] Loading binary into Unicorn...\n[+] Mapping memory regions... done\n[+] Setting up stack at 0x7fff0000... done\n[+] Loading input from corpus/valid_packet.bin (48 bytes)\n[+] Setting $a0 = 0x00500000 (input buffer)\n[+] Setting $a1 = 48 (input length)\n[+] Starting emulation at 0x00403C20...\n[+] Emulation finished at 0x00403FA8 (return)\n[+] Return value ($v0): 0 (SUCCESS)\n[+] No crashes detected. Harness is working correctly.\n[+] Execution time: 0.003s";
          if (args.includes("--debug")) return "afl-unicorn Crash Analysis\n==========================\n[+] Loading crash input: id:000000,sig:11 (127 bytes)\n[+] Starting emulation with debug hooks...\n[*] 0x00403C20: parse_packet entry\n[*] 0x00403C38: length check: input_len=127, max=64\n[*] 0x00403C4C: WARNING — no bounds check on memcpy!\n[*] 0x00403C58: memcpy(dst=0x7ffff000, src=0x00500000, len=127)\n[!] CRASH at 0x00403C58: stack buffer overflow!\n    Wrote 127 bytes into 64-byte stack buffer\n    Stack canary overwritten at 0x7ffff040\n    Return address overwritten: 0x41414141\n[+] Root cause: missing bounds check before memcpy in parse_packet\n[+] Vulnerability type: Stack-based buffer overflow";
          return "python3: can't open file '" + args + "'";
        },
        mkdir: () => "",
        "afl-fuzz": (args: string) => {
          if (args.includes("-U")) return "afl-fuzz++4.09a — Unicorn mode enabled\n[+] Unicorn harness: unicorn_harness.py\n[+] Target function: parse_packet @ 0x00403C20\n[+] Loaded 1 seed from corpus/\n[+] Starting fuzzing in Unicorn mode...\n\n┌─ process timing ─────────────────────────────────────────┐\n│        run time : 0 days, 0 hrs, 8 min, 12 sec           │\n│   last new find : 0 days, 0 hrs, 0 min, 1 sec            │\n│ last uniq crash : 0 days, 0 hrs, 1 min, 45 sec           │\n├─ overall results ────────────────────────────────────────┤\n│  cycles done : 156                                        │\n│ corpus count : 94                                         │\n│   saved crashes : 2   (2 unique)                          │\n│    saved hangs : 0                                        │\n├─ stage progress ─────────────────────────────────────────┤\n│  now trying : havoc                                       │\n│ total execs : 3.8M                                        │\n│  exec speed : 7,723/sec (Unicorn — fast!)                 │\n├─ path geometry ──────────────────────────────────────────┤\n│    levels : 5                                             │\n│   pending : 8                                             │\n│ stability : 100.00%                                       │\n└──────────────────────────────────────────────────────────┘\n[!] 2 unique crashes found!";
          return "afl-fuzz: usage: afl-fuzz -U -i <input> -o <output> -- <command>";
        },
        ls: (args: string) => {
          if (args.includes("crashes")) return "README.txt\nid:000000,sig:11,src:000012,time:6234,execs:48123,op:havoc,rep:2\nid:000001,sig:06,src:000067,time:45678,execs:352901,op:splice,rep:1";
          if (args.includes("output")) return "crashes/  hangs/  queue/  fuzzer_stats  plot_data";
          return "unicorn_harness.py  firmware_httpd  corpus/  output/";
        },
        help: () => "Available commands: python3, afl-fuzz, mkdir, ls, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "When would you choose afl-unicorn over AFL++ QEMU mode for fuzzing a firmware binary?",
      options: [
        { label: "A", value: "When you want to test the entire firmware as a complete system" },
        { label: "B", value: "When you want to fuzz a specific function in isolation, especially one with complex hardware dependencies" },
        { label: "C", value: "When you have the source code and can recompile with instrumentation" },
        { label: "D", value: "When the binary runs natively on your x86 machine" },
      ],
      correct: "B",
      explanation: "afl-unicorn shines when you need to fuzz a specific function (like a parser or protocol handler) in isolation, without emulating the entire OS, hardware peripherals, or init system. It's faster than full QEMU emulation and avoids the setup complexity of getting an entire firmware to boot. The tradeoff is writing a harness that correctly sets up the function's execution environment.",
    },
    output: "Today you learned to use afl-unicorn for targeted function-level fuzzing — isolating and testing specific firmware functions without full-system emulation.",
    homework: [
      {
        title: "afl-unicorn",
        url: "https://github.com/Battelle/afl-unicorn",
        description: "Battelle's original afl-unicorn project — fuzz arbitrary binary functions with AFL and Unicorn Engine, designed for firmware analysis."
      },
      {
        title: "Unicorn CPU Emulator",
        url: "https://github.com/unicorn-engine/unicorn",
        description: "The Unicorn Engine — lightweight multi-architecture CPU emulator framework used as the foundation for afl-unicorn and many security tools."
      }
    ],
  },
  {
    day: 33,
    title: "Crash Triage — From Crash to CVE",
    hook: "Your fuzzer has been running for 12 hours and found 47 unique crashes. Exciting, right? Maybe — or maybe not. Not every crash is a security vulnerability. Some are null pointer dereferences that cause a clean exit. Some are assertion failures in debug code. Some are the same root-cause bug triggered through different code paths. A seasoned researcher knows that the real work begins after the fuzzer stops. Learning to triage crashes — sorting the exploitable from the benign, deduplicating root causes, and building reproducible proof-of-concept inputs — is what separates someone who runs a fuzzer from someone who finds CVEs. Today you'll learn to think like a vulnerability analyst.",
    lesson: [
      "Crash triage is the process of analyzing fuzzer-generated crashes to determine their root cause, severity, and exploitability. The first step is deduplication: grouping crashes by the crashing instruction address and stack trace. If 30 of your 47 crashes all crash at the same memcpy call with different inputs, that's one bug — not 30. Tools like afl-collect and crashwalk automate this grouping.",
      "Once deduplicated, classify each unique crash by its signal type. SIGSEGV (signal 11) means invalid memory access — this could be a buffer overflow, use-after-free, or null dereference. SIGABRT (signal 6) typically means the program detected its own corruption (via assertions, stack canaries, or heap integrity checks). SIGFPE (signal 8) is a division by zero or integer overflow. SIGSEGV crashes are generally the most interesting for exploitation.",
      "To analyze a crash, reproduce it under a debugger: 'gdb ./target' then 'run < crash_input'. Examine the backtrace with 'bt' to see the call chain leading to the crash. Check register values with 'info registers' — if the program counter (PC/EIP/RIP) contains user-controlled data (like 0x41414141), you likely have a code execution vulnerability. If the crash address is near NULL (0x00000000-0x0000FFFF), it's probably a null dereference — annoying but usually not exploitable.",
      "The severity scale from least to most critical: null dereference (denial of service at best), out-of-bounds read (information leak), stack buffer overflow (likely code execution), heap buffer overflow (code execution with more work), use-after-free (code execution, often bypasses mitigations). For embedded systems without ASLR or stack canaries, even simple stack overflows are often directly exploitable. Document each triaged crash with its root cause, exploitability assessment, and a minimal reproduction case — this is what goes into a CVE submission."
    ],
    exercise: {
      type: "terminal",
      prompt: "You have 47 crash files from a fuzzing campaign. Triage them:\n• ls output/crashes/ | wc -l\n• afl-collect -r output/crashes/ triaged/\n• gdb ./target -ex 'run < triaged/group_001/crash_001' -ex 'bt' -ex 'info registers' -ex 'quit'\n• gdb ./target -ex 'run < triaged/group_002/crash_001' -ex 'bt' -ex 'info registers' -ex 'quit'\n• exploitable triaged/group_001/crash_001\n• exploitable triaged/group_002/crash_001",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        ls: (args: string) => {
          if (args.includes("wc")) return "47";
          if (args.includes("triaged")) return "group_001/  group_002/  group_003/  group_004/  summary.txt";
          if (args.includes("crashes")) return "id:000000,sig:11  id:000001,sig:11  id:000002,sig:06  id:000003,sig:11\nid:000004,sig:11  id:000005,sig:11  id:000006,sig:06  id:000007,sig:11\nid:000008,sig:11  id:000009,sig:11  ... (47 files total)";
          return "output/  triaged/  target";
        },
        wc: () => "47",
        "afl-collect": (args: string) => {
          if (args.includes("triaged")) return "afl-collect v1.2.0\n[+] Processing 47 crash files from output/crashes/\n[+] Deduplicating by crash address and stack trace...\n[+] Results:\n    Group 001: 28 crashes @ 0x00403C58 (memcpy overflow)   → SIGSEGV\n    Group 002:  9 crashes @ 0x00405A12 (use-after-free)    → SIGSEGV\n    Group 003:  7 crashes @ 0x00401B40 (assertion failure)  → SIGABRT\n    Group 004:  3 crashes @ 0x00000000 (null dereference)  → SIGSEGV\n[+] 47 crashes deduplicated to 4 unique root causes.\n[+] Written to triaged/";
          return "afl-collect: usage: afl-collect -r <crash_dir> <output_dir>";
        },
        gdb: (args: string) => {
          if (args.includes("group_001")) return "GNU gdb (GDB) 13.2\nStarting program: ./target\n\nProgram received signal SIGSEGV, Segmentation fault.\n0x00403c58 in parse_packet () at parser.c:142\n142\t    memcpy(local_buf, input, input_len);  // no bounds check!\n\n#0  0x00403c58 in parse_packet (input=0x7fffffffe000, input_len=1024) at parser.c:142\n#1  0x00405210 in handle_request (req=0x7fffffffea00) at server.c:89\n#2  0x00405890 in main (argc=2, argv=0x7fffffffeb48) at main.c:34\n\nRegister dump:\neax            0x41414141  1094795585\nebx            0x0         0\necx            0x400       1024\nedx            0x7fffffffe000  140737488347136\nesp            0x7ffff040  0x7ffff040\nebp            0x41414141  0x41414141  ← overwritten!\neip            0x41414141  0x41414141  ← CONTROLLED!\neflags         0x10202     [ IF RF ]\n\n[!] EIP contains 0x41414141 — user-controlled data in instruction pointer!";
          if (args.includes("group_002")) return "GNU gdb (GDB) 13.2\nStarting program: ./target\n\nProgram received signal SIGSEGV, Segmentation fault.\n0x00405a12 in process_response () at response.c:67\n67\t    resp->callback(resp->data);  // resp was already freed!\n\n#0  0x00405a12 in process_response (resp=0x55555576a2d0) at response.c:67\n#1  0x00405680 in dispatch_event (ev=0x7fffffffe100) at event.c:203\n#2  0x00405890 in main (argc=2, argv=0x7fffffffeb48) at main.c:34\n\nRegister dump:\neax            0x55555576a2d0  93824994378448\nebx            0x0            0\necx            0xdeadbeef      3735928559\nedx            0x0            0\nesp            0x7fffffffdf80  0x7fffffffdf80\nebp            0x7fffffffe0a0  0x7fffffffe0a0\neip            0xdeadbeef      0xdeadbeef  ← freed memory!\neflags         0x10206         [ PF IF RF ]\n\n[!] EIP points to 0xdeadbeef — use-after-free: freed object's callback pointer used as jump target.";
          return "gdb: usage: gdb <binary> -ex 'run < <input>'";
        },
        exploitable: (args: string) => {
          if (args.includes("group_001")) return "GDB 'exploitable' Analysis\n==========================\nCrash file: triaged/group_001/crash_001\nSignal: SIGSEGV (11)\nCrash address: 0x41414141\nCrash type: Stack Buffer Overflow\n\nExploitability: EXPLOITABLE\nReason: The instruction pointer (EIP) is controlled by the attacker.\n         User-supplied data (0x41414141 = 'AAAA') overwrote the\n         saved return address on the stack. Attacker can redirect\n         execution to arbitrary code.\n\nSeverity: CRITICAL\nCWE: CWE-121 (Stack-based Buffer Overflow)\nRecommendation: Report as security vulnerability. Prepare CVE request.";
          if (args.includes("group_002")) return "GDB 'exploitable' Analysis\n==========================\nCrash file: triaged/group_002/crash_001\nSignal: SIGSEGV (11)\nCrash address: 0xdeadbeef\nCrash type: Use-After-Free\n\nExploitability: EXPLOITABLE\nReason: Program dereferences a freed heap object and uses its\n         callback pointer as a jump target. An attacker who controls\n         the heap layout can place a crafted object at the freed\n         address and hijack execution.\n\nSeverity: HIGH\nCWE: CWE-416 (Use After Free)\nRecommendation: Report as security vulnerability. Heap grooming\n                required for reliable exploitation.";
          return `exploitable: can't open '${args}'`;
        },
        cat: (args: string) => {
          if (args.includes("summary")) return "Crash Triage Summary\n====================\nTotal crashes: 47\nUnique root causes: 4\n\nGroup 001 (28 crashes): Stack buffer overflow in parse_packet — EXPLOITABLE\nGroup 002 (9 crashes):  Use-after-free in process_response — EXPLOITABLE\nGroup 003 (7 crashes):  Assertion failure in validate_header — NOT EXPLOITABLE\nGroup 004 (3 crashes):  Null pointer dereference in log_event — NOT EXPLOITABLE\n\nActionable vulnerabilities: 2\nCVE candidates: 2";
          return `cat: ${args}: No such file or directory`;
        },
        help: () => "Available commands: ls, wc, afl-collect, gdb, exploitable, cat, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You analyze a crash and see that EIP/PC contains 0x41414141 (the ASCII representation of 'AAAA'). What does this tell you?",
      options: [
        { label: "A", value: "The program is working correctly — 0x41414141 is a valid code address" },
        { label: "B", value: "A null pointer was dereferenced" },
        { label: "C", value: "User-controlled input has overwritten the return address, giving the attacker control of execution flow" },
        { label: "D", value: "The program ran out of memory" },
      ],
      correct: "C",
      explanation: "0x41414141 is 'AAAA' in ASCII — a classic pattern used in buffer overflow testing. When this value appears in the instruction pointer (EIP/PC), it means the attacker's input has overwritten the saved return address on the stack. The CPU tried to jump to that address when the function returned, causing the crash. This is a textbook exploitable buffer overflow: the attacker controls where execution goes next.",
    },
    output: "Today you learned crash triage — deduplicating fuzzer output, classifying crashes by severity, and using debuggers to determine exploitability.",
    homework: [
      {
        title: "What Is a Good Memory Corruption Vulnerability?",
        url: "https://googleprojectzero.blogspot.com/2015/06/what-is-good-memory-corruption.html",
        description: "Google Project Zero explains what makes a memory corruption bug truly exploitable vs. just a crash — essential reading for understanding vulnerability severity."
      },
      {
        title: "Good Enough Emulation",
        url: "https://web.archive.org/web/2024/https://blog.talosintelligence.com/good-enough-emulation/",
        description: "Cisco Talos on the art of 'good enough' emulation for crash reproduction and triage — practical strategies for analyzing firmware crashes."
      }
    ],
  },
  {
    day: 34,
    title: "Symbolic Execution — Exploring All Paths",
    hook: "Fuzzing is fast but blind — it explores paths through random mutation and hopes to stumble into the right input. What if you could explore every possible path through a program mathematically? Symbolic execution treats program inputs as algebraic variables instead of concrete values. Instead of running the program with input=5, it runs with input=X and tracks what constraints each branch imposes: 'if X > 10' creates two worlds — one where X > 10 and one where X <= 10. A constraint solver (SMT solver) then generates concrete inputs that satisfy each path's constraints. In theory, this explores every reachable path. In practice, path explosion makes it intractable for large programs — but for small, critical functions in firmware, it's devastatingly effective. DARPA's Cyber Grand Challenge in 2016 proved it: autonomous systems using symbolic execution found and patched vulnerabilities in real-time, with zero human intervention.",
    lesson: [
      "Symbolic execution works by replacing concrete inputs with symbolic variables and executing the program abstractly. At each branch condition, the engine forks into two states: one where the condition is true and one where it's false. Each state accumulates path constraints — a set of mathematical equations that describe what the input must look like to reach that point in the code.",
      "When the symbolic executor reaches an interesting state (a crash, an assertion violation, or a target code location), it feeds the accumulated path constraints to an SMT (Satisfiability Modulo Theories) solver like Z3. The solver either produces a concrete input that satisfies all constraints — giving you a test case that reaches that exact program state — or proves that the path is unreachable.",
      "The main limitation is path explosion: every branch doubles the number of states to explore, and loops create potentially infinite paths. A program with 30 sequential if-else statements has over 1 billion possible paths. Practical tools mitigate this with strategies like concolic execution (mixing concrete and symbolic), path merging, and state pruning. For firmware analysis, tools like angr, Triton (TritonDSE), and KLEE are commonly used.",
      "Symbolic execution and fuzzing complement each other perfectly. Fuzzers are fast at exploring shallow code paths and finding easy bugs. Symbolic executors are slow but can solve complex constraints that fuzzers would never stumble into — like finding the exact 16-byte input that passes a CRC check, decrypts correctly, and reaches a vulnerable memcpy. Modern approaches like Driller combine both: fuzz until stuck, use symbolic execution to solve the blocking constraint, feed the solution back to the fuzzer."
    ],
    exercise: {
      type: "choice",
      prompt: "A firmware function checks: if (input[0] == 0xDE && input[1] == 0xAD && input[2] == 0xBE && input[3] == 0xEF). A fuzzer has been running for hours and never passed this check. What technique can solve this instantly?",
      choices: [
        "Running the fuzzer longer — it will eventually find the right bytes",
        "Symbolic execution — it models the constraints algebraically and solves for 0xDEADBEEF directly",
        "Using a larger input corpus with more diverse seeds",
        "Switching to a dumb fuzzer with fully random input generation"
      ],
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "B") {
          return { correct: true, hint: "Correct! Symbolic execution represents each byte as a variable, encounters the comparison constraints, and feeds them to an SMT solver. The solver returns input[0]=0xDE, input[1]=0xAD, input[2]=0xBE, input[3]=0xEF instantly. A fuzzer would need to randomly guess a 1-in-4-billion combination." };
        }
        if (choice === "A") {
          return { correct: false, hint: "The probability of randomly generating exactly 0xDEADBEEF in the first 4 bytes is 1 in 2^32 (over 4 billion). Even at 10,000 execs/sec, it could take days. Symbolic execution solves this constraint in milliseconds." };
        }
        if (choice === "C") {
          return { correct: false, hint: "A larger corpus helps if some seed happens to contain 0xDEADBEEF, but that's unlikely for a magic constant. Symbolic execution doesn't guess — it solves the constraint mathematically." };
        }
        if (choice === "D") {
          return { correct: false, hint: "A dumb fuzzer generates completely random data — it's even less likely to find 0xDEADBEEF than a coverage-guided fuzzer. The right tool here solves the constraint algebraically." };
        }
        return { correct: false, hint: "Choose A, B, C, or D." };
      },
    },
    quiz: {
      question: "What is the fundamental tradeoff between fuzzing and symbolic execution?",
      options: [
        { label: "A", value: "Fuzzing is free but symbolic execution requires a license" },
        { label: "B", value: "Fuzzing is fast with shallow coverage; symbolic execution is slow but can reason about complex constraints and hard-to-reach paths" },
        { label: "C", value: "Symbolic execution always finds more bugs than fuzzing" },
        { label: "D", value: "Fuzzing works only on source code; symbolic execution works only on binaries" },
      ],
      correct: "B",
      explanation: "Fuzzing excels at speed — millions of test cases per second exploring broad, shallow paths. But it struggles with complex multi-byte constraints (like magic numbers or checksums). Symbolic execution can solve these constraints mathematically but suffers from path explosion in large programs. The best approach combines both: fuzz for speed and breadth, use symbolic execution to overcome specific obstacles.",
    },
    output: "Today you learned symbolic execution — how it models programs as constraint systems, when it outperforms fuzzing, and how the two techniques complement each other.",
    homework: [
      {
        title: "TritonDSE Library",
        url: "https://github.com/quarkslab/tritondse",
        description: "Quarkslab's TritonDSE — a dynamic symbolic execution framework for binary analysis, built on top of the Triton library."
      },
      {
        title: "Fuzzing Against the Machine",
        url: "https://web.archive.org/web/2024/https://packtpub.com/product/fuzzing-against-the-machine/9781804614976",
        description: "Comprehensive book covering fuzzing and symbolic execution for embedded systems — from theory to real-world firmware targets."
      }
    ],
  },
  {
    day: 35,
    title: "Week 5 Capstone — Fuzz a Router CGI Binary",
    hook: "It's time to put everything together. Over the past six days you've learned what fuzzing is, how to use AFL++, how to fuzz cross-architecture binaries with QEMU mode, how to target individual functions with Unicorn, how to triage crashes, and when to bring in symbolic execution. Today you'll run the complete pipeline on a real target: a CGI binary extracted from a router's firmware. This is the exact workflow that researchers at Synacktiv, Flashback Team, and DEVCORE use to prepare for Pwn2Own — extract a binary, build a corpus, fuzz it, triage crashes, and turn the best one into a CVE submission. You have all the pieces. Now let's see if you can chain them together.",
    lesson: [
      "The complete fuzzing pipeline for firmware has five stages. Stage 1 — Target Selection: extract the firmware, identify high-value binaries (CGI handlers, protocol parsers, network services), and choose your target based on attack surface analysis. CGI binaries in /www/cgi-bin/ are prime targets because they process user input directly from HTTP requests.",
      "Stage 2 — Corpus Creation: build a set of seed inputs that represent valid data for your target. For a CGI binary, these are HTTP requests (GET and POST with various parameters). Use real traffic captures if available, or craft minimal valid requests by examining the binary's string references. A good corpus has 10-50 small, diverse seeds that exercise different code paths.",
      "Stage 3 — Fuzzing: run AFL++ with QEMU mode against the target binary, using your corpus as seeds. Monitor the campaign: watch execution speed (aim for >100/sec in QEMU mode), corpus growth (steady growth means the fuzzer is finding new paths), and crash count. Let it run for at least several hours. If the fuzzer plateaus with no new coverage, consider adding dictionary tokens (common protocol keywords) or switching to afl-unicorn for deeper function-level fuzzing.",
      "Stage 4 and 5 — Triage and Reporting: collect all crashes, deduplicate them, analyze each unique crash under a debugger to determine root cause and exploitability. Document the exploitable ones with: the vulnerable function, the bug class (overflow, UAF, etc.), a minimal reproduction input, and the potential security impact. This documentation is what becomes a CVE submission or a Pwn2Own exploit."
    ],
    exercise: {
      type: "terminal",
      prompt: "Run the complete fuzzing pipeline on a router's CGI binary:\n• binwalk -e firmware.bin && file squashfs-root/www/cgi-bin/setup.cgi\n• strings squashfs-root/www/cgi-bin/setup.cgi | grep -i 'get\\|post\\|content\\|action'\n• mkdir -p corpus && printf 'action=ping&host=127.0.0.1' > corpus/post_ping.txt\n• afl-fuzz -Q -i corpus -o output -- qemu-mipsel -L ./squashfs-root ./squashfs-root/www/cgi-bin/setup.cgi\n• afl-collect -r output/crashes/ triaged/\n• gdb-multiarch ./squashfs-root/www/cgi-bin/setup.cgi -ex 'target remote :1234' -ex 'run < triaged/group_001/crash_001' -ex 'bt' -ex 'quit'\n• cat triaged/summary.txt",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        binwalk: (args: string) => {
          if (args.includes("-e")) return "DECIMAL       HEXADECIMAL     DESCRIPTION\n-----------------------------------------------------------------------\n0             0x0             uImage header, \"MIPS Linux-2.6.36\"\n64            0x40            LZMA compressed data\n1048576       0x100000        Squashfs filesystem, version 4.0\n\nExtracting to squashfs-root/... done.";
          return "binwalk: usage: binwalk [-e] <file>";
        },
        file: (args: string) => {
          if (args.includes("setup.cgi")) return "squashfs-root/www/cgi-bin/setup.cgi: ELF 32-bit LSB executable, MIPS, MIPS32 rel2 version 1 (SYSV), dynamically linked, interpreter /lib/ld-uClibc.so.0, stripped";
          return `${args}: data`;
        },
        strings: (args: string) => {
          if (args.includes("setup.cgi")) return "GET\nPOST\nContent-Length\nContent-Type\naction\nping\ntraceroute\nreboot\nfirmware_upgrade\npassword_change\nwifi_setup\nsystem(\"/bin/ping -c 4 %s\"\nsystem(\"/usr/sbin/traceroute %s\"\nHTTP_CONTENT_TYPE\nREQUEST_METHOD\nQUERY_STRING";
          return `strings: ${args}: No such file`;
        },
        mkdir: () => "",
        printf: () => "",
        "afl-fuzz": (args: string) => {
          if (args.includes("-Q")) return "afl-fuzz++4.09a — QEMU mode\n[+] Target: setup.cgi (MIPS32 little-endian)\n[+] Sysroot: ./squashfs-root\n[+] Loaded 1 seed from corpus/\n[+] Starting fuzzing...\n\n┌─ process timing ─────────────────────────────────────────┐\n│        run time : 0 days, 3 hrs, 45 min, 12 sec          │\n│   last new find : 0 days, 0 hrs, 0 min, 45 sec           │\n│ last uniq crash : 0 days, 0 hrs, 22 min, 11 sec          │\n├─ overall results ────────────────────────────────────────┤\n│  cycles done : 23                                         │\n│ corpus count : 312                                        │\n│   saved crashes : 8   (8 unique)                          │\n│    saved hangs : 2                                        │\n├─ stage progress ─────────────────────────────────────────┤\n│  now trying : havoc                                       │\n│ total execs : 892,451                                     │\n│  exec speed : 66/sec (QEMU)                               │\n├─ path geometry ──────────────────────────────────────────┤\n│    levels : 9                                             │\n│   pending : 41                                            │\n│ own finds : 311                                           │\n│ stability : 94.52%                                        │\n└──────────────────────────────────────────────────────────┘\n[!] 8 unique crashes found!";
          return "afl-fuzz: usage: afl-fuzz -Q -i <input> -o <output> -- <command>";
        },
        "afl-collect": (args: string) => {
          if (args.includes("triaged")) return "afl-collect v1.2.0\n[+] Processing 8 crash files from output/crashes/\n[+] Deduplicating...\n[+] Results:\n    Group 001: 4 crashes @ 0x00404A20 (stack overflow in ping handler)  → SIGSEGV\n    Group 002: 2 crashes @ 0x00405C38 (command injection via action param) → SIGSEGV\n    Group 003: 2 crashes @ 0x00000000 (null deref in auth check)        → SIGSEGV\n[+] 8 crashes deduplicated to 3 unique root causes.\n[+] Written to triaged/";
          return "afl-collect: usage: afl-collect -r <crash_dir> <output_dir>";
        },
        "gdb-multiarch": (args: string) => {
          if (args.includes("group_001")) return "GNU gdb (GDB) 13.2 — multiarch\nStarting program: setup.cgi\n\nProgram received signal SIGSEGV, Segmentation fault.\n0x00404a20 in handle_ping (host=0x7fff0100) at setup.c:89\n89\t    sprintf(cmd, \"/bin/ping -c 4 %s\", host);  // 512-byte host into 128-byte cmd!\n\n#0  0x00404a20 in handle_ping (host=0x7fff0100) at setup.c:89\n#1  0x41414141 in ?? ()    ← return address overwritten!\n\nRegisters:\n$pc  0x41414141  ← CONTROLLED\n$sp  0x7fff0080\n$ra  0x41414141  ← CONTROLLED\n$a0  0x7fff0100\n\n[!] Stack buffer overflow: 512 bytes into 128-byte buffer\n[!] Return address ($ra) controlled by attacker — EXPLOITABLE";
          return "gdb-multiarch: usage: gdb-multiarch <binary>";
        },
        gdb: (args: string) => {
          if (args.includes("group_001")) return "GNU gdb (GDB) 13.2\n[See gdb-multiarch output for MIPS targets]";
          return "gdb: use gdb-multiarch for cross-architecture debugging";
        },
        cat: (args: string) => {
          if (args.includes("summary")) return "═══════════════════════════════════════════════════════════\n  WEEK 5 CAPSTONE — FUZZING TRIAGE REPORT\n═══════════════════════════════════════════════════════════\n\nTarget: setup.cgi (MIPS32, from router firmware v1.2.3)\nFuzzing time: 3h 45m | Executions: 892,451 | Speed: 66/sec\nTotal crashes: 8 | Unique root causes: 3\n\n──────────────────────────────────────────────────────────\nBUG #1: Stack Buffer Overflow in handle_ping()\n  Location: 0x00404A20 (setup.c:89)\n  Root cause: sprintf(cmd, \"/bin/ping -c 4 %s\", host)\n              512-byte host parameter → 128-byte stack buffer\n  Impact: Return address ($ra) fully controlled\n  Exploitability: CRITICAL — direct code execution\n  CWE: CWE-121 (Stack-based Buffer Overflow)\n  CVE candidate: YES\n\nBUG #2: Command Injection via action parameter\n  Location: 0x00405C38\n  Root cause: system() called with unsanitized input\n  Impact: Arbitrary command execution as root\n  Exploitability: CRITICAL — no memory corruption needed\n  CWE: CWE-78 (OS Command Injection)\n  CVE candidate: YES\n\nBUG #3: Null Pointer Dereference in auth check\n  Location: 0x00000000\n  Root cause: Missing NULL check on session token\n  Impact: Denial of service (crash)\n  Exploitability: LOW — not exploitable for code execution\n  CWE: CWE-476 (NULL Pointer Dereference)\n  CVE candidate: Possible (DoS only)\n\n──────────────────────────────────────────────────────────\nSUMMARY: 2 critical vulnerabilities found.\nRecommendation: Prepare CVE submissions for bugs #1 and #2.\n═══════════════════════════════════════════════════════════";
          return `cat: ${args}: No such file or directory`;
        },
        ls: (args: string) => {
          if (args.includes("triaged")) return "group_001/  group_002/  group_003/  summary.txt";
          if (args.includes("cgi-bin")) return "setup.cgi  login.cgi  status.cgi  firmware.cgi";
          return "firmware.bin  squashfs-root/  corpus/  output/  triaged/";
        },
        help: () => "Available commands: binwalk, file, strings, mkdir, printf, afl-fuzz, afl-collect, gdb-multiarch, gdb, cat, ls, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You completed a full fuzzing pipeline and found 2 critical bugs in a router's CGI binary. What is the correct next step for responsible disclosure?",
      options: [
        { label: "A", value: "Post the exploits publicly on Twitter for maximum visibility" },
        { label: "B", value: "Report the vulnerabilities to the vendor privately, give them 90 days to patch, then disclose" },
        { label: "C", value: "Sell the exploits to the highest bidder on the dark web" },
        { label: "D", value: "Ignore the bugs — someone else will find them eventually" },
      ],
      correct: "B",
      explanation: "Responsible disclosure means reporting vulnerabilities privately to the vendor first (via their security contact or a coordinated disclosure program), giving them a reasonable window (typically 90 days, following Google Project Zero's standard) to develop and release a patch, then publishing your findings. This protects users while giving credit to the researcher. Organizations like MITRE assign CVE IDs, and many vendors offer bug bounties.",
    },
    output: "You completed Week 5! You can now run a complete firmware fuzzing pipeline: target selection, corpus creation, AFL++ with QEMU mode, crash triage, and vulnerability reporting. These are the skills that find real CVEs in real devices.",
    homework: [
      {
        title: "Fuzzing Zephyr with AFL and Renode",
        url: "https://renode.io/news/fuzzing-zephyr-with-afl-renode/",
        description: "Antmicro demonstrates fuzzing Zephyr RTOS firmware using AFL with the Renode emulation framework — a different approach to embedded fuzzing."
      },
      {
        title: "Damn Vulnerable Router Firmware",
        url: "https://github.com/praetorian-inc/DVRF",
        description: "Praetorian's deliberately vulnerable MIPS firmware — practice the complete fuzzing pipeline on a safe target with known bugs."
      },
      {
        title: "HITB Lab: Build a Fuzzer Based on a 1day Bug",
        url: "https://www.youtube.com/watch?v=e3_T3KLh2NU",
        description: "Hands-on HITB conference lab on building targeted fuzzers based on analysis of known vulnerabilities — learn to fuzz strategically."
      }
    ],
  },
];
