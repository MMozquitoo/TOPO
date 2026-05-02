import { DayData } from "@/lib/types";

export const week3: DayData[] = [
  {
    day: 15,
    title: "What Is Firmware Emulation? Running Devices Without Devices",
    hook: "In 2020, a security researcher at Flashback Team wanted to test a suspected command injection vulnerability in a Netgear router's web interface. The problem? He didn't own the router. Buying one would take days, and the firmware update fixing the bug was already rolling out. So he downloaded the firmware from Netgear's support page, extracted the filesystem with binwalk, and booted the entire router operating system inside QEMU on his laptop. Within hours, he had a working exploit — confirmed on real hardware later by a colleague who did own the device. He never touched a physical router. Firmware emulation lets you run embedded device software on your own machine. You can test exploits safely without bricking hardware, analyze firmware from any device without buying it, and spin up dozens of virtual routers in parallel. Today you'll learn why emulation is the single most powerful technique in an IoT researcher's toolkit, and how it transforms the firmware you extracted last week into a living, interactive target.",
    lesson: [
      "Firmware emulation means running embedded device software on a standard computer by simulating the original hardware. Instead of executing code on a MIPS or ARM processor inside a router, you use an emulator like QEMU to translate those instructions into something your x86 laptop understands. The device's software doesn't know the difference — it boots, runs its services, and behaves as if it were running on real hardware.",
      "There are two main modes of emulation. User-mode emulation runs a single binary from the firmware — one executable at a time, translated from MIPS/ARM to your host architecture. System-mode emulation boots an entire operating system: kernel, init scripts, networking, web server, the whole stack. User mode is fast and simple; system mode is more realistic but harder to set up.",
      "Why emulate instead of using real hardware? First, safety: you can crash, corrupt, or exploit the emulated system without risk. Reset takes seconds. Second, scale: you can emulate dozens of different firmware versions simultaneously, comparing behavior across updates. Third, access: you don't need to own every device you want to research. Download the firmware, emulate it, and you have a working target.",
      "The emulation ecosystem has grown significantly. QEMU is the industry standard — it supports MIPS, ARM, PowerPC, and more. Qiling Framework adds high-level scripting on top of emulation. Firmadyne and FirmAE attempt to fully automate the process of booting firmware images. This week, you'll work with all of these tools, starting with the fundamentals and building up to a full emulation pipeline."
    ],
    exercise: {
      type: "choice",
      prompt: "A researcher discovers a potential buffer overflow in a D-Link router's web server binary. She doesn't own the hardware. Why would she choose to emulate the firmware rather than wait for the physical device?",
      choices: [
        "Emulation provides better graphics for the web interface",
        "She can test the exploit safely, needs no hardware, and can scale analysis across multiple firmware versions",
        "Emulation automatically generates exploit code",
        "Physical devices cannot be exploited, only emulated ones can"
      ],
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "B") {
          return { correct: true, hint: "Correct! Emulation provides three key advantages: safety (crash without consequence), independence from hardware (no need to buy the device), and scalability (test multiple firmware versions in parallel). These make it the standard approach for IoT vulnerability research." };
        }
        if (choice === "A") {
          return { correct: false, hint: "Emulation isn't about graphics quality — emulated web interfaces often look identical to the real thing. The real advantages are safety, no hardware requirement, and scalability." };
        }
        if (choice === "C") {
          return { correct: false, hint: "Emulation doesn't generate exploits automatically. It provides a safe environment where researchers can manually develop and test exploits without risking real hardware." };
        }
        if (choice === "D") {
          return { correct: false, hint: "Physical devices can absolutely be exploited — that's the whole point of IoT security research. Emulation is a convenience, not a requirement." };
        }
        return { correct: false, hint: "Choose A, B, C, or D." };
      },
    },
    quiz: {
      question: "What is the fundamental difference between user-mode and system-mode emulation?",
      options: [
        { label: "A", value: "User mode emulates the entire OS with kernel and networking; system mode runs a single binary" },
        { label: "B", value: "User mode runs a single binary translated to the host architecture; system mode boots an entire OS including kernel and services" },
        { label: "C", value: "User mode requires physical hardware; system mode is software-only" },
        { label: "D", value: "There is no practical difference — they produce identical results" },
      ],
      correct: "B",
      explanation: "User-mode emulation translates and runs a single executable binary (e.g., a CGI script from the firmware). System-mode emulation boots a complete operating system — kernel, init, networking, daemons — simulating the entire device. User mode is simpler and faster for analyzing individual binaries; system mode is needed when you want to interact with the device's full service stack.",
    },
    output: "Today you learned what firmware emulation is, the difference between user-mode and system-mode emulation, and why emulation is essential for scalable IoT security research.",
    homework: [
      {
        title: "Emulating IoT Firmware Made Easy",
        url: "https://boschko.ca/qemu-emulating-firmware/",
        description: "A practical guide to setting up QEMU for firmware emulation — covers architecture selection, rootfs mounting, and common pitfalls."
      },
      {
        title: "No Hardware, No Problem: Emulation and Exploitation",
        url: "https://grimmcyber.com/no-hardware-no-problem-emulation-and-exploitation/",
        description: "GRIMM walks through emulating and exploiting a real embedded device without physical hardware access."
      },
      {
        title: "How to Just Emulate It with QEMU",
        url: "https://www.zerodayinitiative.com/blog/2020/5/27/mindshare-how-to-just-emulate-it-with-qemu",
        description: "Zero Day Initiative's guide covering QEMU setup, kernel selection, and debugging tips for firmware researchers."
      }
    ],
  },
  {
    day: 16,
    title: "QEMU User Mode — Running a Single Binary",
    hook: "You've extracted a router's firmware and found a suspicious CGI binary called 'diagnostic.cgi'. You know it's compiled for MIPS, and you suspect it has a command injection vulnerability. But you can't just run it — your laptop speaks x86, not MIPS. Enter QEMU user mode. With one command, you can execute that MIPS binary on your x86 machine as if your laptop were a MIPS processor. No kernel to configure, no network to set up. Just point QEMU at the binary, and it translates every MIPS instruction to x86 in real time. Today you'll learn to identify binary architectures, set up the right QEMU user-mode emulator, and run cross-architecture binaries directly from extracted firmware. This is the fastest way to test individual programs from any embedded device.",
    lesson: [
      "QEMU user mode translates individual Linux binaries from one CPU architecture to another. When you run 'qemu-mips ./httpd', QEMU intercepts every MIPS instruction, translates it to equivalent x86 instructions, and executes it on your host CPU. System calls are forwarded to your host kernel. The binary thinks it's running on a MIPS system, but it's actually using your laptop's Linux kernel.",
      "Before you can emulate a binary, you need to know its architecture. The 'file' command is your first tool: 'file ./httpd' might output 'ELF 32-bit MSB executable, MIPS, MIPS-I version 1 (SYSV), dynamically linked'. This tells you it's MIPS, 32-bit, big-endian (MSB), and dynamically linked. For big-endian MIPS, use 'qemu-mips'; for little-endian, use 'qemu-mipsel'. 'readelf -h' gives even more detail: entry point address, ELF type, and exact architecture flags.",
      "Dynamically linked binaries need their libraries. When you run a MIPS binary with QEMU user mode, it looks for MIPS libraries in the default paths — but your system has x86 libraries. The fix: point QEMU to the extracted firmware's root filesystem. Use the '-L' flag: 'qemu-mips -L ./squashfs-root ./squashfs-root/usr/bin/httpd'. This tells QEMU to use the firmware's /lib and /usr/lib for shared libraries.",
      "QEMU user mode is perfect for quick analysis: run 'strings' on the output, check command-line arguments, test input handling, and even attach GDB for debugging. The limitation is that it can't emulate hardware peripherals or kernel-level behavior — for that, you need system mode. But for testing individual binaries, user mode is fast, simple, and incredibly effective."
    ],
    exercise: {
      type: "terminal",
      prompt: "You've extracted a router firmware and want to run its binaries. Identify architectures and run them with QEMU user mode:\n• file squashfs-root/usr/bin/httpd\n• readelf -h squashfs-root/usr/bin/httpd\n• file squashfs-root/usr/bin/cli\n• qemu-mips -L ./squashfs-root ./squashfs-root/usr/bin/httpd --help\n• qemu-arm -L ./squashfs-root ./squashfs-root/usr/bin/cli --version",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        file: (args: string) => {
          if (args.includes("httpd")) return "squashfs-root/usr/bin/httpd: ELF 32-bit MSB executable, MIPS, MIPS-I version 1 (SYSV), dynamically linked, interpreter /lib/ld-uClibc.so.0, stripped";
          if (args.includes("cli")) return "squashfs-root/usr/bin/cli: ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.3, stripped";
          if (args.includes("busybox")) return "squashfs-root/bin/busybox: ELF 32-bit MSB executable, MIPS, MIPS-I version 1 (SYSV), statically linked, stripped";
          if (args.includes("diagnostic")) return "squashfs-root/www/cgi-bin/diagnostic.cgi: ELF 32-bit MSB executable, MIPS, MIPS-I version 1 (SYSV), dynamically linked, stripped";
          return `${args}: No such file or directory`;
        },
        readelf: (args: string) => {
          if (args.includes("httpd")) return "ELF Header:\n  Magic:   7f 45 4c 46 01 02 01 00 00 00 00 00 00 00 00 00\n  Class:                             ELF32\n  Data:                              2's complement, big endian\n  Version:                           1 (current)\n  OS/ABI:                            UNIX - System V\n  Type:                              EXEC (Executable file)\n  Machine:                           MIPS R3000\n  Version:                           0x1\n  Entry point address:               0x00404890\n  Start of program headers:          52 (bytes into file)\n  Start of section headers:          0 (bytes into file)\n  Flags:                             0x50001007, noreorder, pic, cpic, o32, mips32\n  Size of this header:               52 (bytes)\n  Number of program headers:         8";
          if (args.includes("cli")) return "ELF Header:\n  Magic:   7f 45 4c 46 01 01 01 00 00 00 00 00 00 00 00 00\n  Class:                             ELF32\n  Data:                              2's complement, little endian\n  Version:                           1 (current)\n  OS/ABI:                            UNIX - System V\n  Type:                              EXEC (Executable file)\n  Machine:                           ARM\n  Version:                           0x1\n  Entry point address:               0x00010A60\n  Flags:                             0x5000400, Version5 EABI, hard-float ABI";
          return `readelf: Error: '${args}': No such file`;
        },
        "qemu-mips": (args: string) => {
          if (args.includes("httpd") && args.includes("--help")) return "Usage: httpd [OPTIONS]\n  -p PORT    Listen on PORT (default: 80)\n  -h DIR     Document root directory\n  -c FILE    Configuration file\n  -d         Debug mode (foreground)\n  -v         Show version\n\nTP-Link HTTP Server v1.0.3\nBuilt with uClibc 0.9.33.2";
          if (args.includes("httpd")) return "httpd: starting server on port 80\nhttpd: document root: /www\nhttpd: waiting for connections...";
          if (args.includes("diagnostic")) return "diagnostic.cgi: must be called via HTTP\nContent-Type: text/html\n\nError: QUERY_STRING not set";
          return "qemu-mips: usage: qemu-mips [-L path] program [arguments]";
        },
        "qemu-mipsel": (args: string) => {
          if (args.includes("httpd")) return "qemu-mipsel: squashfs-root/usr/bin/httpd: wrong endianness\nTry qemu-mips for big-endian MIPS binaries.";
          return "qemu-mipsel: usage: qemu-mipsel [-L path] program [arguments]";
        },
        "qemu-arm": (args: string) => {
          if (args.includes("cli") && args.includes("--version")) return "RouterCLI v2.4.1\nCopyright (c) 2023 DeviceCorp\nArch: ARMv7-A (Cortex-A9)\nBuild: 2023-08-15\nLinked against: uClibc 1.0.31";
          if (args.includes("cli")) return "RouterCLI> type 'help' for available commands";
          return "qemu-arm: usage: qemu-arm [-L path] program [arguments]";
        },
        ls: (args: string) => {
          if (args.includes("usr/bin")) return "httpd  cli  busybox  nvram  diagnostic  iwconfig  brctl";
          if (args.includes("lib")) return "ld-uClibc.so.0  libc.so.0  libgcc_s.so.1  libpthread.so.0  libcrypt.so.0  libnvram.so";
          if (args.includes("squashfs")) return "bin  dev  etc  lib  mnt  proc  sbin  sys  tmp  usr  var  www";
          return "squashfs-root/";
        },
        help: () => "Available commands: file, readelf, qemu-mips, qemu-mipsel, qemu-arm, ls, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You run 'file httpd' and get 'ELF 32-bit MSB executable, MIPS'. What QEMU user-mode command should you use?",
      options: [
        { label: "A", value: "qemu-mipsel — because MIPS always uses little-endian" },
        { label: "B", value: "qemu-mips — because MSB means big-endian, and qemu-mips handles big-endian MIPS" },
        { label: "C", value: "qemu-arm — because all embedded binaries use ARM" },
        { label: "D", value: "qemu-system-mips — because user-mode can't run ELF files" },
      ],
      correct: "B",
      explanation: "MSB means Most Significant Byte first — that's big-endian. The QEMU user-mode emulators are named by architecture and endianness: 'qemu-mips' for big-endian MIPS, 'qemu-mipsel' for little-endian MIPS. Similarly, 'qemu-arm' is little-endian ARM and 'qemu-armeb' is big-endian ARM. Always match the endianness from the 'file' output.",
    },
    output: "Today you learned to identify binary architectures with file and readelf, and run cross-architecture binaries using QEMU user mode with proper library paths.",
    homework: [
      {
        title: "Evaluating IoT Firmware Through Emulation and Fuzzing",
        url: "https://web.archive.org/web/2024/https://www.jtsec.es/blog-entry/113/evaluating-iot-firmware-through-emulation-and-fuzzing",
        description: "jtsec demonstrates the full pipeline from firmware extraction through QEMU emulation to fuzzing individual binaries for vulnerabilities."
      },
      {
        title: "Intro to Firmware Analysis with QEMU and Ghidra",
        url: "https://youtu.be/50lFwNvHbDs?si=0sbcvcf5My3p4MqP",
        description: "Video walkthrough covering QEMU user-mode emulation paired with Ghidra reverse engineering for firmware analysis."
      }
    ],
  },
  {
    day: 17,
    title: "QEMU System Mode — Booting a Full Firmware",
    hook: "User mode lets you run one binary at a time, but what if you need the full picture? A router's web interface doesn't work in isolation — it depends on the kernel, the network stack, NVRAM services, and half a dozen daemons that start at boot. In 2022, a team at Greynoise emulated a complete D-Link router firmware to study its network behavior. They booted the entire OS in QEMU system mode, configured a virtual network interface, and within minutes the emulated router was serving its admin panel on their local network — responding to HTTP requests, running its CGI scripts, and behaving exactly like the physical device. They found an authentication bypass without ever plugging in a cable. Today you'll learn to do the same: boot a complete firmware image, set up networking, and interact with the emulated device as if it were sitting on your desk.",
    lesson: [
      "QEMU system mode emulates a complete computer — CPU, memory, storage, network interfaces, and peripherals. Instead of running a single binary, you boot an entire operating system. For firmware research, this means running the device's Linux kernel with its root filesystem, launching all its services, and interacting with the full software stack just like a real device.",
      "The basic command looks like: 'qemu-system-mips -M malta -kernel vmlinux -hda rootfs.ext2 -append \"root=/dev/sda\" -nographic -net nic -net user,hostfwd=tcp::8080-:80'. Breaking this down: '-M malta' selects a MIPS machine type, '-kernel' points to the Linux kernel, '-hda' provides the root filesystem image, '-append' passes kernel boot arguments, '-nographic' uses the terminal instead of a GUI, and '-net' configures networking with port forwarding.",
      "Network configuration is where system-mode emulation becomes powerful. The '-net user,hostfwd=tcp::8080-:80' flag forwards your host's port 8080 to the emulated device's port 80. After boot, open http://localhost:8080 in your browser and you'll see the router's admin panel. You can also forward SSH (port 22), telnet (port 23), or any other service the firmware runs.",
      "The hardest part of system-mode emulation is getting the right kernel. The firmware's original kernel is often tightly coupled to specific hardware. Researchers use pre-built kernels from projects like Firmadyne or compile custom ones matching the firmware's kernel version and architecture. Once you have a compatible kernel and have extracted the root filesystem into a mountable image, most firmware will boot with minor tweaks to init scripts."
    ],
    exercise: {
      type: "terminal",
      prompt: "Boot a full MIPS firmware in QEMU system mode, configure networking, and interact with it:\n• qemu-system-mips -M malta -kernel vmlinux-mips -hda rootfs.ext2 -append \"root=/dev/sda\" -nographic -net nic -net user,hostfwd=tcp::8080-:80\n• curl http://localhost:8080/\n• curl http://localhost:8080/login.html\n• curl -X POST http://localhost:8080/cgi-bin/login.cgi -d \"username=admin&password=admin\"\n• netstat -tlnp\n• ps aux",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        "qemu-system-mips": () => "QEMU 7.2.0 monitor - type 'help' for more information\n\nU-Boot 1.1.3 (Oct 15 2022)\nBoard: MIPS Malta CoreLV\nDRAM: 256 MB\nFlash: 4 MB\n\n## Booting kernel from Legacy Image at 80800000 ...\n   Image Name:   MIPS Linux-4.14.151\n   Image Type:   MIPS Linux Kernel Image\n   Uncompressing Kernel Image ... OK\n\n[    0.000000] Linux version 4.14.151 (firmadyne@builder)\n[    0.500000] Mount-cache hash table entries: 1024\n[    1.200000] NET: Registered protocol family 2\n[    1.800000] TCP: Hash tables configured\n[    2.400000] NET: Registered protocol family 17\n[    3.100000] VFS: Mounted root (ext2 filesystem) on device 8:0.\n[    3.500000] Freeing unused kernel memory: 224K\n\nStarting system initialization...\nConfiguring network: eth0 UP (10.0.2.15)\nStarting httpd on port 80...\nStarting telnetd on port 23...\nStarting dnsmasq...\n\nSystem ready. Web interface available.\n\nRouter login: _",
        curl: (args: string) => {
          if (args.includes("8080/login.html") || args.includes("8080/login")) return "<html>\n<head><title>Router Admin Panel</title></head>\n<body>\n<h1>TP-Link TL-WR841N</h1>\n<form action=\"/cgi-bin/login.cgi\" method=\"POST\">\n  <label>Username:</label>\n  <input type=\"text\" name=\"username\">\n  <label>Password:</label>\n  <input type=\"password\" name=\"password\">\n  <button type=\"submit\">Login</button>\n</form>\n<p>Default credentials: admin/admin</p>\n</body>\n</html>";
          if (args.includes("POST") && args.includes("login.cgi")) return "HTTP/1.1 302 Found\nSet-Cookie: session=a1b2c3d4e5f6; path=/\nLocation: /admin.html\n\n{\"status\": \"success\", \"message\": \"Login successful\", \"user\": \"admin\", \"role\": \"superuser\"}\n\n[!] Notice: Authentication accepted with default credentials.\n[!] No CSRF token validation detected.\n[!] Session cookie set without HttpOnly or Secure flags.";
          if (args.includes("8080/") || args.includes("localhost:8080")) return "<!DOCTYPE html>\n<html>\n<head><title>TP-Link TL-WR841N</title></head>\n<body>\n<h1>Welcome to TP-Link Router</h1>\n<p>Please <a href=\"/login.html\">login</a> to continue.</p>\n<p>Firmware Version: 3.16.9 Build 150310</p>\n<p>Hardware Version: WR841N v11</p>\n</body>\n</html>";
          return "curl: (7) Failed to connect to localhost port 8080: Connection refused";
        },
        netstat: () => "Active Internet connections (only servers)\nProto  Local Address    Foreign Address  State       PID/Program\ntcp    0.0.0.0:80       0.0.0.0:*        LISTEN      102/httpd\ntcp    0.0.0.0:23       0.0.0.0:*        LISTEN      115/telnetd\ntcp    0.0.0.0:53       0.0.0.0:*        LISTEN      128/dnsmasq\ntcp    0.0.0.0:22       0.0.0.0:*        LISTEN      141/dropbear\nudp    0.0.0.0:67       0.0.0.0:*                    155/udhcpd\nudp    0.0.0.0:53       0.0.0.0:*                    128/dnsmasq",
        ps: () => "  PID USER       VSZ STAT COMMAND\n    1 root      1504 S    /sbin/init\n   45 root       856 S    /sbin/syslogd -m 0\n   78 root      1184 S    /usr/sbin/httpd -p 80 -h /www\n  102 root      1508 S    /usr/sbin/telnetd -l /bin/sh\n  115 root      1732 S    /usr/sbin/dnsmasq\n  128 root      1264 S    /usr/sbin/dropbear -p 22\n  141 root       876 S    /usr/sbin/udhcpd /etc/udhcpd.conf\n  155 root      1116 S    /sbin/watchdog -t 5 /dev/watchdog\n  201 root      1060 R    ps aux",
        ifconfig: () => "eth0      Link encap:Ethernet  HWaddr 52:54:00:12:34:56\n          inet addr:10.0.2.15  Bcast:10.0.2.255  Mask:255.255.255.0\n          UP BROADCAST RUNNING MULTICAST  MTU:1500\n          RX packets:156 errors:0 dropped:0\n          TX packets:89 errors:0 dropped:0\n\nlo        Link encap:Local Loopback\n          inet addr:127.0.0.1  Mask:255.0.0.0\n          UP LOOPBACK RUNNING  MTU:65536",
        help: () => "Available commands: qemu-system-mips, curl, netstat, ps, ifconfig, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "In the QEMU command '-net user,hostfwd=tcp::8080-:80', what does the port forwarding accomplish?",
      options: [
        { label: "A", value: "It blocks port 80 on the emulated device for security" },
        { label: "B", value: "It maps your host machine's port 8080 to the emulated device's port 80, so you can access its web server at localhost:8080" },
        { label: "C", value: "It forces the emulated device to listen on port 8080 instead of port 80" },
        { label: "D", value: "It encrypts all traffic between port 8080 and port 80" },
      ],
      correct: "B",
      explanation: "Port forwarding in QEMU's user-mode networking creates a bridge between your host system and the emulated guest. 'hostfwd=tcp::8080-:80' means: any TCP connection to localhost:8080 on your host gets forwarded to port 80 inside the emulated device. The emulated device still listens on port 80 as normal — the forwarding is transparent to it. This lets you interact with the device's services from your browser or curl.",
    },
    output: "Today you learned to boot a full firmware image in QEMU system mode, configure network port forwarding, and interact with an emulated device's web interface.",
    homework: [
      {
        title: "Debugging D-Link: Emulating Firmware and Hacking Hardware",
        url: "https://www.greynoise.io/blog/debugging-d-link-emulating-firmware-and-hacking-hardware",
        description: "Greynoise documents their full process of emulating D-Link firmware, setting up networking, and discovering vulnerabilities in the emulated environment."
      },
      {
        title: "HEXACON 2022: Emulate It Until You Make It",
        url: "https://youtu.be/CD8HfjdDeuM",
        description: "Conference talk demonstrating advanced system-mode emulation techniques for IoT firmware, including handling NVRAM and custom peripherals."
      }
    ],
  },
  {
    day: 18,
    title: "Qiling Framework — Emulation on Steroids",
    hook: "QEMU is powerful, but it's a blunt instrument. You can boot firmware and run binaries, but what if you want to hook a specific function call, trace every system call the binary makes, or replace the return value of a password check at runtime? In 2020, the Qiling team demonstrated something remarkable at Black Hat: they emulated a Windows driver, hooked its IOCTL handler, and fuzzed it — all from a Python script on Linux. No Windows machine, no kernel debugging setup, just a 50-line Python script. Qiling sits on top of QEMU's CPU emulation engine (Unicorn) but adds an operating system layer: it understands Linux syscalls, Windows APIs, filesystem operations, and networking. You write Python scripts that control every aspect of execution. Hook any function, fake any return value, trace any syscall. Today you'll learn to use Qiling to turn firmware analysis from a manual slog into a scriptable, repeatable process.",
    lesson: [
      "Qiling Framework is a binary emulation framework built on top of Unicorn Engine (which itself is based on QEMU's CPU emulation). While QEMU gives you a virtual machine, Qiling gives you a programmable sandbox. You can emulate Linux ELF, Windows PE, macOS Mach-O, and bare-metal firmware — all from Python scripts. For IoT research, this means you can script your entire analysis workflow.",
      "The key advantage over raw QEMU is hooking. With Qiling, you can intercept any function call, system call, or memory access and run your own Python code. Want to know every time the binary calls 'strcmp'? Hook it. Want to bypass a password check? Hook the authentication function and force it to return success. Want to log every file the binary opens? Hook the 'open' syscall. This turns static analysis questions into dynamic answers.",
      "A basic Qiling script looks like: import the framework, point it at a binary and its rootfs, set up any hooks you need, and call ql.run(). For firmware binaries, you provide the extracted squashfs-root as the rootfs, and Qiling handles library loading, syscall translation, and execution. You can also set up custom NVRAM handlers to fake the hardware-specific data that firmware binaries expect.",
      "Practical applications include: tracing all network connections a binary makes (hook socket/connect/send), monitoring file access patterns (hook open/read/write), identifying crypto operations (hook known crypto library functions), and vulnerability confirmation (hook dangerous functions like system/popen and log their arguments). Qiling turns every binary into an observable, controllable experiment."
    ],
    exercise: {
      type: "terminal",
      prompt: "Use Qiling Framework to emulate and analyze firmware binaries:\n• python3 qiling_trace.py --binary squashfs-root/usr/bin/httpd --rootfs squashfs-root\n• python3 qiling_hook.py --binary squashfs-root/usr/bin/httpd --hook strcmp\n• python3 qiling_syscall.py --binary squashfs-root/www/cgi-bin/diagnostic.cgi --rootfs squashfs-root\n• python3 qiling_nvram.py --binary squashfs-root/usr/bin/httpd --rootfs squashfs-root\n• cat qiling_trace.py\n• cat qiling_hook.py",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        python3: (args: string) => {
          if (args.includes("qiling_trace")) return "[QILING] Loading binary: squashfs-root/usr/bin/httpd\n[QILING] Arch: MIPS32, Endian: Big\n[QILING] Rootfs: squashfs-root/\n[QILING] Loading libraries:\n  -> /lib/ld-uClibc.so.0\n  -> /lib/libc.so.0\n  -> /lib/libpthread.so.0\n  -> /lib/libnvram.so\n[QILING] Entry point: 0x00404890\n[TRACE] 0x00404890: lui $gp, 0x0042\n[TRACE] 0x00404894: addiu $gp, $gp, -0x5e50\n[TRACE] 0x00404898: addiu $sp, $sp, -0x28\n[TRACE] 0x0040489c: sw $ra, 0x24($sp)\n...\n[TRACE] Total instructions executed: 148,293\n[TRACE] Unique functions called: 47\n[TRACE] Execution completed in 2.3 seconds";
          if (args.includes("qiling_hook") && args.includes("strcmp")) return "[QILING] Loading binary: squashfs-root/usr/bin/httpd\n[QILING] Hook registered: strcmp @ 0x0041A230\n[QILING] Starting emulation...\n\n[HOOK] strcmp called:\n  arg1: \"admin\"\n  arg2: \"admin\"\n  result: 0 (match)\n\n[HOOK] strcmp called:\n  arg1: \"password\"\n  arg2: \"admin123\"\n  result: 0 (match)\n\n[HOOK] strcmp called:\n  arg1: \"GET\"\n  arg2: \"POST\"\n  result: -1 (no match)\n\n[HOOK] strcmp called:\n  arg1: \"/cgi-bin/login.cgi\"\n  arg2: \"/cgi-bin/login.cgi\"\n  result: 0 (match)\n\n[!] Interesting: hardcoded credential comparison detected\n    \"password\" vs \"admin123\" at 0x00408F1C\n\n[HOOK] Total strcmp calls: 23";
          if (args.includes("qiling_syscall")) return "[QILING] Loading binary: squashfs-root/www/cgi-bin/diagnostic.cgi\n[QILING] Tracing system calls...\n\n[SYSCALL] open(\"/etc/passwd\", O_RDONLY) = 3\n[SYSCALL] read(3, buf, 1024) = 156\n[SYSCALL] close(3)\n[SYSCALL] socket(AF_INET, SOCK_STREAM, 0) = 4\n[SYSCALL] connect(4, {sa_family=AF_INET, sin_port=80, sin_addr=\"127.0.0.1\"}, 16) = 0\n[SYSCALL] write(1, \"Content-Type: text/html\\n\", 24)\n[SYSCALL] execve(\"/bin/sh\", [\"/bin/sh\", \"-c\", \"ping -c 4 $QUERY_STRING\"], envp)\n\n[!] CRITICAL: execve called with user-controlled input ($QUERY_STRING)\n[!] Potential command injection at 0x00400B8C\n\n[SYSCALL] Total system calls: 34";
          if (args.includes("qiling_nvram")) return "[QILING] Loading binary: squashfs-root/usr/bin/httpd\n[QILING] NVRAM emulation enabled\n[NVRAM] GET: lan_ipaddr -> 192.168.0.1\n[NVRAM] GET: http_username -> admin\n[NVRAM] GET: http_passwd -> admin\n[NVRAM] GET: wifi_ssid -> TP-Link_WR841N\n[NVRAM] GET: wifi_key -> HomeWiFi2024\n[NVRAM] GET: wan_proto -> dhcp\n[NVRAM] GET: fw_version -> 3.16.9\n[NVRAM] GET: remote_mgmt -> 1\n\n[!] WARNING: remote_mgmt=1 means web interface is accessible from WAN\n[!] WARNING: Default credentials still set\n\n[NVRAM] Total NVRAM reads: 42";
          return "python3: No such script";
        },
        cat: (args: string) => {
          if (args.includes("qiling_trace")) return "from qiling import Qiling\n\ndef trace_cb(ql, address, size):\n    buf = ql.mem.read(address, size)\n    print(f\"[TRACE] 0x{address:08x}: {buf.hex()}\")\n\nql = Qiling(\n    argv=[\"squashfs-root/usr/bin/httpd\"],\n    rootfs=\"squashfs-root\",\n    ostype=\"linux\",\n    archtype=\"mips\"\n)\n\nql.hook_code(trace_cb)\nql.run()";
          if (args.includes("qiling_hook")) return "from qiling import Qiling\n\ndef strcmp_hook(ql):\n    # Read arguments from MIPS registers\n    arg1_ptr = ql.reg.a0\n    arg2_ptr = ql.reg.a1\n    arg1 = ql.mem.string(arg1_ptr)\n    arg2 = ql.mem.string(arg2_ptr)\n    print(f\"[HOOK] strcmp: \\\"{arg1}\\\" vs \\\"{arg2}\\\"\")\n\nql = Qiling(\n    argv=[\"squashfs-root/usr/bin/httpd\"],\n    rootfs=\"squashfs-root\"\n)\n\n# Hook strcmp function\nql.os.set_api(\"strcmp\", strcmp_hook, \"enter\")\nql.run()";
          if (args.includes("qiling_syscall")) return "from qiling import Qiling\nfrom qiling.const import QL_INTERCEPT\n\ndef syscall_logger(ql, *args):\n    print(f\"[SYSCALL] {ql.os.utils.syscall_name}({args})\")\n\nql = Qiling(\n    argv=[\"squashfs-root/www/cgi-bin/diagnostic.cgi\"],\n    rootfs=\"squashfs-root\"\n)\n\nql.os.set_syscall(\"execve\", syscall_logger, QL_INTERCEPT.ENTER)\nql.run()";
          return `cat: ${args}: No such file or directory`;
        },
        ls: () => "qiling_trace.py  qiling_hook.py  qiling_syscall.py  qiling_nvram.py  squashfs-root/",
        help: () => "Available commands: python3, cat, ls, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "What is the primary advantage of Qiling Framework over raw QEMU for firmware analysis?",
      options: [
        { label: "A", value: "Qiling is faster because it doesn't emulate the CPU" },
        { label: "B", value: "Qiling provides Python-scriptable hooks for functions, syscalls, and memory — making analysis programmable and repeatable" },
        { label: "C", value: "Qiling can only emulate ARM binaries, while QEMU handles all architectures" },
        { label: "D", value: "Qiling replaces the need for firmware extraction — it works directly on .bin files" },
      ],
      correct: "B",
      explanation: "Qiling's core advantage is programmability. While QEMU gives you a virtual machine, Qiling gives you a scriptable sandbox where you can hook any function (like strcmp to see password comparisons), intercept any syscall (like execve to detect command injection), and control execution flow — all from Python. This makes analysis repeatable, automatable, and far more efficient than manual QEMU debugging.",
    },
    output: "Today you learned to use Qiling Framework for scriptable firmware emulation — hooking functions, tracing syscalls, and emulating NVRAM to dynamically analyze embedded binaries.",
    homework: [
      {
        title: "Firmware Emulation with Qiling",
        url: "https://labs.nettitude.com/blog/emulation-with-qiling/",
        description: "Nettitude walks through practical Qiling use cases for IoT firmware, including NVRAM emulation and function hooking."
      },
      {
        title: "Simulating and Hunting Firmware Vulnerabilities with Qiling",
        url: "https://web.archive.org/web/2024/https://blog.vincss.net/2020/12/pt007-simulating-and-hunting-firmware-vulnerabilities-with-Qiling.html",
        description: "VinCSS demonstrates using Qiling to find and confirm vulnerabilities in real firmware binaries through dynamic analysis."
      },
      {
        title: "Qiling Labs",
        url: "https://joansivion.github.io/qilinglabs/",
        description: "Hands-on challenges designed to teach Qiling Framework through progressively difficult exercises."
      }
    ],
  },
  {
    day: 19,
    title: "GDB Remote Debugging — Breakpoints on Embedded Code",
    hook: "You've emulated a router's web server in QEMU and you suspect the 'diagnostic.cgi' binary has a buffer overflow in its ping handler. But you need to see exactly what happens at the CPU level: what values are in the registers when the vulnerable function is called, what's on the stack, where execution jumps after your input is processed. You need a debugger. In embedded security research, GDB with remote debugging is the standard. QEMU has a built-in GDB server — you can pause execution, set breakpoints, inspect memory, and step through code instruction by instruction. This is how Pwn2Own teams develop their exploits: they attach GDB to a QEMU-emulated binary and watch every register change as their payload executes. Today you'll learn to connect gdb-multiarch to QEMU, set breakpoints on interesting functions, and read the state of a running embedded binary.",
    lesson: [
      "GDB (GNU Debugger) is the standard debugger for Linux systems, and gdb-multiarch is the version that understands multiple CPU architectures — MIPS, ARM, PowerPC, and more. When combined with QEMU's built-in GDB server, it gives you full debugging control over emulated binaries: set breakpoints, step through instructions, read/write registers, and examine memory.",
      "To start a debug session, launch QEMU with the '-g' flag: 'qemu-mips -g 1234 -L ./squashfs-root ./squashfs-root/usr/bin/httpd'. This starts the binary but pauses execution immediately, waiting for a GDB connection on port 1234. Then in another terminal: 'gdb-multiarch ./squashfs-root/usr/bin/httpd' followed by 'target remote localhost:1234' to connect.",
      "Essential GDB commands for firmware debugging: 'break *0x00408F1C' sets a breakpoint at a specific address (found through Ghidra or strings analysis). 'continue' resumes execution until the next breakpoint. 'info registers' shows all CPU register values. 'x/s $a0' examines memory at the address in register a0 as a string (useful for seeing function arguments on MIPS). 'backtrace' shows the call stack — how execution arrived at the current point.",
      "The workflow in practice: first, use static analysis (strings, Ghidra) to identify interesting addresses — the strcmp that checks passwords, the system() call that might be injectable, the memcpy that might overflow. Then set breakpoints at those addresses, run the binary, send input (via curl to the web interface), and watch exactly what happens at each checkpoint. This is how you confirm vulnerabilities and develop working exploits."
    ],
    exercise: {
      type: "terminal",
      prompt: "Debug a MIPS binary with GDB remote debugging:\n• qemu-mips -g 1234 -L ./squashfs-root ./squashfs-root/www/cgi-bin/diagnostic.cgi\n• gdb-multiarch squashfs-root/www/cgi-bin/diagnostic.cgi\n• target remote localhost:1234\n• break *0x00400B8C\n• continue\n• info registers\n• x/s $a0\n• backtrace",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        "qemu-mips": (args: string) => {
          if (args.includes("-g")) return "[QEMU] Starting GDB server on port 1234\n[QEMU] Waiting for GDB connection...\n[QEMU] Binary: squashfs-root/www/cgi-bin/diagnostic.cgi\n[QEMU] Arch: MIPS32 Big Endian\n[QEMU] Execution paused at entry point 0x00400490";
          return "qemu-mips: usage: qemu-mips [-g port] [-L rootfs] binary";
        },
        "gdb-multiarch": (args: string) => {
          if (args.includes("diagnostic")) return "GNU gdb (Ubuntu 12.1-0ubuntu1) 12.1\nCopyright (C) 2022 Free Software Foundation, Inc.\n\nReading symbols from squashfs-root/www/cgi-bin/diagnostic.cgi...\n(No debugging symbols found)\n\nSet architecture to mips.\n(gdb) _";
          return "gdb-multiarch: no binary specified";
        },
        target: (args: string) => {
          if (args.includes("remote") && args.includes("1234")) return "Remote debugging using localhost:1234\n0x00400490 in _start ()\n(gdb) Connected to QEMU GDB server.\nProgram stopped at entry point.";
          return "target: unknown command";
        },
        break: (args: string) => {
          if (args.includes("0x00400B8C")) return "Breakpoint 1 at 0x00400B8C\n(gdb) Breakpoint set at system() call site.";
          if (args.includes("0x00408F1C")) return "Breakpoint 2 at 0x00408F1C\n(gdb) Breakpoint set at strcmp() — password check.";
          if (args.includes("main")) return "Breakpoint 1 at 0x004004A0\n(gdb) Breakpoint set at main().";
          return `Breakpoint set at ${args}`;
        },
        continue: () => "Continuing.\n\nBreakpoint 1, 0x00400B8C in handle_diagnostic ()\n(gdb) Hit breakpoint at system() call.\n\nProgram received input: QUERY_STRING=\"8.8.8.8;cat /etc/passwd\"\nAbout to execute: system(\"/bin/ping -c 4 8.8.8.8;cat /etc/passwd\")\n\n[!] Command injection payload detected in argument to system()",
        info: (args: string) => {
          if (args.includes("registers") || args.includes("reg")) return "(gdb) MIPS Register State:\n  zero: 0x00000000    at: 0x00420000    v0: 0x00000001    v1: 0x7fff6b08\n  a0:   0x7fff6b20    a1: 0x00000000    a2: 0x00000000    a3: 0x00000000\n  t0:   0x00000000    t1: 0x00000001    t2: 0x00000003    t3: 0x7fff6c00\n  s0:   0x00410230    s1: 0x7fff6b50    s2: 0x00000000    s3: 0x00000000\n  sp:   0x7fff6af0    fp: 0x7fff6b40    ra: 0x00400A24    pc: 0x00400B8C\n  gp:   0x0041c9b0    hi: 0x00000000    lo: 0x00000004\n\n  a0 -> points to command string: \"/bin/ping -c 4 8.8.8.8;cat /etc/passwd\"";
          if (args.includes("breakpoints")) return "Num  Type           Disp  Enb  Address     What\n1    breakpoint     keep  y    0x00400B8C  handle_diagnostic+0x1c\n2    breakpoint     keep  y    0x00408F1C  check_password+0x38";
          return "info: unknown subcommand";
        },
        "x/s": (args: string) => {
          if (args.includes("$a0") || args.includes("a0")) return "0x7fff6b20: \"/bin/ping -c 4 8.8.8.8;cat /etc/passwd\"\n\n[!] User-controlled input (after semicolon) injected into system() argument";
          if (args.includes("$sp")) return "0x7fff6af0: \"\\x00\\x40\\x0a\\x24\" (return address on stack)";
          return `Cannot access memory at address ${args}`;
        },
        backtrace: () => "(gdb) Call stack:\n#0  0x00400B8C in handle_diagnostic ()\n#1  0x00400A24 in cgi_handler ()\n#2  0x004008F0 in process_request ()\n#3  0x004006BC in main ()\n#4  0x00400490 in _start ()\n\nExecution path: _start -> main -> process_request -> cgi_handler -> handle_diagnostic\n\n[!] The user input flows from process_request through cgi_handler\n    to handle_diagnostic where it reaches system() unsanitized.",
        step: () => "0x00400B90  jalr   $t9       # Calling system()\n(gdb) Stepped one instruction. About to jump to system() libc function.",
        nexti: () => "0x00400B94  nop              # MIPS branch delay slot\n(gdb) Next instruction after system() call.",
        quit: () => "Detaching from program.\n[Inferior 1 (Remote target) detached]",
        help: () => "Available commands: qemu-mips, gdb-multiarch, target, break, continue, info, x/s, backtrace, step, nexti, quit, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You're debugging a MIPS binary and hit a breakpoint at a system() call. Which GDB command shows you the string argument being passed to system()?",
      options: [
        { label: "A", value: "info registers — it shows all register values but not the string content" },
        { label: "B", value: "backtrace — it shows the call stack, not argument values" },
        { label: "C", value: "x/s $a0 — on MIPS, the first function argument is in register a0, and x/s examines memory as a string" },
        { label: "D", value: "continue — it resumes execution past the breakpoint" },
      ],
      correct: "C",
      explanation: "On MIPS, function arguments are passed in registers a0-a3. The first argument to system() (the command string) is in $a0. The GDB command 'x/s $a0' means: examine memory at the address stored in register a0, formatted as a string. This reveals exactly what command is about to be executed — critical for confirming command injection vulnerabilities.",
    },
    output: "Today you learned GDB remote debugging with QEMU — setting breakpoints, inspecting registers and memory, and tracing execution flow through firmware binaries.",
    homework: [
      {
        title: "Modern Vulnerability Research Techniques",
        url: "https://breaking-bits.gitbook.io/breaking-bits/vulnerability-discovery/reverse-engineering/modern-approaches-toward-embedded-research",
        description: "Comprehensive guide covering GDB, QEMU, and modern debugging approaches for embedded vulnerability discovery."
      },
      {
        title: "HITB Lab: ARM IoT Firmware Extraction And Emulation",
        url: "https://youtu.be/Y1bFNZde33Q",
        description: "Hands-on conference lab walking through ARM firmware extraction, QEMU emulation, and GDB debugging techniques."
      }
    ],
  },
  {
    day: 20,
    title: "Network Analysis on Emulated Firmware",
    hook: "In 2021, researchers at Talos Intelligence were analyzing the firmware of a popular IP camera. After booting the firmware in QEMU, they noticed something unexpected: the emulated camera was making outbound DNS requests to a domain registered in China, even though no user had configured any cloud service. They captured the traffic with tcpdump, decoded the packets, and discovered the camera was silently sending device information — MAC address, firmware version, local network configuration — to an unknown server every 15 minutes. The vulnerability was buried in an obfuscated binary that started at boot. Without emulation and network capture, it would never have been found. Today you'll learn to combine emulated firmware with network analysis tools to see everything a device sends and receives — because firmware doesn't just run code, it talks to the network.",
    lesson: [
      "When you boot firmware in QEMU system mode with networking enabled, the emulated device can send and receive network traffic just like a real device. This means you can use standard network analysis tools — tcpdump, Wireshark, curl — to observe and interact with its services. Every HTTP request, DNS lookup, and outbound connection the firmware makes becomes visible.",
      "The basic workflow: start your emulated firmware with port forwarding, then use tcpdump to capture traffic on the QEMU network interface. 'tcpdump -i any -w capture.pcap' saves all packets to a file you can analyze with Wireshark later. For real-time analysis, 'tcpdump -i any -A' shows packet contents in ASCII — great for spotting plaintext credentials, API keys, or suspicious URLs.",
      "Active testing means poking the emulated device's services and observing the responses. Use curl to interact with the web interface: 'curl http://localhost:8080/cgi-bin/diagnostic.cgi?ping_addr=8.8.8.8' tests the diagnostic feature. Watch what the server returns, what headers it sets, and whether it leaks information. Try malformed input, oversized parameters, and shell metacharacters — all safely against the emulated target.",
      "Look for three categories of issues: (1) Insecure communications — plaintext HTTP for admin panels, unencrypted API calls, credentials sent in cleartext. (2) Unwanted outbound traffic — phone-home behavior, telemetry, update checks to suspicious domains. (3) Service vulnerabilities — missing authentication on APIs, directory traversal in the web server, command injection in CGI scripts. The combination of emulation and network analysis lets you catch things that static analysis alone would miss."
    ],
    exercise: {
      type: "terminal",
      prompt: "Analyze network traffic from an emulated router firmware:\n• tcpdump -i any -A -c 20\n• curl http://localhost:8080/\n• curl http://localhost:8080/cgi-bin/diagnostic.cgi?ping_addr=8.8.8.8\n• curl http://localhost:8080/cgi-bin/diagnostic.cgi?ping_addr=8.8.8.8;cat%20/etc/passwd\n• curl -v http://localhost:8080/cgi-bin/login.cgi\n• tcpdump -i any -w capture.pcap -c 50",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        tcpdump: (args: string) => {
          if (args.includes("-w")) return "tcpdump: listening on any, link-type LINUX_SLL2\n50 packets captured\n50 packets received by filter\n0 packets dropped by kernel\n\nCapture saved to capture.pcap (12,847 bytes)\nUse 'wireshark capture.pcap' or 'tshark -r capture.pcap' to analyze.";
          if (args.includes("-A")) return "tcpdump: listening on any, link-type LINUX_SLL2\n\n09:14:22.001 IP 10.0.2.15.80 > 10.0.2.2.45678: HTTP/1.1 200 OK\nContent-Type: text/html\nServer: httpd/2.0\nSet-Cookie: session=UNENCRYPTED; path=/\n\n<html><title>Router Admin</title>...\n\n09:14:22.145 IP 10.0.2.15 > 8.8.8.8: ICMP echo request\n09:14:22.312 IP 8.8.8.8 > 10.0.2.15: ICMP echo reply\n\n09:14:25.001 IP 10.0.2.15.53 > 8.8.8.8.53: DNS A? telemetry.devicecloud.cn\n09:14:25.089 IP 8.8.8.8.53 > 10.0.2.15.53: DNS A telemetry.devicecloud.cn 103.45.67.89\n\n09:14:25.150 IP 10.0.2.15.41234 > 103.45.67.89.80: POST /report HTTP/1.1\nHost: telemetry.devicecloud.cn\nContent-Type: application/json\n{\"mac\":\"52:54:00:12:34:56\",\"fw\":\"3.16.9\",\"lan\":\"192.168.0.0/24\"}\n\n[!] ALERT: Plaintext telemetry data sent to external server\n[!] ALERT: Device MAC, firmware version, and LAN config leaked\n\n09:14:30.200 IP 10.0.2.15.80 > 10.0.2.2.45679: HTTP/1.1 200 OK\nAuthorization: Basic YWRtaW46YWRtaW4=\n\n[!] ALERT: Basic auth credentials in plaintext (admin:admin)\n\n20 packets captured";
          return "tcpdump: usage: tcpdump [-i interface] [-A] [-w file] [-c count]";
        },
        curl: (args: string) => {
          if (args.includes("cat%20/etc/passwd") || args.includes("cat /etc/passwd")) return "HTTP/1.1 200 OK\nContent-Type: text/html\n\nPING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: seq=0 ttl=118 time=11.2 ms\n\nroot:x:0:0:root:/root:/bin/ash\nadmin:x:500:500:admin:/home/admin:/bin/ash\nnobody:x:65534:65534:nobody:/var:/bin/false\n\n[!] COMMAND INJECTION CONFIRMED!\n[!] The semicolon allowed execution of 'cat /etc/passwd'\n[!] The ping_addr parameter is not sanitized before passing to system()";
          if (args.includes("diagnostic") && args.includes("8.8.8.8")) return "HTTP/1.1 200 OK\nContent-Type: text/html\n\n<h2>Diagnostic Results</h2>\n<pre>\nPING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: seq=0 ttl=118 time=11.2 ms\n64 bytes from 8.8.8.8: seq=1 ttl=118 time=10.8 ms\n64 bytes from 8.8.8.8: seq=2 ttl=118 time=11.5 ms\n64 bytes from 8.8.8.8: seq=3 ttl=118 time=10.9 ms\n\n--- 8.8.8.8 ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss\n</pre>";
          if (args.includes("-v") && args.includes("login")) return "*   Trying 127.0.0.1:8080...\n* Connected to localhost (127.0.0.1) port 8080 (#0)\n> GET /cgi-bin/login.cgi HTTP/1.1\n> Host: localhost:8080\n> User-Agent: curl/7.88.1\n> Accept: */*\n>\n< HTTP/1.1 200 OK\n< Content-Type: text/html\n< Server: httpd/2.0\n< X-Powered-By: custom-cgi/1.0\n< Access-Control-Allow-Origin: *\n<\n<html><form action=\"/cgi-bin/login.cgi\" method=\"POST\">\n<input name=\"username\"><input name=\"password\" type=\"password\">\n</form></html>\n\n[!] No HTTPS — credentials will be sent in plaintext\n[!] Access-Control-Allow-Origin: * — vulnerable to CORS attacks\n[!] No CSRF token in the form";
          if (args.includes("8080")) return "<!DOCTYPE html>\n<html>\n<head><title>Router Admin</title></head>\n<body>\n<h1>TP-Link TL-WR841N</h1>\n<p>Firmware Version: 3.16.9</p>\n<a href=\"/login.html\">Login</a>\n</body>\n</html>";
          return "curl: (7) Failed to connect";
        },
        tshark: (args: string) => {
          if (args.includes("capture.pcap")) return "  1   0.000000 10.0.2.2 -> 10.0.2.15  TCP  SYN [8080 -> 80]\n  2   0.000123 10.0.2.15 -> 10.0.2.2  TCP  SYN,ACK\n  3   0.000234 10.0.2.2 -> 10.0.2.15  HTTP GET /\n  4   0.001200 10.0.2.15 -> 10.0.2.2  HTTP 200 OK\n  5   0.500000 10.0.2.15 -> 8.8.8.8   DNS  A? telemetry.devicecloud.cn\n  6   0.589000 8.8.8.8 -> 10.0.2.15   DNS  A 103.45.67.89\n  7   0.600000 10.0.2.15 -> 103.45.67.89 HTTP POST /report";
          return `tshark: No such file: ${args}`;
        },
        help: () => "Available commands: tcpdump, curl, tshark, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You capture traffic from an emulated router and see it making HTTP POST requests to 'telemetry.devicecloud.cn' with the device MAC address and LAN configuration. What type of issue is this?",
      options: [
        { label: "A", value: "A normal firmware update check — all routers do this" },
        { label: "B", value: "An unwanted phone-home behavior leaking device and network information to an external server without user consent" },
        { label: "C", value: "A DNS resolution error causing traffic to be misrouted" },
        { label: "D", value: "An artifact of the emulation — this wouldn't happen on real hardware" },
      ],
      correct: "B",
      explanation: "This is unauthorized telemetry — the device is silently sending identifying information (MAC address, firmware version, local network topology) to an external server. The user never consented to this data collection. On a real network, this could reveal internal network structure to a third party. This type of phone-home behavior has been found in real consumer routers, IP cameras, and smart home devices.",
    },
    output: "Today you learned to capture and analyze network traffic from emulated firmware using tcpdump and curl, identifying plaintext credentials, phone-home behavior, and command injection vulnerabilities.",
    homework: [
      {
        title: "Good Enough Emulation: Fuzzing a Single Thread",
        url: "https://web.archive.org/web/2024/https://blog.talosintelligence.com/good-enough-emulation/",
        description: "Talos Intelligence demonstrates practical network-level analysis on emulated firmware with a focus on fuzzing services."
      },
      {
        title: "Dynamic Analysis of Firmware Components in IoT Devices",
        url: "https://ics-cert.kaspersky.com/publications/reports/2022/07/06/dynamic-analysis-of-firmware-components-in-iot-devices/",
        description: "Kaspersky ICS-CERT covers network analysis methodology for emulated IoT firmware, including traffic capture and protocol analysis."
      }
    ],
  },
  {
    day: 21,
    title: "Week 3 Capstone — Full Emulation Pipeline",
    hook: "It's Friday, and your team lead drops a firmware binary on your desk. 'We think there's something in this IP camera firmware. Customer complaint about weird network traffic. You have until end of day.' No device, no documentation, no prior analysis. Just a raw firmware.bin file and your skills. This is exactly the scenario IoT security consultants face every week. And after this week of training, you have every tool you need. Today you'll run the complete emulation pipeline from start to finish: identify the firmware, extract the filesystem, emulate the whole system, capture network traffic, and find the vulnerability. This is your capstone — everything from Week 3 in a single, end-to-end exercise.",
    lesson: [
      "The emulation pipeline has five stages, and each builds on the last. Stage 1: Identify. Use 'file' and 'binwalk' to determine architecture, endianness, and contents. This tells you which QEMU variant to use and what to expect inside. Stage 2: Extract. Use 'binwalk -e' to unpack the filesystem. Navigate the extracted rootfs to understand the device's services, configs, and attack surface.",
      "Stage 3: Emulate. Start with user mode for quick binary analysis — run individual binaries with 'qemu-mips -L ./squashfs-root'. For full interaction, use system mode with port forwarding to access the web interface. If binaries need NVRAM or custom hardware, consider Qiling for scriptable emulation with fake hardware responses.",
      "Stage 4: Analyze. With the firmware running, use tcpdump to capture all network traffic. Use curl to interact with web services. Use GDB to debug specific binaries. Look for the three categories: insecure communications (plaintext credentials, missing HTTPS), unwanted behavior (phone-home, telemetry), and exploitable vulnerabilities (command injection, buffer overflows, authentication bypasses).",
      "Stage 5: Document. A vulnerability without a report is just a personal discovery. Write up your findings: what you found, how to reproduce it, what the impact is, and how to fix it. Include your methodology so others can verify your work. This is what separates hobbyist tinkering from professional security research. The pipeline is your methodology — follow it systematically, and you'll find bugs that automated scanners miss."
    ],
    exercise: {
      type: "terminal",
      prompt: "Run the full emulation pipeline on an unknown firmware image:\n• file firmware.bin\n• binwalk firmware.bin\n• binwalk -e firmware.bin\n• ls _firmware.bin.extracted/squashfs-root/\n• file _firmware.bin.extracted/squashfs-root/usr/bin/httpd\n• qemu-mips -L ./squashfs-root ./squashfs-root/usr/bin/httpd --help\n• curl http://localhost:8080/cgi-bin/diagnostic.cgi?cmd=8.8.8.8;id\n• grep -r \"system(\" squashfs-root/www/",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        file: (args: string) => {
          if (args.includes("firmware.bin")) return "firmware.bin: u-boot legacy uImage, MIPS Linux-4.14.151, Linux/MIPS, OS Kernel Image (lzma), 7340032 bytes";
          if (args.includes("httpd")) return "_firmware.bin.extracted/squashfs-root/usr/bin/httpd: ELF 32-bit MSB executable, MIPS, MIPS-I version 1 (SYSV), dynamically linked, interpreter /lib/ld-uClibc.so.0, stripped";
          if (args.includes("diagnostic")) return "_firmware.bin.extracted/squashfs-root/www/cgi-bin/diagnostic.cgi: ELF 32-bit MSB executable, MIPS, MIPS-I version 1 (SYSV), dynamically linked, stripped";
          return `${args}: data`;
        },
        binwalk: (args: string) => {
          if (args.includes("-e")) return "DECIMAL       HEXADECIMAL     DESCRIPTION\n-----------------------------------------------------------------------\n0             0x0             uImage header, \"MIPS Linux-4.14.151\"\n64            0x40            LZMA compressed data, properties: 0x5D\n1048576       0x100000        Squashfs filesystem, little endian, version 4.0\n                              compression: xz, size: 5242880 bytes\n6291456       0x600000        JFFS2 filesystem, little endian\n\nExtracting to _firmware.bin.extracted/\nDecompressing LZMA data...\nExtracting SquashFS filesystem...\nExtraction complete.\n\n_firmware.bin.extracted/squashfs-root/ ready for analysis.";
          if (args.includes("firmware")) return "DECIMAL       HEXADECIMAL     DESCRIPTION\n-----------------------------------------------------------------------\n0             0x0             uImage header, header size: 64 bytes\n                              image name: \"MIPS Linux-4.14.151\"\n64            0x40            LZMA compressed data\n1048576       0x100000        Squashfs filesystem, version 4.0\n6291456       0x600000        JFFS2 filesystem, little endian";
          return "binwalk: usage: binwalk [-e] <file>";
        },
        ls: (args: string) => {
          if (args.includes("squashfs-root/www")) return "cgi-bin/  css/  images/  js/  index.html  login.html  admin.html";
          if (args.includes("squashfs-root/etc")) return "passwd  shadow  hosts  config/  init.d/  inittab  fstab";
          if (args.includes("squashfs-root")) return "bin  dev  etc  lib  mnt  proc  sbin  sys  tmp  usr  var  www";
          if (args.includes("extracted")) return "40.7z  squashfs-root/";
          return "firmware.bin  _firmware.bin.extracted/";
        },
        "qemu-mips": (args: string) => {
          if (args.includes("--help")) return "Usage: httpd [OPTIONS]\n  -p PORT    Listen port (default: 80)\n  -h DIR     Document root\n  -c FILE    Config file\n  -d         Debug mode\n\nIPCam HTTP Server v2.1.4\nBuilt: 2023-06-20\nArch: MIPS32 Big Endian";
          return "httpd: starting on port 80...";
        },
        curl: (args: string) => {
          if (args.includes(";id") || args.includes("%3Bid")) return "HTTP/1.1 200 OK\nContent-Type: text/html\n\n<h2>Diagnostic Results</h2>\n<pre>\nPING 8.8.8.8: 56 data bytes\n64 bytes from 8.8.8.8: seq=0 ttl=118 time=11.2ms\n\nuid=0(root) gid=0(root)\n</pre>\n\n[!] COMMAND INJECTION CONFIRMED\n[!] The 'cmd' parameter was passed unsanitized to system()\n[!] Severity: CRITICAL — unauthenticated remote code execution as root\n[!] Impact: Full device compromise, network pivot, botnet recruitment";
          if (args.includes("diagnostic")) return "<h2>Diagnostic Results</h2>\n<pre>\nPING 8.8.8.8: 56 data bytes\n64 bytes from 8.8.8.8: seq=0 ttl=118\n</pre>";
          if (args.includes("8080")) return "<html><title>IPCam Admin</title>\n<p>Firmware: v2.1.4</p>\n<a href='/login.html'>Login</a></html>";
          return "curl: (7) Connection refused";
        },
        grep: (args: string) => {
          if (args.includes("system(") && args.includes("www")) return "squashfs-root/www/cgi-bin/diagnostic.cgi: Binary file matches\n\n[strings output from matching binary:]\n  system(\"/bin/ping -c 4 %s\")\n  -> user input from QUERY_STRING flows directly to system()\n  -> no input validation or sanitization detected";
          if (args.includes("password")) return "squashfs-root/etc/config/httpd.conf:admin_password=admin\nsquashfs-root/www/config.js:DEFAULT_PASS='camera123'";
          return "No matches.";
        },
        strings: (args: string) => {
          if (args.includes("diagnostic")) return "ping_addr\nQUERY_STRING\nsystem\n/bin/ping -c 4 %s\nsprintf\nContent-Type\ntext/html\n/bin/sh";
          return `strings: ${args}: No such file`;
        },
        cat: (args: string) => {
          if (args.includes("passwd")) return "root:x:0:0:root:/root:/bin/ash\nadmin:x:500:500:admin:/home/admin:/bin/ash\ncamera:x:501:501:camera:/tmp:/bin/false";
          return `cat: ${args}: No such file`;
        },
        help: () => "Available commands: file, binwalk, ls, qemu-mips, curl, grep, strings, cat, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You've completed the full emulation pipeline this week. Which ordering represents the correct methodology?",
      options: [
        { label: "A", value: "Extract -> Emulate -> Identify -> Analyze -> Report" },
        { label: "B", value: "Emulate -> Extract -> Report -> Identify -> Analyze" },
        { label: "C", value: "Identify (file/binwalk) -> Extract (binwalk -e) -> Emulate (QEMU/Qiling) -> Analyze (tcpdump/curl/GDB) -> Document" },
        { label: "D", value: "Report -> Identify -> Analyze -> Extract -> Emulate" },
      ],
      correct: "C",
      explanation: "The correct pipeline is: (1) Identify — use file and binwalk to determine architecture and contents. (2) Extract — unpack the filesystem with binwalk -e. (3) Emulate — run binaries in user mode or boot the full system in QEMU/Qiling. (4) Analyze — capture traffic, test services, debug binaries. (5) Document — write up findings with reproduction steps. Each stage builds on the previous one, and skipping a stage leads to errors or missed findings.",
    },
    output: "You completed Week 3! You now command the full emulation pipeline: QEMU user and system mode, Qiling Framework, GDB remote debugging, network capture, and end-to-end firmware analysis.",
    homework: [
      {
        title: "Qiling Framework",
        url: "https://github.com/qilingframework/qiling",
        description: "The open-source binary emulation framework — explore the codebase, examples, and documentation for scriptable firmware analysis."
      },
      {
        title: "QEMU Emulator",
        url: "https://github.com/qemu/qemu",
        description: "The foundational emulation platform supporting MIPS, ARM, PowerPC, and dozens more architectures."
      },
      {
        title: "OWASP IoT Goat",
        url: "https://github.com/OWASP/IoTGoat",
        description: "A deliberately vulnerable IoT firmware image — practice the full emulation pipeline in a safe, legal environment."
      }
    ],
  },
];
