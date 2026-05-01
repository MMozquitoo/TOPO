import { DayData } from "@/lib/types";

export const week2: DayData[] = [
  {
    day: 8,
    title: "What Is an Embedded System? — Anatomy of a Router",
    hook: "In 2023, researchers at Quarkslab discovered a hidden TCP backdoor on port 32764 running in thousands of routers — Linksys, Netgear, Cisco. It had been there for years, hardcoded into the firmware, invisible to every user. No one had opened the device. No one had read the code. The backdoor gave full root access to anyone who knew the magic packet. How did they find it? They took the router apart — physically — and read the firmware chip. This week, you'll learn the same skills. Today we start at the beginning: what's actually inside a router, and why should you care? Important note: everything you learn this week should only be practiced on devices you own. Responsible disclosure and legal boundaries aren't optional — they're what separates a researcher from an attacker.",
    lesson: [
      "An embedded system is a computer built into a device that isn't a traditional computer. Your router, your smart thermostat, your car's dashboard — they all run software on tiny processors. Unlike your laptop, these systems run a single piece of software (firmware) from the moment they power on, with no user-installable apps.",
      "Open a typical home router and you'll find a PCB (Printed Circuit Board) with a few key components: the SoC (System-on-Chip) — the brain that runs Linux or an RTOS; the RAM chip for temporary data; the flash memory (usually SPI or NAND) where the firmware lives permanently; and the Ethernet/WiFi radio chips for connectivity.",
      "Why should a security researcher care? Because embedded devices ship with the same firmware to millions of users. A single vulnerability means millions of compromised devices. Manufacturers rarely push updates, users never install them, and the attack surface is enormous: network-facing services, web interfaces, debug ports left enabled from manufacturing.",
      "The research process always starts the same way: identify the hardware (what SoC, what flash chip), extract the firmware (from the chip or from a download), unpack it (with tools like binwalk), and analyze the filesystem. This week, you'll learn each step."
    ],
    exercise: {
      type: "choice",
      prompt: "You open a router and see the PCB. You identify four major chips. Which component stores the firmware that runs every time the device boots?",
      choices: [
        "The RAM chip (volatile memory)",
        "The SPI flash chip (non-volatile memory)",
        "The Ethernet controller",
        "The power management IC"
      ],
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "B") {
          return { correct: true, hint: "Correct! The SPI flash chip holds the firmware persistently. RAM is volatile — it loses data when powered off. The flash chip is your target for firmware extraction." };
        }
        if (choice === "A") {
          return { correct: false, hint: "RAM is volatile memory — it's erased when the device loses power. Firmware needs to survive reboots, so it's stored in non-volatile flash memory." };
        }
        if (choice === "C") {
          return { correct: false, hint: "The Ethernet controller handles network communication, not firmware storage. Look for the chip that retains data without power." };
        }
        if (choice === "D") {
          return { correct: false, hint: "The power management IC regulates voltage, not data. Firmware lives on a dedicated storage chip." };
        }
        return { correct: false, hint: "Choose A, B, C, or D." };
      },
    },
    quiz: {
      question: "Why are embedded devices particularly attractive targets for attackers compared to desktop computers?",
      options: [
        { label: "A", value: "They use stronger encryption than desktops" },
        { label: "B", value: "Millions of identical devices share the same firmware, rarely get updated, and often expose debug interfaces" },
        { label: "C", value: "They are harder to exploit because they use custom operating systems" },
        { label: "D", value: "They have more RAM and processing power than desktops" },
      ],
      correct: "B",
      explanation: "Embedded devices are mass-produced with identical firmware, manufacturers rarely push security updates, users almost never install them, and debug interfaces (UART, JTAG) are often left accessible. One vulnerability = millions of affected devices. This makes them a high-value, low-effort target.",
    },
    output: "Today you learned the anatomy of an embedded system — SoC, RAM, flash, and why these devices are prime targets for security research.",
    homework: [
      {
        title: "Embedded Hardware Hacking 101 – The Belkin WeMo Link",
        url: "https://www.mandiant.com/resources/blog/embedded-hardwareha",
        description: "Mandiant walks through a real teardown of a consumer IoT device, from opening the case to identifying chips on the PCB."
      },
      {
        title: "Practical IoT Hacking (Book)",
        url: "https://nostarch.com/practical-iot-hacking",
        description: "The definitive hands-on reference for IoT security research — covers hardware, firmware, radio, and network attacks."
      },
      {
        title: "Hardware All The Things",
        url: "https://swisskyrepo.github.io/HardwareAllTheThings/",
        description: "Community-maintained wiki covering every hardware hacking technique in a cheatsheet format."
      }
    ],
  },
  {
    day: 9,
    title: "UART — The Forgotten Back Door",
    hook: "A security researcher buys a NEC Wi-Fi router for $15 at a thrift store. She flips the board over, spots four unmarked pads in a row, and connects a $3 USB-to-serial adapter. A Linux login prompt appears on her screen. Username: admin. Password: admin. She now has root access to the device — no exploit needed, no software vulnerability, just four solder pads the manufacturer forgot to disable. This is UART, and it's hiding on almost every embedded device ever made.",
    lesson: [
      "UART (Universal Asynchronous Receiver/Transmitter) is a serial communication protocol used for debugging during manufacturing. Engineers use it to watch the device boot, read kernel logs, and drop into a root shell. The problem? Most manufacturers never disable it before shipping.",
      "UART uses just 4 pins: TX (transmit data from the device), RX (receive data to the device), GND (ground reference), and VCC (power, usually 3.3V — don't connect this unless needed). You only need to connect TX, RX, and GND to get a working console.",
      "Finding UART on a PCB: look for a row of 3-4 pads or pins, often near the SoC or edge of the board. They might be labeled, or they might be unmarked test points. You can identify them with a multimeter: GND reads 0V, VCC reads 3.3V or 5V, TX fluctuates during boot (data being sent), and RX stays steady.",
      "The critical setting is the baud rate — the speed at which data is transmitted. Common rates: 9600, 19200, 38400, 57600, 115200. If you connect at the wrong baud rate, you'll see garbage characters. 115200 is the most common for modern devices. Tools like picocom, minicom, or screen let you connect: 'picocom -b 115200 /dev/ttyUSB0'."
    ],
    exercise: {
      type: "terminal",
      prompt: "You've connected a USB-to-serial adapter to a router's UART pins. The adapter shows up as /dev/ttyUSB0. Try connecting and exploring the device:\n• picocom -b 115200 /dev/ttyUSB0\n• ls /etc\n• cat /etc/passwd\n• cat /etc/shadow\n• uname -a\n• ps",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        picocom: (args: string) => {
          if (args.includes("115200")) return "picocom v3.1\n\nport is        : /dev/ttyUSB0\nflowcontrol    : none\nbaudrate is    : 115200\nparity is      : none\ndatabits are   : 8\nstopbits are   : 1\n\nTerminal ready\n\n\nU-Boot 1.1.3 (Aug 12 2019)\nBoard: Ralink APSoC DRAM: 64 MB\nrelocate_code Pointer at: 83fb0000\n\n## Booting image at bc050000 ...\n   Uncompressing Kernel Image ... OK\nStarting kernel ...\n\n[    0.000000] Linux version 2.6.36 (builder@buildhost)\n[    2.340000] init started: BusyBox v1.12.1\n\nRouter login: admin\nPassword: admin\n\nBusyBox v1.12.1 (2019-08-12) built-in shell (ash)\n\n# _";
          if (args.includes("9600")) return "picocom v3.1\nport is        : /dev/ttyUSB0\nbaudrate is    : 9600\n\nTerminal ready\n\nçó¥»ÒèñÄÝ...\n[garbled output - wrong baud rate]";
          return "picocom: command usage: picocom -b <baudrate> <device>";
        },
        ls: (args: string) => {
          if (args.includes("/etc")) return "passwd\nshadow\nhosts\nresolv.conf\ninittab\ninit.d/\nconfig/\nfstab\nTZ\nservices\nprotocols";
          if (args.includes("/")) return "bin  dev  etc  lib  mnt  proc  sbin  sys  tmp  usr  var  www";
          return "bin  dev  etc  lib  mnt  proc  sbin  sys  tmp  usr  var  www";
        },
        cat: (args: string) => {
          if (args.includes("/etc/passwd")) return "root:x:0:0:root:/root:/bin/ash\nnobody:x:65534:65534:nobody:/var:/bin/false\nadmin:x:500:500:admin:/home/admin:/bin/ash\ndaemon:x:1:1:daemon:/var:/bin/false";
          if (args.includes("/etc/shadow")) return "root:$1$Ht7Emqrs$GCVW9t7CJV0Rvn1HIOQV41:18000:0:99999:7:::\nadmin:$1$vG3aN0TN$sKLK0s3ju0SmM/FDv1SUo/:18000:0:99999:7:::\nnobody:*:0:0:99999:7:::";
          if (args.includes("resolv.conf")) return "nameserver 8.8.8.8\nnameserver 8.8.4.4";
          return `cat: ${args || "?"}: No such file or directory`;
        },
        uname: () => "Linux Router 2.6.36 #1 Mon Aug 12 10:23:15 CST 2019 mips GNU/Linux",
        ps: () => "  PID USER       VSZ STAT COMMAND\n    1 root      1504 S    init\n   89 root      1184 S    /sbin/syslogd\n  102 root      1508 S    /usr/sbin/httpd\n  115 root      1732 S    /usr/sbin/udhcpd\n  128 root      1264 S    /usr/sbin/telnetd\n  141 root       876 S    /sbin/watchdog\n  155 root      1508 S    /usr/sbin/dnsmasq\n  201 root      1116 S    -ash",
        id: () => "uid=0(root) gid=0(root)",
        whoami: () => "root",
        pwd: () => "/root",
        help: () => "Available commands: picocom, ls, cat, uname, ps, id, whoami, pwd, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You connect to a device's UART at 115200 baud and see garbage characters on screen. What's the most likely cause?",
      options: [
        { label: "A", value: "The device is encrypted and you need a decryption key" },
        { label: "B", value: "The baud rate is wrong — try other common rates like 9600, 57600, or 38400" },
        { label: "C", value: "The UART port is disabled and cannot be used" },
        { label: "D", value: "You need to install special drivers for the serial adapter" },
      ],
      correct: "B",
      explanation: "Garbage characters on a UART connection almost always mean a baud rate mismatch. The device is transmitting data, but your terminal is interpreting the bits at the wrong speed. Try common baud rates: 9600, 19200, 38400, 57600, 115200. If one shows readable text, you've found the right one.",
    },
    output: "Today you learned how UART works, how to identify it on a PCB, and how to connect to get a root shell on an embedded device.",
    homework: [
      {
        title: "How to Speak your Hardware's Language",
        url: "https://www.interruptlabs.co.uk/articles/how-to-speak-your-hardwares-language",
        description: "Covers UART, SPI, I2C, and JTAG interfaces with clear diagrams and practical examples."
      },
      {
        title: "Bypassing password protection via UART on NEC router",
        url: "https://faradaysec.com/bypassing-password-protection-and-getting-a-shell-through-uart-in-nec-aterm-wr8165n-wi-fi-router/",
        description: "Step-by-step walkthrough of getting root access through UART on a real Wi-Fi router."
      },
      {
        title: "Basics of hardware hacking",
        url: "https://maldroid.github.io/hardware-hacking/",
        description: "Beginner-friendly guide covering equipment, safety, and first steps with hardware interfaces."
      }
    ],
  },
  {
    day: 10,
    title: "JTAG & SWD — The Manufacturer's Debug Port",
    hook: "In 2023, a researcher published a blog post titled \"JTAG Hacking the Original Xbox in 2023.\" Using a $50 tool and the JTAG port that Microsoft left on the motherboard, he could pause the CPU mid-instruction, read any memory address, and step through the boot process one instruction at a time. The debug port that Microsoft used to develop the Xbox was never removed. It's the same story with routers, cameras, and IoT devices everywhere — the manufacturer's master key, left in the lock.",
    lesson: [
      "JTAG (Joint Test Action Group) was originally designed for testing circuit board connections after manufacturing. But it evolved into a full debugging interface: you can halt the CPU, read/write memory, flash firmware, and single-step through code. It's like having a GDB session directly on the hardware.",
      "JTAG uses 4-5 pins: TDI (Test Data In), TDO (Test Data Out), TCK (Test Clock), TMS (Test Mode Select), and optionally TRST (Test Reset). Finding them on a PCB can be tricky — look for a row of 10-20 pads often labeled 'JTAG' or 'DEBUG', or use a tool like JTAGulator that automatically identifies the pins.",
      "SWD (Serial Wire Debug) is ARM's simplified alternative to JTAG, using only 2 pins: SWDIO (data) and SWCLK (clock). Most modern ARM Cortex-M microcontrollers use SWD. It provides the same debugging capabilities as JTAG but with fewer wires. Common on IoT devices, smart home sensors, and wearables.",
      "Tools of the trade: JTAGulator ($150) auto-identifies JTAG pins on unknown boards. JTAGenum (free, runs on Arduino) does the same on a budget. OpenOCD is the open-source software that talks to JTAG/SWD interfaces. For ARM devices, a $20 ST-Link or J-Link EDU can connect to SWD ports."
    ],
    exercise: {
      type: "input",
      prompt: "JTAG uses 4 mandatory signal pins for communication. One carries data INTO the device, one carries data OUT, one provides the clock signal, and one selects the test mode.\n\nName the pin that carries data OUT from the device to the debugger:\n(Hint: it's a three-letter acronym)",
      placeholder: "Type the pin name...",
      validator: (input: string) => {
        const clean = input.trim().toUpperCase();
        if (clean === "TDO" || clean === "TEST DATA OUT") {
          return { correct: true, hint: "Correct! TDO (Test Data Out) carries data from the device to the debugger. It's how you read memory contents, register values, and debug output from the target device." };
        }
        if (clean === "TDI") {
          return { correct: false, hint: "TDI is Test Data In — that's for sending data TO the device. You want the pin that sends data OUT from the device." };
        }
        if (clean === "TCK" || clean === "TMS" || clean === "TRST") {
          return { correct: false, hint: "That pin has a different function. TCK is the clock, TMS selects the mode, TRST is reset. Which pin carries data OUT?" };
        }
        return { correct: false, hint: "Think about the direction: you want data flowing OUT of the device. The acronym starts with T and describes the data direction." };
      },
    },
    quiz: {
      question: "What is the key difference between JTAG and SWD?",
      options: [
        { label: "A", value: "JTAG is for hardware testing only; SWD is for software debugging only" },
        { label: "B", value: "SWD is ARM-specific and uses only 2 pins; JTAG uses 4-5 pins and works across architectures" },
        { label: "C", value: "JTAG is wireless; SWD requires physical connection" },
        { label: "D", value: "SWD is older and being replaced by JTAG in modern devices" },
      ],
      correct: "B",
      explanation: "SWD (Serial Wire Debug) is ARM's streamlined debug protocol using just SWDIO and SWCLK — 2 wires instead of JTAG's 4-5. Both provide full debug access (halt CPU, read memory, flash firmware), but SWD is ARM-only while JTAG works across MIPS, ARM, x86, and other architectures.",
    },
    output: "Today you learned about JTAG and SWD debug interfaces — how they work, how to find them on a PCB, and what tools researchers use to connect.",
    homework: [
      {
        title: "JTAGulator vs JTAGenum: Identifying JTAG Pins",
        url: "https://www.praetorian.com/blog/jtagulator-vs-jtagenum-tools-for-identifying-jtag-pins-in-iot-devices/",
        description: "Compares two popular tools for automatically discovering JTAG pins on unknown devices."
      },
      {
        title: "JTAG Hacking the Original Xbox in 2023",
        url: "https://blog.ret2.io/2023/08/09/jtag-hacking-the-original-xbox-2023/",
        description: "A modern walkthrough of using JTAG to debug the original Xbox — covers setup, connection, and memory reads."
      },
      {
        title: "DEF CON 27 — Intro to Hardware Hacking",
        url: "https://youtu.be/HuCbr2588-w?si=05gD8m7th_MfG3ZQ",
        description: "Philippe Laulheret's talk covers UART, JTAG, and SPI with live demos on real devices."
      }
    ],
  },
  {
    day: 11,
    title: "SPI Flash & Firmware Dumping",
    hook: "Payatu, an IoT security firm, published a blog post showing how they desoldered a tiny 8-pin chip from a router's PCB, clipped it to a $15 programmer, and in 90 seconds had a complete copy of the device's firmware — every password, every encryption key, every hidden service. The chip was a SPI flash, the most common firmware storage in consumer electronics. It's smaller than your fingernail, and it holds every secret the device has.",
    lesson: [
      "SPI (Serial Peripheral Interface) flash is the most common storage for firmware in embedded devices. It's a small chip (usually 8 pins in a SOIC-8 package) that stores between 1MB and 32MB of data. Inside lives the bootloader, the Linux kernel, the root filesystem, and all configuration — including hardcoded credentials.",
      "To read a SPI flash chip, you have two approaches: in-circuit (connecting to the chip while it's still on the board) or desoldering (removing the chip with a hot air rework station). In-circuit is less risky but can be unreliable if other components on the bus interfere. Common tools: a CH341A USB programmer ($5), a Raspberry Pi with SPI enabled, or a Bus Pirate.",
      "The software side uses flashrom — an open-source utility that reads and writes flash chips. The workflow: 'flashrom -p ch341a_spi -r firmware.bin' reads the entire chip to a file. Always read twice and compare checksums to ensure a clean dump: if the two files have different hashes, the read was corrupted.",
      "Another storage type is eMMC (embedded MultiMediaCard), common in higher-end devices like smart TVs, phones, and newer routers. eMMC is faster and larger (4GB-64GB) but uses a different interface. You can read eMMC chips using an SD card reader with adapter wires or a dedicated eMMC reader. The chip markings tell you everything: look up the part number to identify capacity, voltage, and interface."
    ],
    exercise: {
      type: "terminal",
      prompt: "You've connected a CH341A programmer to a SPI flash chip on a router. Use flashrom to dump the firmware and verify the dump:\n• flashrom -p ch341a_spi -r firmware_1.bin\n• flashrom -p ch341a_spi -r firmware_2.bin\n• md5sum firmware_1.bin firmware_2.bin\n• hexdump -C firmware_1.bin | head\n• file firmware_1.bin",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        flashrom: (args: string) => {
          if (args.includes("firmware_1")) return "flashrom v1.2 on Linux\nUsing clock_gettime for delay loops\nFound Winbond flash chip \"W25Q64.V\" (8192 kB, SPI)\nReading flash... done.\nFile firmware_1.bin written successfully.";
          if (args.includes("firmware_2")) return "flashrom v1.2 on Linux\nUsing clock_gettime for delay loops\nFound Winbond flash chip \"W25Q64.V\" (8192 kB, SPI)\nReading flash... done.\nFile firmware_2.bin written successfully.";
          return "flashrom: usage: flashrom -p <programmer> -r <output_file>";
        },
        md5sum: (args: string) => {
          if (args.includes("firmware_1") && args.includes("firmware_2")) return "a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5  firmware_1.bin\na3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5  firmware_2.bin";
          if (args.includes("firmware")) return "a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5  firmware_1.bin";
          return `md5sum: ${args}: No such file or directory`;
        },
        sha256sum: (args: string) => {
          if (args.includes("firmware")) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  firmware_1.bin";
          return `sha256sum: ${args}: No such file or directory`;
        },
        hexdump: () => "00000000  27 05 19 56 00 00 00 00  00 00 00 00 00 60 00 00  |'..V.........`.|\n00000010  80 01 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|\n00000020  4d 49 50 53 20 4c 69 6e  75 78 2d 32 2e 36 2e 33  |MIPS Linux-2.6.3|\n00000030  36 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |6...............|\n00000040  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|\n00000050  68 73 71 73 00 00 00 00  00 04 00 00 00 00 00 00  |hsqs............|",
        file: (args: string) => {
          if (args.includes("firmware")) return "firmware_1.bin: data";
          return `file: ${args}: No such file or directory`;
        },
        strings: (args: string) => {
          if (args.includes("firmware")) return "U-Boot 1.1.3\nMIPS Linux-2.6.36\nhsqs\nLinux version 2.6.36\nBusyBox v1.12.1\n/dev/mtdblock\nadmin\npassword123\nwifi_key=MySecretWiFi2024\nhttp_passwd=admin";
          return `strings: ${args}: No such file or directory`;
        },
        ls: () => "firmware_1.bin  firmware_2.bin",
        help: () => "Available commands: flashrom, md5sum, sha256sum, hexdump, file, strings, ls, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You dump a SPI flash chip twice and get two different MD5 hashes. What should you do?",
      options: [
        { label: "A", value: "Use the first dump — it's probably fine" },
        { label: "B", value: "Dump again, check connections, and ensure no other components are interfering with the SPI bus" },
        { label: "C", value: "Average the two files together" },
        { label: "D", value: "The chip is encrypted and can't be read" },
      ],
      correct: "B",
      explanation: "Different hashes mean at least one read was corrupted — bits were misread due to electrical noise, loose connections, or bus contention (other chips on the SPI bus interfering). Fix: re-seat clips, hold the SoC in reset to quiet the bus, and dump again until two consecutive reads produce identical hashes.",
    },
    output: "Today you learned how to dump firmware from SPI flash chips using flashrom and verify the integrity of your dumps with checksums.",
    homework: [
      {
        title: "Dumping Firmware from eMMC",
        url: "https://payatu.com/blog/dumping-firmware-from-emmc/",
        description: "Payatu's guide to extracting firmware from eMMC chips — covers tools, wiring, and common pitfalls."
      },
      {
        title: "Firmware dumping technique for ARM Cortex-M0",
        url: "https://blog.includesecurity.com/2015/11/firmware-dumping-technique-for-an-arm-cortex-m0-soc/",
        description: "Demonstrates creative firmware extraction from a microcontroller with read protection enabled."
      },
      {
        title: "Methods for Extracting Firmware from OT Devices",
        url: "https://www.nozominetworks.com/blog/methods-for-extracting-firmware-from-ot-devices-for-vulnerability-research",
        description: "Nozomi Networks covers multiple extraction methods: SPI, UART, JTAG, and vendor download — with decision flowchart."
      }
    ],
  },
  {
    day: 12,
    title: "Binwalk & Unblob — Unpacking Firmware",
    hook: "You have a firmware.bin file — 8 megabytes of raw binary data. To a hex editor, it's a wall of bytes. But inside that wall are layers: a bootloader, a compressed Linux kernel, and a SquashFS filesystem containing every config file, web page, binary, and script the device runs. The tool that cracks it open? Binwalk. One command, and the wall becomes a directory tree you can browse like any Linux filesystem.",
    lesson: [
      "Firmware images are layered containers. A typical router firmware contains: the bootloader (U-Boot) at the start, a compressed kernel (usually LZMA or gzip), and one or more filesystems (SquashFS, JFFS2, CramFS). These sections are concatenated together at specific offsets, and each has a recognizable header (magic bytes).",
      "Binwalk scans a binary file for known signatures — file headers, compression markers, filesystem magic bytes — and reports what it finds at each offset. Running 'binwalk firmware.bin' shows you the map. Running 'binwalk -e firmware.bin' extracts each identified section into a directory tree.",
      "Unblob is the next-generation alternative to binwalk. It handles more formats (400+ vs binwalk's ~100), is more accurate with extraction, and avoids false positives. Usage is similar: 'unblob firmware.bin' scans and extracts in one step. For complex or nested firmware, unblob usually produces cleaner results.",
      "Once extracted, you'll find a root filesystem that looks like any Linux system: /etc (config files), /usr/bin (executables), /www or /var/www (web interface), /lib (shared libraries). This is where the real analysis begins — hunting for hardcoded credentials, debug scripts, vulnerable services, and custom binaries."
    ],
    exercise: {
      type: "terminal",
      prompt: "You have firmware.bin from yesterday's SPI dump. Use binwalk to analyze and extract it, then explore the filesystem:\n• binwalk firmware.bin\n• binwalk -e firmware.bin\n• ls _firmware.bin.extracted/squashfs-root/\n• cat _firmware.bin.extracted/squashfs-root/etc/passwd\n• ls _firmware.bin.extracted/squashfs-root/www/",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        binwalk: (args: string) => {
          if (args.includes("-e")) return "DECIMAL       HEXADECIMAL     DESCRIPTION\n-----------------------------------------------------------------------\n0             0x0             uImage header, \"MIPS Linux-2.6.36\"\n64            0x40            LZMA compressed data\n1048576       0x100000        Squashfs filesystem, little endian, version 4.0\n\nExtracting to _firmware.bin.extracted/\nExtracting uImage at offset 0x0\nDecompressing LZMA at offset 0x40\nExtracting SquashFS at offset 0x100000\nExtraction complete.";
          if (args.includes("firmware")) return "DECIMAL       HEXADECIMAL     DESCRIPTION\n-----------------------------------------------------------------------\n0             0x0             uImage header, header size: 64 bytes, image size: 983040\n                              image name: \"MIPS Linux-2.6.36\"\n64            0x40            LZMA compressed data, properties: 0x5D\n1048576       0x100000        Squashfs filesystem, little endian, version 4.0\n                              compression: xz, size: 6291456 bytes\n7340032       0x700000        JFFS2 filesystem, little endian";
          return "binwalk: usage: binwalk [-e] <firmware_file>";
        },
        ls: (args: string) => {
          if (args.includes("squashfs-root/www")) return "cgi-bin/  css/  images/  js/  login.html  index.html  admin.html  config.js";
          if (args.includes("squashfs-root/etc")) return "passwd  shadow  hosts  inittab  init.d/  config/  fstab  services";
          if (args.includes("squashfs-root")) return "bin  dev  etc  lib  mnt  proc  sbin  sys  tmp  usr  var  www";
          if (args.includes("extracted")) return "40.7z  squashfs-root/";
          return "firmware.bin  _firmware.bin.extracted/";
        },
        cat: (args: string) => {
          if (args.includes("passwd")) return "root:x:0:0:root:/root:/bin/ash\nadmin:x:500:500:admin:/home/admin:/bin/ash\nnobody:x:65534:65534:nobody:/var:/bin/false";
          if (args.includes("shadow")) return "root:$1$Ht7Emqrs$GCVW9t7CJV0Rvn1HIOQV41:18000:0:99999:7:::\nadmin:$1$vG3aN0TN$sKLK0s3ju0SmM/FDv1SUo/:18000:0:99999:7:::";
          if (args.includes("config.js")) return "var DEFAULT_USER = 'admin';\nvar DEFAULT_PASS = 'admin';\nvar API_KEY = 'sk_live_R4nd0mK3y1234567890';\nvar DEBUG_MODE = true;\nvar TELNET_ENABLED = true;";
          if (args.includes("login.html")) return "<html><head><title>Router Admin</title></head>\n<body>\n<form action='/cgi-bin/login.cgi' method='POST'>\n<input name='username'><input name='password' type='password'>\n<button>Login</button>\n</form></body></html>";
          return `cat: ${args}: No such file or directory`;
        },
        file: (args: string) => {
          if (args.includes("squashfs-root")) return "squashfs-root/: directory";
          return `${args}: ELF 32-bit MSB executable, MIPS`;
        },
        find: (args: string) => {
          if (args.includes("passwd") || args.includes("shadow")) return "_firmware.bin.extracted/squashfs-root/etc/passwd\n_firmware.bin.extracted/squashfs-root/etc/shadow";
          if (args.includes(".conf")) return "_firmware.bin.extracted/squashfs-root/etc/config/httpd.conf\n_firmware.bin.extracted/squashfs-root/etc/config/wireless.conf\n_firmware.bin.extracted/squashfs-root/etc/config/firewall.conf";
          return "No files found matching pattern.";
        },
        help: () => "Available commands: binwalk, ls, cat, file, find, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "After running 'binwalk -e firmware.bin', you find a squashfs-root directory. What does this directory contain?",
      options: [
        { label: "A", value: "The bootloader source code" },
        { label: "B", value: "The device's root filesystem — config files, binaries, web pages, libraries" },
        { label: "C", value: "Encrypted firmware that still needs to be decrypted" },
        { label: "D", value: "A Windows executable for updating the firmware" },
      ],
      correct: "B",
      explanation: "SquashFS is a compressed read-only filesystem commonly used in embedded Linux devices. The extracted squashfs-root directory IS the device's root filesystem — /etc, /bin, /usr, /www — exactly as it exists on the running device. This is where you find config files, web interfaces, custom binaries, and potentially hardcoded credentials.",
    },
    output: "Today you learned to use binwalk and unblob to unpack firmware images and navigate the extracted filesystem like a real device.",
    homework: [
      {
        title: "Unpacking Firmware Images from Cable Modems",
        url: "https://w00tsec.blogspot.com/2013/11/unpacking-firmware-images-from-cable.html",
        description: "Classic walkthrough of extracting and analyzing cable modem firmware with binwalk."
      },
      {
        title: "Binwalk (tool)",
        url: "https://github.com/ReFirmLabs/binwalk",
        description: "The go-to firmware extraction tool — scan, identify, and extract embedded file systems and compressed data."
      },
      {
        title: "Unblob (tool)",
        url: "https://unblob.org/",
        description: "Next-generation firmware extractor supporting 400+ formats with better accuracy than binwalk."
      }
    ],
  },
  {
    day: 13,
    title: "Hunting Secrets in Extracted Firmware",
    hook: "In 2014, researchers at Quarkslab discovered that thousands of Linksys, Netgear, and Cisco routers had a backdoor service listening on TCP port 32764. Anyone on the local network could send a special 13-byte packet and get a root shell. The backdoor wasn't a bug — it was intentionally coded into the firmware by a manufacturer named SerComm. How was it discovered? Someone ran 'strings' on the extracted firmware and found a suspicious binary called 'scfgmgr'. That one command — strings — led to the exposure of a supply chain backdoor affecting millions of devices.",
    lesson: [
      "After extracting a firmware filesystem, the real work begins: hunting for vulnerabilities. The simplest and most effective first step is the 'strings' command. It extracts human-readable text from binary files — URLs, passwords, API keys, debug messages, error strings, and command-line arguments that developers left behind.",
      "'grep' is your scalpel. Search the entire filesystem for common secrets: 'grep -r \"password\" .' finds hardcoded passwords. 'grep -r \"api_key\\|secret\\|token\" .' finds API credentials. 'grep -r \"telnet\\|ssh\\|backdoor\" .' finds hidden services. 'grep -r \"http://\\|https://\" .' reveals hardcoded server URLs and C2 endpoints.",
      "Key files to check first: /etc/shadow (password hashes — can they be cracked?), /etc/passwd (user accounts), any .conf files (service configurations), web interface scripts in /www or /var/www (often contain hardcoded admin credentials), and init scripts in /etc/init.d/ (reveal which services start at boot — any suspicious ones?).",
      "Beyond text searches, check file permissions (find files with SUID bit set — they run as root), look for custom binaries (anything not standard BusyBox), and examine the web CGI scripts (common source of command injection vulnerabilities). The combination of strings + grep + understanding the filesystem layout is how researchers find 0-days in firmware."
    ],
    exercise: {
      type: "terminal",
      prompt: "You've extracted a router's firmware. Time to hunt for secrets:\n• strings usr/bin/httpd | grep -i pass\n• grep -r \"password\" etc/\n• grep -r \"api_key\\|secret\\|token\" www/\n• cat etc/init.d/rcS\n• find . -perm -4000\n• strings usr/bin/scfgmgr",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        strings: (args: string) => {
          if (args.includes("httpd") && args.includes("pass")) return "admin_password\ncheck_password\ndefault_pass=admin123\npasswd_file=/etc/shadow\ninvalid password\npassword_verify";
          if (args.includes("httpd")) return "HTTP/1.1 200 OK\nContent-Type: text/html\nGET /login.cgi\nPOST /apply.cgi\nadmin_password\ncheck_password\ndefault_pass=admin123\n/dev/mtdblock/3\nwifi_password\ntelnetd -l /bin/sh";
          if (args.includes("scfgmgr")) return "SerComm FW Configuration Manager\nlistening on port 32764\ncommand_handler\nget_nvram\nset_nvram\nexec_shell\nroot_shell_enabled=1\n/dev/mtdblock/5\nfactory_reset\nbypass_auth";
          if (args.includes("firmware")) return "U-Boot 1.1.3\nMIPS Linux-2.6.36\nBusyBox v1.12.1";
          return `strings: ${args.split("|")[0].trim()}: No such file or directory`;
        },
        grep: (args: string) => {
          if (args.includes("password") && args.includes("etc")) return "etc/config/httpd.conf:admin_password=admin123\netc/config/wireless.conf:wpa_passphrase=HomeWiFi2024!\netc/shadow:root:$1$Ht7Emqrs$GCVW9t7CJV0Rvn1HIOQV41:18000:0:99999:7:::\netc/init.d/rcS:# default password for telnet";
          if ((args.includes("api_key") || args.includes("secret") || args.includes("token")) && args.includes("www")) return "www/config.js:var API_KEY = 'sk_live_R4nd0mK3y1234567890';\nwww/config.js:var DEBUG_TOKEN = 'd3bug_t0ken_2024';\nwww/cgi-bin/cloud.cgi:CLOUD_SECRET=\"mfg_secret_do_not_ship\"";
          if (args.includes("telnet") || args.includes("backdoor")) return "etc/init.d/rcS:telnetd -l /bin/sh -p 23 &\nusr/bin/scfgmgr: matches binary file";
          return `grep: ${args}: No match found`;
        },
        cat: (args: string) => {
          if (args.includes("rcS")) return "#!/bin/sh\n# System startup script\nmount -t proc proc /proc\nmount -t sysfs sysfs /sys\n\n# Start networking\nifconfig eth0 up\nudhcpc &\n\n# Start services\nhttpd -p 80 -h /www\ndnsmasq &\n\n# default password for telnet\ntelnetd -l /bin/sh -p 23 &\n\n# Start management daemon\n/usr/bin/scfgmgr &\n\n# Enable watchdog\n/sbin/watchdog -t 5 /dev/watchdog";
          if (args.includes("shadow")) return "root:$1$Ht7Emqrs$GCVW9t7CJV0Rvn1HIOQV41:18000:0:99999:7:::\nadmin:$1$vG3aN0TN$sKLK0s3ju0SmM/FDv1SUo/:18000:0:99999:7:::";
          return `cat: ${args}: No such file or directory`;
        },
        find: (args: string) => {
          if (args.includes("-4000") || args.includes("perm")) return "./usr/bin/scfgmgr\n./usr/sbin/httpd\n./bin/busybox";
          if (args.includes("-name") && args.includes(".cgi")) return "./www/cgi-bin/login.cgi\n./www/cgi-bin/apply.cgi\n./www/cgi-bin/cloud.cgi\n./www/cgi-bin/diagnostic.cgi";
          return "No results.";
        },
        ls: (args: string) => {
          if (args.includes("etc")) return "config/  init.d/  passwd  shadow  hosts  inittab  fstab";
          if (args.includes("www")) return "cgi-bin/  config.js  index.html  login.html  admin.html";
          return "bin  dev  etc  lib  usr  var  www";
        },
        help: () => "Available commands: strings, grep, cat, find, ls, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You find this in a firmware init script: 'telnetd -l /bin/sh -p 23 &'. What does this mean?",
      options: [
        { label: "A", value: "A secure SSH server is starting on port 23" },
        { label: "B", value: "A telnet server starts at boot giving direct shell access with no authentication" },
        { label: "C", value: "The device is logging telnet connections for security monitoring" },
        { label: "D", value: "Telnet is disabled and this line is commented out" },
      ],
      correct: "B",
      explanation: "The '-l /bin/sh' flag tells telnetd to launch a shell directly — no login prompt, no password. Anyone connecting to port 23 gets an instant root shell. The '&' runs it in the background at boot. This is a critical backdoor, likely left from development and never removed before shipping.",
    },
    output: "Today you learned to hunt for hardcoded credentials, backdoors, and secrets in extracted firmware using strings, grep, and filesystem analysis.",
    homework: [
      {
        title: "TCP backdoor 32764",
        url: "https://blog.quarkslab.com/tcp-backdoor-32764-or-how-we-could-patch-the-internet-or-part-of-it.html",
        description: "The original Quarkslab write-up on the SerComm backdoor that affected millions of routers worldwide."
      },
      {
        title: "Identifying Bugs in Router Firmware at Scale with Taint Analysis",
        url: "https://starlabs.sg/blog/2021/08-identifying-bugs-in-router-firmware-at-scale-with-taint-analysis/",
        description: "Star Labs shows how to scale firmware analysis beyond manual grep — automated taint tracking across binaries."
      },
      {
        title: "Reverse Engineering IoT Firmware: Where to Start",
        url: "https://www.apriorit.com/dev-blog/reverse-reverse-engineer-iot-firmware",
        description: "Step-by-step guide from firmware download to vulnerability discovery, ideal for beginners."
      }
    ],
  },
  {
    day: 14,
    title: "Your First Firmware Analysis — Guided Case Study",
    hook: "It's time to put it all together. Over the past six days you've learned to identify hardware, connect to UART, understand JTAG, dump flash chips, extract filesystems, and hunt for secrets. Today you'll walk through a complete firmware analysis — from binary blob to vulnerability — on a simulated TP-Link router. This is the workflow that Pwn2Own contestants, bug bounty hunters, and security consultants use on real devices every day. Let's see what you've learned.",
    lesson: [
      "The firmware analysis workflow has 5 phases: (1) Reconnaissance — identify the device, download or dump firmware, research known vulnerabilities. (2) Extraction — use binwalk/unblob to unpack the filesystem. (3) Static analysis — search for secrets, analyze binaries, map the attack surface. (4) Emulation — run the firmware (or parts of it) in QEMU to test without hardware. (5) Exploitation — confirm vulnerabilities with proof-of-concept code.",
      "Today we simulate a TP-Link router analysis. First, identify the target: 'file firmware.bin' reveals it's a MIPS binary with a U-Boot header. 'binwalk firmware.bin' shows the structure. Extract with 'binwalk -e', then explore the filesystem to understand what services run and where the attack surface lives.",
      "The web interface is almost always the richest attack surface on a consumer router. CGI scripts written in C often lack input validation. Look at /www/cgi-bin/ for executables that take user input. Check if they use system(), popen(), or exec() — if user-controlled data reaches these functions without sanitization, you have command injection.",
      "This workflow is exactly how teams at Synacktiv, Claroty Team82, and Star Labs approach Pwn2Own targets. The difference between a beginner and a pro isn't magic — it's systematic methodology. You now have the methodology. What comes next is practice, practice, and more practice."
    ],
    exercise: {
      type: "terminal",
      prompt: "Walk through a complete firmware analysis:\n• file firmware.bin\n• binwalk -e firmware.bin\n• ls squashfs-root/www/cgi-bin/\n• strings squashfs-root/www/cgi-bin/diagnostic.cgi\n• cat squashfs-root/etc/shadow\n• grep -r \"system(\" squashfs-root/www/cgi-bin/\n• hashcat -m 500 hashes.txt (simulate cracking)",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        file: (args: string) => {
          if (args.includes("firmware")) return "firmware.bin: u-boot legacy uImage, MIPS Linux-2.6.36, Linux/MIPS, OS Kernel Image (lzma)";
          if (args.includes("diagnostic")) return "diagnostic.cgi: ELF 32-bit MSB executable, MIPS, MIPS-I version 1 (SYSV), dynamically linked";
          return `${args}: data`;
        },
        binwalk: (args: string) => {
          if (args.includes("-e")) return "DECIMAL       HEXADECIMAL     DESCRIPTION\n-----------------------------------------------------------------------\n0             0x0             uImage header, \"MIPS Linux-2.6.36\"\n64            0x40            LZMA compressed data\n1048576       0x100000        Squashfs filesystem, version 4.0\n\nExtracting...\n> squashfs-root/\n  > bin/ dev/ etc/ lib/ usr/ var/ www/\nExtraction complete.";
          if (args.includes("firmware")) return "DECIMAL       HEXADECIMAL     DESCRIPTION\n-----------------------------------------------------------------------\n0             0x0             uImage header\n64            0x40            LZMA compressed data\n1048576       0x100000        Squashfs filesystem, version 4.0\n7340032       0x700000        JFFS2 filesystem";
          return "Usage: binwalk [-e] <file>";
        },
        ls: (args: string) => {
          if (args.includes("cgi-bin")) return "login.cgi     apply.cgi     diagnostic.cgi     firmware_update.cgi     reboot.cgi";
          if (args.includes("squashfs")) return "bin  dev  etc  lib  usr  var  www";
          return "firmware.bin  squashfs-root/";
        },
        strings: (args: string) => {
          if (args.includes("diagnostic")) return "ping_addr\nsystem\n/bin/ping -c 4 %s\ntraceroute\n/usr/bin/traceroute %s\nHTTP_REFERER\nContent-Type\napplication/json\nping_count\nresult\nsprintf\npopen\n[VULN] user input passed directly to system() via ping_addr parameter";
          return `strings: ${args}: No such file`;
        },
        cat: (args: string) => {
          if (args.includes("shadow")) return "root:$1$Ht7Emqrs$GCVW9t7CJV0Rvn1HIOQV41:18000:0:99999:7:::\nadmin:$1$vG3aN0TN$sKLK0s3ju0SmM/FDv1SUo/:18000:0:99999:7:::";
          if (args.includes("diagnostic")) return "[binary content - use 'strings' instead]";
          return `cat: ${args}: No such file`;
        },
        grep: (args: string) => {
          if (args.includes("system(") || args.includes("system")) return "squashfs-root/www/cgi-bin/diagnostic.cgi: system(\"/bin/ping -c 4 %s\", ping_addr)\nsquashfs-root/www/cgi-bin/diagnostic.cgi: system(\"/usr/bin/traceroute %s\", target)\nsquashfs-root/www/cgi-bin/firmware_update.cgi: system(\"/usr/bin/fwupgrade %s\", filename)";
          if (args.includes("password") || args.includes("passwd")) return "squashfs-root/etc/config/httpd.conf:admin_password=admin123\nsquashfs-root/www/config.js:DEFAULT_PASS='admin'";
          return "No matches.";
        },
        hashcat: () => "hashcat (v6.2.6)\n\nHash.Type........: md5crypt, MD5 (Unix)\nSpeed.#1.........:  1200.3 kH/s\n\nDictionary cache hit:\n$1$Ht7Emqrs$GCVW9t7CJV0Rvn1HIOQV41:toor\n$1$vG3aN0TN$sKLK0s3ju0SmM/FDv1SUo/:admin123\n\nSession..........: hashcat\nStatus...........: Cracked\nHash.Target......: 2 hashes\nTime.Started.....: Thu Jan 01 00:00:01 2025\nTime.Estimated...: Thu Jan 01 00:00:03 2025\n\nRecovered........: 2/2 (100.00%) Digests\nroot:toor\nadmin:admin123",
        help: () => "Available commands: file, binwalk, ls, strings, cat, grep, hashcat, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You find this code pattern in a router's CGI binary: system(\"/bin/ping -c 4 %s\", user_input). What class of vulnerability is this?",
      options: [
        { label: "A", value: "SQL Injection" },
        { label: "B", value: "Cross-Site Scripting (XSS)" },
        { label: "C", value: "OS Command Injection — user input goes directly into a system() call" },
        { label: "D", value: "Buffer Overflow" },
      ],
      correct: "C",
      explanation: "When user-controlled input is passed directly to system(), an attacker can inject additional commands using shell metacharacters. Input like '8.8.8.8; cat /etc/shadow' would execute the ping AND dump the password file. This is OS Command Injection — one of the most common and dangerous vulnerabilities in embedded web interfaces.",
    },
    output: "You completed Week 2! You now know the full firmware analysis workflow: hardware identification, UART/JTAG interfaces, SPI flash dumping, firmware extraction with binwalk, and vulnerability hunting with strings and grep.",
    homework: [
      {
        title: "OWASP IoT Goat",
        url: "https://github.com/OWASP/IoTGoat",
        description: "A deliberately vulnerable firmware image designed for learning — practice the entire analysis workflow in a safe environment."
      },
      {
        title: "Damn Vulnerable Router Firmware (DVRF)",
        url: "https://github.com/praetorian-inc/DVRF",
        description: "Praetorian's intentionally vulnerable firmware for ARM — includes stack overflows, command injection, and backdoors."
      },
      {
        title: "Hardware Reversing with the TP-Link TL-WR841N (ZDI)",
        url: "https://www.zerodayinitiative.com/blog/2019/9/2/mindshare-hardware-reversing-with-the-tp-link-tl-wr841n-router",
        description: "Zero Day Initiative's complete hardware teardown of a popular router — from PCB photos to firmware analysis."
      }
    ],
  },
];
