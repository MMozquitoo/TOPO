import { DayData } from "@/lib/types";

export const week7: DayData[] = [
  {
    day: 43,
    title: "Bluetooth Low Energy — Hacking the Invisible Network",
    hook: "In 2018, researchers at the University of Manchester reverse-engineered a popular BLE fitness smartband and discovered something alarming: heart rate data, GPS coordinates, and even text message notifications were transmitted completely unencrypted over Bluetooth Low Energy. They captured everything from 30 feet away using a $15 Bluetooth adapter and free software. The user had no idea. No pairing prompt, no warning, no indication that a stranger in the coffee shop was reading their heart rate in real time. BLE was designed to be simple and power-efficient — not secure. Today you'll learn how attackers exploit that design choice, and how to use the same tools researchers use to audit BLE devices. Every fitness tracker, smart lock, medical device, and wireless sensor around you is broadcasting right now. Today you'll learn to listen.",
    lesson: [
      "Bluetooth Low Energy (BLE) is a wireless protocol designed for short-range, low-power communication. Unlike classic Bluetooth, BLE devices constantly advertise their presence by broadcasting small packets — even before pairing. These advertisement packets can contain device names, service UUIDs, manufacturer data, and sometimes sensor readings. Anyone with a BLE adapter can passively receive these broadcasts.",
      "BLE communication is organized around the GATT (Generic Attribute Profile) protocol. A device exposes services (like 'Heart Rate' or 'Battery Level'), and each service contains characteristics — individual data points you can read, write, or subscribe to. Each characteristic has a UUID and permissions. The problem? Many manufacturers set all characteristics to 'read without authentication,' meaning anyone in range can query sensitive data.",
      "The attack surface of BLE is broad: passive eavesdropping on unencrypted connections, active MITM attacks by spoofing a device during pairing, replay attacks by recording and retransmitting captured packets, and fuzzing GATT characteristics to crash devices or trigger unintended behavior. Many smart locks, for example, use a simple write to a characteristic to unlock — if the value is predictable or replayable, the lock is worthless.",
      "Today you'll use hcitool for BLE scanning, gatttool for connecting to devices and reading characteristics, and learn to interpret the data structures that BLE devices expose. These are the same tools that security researchers use before moving to more advanced frameworks like BtleJuice or Mirage for MITM and relay attacks."
    ],
    exercise: {
      type: "terminal",
      prompt: "You're auditing a smart office building. Your laptop has a BLE adapter. Scan for nearby devices, connect to a smart lock, and explore its services:\n• hcitool lescan\n• gatttool -b AA:BB:CC:DD:EE:01 --primary\n• gatttool -b AA:BB:CC:DD:EE:01 --characteristics\n• gatttool -b AA:BB:CC:DD:EE:01 --char-read -a 0x000e\n• gatttool -b AA:BB:CC:DD:EE:02 --char-read -a 0x0012\n• hcitool leinfo AA:BB:CC:DD:EE:01",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        hcitool: (args: string) => {
          if (args.includes("lescan")) return "LE Scan ...\nAA:BB:CC:DD:EE:01  SmartLock-Office-3F\nAA:BB:CC:DD:EE:02  FitBand-HR-v2\nAA:BB:CC:DD:EE:03  TempSensor-HVAC\nAA:BB:CC:DD:EE:04  (unknown)\nAA:BB:CC:DD:EE:05  BLE-Beacon-Lobby\n11:22:33:44:55:66  SmartBulb-Conf-Room\n77:88:99:AA:BB:CC  BadgeReader-Entry\n\n[WARNING] 7 devices found. 3 are broadcasting service data in advertisement packets.";
          if (args.includes("leinfo")) return "Requesting information ...\n\tHandle: 0x0040\n\tLMP Version: 4.2 (0x8)\n\tLMP Subversion: 0x0001\n\tManufacturer: Generic BLE Corp (0x004C)\n\tFeatures: 0x01 0x00 0x00 0x00 0x00 0x00 0x00 0x00\n\t  LE Encryption: YES\n\t  Connection Parameters Update: NO\n\t  Extended Reject Indication: NO\n\t  Slave-initiated Features Exchange: NO\n\t  LE Ping: NO\n\n[NOTE] Device supports encryption but does NOT require it for characteristic reads.";
          return "Usage: hcitool lescan | hcitool leinfo <bdaddr>";
        },
        gatttool: (args: string) => {
          if (args.includes("EE:01") && args.includes("--primary")) return "attr handle = 0x0001, end grp handle = 0x0005 uuid: 00001800-0000-1000-8000-00805f9b34fb (Generic Access)\nattr handle = 0x0006, end grp handle = 0x0009 uuid: 00001801-0000-1000-8000-00805f9b34fb (Generic Attribute)\nattr handle = 0x000a, end grp handle = 0x0012 uuid: 0000fff0-0000-1000-8000-00805f9b34fb (Vendor Specific - Lock Control)\nattr handle = 0x0013, end grp handle = 0x0018 uuid: 0000180f-0000-1000-8000-00805f9b34fb (Battery Service)\nattr handle = 0x0019, end grp handle = 0x001f uuid: 0000180a-0000-1000-8000-00805f9b34fb (Device Information)";
          if (args.includes("EE:01") && args.includes("--characteristics")) return "handle = 0x000b, char properties = 0x02, char value handle = 0x000c, uuid = 0000fff1-...(Lock State)\nhandle = 0x000d, char properties = 0x08, char value handle = 0x000e, uuid = 0000fff2-...(Lock Command)\nhandle = 0x000f, char properties = 0x02, char value handle = 0x0010, uuid = 0000fff3-...(Lock PIN)\nhandle = 0x0014, char properties = 0x02, char value handle = 0x0015, uuid = 00002a19-...(Battery Level)\nhandle = 0x001a, char properties = 0x02, char value handle = 0x001b, uuid = 00002a29-...(Manufacturer Name)";
          if (args.includes("EE:01") && args.includes("0x000e")) return "Characteristic value/descriptor: 01\n\n[DECODE] Lock Command characteristic (0x000e):\n  Current value: 0x01 (LOCKED)\n  Write 0x00 to UNLOCK\n  Write 0x01 to LOCK\n\n[CRITICAL] This characteristic is WRITABLE WITHOUT AUTHENTICATION.\n  Any BLE device in range can unlock this smart lock.";
          if (args.includes("EE:02") && args.includes("0x0012")) return "Characteristic value/descriptor: 48 52 3a 20 37 32 20 62 70 6d\n\n[DECODE] Heart Rate: 72 bpm\n  Raw hex: 48 52 3a 20 37 32 20 62 70 6d\n  ASCII:   HR: 72 bpm\n\n[WARNING] Heart rate data transmitted in PLAINTEXT.\n  No encryption, no authentication required to read.\n  HIPAA / health data privacy implications.";
          return "Usage: gatttool -b <bdaddr> [--primary|--characteristics|--char-read -a <handle>]";
        },
        btmon: () => "Bluetooth monitor ver 5.64\n= Note: Linux kernel 5.15.0\n> HCI Event: LE Meta Event (0x3e)\n    LE Advertising Report\n      Num reports: 1\n      Event type: Connectable undirected (ADV_IND)\n      Address: AA:BB:CC:DD:EE:01 (SmartLock-Office-3F)\n      Data length: 24\n      Flags: 0x06\n      Company: Generic BLE Corp (0x004C)\n      Service Data: Lock Status=LOCKED\n      TX Power: -4 dBm\n      RSSI: -42 dBm (close proximity)",
        help: () => "Available commands: hcitool, gatttool, btmon, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You discover a BLE smart lock where the 'Lock Command' characteristic is writable without authentication. What type of vulnerability is this?",
      options: [
        { label: "A", value: "Buffer overflow in the BLE stack" },
        { label: "B", value: "Missing access control — any BLE device in range can send the unlock command" },
        { label: "C", value: "SQL injection through BLE characteristics" },
        { label: "D", value: "Denial of service via BLE flooding" },
      ],
      correct: "B",
      explanation: "This is a missing access control vulnerability. The lock's GATT characteristic allows writes without requiring authentication or pairing. Any device in BLE range (typically 30-100 feet) can write the unlock value. Proper implementation would require encrypted pairing, a challenge-response protocol, or at minimum, a PIN verification before accepting lock commands.",
    },
    output: "Today you learned how BLE advertising, GATT services, and characteristics work — and how missing authentication on writable characteristics can turn a smart lock into an open door.",
    homework: [
      {
        title: "Reverse Engineer a Bluetooth BLE SmartBand",
        url: "https://medium.com/@shelladdicted/reverse-engineer-a-bluetooth-ble-smartband-91ee10129217",
        description: "Step-by-step walkthrough of intercepting BLE traffic from a fitness band, decoding GATT services, and reading private health data."
      },
      {
        title: "Hacking Bluetooth Speaker Firmware",
        url: "https://olegkutkov.me/2021/02/27/hacking-a-firmware-of-bluetooth-speaker-fm-radio/",
        description: "Deep dive into extracting and reversing Bluetooth speaker firmware — covers chip identification, flash dumping, and protocol analysis."
      }
    ],
  },
  {
    day: 44,
    title: "WiFi Security in Embedded Devices",
    hook: "A team of researchers working on the ESP32 open-source MAC project needed to analyze WiFi traffic from their custom firmware in complete isolation — no interference from nearby access points, no stray packets from neighbors. Their solution? They built a Faraday cage from a metal ammunition box lined with copper tape and RF gaskets, creating a radio-silent chamber on their workbench. Inside, the ESP32 transmitted and their analyzer captured every frame in pristine clarity. This is real radio hacking: before you can break a wireless protocol, you need to control the RF environment. Today you'll learn how embedded devices handle WiFi — where they store credentials, how they configure radios, and what goes wrong when manufacturers cut corners on wireless security.",
    lesson: [
      "Embedded devices handle WiFi differently from your laptop. Most IoT devices use dedicated WiFi SoCs (like the ESP32, Realtek RTL8xxxxx, or Marvell Avastar) with firmware that runs on the wireless chip itself. This WiFi firmware is a separate attack surface from the main application — it processes raw 802.11 frames before the main CPU even sees them, making WiFi chip vulnerabilities particularly dangerous.",
      "When you extract firmware from an IoT device, WiFi configuration is a goldmine. Look for wpa_supplicant.conf (contains SSIDs and PSKs in plaintext), nvram settings storing wifi_passphrase variables, and hardcoded credentials in factory reset scripts. Many devices store WiFi credentials in unencrypted flash partitions — dump the chip and you have the network password.",
      "The Marvell Avastar vulnerability (2019) demonstrated the worst case: a bug in the WiFi chip's firmware allowed zero-click remote code execution. The chip scanned for WiFi networks automatically, and a specially crafted WiFi beacon could trigger a buffer overflow in the scanning routine. The victim's device didn't need to connect to anything — just having WiFi enabled was enough. This affected laptops, phones, and IoT devices using Marvell WiFi chips.",
      "Today you'll analyze WiFi configurations extracted from firmware, understand iwconfig output to assess wireless security posture, and learn the concepts behind airmon-ng and wireless monitoring. Understanding how WiFi works at the embedded level is essential because IoT devices often use outdated protocols (WEP, WPA with weak PSKs), broadcast management frames, and lack the automatic updates that keep laptop WiFi stacks patched."
    ],
    exercise: {
      type: "terminal",
      prompt: "You've extracted firmware from a smart home hub and want to analyze its WiFi configuration and security:\n• iwconfig wlan0\n• cat /etc/wpa_supplicant.conf\n• grep -r \"passphrase\\|psk\\|wifi_key\" /etc/config/\n• iw dev wlan0 scan\n• cat /etc/config/wireless\n• airmon-ng check",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        iwconfig: (args: string) => {
          if (args.includes("wlan0") || args === "") return "wlan0     IEEE 802.11bgn  ESSID:\"SmartHome-Hub-5G\"\n          Mode:Managed  Frequency:2.437 GHz  Access Point: DE:AD:BE:EF:CA:FE\n          Bit Rate=72.2 Mb/s   Tx-Power=20 dBm\n          Retry short limit:7   RTS thr:off   Fragment thr:off\n          Encryption key:on\n          Power Management:off\n          Link Quality=70/70  Signal level=-35 dBm\n          Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0\n          Tx excessive retries:0  Invalid misc:0  Missed beacon:0\n\n[NOTE] Device is using 802.11n on 2.4GHz — no 802.11w (Management Frame Protection) enabled.";
          return "No such device: " + args;
        },
        cat: (args: string) => {
          if (args.includes("wpa_supplicant")) return "# WiFi Configuration - Factory Default\nctrl_interface=/var/run/wpa_supplicant\nupdate_config=1\n\nnetwork={\n    ssid=\"SmartHome-Hub-5G\"\n    psk=\"factorydefault123\"\n    key_mgmt=WPA-PSK\n    proto=WPA2\n    pairwise=CCMP\n    group=CCMP\n}\n\nnetwork={\n    ssid=\"Setup-Network\"\n    key_mgmt=NONE\n    priority=0\n}\n\n# [CRITICAL] PSK stored in plaintext\n# [CRITICAL] Fallback open network 'Setup-Network' with no encryption\n# [WARNING] No 802.11w management frame protection configured";
          if (args.includes("wireless")) return "config wifi-device 'radio0'\n    option type 'mac80211'\n    option channel '6'\n    option hwmode '11g'\n    option htmode 'HT20'\n    option disabled '0'\n    option txpower '20'\n\nconfig wifi-iface 'default_radio0'\n    option device 'radio0'\n    option network 'lan'\n    option mode 'ap'\n    option ssid 'SmartHome-Setup'\n    option encryption 'none'\n    option hidden '0'\n\n# [CRITICAL] Access point running with NO encryption (option encryption 'none')\n# [WARNING] SSID is not hidden — device broadcasts its setup network constantly";
          return `cat: ${args}: No such file or directory`;
        },
        grep: (args: string) => {
          if (args.includes("passphrase") || args.includes("psk") || args.includes("wifi_key")) return "/etc/config/system:wifi_key=factorydefault123\n/etc/config/system:setup_psk=\n/etc/config/backup:wifi_passphrase=MyHomeNetwork2024!\n/etc/config/cloud:cloud_wifi_token=c10ud_53cr3t_k3y\n\n[WARNING] Multiple WiFi credentials found in plaintext across config files.\n[CRITICAL] Backup config contains what appears to be the user's home WiFi password.";
          return "No matches found.";
        },
        iw: (args: string) => {
          if (args.includes("scan")) return "BSS de:ad:be:ef:ca:fe(on wlan0)\n\tTSF: 1234567890 usec\n\tfreq: 2437\n\tcapability: ESS Privacy ShortPreamble ShortSlotTime (0x0431)\n\tsignal: -35.00 dBm\n\tSSID: SmartHome-Hub-5G\n\tRSN:\t * Version: 1\n\t\t * Group cipher: CCMP\n\t\t * Pairwise ciphers: CCMP\n\t\t * Authentication suites: PSK\n\t\t * Capabilities: 16-PTKSA-RC 1-GTKSA-RC (0x000c)\n\t\t * 0x0028: Management Frame Protection NOT required\n\nBSS aa:bb:cc:dd:ee:ff(on wlan0)\n\tSSID: SmartHome-Setup\n\tcapability: ESS ShortPreamble (0x0021)\n\tsignal: -30.00 dBm\n\t[NO ENCRYPTION DETECTED - OPEN NETWORK]";
          return "Usage: iw dev <interface> scan";
        },
        airmon: (args: string) => {
          if (args.includes("check") || args === "") return "Found 3 processes that could cause trouble:\n  PID Name\n  452 wpa_supplicant\n  489 NetworkManager\n  512 dhclient\n\n[INFO] airmon-ng is used to put WiFi interfaces into monitor mode.\n[INFO] Monitor mode allows capturing ALL WiFi frames in range,\n       not just those addressed to your device.\n[INFO] Usage: airmon-ng start wlan0 (enables monitor mode)\n[NOTE] This is for educational purposes — only monitor networks you own.";
          return "Usage: airmon-ng [check|start|stop] <interface>";
        },
        "airmon-ng": (args: string) => {
          if (args.includes("check") || args === "") return "Found 3 processes that could cause trouble:\n  PID Name\n  452 wpa_supplicant\n  489 NetworkManager\n  512 dhclient\n\n[INFO] airmon-ng is used to put WiFi interfaces into monitor mode.\n[INFO] Monitor mode allows capturing ALL WiFi frames in range,\n       not just those addressed to your device.\n[INFO] Usage: airmon-ng start wlan0 (enables monitor mode)\n[NOTE] This is for educational purposes — only monitor networks you own.";
          return "Usage: airmon-ng [check|start|stop] <interface>";
        },
        help: () => "Available commands: iwconfig, cat, grep, iw, airmon-ng, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "You find that an IoT hub runs a fallback open WiFi network called 'Setup-Network' with no encryption. Why is this especially dangerous?",
      options: [
        { label: "A", value: "Open networks use too much battery power" },
        { label: "B", value: "Any device in range can connect, intercept traffic, and potentially access the hub's management interface" },
        { label: "C", value: "Open networks are faster and will overload the device's CPU" },
        { label: "D", value: "The SSID name reveals the manufacturer, which is a privacy concern but not a security issue" },
      ],
      correct: "B",
      explanation: "An open WiFi network with no encryption means anyone in radio range can connect without credentials. All traffic is transmitted in cleartext, enabling eavesdropping. If the hub's web management interface is accessible on this network (which it usually is for setup), an attacker could reconfigure the device, extract credentials, or pivot into the home network. Many IoT devices leave these setup networks active permanently instead of disabling them after initial configuration.",
    },
    output: "Today you learned how embedded devices handle WiFi — from plaintext credential storage to dangerous fallback networks — and why WiFi chip firmware is its own critical attack surface.",
    homework: [
      {
        title: "Building a Faraday Cage for ESP32 Reverse Engineering",
        url: "https://esp32-open-mac.be/posts/0003-faraday-cage/",
        description: "Practical guide to building a radio-isolated test environment for wireless security research using an ammo box and copper tape."
      },
      {
        title: "Remotely Compromise Devices Using Marvell Avastar Wi-Fi Bugs",
        url: "https://web.archive.org/web/20190119164529/https://embedi.org/blog/remotely-compromise-devices-by-using-bugs-in-marvell-avastar-wi-fi-from-zero-knowledge-to-zero-click-rce/",
        description: "Technical deep-dive into zero-click RCE via WiFi chip firmware — the Marvell Avastar vulnerability that affected millions of devices."
      }
    ],
  },
  {
    day: 45,
    title: "CAN Bus — Hacking Cars 101",
    hook: "In April 2023, security researcher Ken Tindell published a detailed analysis of how car thieves in London were stealing Toyota RAV4s in under two minutes. The technique? CAN injection. The thieves would pry open a headlight, unplug the connector, attach a small device (disguised as a Bluetooth speaker), and inject CAN bus messages that told the car's body control module to unlock the doors and disable the immobilizer. No key fob, no alarm triggered, no broken windows. The device cost about $10 in components. The vulnerability isn't a bug — it's a fundamental design flaw in CAN bus, a protocol designed in the 1980s when cars weren't connected to the internet and physical access meant you already had the keys. Today you'll learn how CAN bus works, why it has zero authentication, and how to read and send messages on a vehicle network.",
    lesson: [
      "CAN (Controller Area Network) bus is the nervous system of every modern vehicle. Designed by Bosch in 1986, it connects all the Electronic Control Units (ECUs) in a car: engine management, braking, steering, airbags, instrument cluster, door locks, and infotainment. Every ECU broadcasts messages on a shared bus, and every other ECU can hear everything. There is no authentication, no encryption, and no source verification.",
      "CAN messages are simple: each has an arbitration ID (11 or 29 bits, identifying the message type) and up to 8 bytes of data. When you press the brake pedal, the brake ECU sends a message with a specific ID and data bytes representing brake pressure. The instrument cluster listens for that ID and lights up the brake indicator. Any device on the bus can send any ID — there's nothing preventing a rogue device from sending fake brake messages.",
      "The tools for CAN bus research are surprisingly accessible. A $15 USB-to-CAN adapter (like the CANtact or a cheap MCP2515 module) connects your laptop to the OBD-II diagnostic port under the dashboard. Linux has built-in CAN support through SocketCAN. The commands candump (capture all traffic), cansend (inject individual messages), and cansniffer (watch for changing values) are all you need to start.",
      "The CAN injection attack that Tindell documented works because the bus trusts all messages equally. The attacker's device sends a 'key validated' message, and the body control module has no way to distinguish it from the real key fob ECU's signal. Defenses are emerging — CAN with HMAC authentication, Automotive Ethernet replacing CAN for critical systems, and intrusion detection systems that monitor for anomalous message patterns — but millions of vehicles on the road today have zero protection."
    ],
    exercise: {
      type: "terminal",
      prompt: "You have a CAN bus test bench with a simulated vehicle network. Connect via SocketCAN and analyze the traffic:\n• ip link set can0 type can bitrate 500000 && ip link set can0 up\n• candump can0\n• cansend can0 7DF#0201050000000000\n• candump can0 -n 5 -L\n• cansniffer can0\n• cansend can0 000#DEADBEEF",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        ip: (args: string) => {
          if (args.includes("can0") && args.includes("bitrate")) return "CAN interface can0 configured: bitrate 500000, sample-point 0.875\ncan0: link up";
          return "Usage: ip link set can0 type can bitrate <rate>";
        },
        candump: (args: string) => {
          if (args.includes("-n 5") || args.includes("-L")) return "  can0  7E8   [8]  04 41 05 7D 00 00 00 00   # Engine RPM response: 3200 RPM\n  can0  7E8   [8]  04 41 0C 1A F8 00 00 00   # Vehicle speed: 0 km/h\n  can0  7E8   [8]  04 41 05 82 00 00 00 00   # Coolant temp: 90°C\n  can0  420   [4]  00 00 00 00               # Brake released\n  can0  188   [8]  00 00 00 00 00 00 00 00   # Steering angle: center";
          if (args.includes("can0")) return "  can0  0C1   [8]  00 00 00 00 27 10 00 00   # Engine ECU: RPM=0, idle\n  can0  0B6   [4]  00 00 00 00               # Brake ECU: no braking\n  can0  188   [8]  00 00 00 00 00 00 00 00   # Steering: centered\n  can0  420   [4]  00 00 00 00               # Door status: all closed\n  can0  39E   [8]  40 00 00 00 00 00 00 00   # Immobilizer: armed\n  can0  621   [8]  00 FF 00 00 00 00 00 00   # Body control: locked\n  can0  3B3   [4]  00 64 00 00               # Battery: 100%, 12.6V\n  can0  0C1   [8]  00 00 00 00 27 10 00 00   # Engine ECU: RPM=0, idle\n  can0  4F1   [8]  0A 0B 0C 0D 0E 0F 10 11   # Infotainment data\n  can0  621   [8]  00 FF 00 00 00 00 00 00   # Body control: locked\n\n[INFO] 10 frames captured. IDs 0C1 and 621 repeat every 100ms.\n[NOTE] No authentication or MAC on any messages.\n       Any device on the bus can spoof any arbitration ID.";
          return "Usage: candump <interface> [-n count] [-L]";
        },
        cansend: (args: string) => {
          if (args.includes("7DF")) return "Sending OBD-II diagnostic request: PID 0x05 (Engine Coolant Temperature)\n  TX: can0  7DF   [8]  02 01 05 00 00 00 00 00\n  RX: can0  7E8   [8]  04 41 05 7D 00 00 00 00\n\n[DECODE] Response from ECU 0x7E8:\n  Service: 0x41 (Current Data Response)\n  PID 0x05: Engine Coolant Temperature\n  Value: 0x7D = 125 - 40 = 85°C";
          if (args.includes("000#DEADBEEF")) return "Sending CAN frame: ID=0x000 Data=DEADBEEF\n  TX: can0  000   [4]  DE AD BE EF\n\n[WARNING] CAN ID 0x000 has the HIGHEST priority on the bus.\n  This message will always win arbitration.\n  Used in CAN denial-of-service attacks (bus-off attack).\n  The bus accepted the frame with no authentication check.\n\n[ALERT] Some ECUs may interpret unknown high-priority\n  frames as error conditions. Monitor bus health.";
          if (args.includes("621")) return "Sending CAN frame: ID=0x621 (Body Control)\n  TX: can0  621   [8]  01 00 00 00 00 00 00 00\n\n[SIMULATION] Door lock ECU received unlock command.\n  Doors: UNLOCKED\n  No authentication was required.\n  This demonstrates CAN injection — any node can\n  impersonate the body control module.";
          return "Usage: cansend <interface> <can_id>#<data>";
        },
        cansniffer: (args: string) => {
          if (args.includes("can0")) return "cansniffer - CAN bus sniffer (showing changing bytes)\n\n  ID    DATA (changing bytes highlighted)\n  0C1   00 00 00 00 [27 10] 00 00    # RPM fluctuating at idle\n  0B6   [00] 00 00 00                 # Brake pressure: 0\n  188   00 [00 03] 00 00 00 00 00     # Slight steering input detected\n  420   [00] 00 00 00                 # Door: closed→opening\n  39E   [40] 00 00 00 00 00 00 00     # Immobilizer status changing\n  621   [00 FF] 00 00 00 00 00 00     # Lock state toggling\n  3B3   00 [63] 00 00                 # Battery dropping: 99%\n\n[INFO] cansniffer highlights bytes that change between frames.\n  This helps identify which CAN IDs correspond to physical actions.\n  Press a button → watch which IDs change → map the function.";
          return "Usage: cansniffer <interface>";
        },
        help: () => "Available commands: ip, candump, cansend, cansniffer, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "Why is CAN injection possible on most modern vehicles?",
      options: [
        { label: "A", value: "CAN bus uses strong encryption but the keys have been leaked online" },
        { label: "B", value: "CAN bus has no message authentication — any device on the bus can send any message ID, and receivers cannot verify the sender" },
        { label: "C", value: "CAN bus requires physical access to the ECU chip itself, making it impractical for real attacks" },
        { label: "D", value: "CAN bus is only used for entertainment systems, not for safety-critical functions like door locks" },
      ],
      correct: "B",
      explanation: "CAN bus was designed in 1986 when 'security through obscurity' was the assumption — if you could physically access the wiring, you already had the car keys. The protocol has zero authentication: any node can transmit any arbitration ID, and receivers trust all messages equally. The 2023 headlight-connector attack proved that physical access points are easily reachable by thieves. Modern solutions like CAN-FD with HMAC authentication exist but aren't deployed in most vehicles on the road.",
    },
    output: "Today you learned how CAN bus works, why its lack of authentication makes vehicle networks vulnerable, and how to capture, analyze, and inject CAN messages using SocketCAN tools.",
    homework: [
      {
        title: "CAN Injection: Keyless Car Theft",
        url: "https://kentindell.github.io/2023/04/03/can-injection/",
        description: "Ken Tindell's detailed analysis of how car thieves use CAN injection via the headlight connector to steal vehicles in under two minutes."
      },
      {
        title: "Car Hacker's Handbook",
        url: "https://nostarch.com/carhacking",
        description: "The definitive guide to vehicle security research — covers CAN bus, OBD-II, ECU hacking, and building your own test bench."
      },
      {
        title: "How to Hack a Car — A Quick Crash-Course",
        url: "https://www.freecodecamp.org/news/hacking-cars-a-guide-tutorial-on-how-to-hack-a-car-5eafcfbbb7ec",
        description: "Beginner-friendly introduction to automotive hacking covering CAN bus fundamentals, tools, and hands-on exercises."
      }
    ],
  },
  {
    day: 46,
    title: "NFC & Smart Home Protocols",
    hook: "In 2022, security researchers at NCC Group demonstrated that they could relay an NFC signal from a Tesla Model 3's key card to unlock and start the car — from hundreds of miles away. The attack used two cheap Bluetooth devices: one near the owner's key card (in their pocket at a restaurant) and one near the car. The car thought the key was right next to it. NFC was designed for tap-to-pay, tap-to-unlock, short-range convenience. But 'short range' doesn't mean 'secure.' Meanwhile, smart home protocols like Zigbee and Z-Wave are controlling millions of light bulbs, door locks, and thermostats — often with encryption keys shared across the entire mesh network. Today you'll explore the attack surface of the protocols that make your home 'smart.'",
    lesson: [
      "NFC (Near Field Communication) operates at 13.56 MHz with a theoretical range of about 4 inches. It's used in contactless payments, access badges, key cards, and transit passes. NFC has three modes: reader/writer (your phone reads an NFC tag), peer-to-peer (two devices exchange data), and card emulation (your phone acts as a contactless card). The security assumption is proximity — if you're close enough to tap, you must be authorized. Relay attacks shatter this assumption.",
      "Zigbee is a mesh networking protocol used by smart home devices: Philips Hue bulbs, Samsung SmartThings sensors, Amazon Echo Plus. It operates on 2.4 GHz and uses 128-bit AES encryption. The catch? Many Zigbee implementations use a well-known default 'trust center link key' (ZigbeeAlliance09) for initial pairing. If an attacker captures the pairing exchange, they can derive the network key and decrypt all traffic.",
      "Z-Wave is another smart home mesh protocol, operating on sub-GHz frequencies (908 MHz in the US). Z-Wave S2 (the current security framework) uses Diffie-Hellman key exchange and AES-128 encryption. However, many devices still support S0 (the legacy protocol) as a fallback, which uses a known key of all zeros during pairing. An attacker who forces a device to downgrade from S2 to S0 can intercept the network key.",
      "The smart home attack surface is enormous: sniffing Zigbee traffic with a $20 CC2531 USB dongle, replaying Z-Wave commands with an RTL-SDR, cloning NFC badges with a Proxmark3, and exploiting the cloud APIs that bridge these protocols to the internet. When a vulnerability exists in a smart home hub, it often grants access to every device on the mesh — locks, cameras, alarms, and thermostats. Research from Kaspersky demonstrated that even smart pet feeders can be compromised to extract WiFi credentials and spy on owners through built-in cameras."
    ],
    exercise: {
      type: "choice",
      prompt: "A penetration tester discovers that a corporate building uses NFC access badges with MIFARE Classic chips. After reading one badge with a Proxmark3, they find the default encryption keys were never changed. What attack is now possible?",
      choices: [
        "Denial of service against the NFC readers by sending malformed packets",
        "Cloning the badge to create a duplicate that grants the same access level",
        "Injecting SQL commands through the NFC data field into the backend database",
        "Overwriting the reader's firmware through the NFC interface"
      ],
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "B") {
          return { correct: true, hint: "Correct! MIFARE Classic with default keys can be fully read and cloned. The Proxmark3 can read all sectors of the card and write an identical copy to a blank card. The door reader cannot distinguish the clone from the original. This is why organizations should use MIFARE DESFire or newer cards with diversified keys." };
        }
        if (choice === "A") {
          return { correct: false, hint: "While NFC DoS is possible, the much more impactful attack with full key access is cloning — creating a physical duplicate of the badge that opens all the same doors." };
        }
        if (choice === "C") {
          return { correct: false, hint: "NFC data fields don't typically interact with SQL databases directly. The reader checks the card's UID and stored credentials against a local or networked access control system." };
        }
        if (choice === "D") {
          return { correct: false, hint: "NFC readers don't accept firmware updates through the contactless interface. The critical threat with readable badge data is physical cloning." };
        }
        return { correct: false, hint: "Choose A, B, C, or D." };
      },
    },
    quiz: {
      question: "What makes Zigbee's default trust center link key a security risk?",
      options: [
        { label: "A", value: "It uses 256-bit encryption which is too slow for IoT devices" },
        { label: "B", value: "The default key (ZigbeeAlliance09) is publicly known, allowing attackers who capture the pairing process to derive the network encryption key" },
        { label: "C", value: "Zigbee doesn't use encryption at all — all traffic is plaintext" },
        { label: "D", value: "The key is stored on a cloud server that can be hacked" },
      ],
      correct: "B",
      explanation: "Zigbee uses a well-known default trust center link key ('ZigbeeAlliance09') during device pairing. If an attacker sniffs the pairing exchange with a $20 CC2531 dongle, they can use this known key to decrypt the session and extract the actual network key. Once they have the network key, they can decrypt all Zigbee traffic on the mesh. The fix is to use Zigbee 3.0's 'install code' method, which generates a unique per-device key, but many devices still use the default.",
    },
    output: "Today you learned how NFC relay attacks break the proximity assumption, how Zigbee and Z-Wave encryption can be undermined by default keys and downgrade attacks, and why smart home protocols create an interconnected attack surface.",
    homework: [
      {
        title: "The ABCs of NFC Chip Security",
        url: "https://research.nccgroup.com/2021/08/30/the-abcs-of-nfc-chip-security/",
        description: "NCC Group's comprehensive overview of NFC security — covers MIFARE Classic weaknesses, relay attacks, and chip-level protections."
      },
      {
        title: "Security Problems in Smart Pet Feeders",
        url: "https://securelist.com/smart-pet-feeder-vulnerabilities/110028/",
        description: "Kaspersky researchers found critical vulnerabilities in popular smart pet feeders — WiFi credential theft, camera access, and feeding schedule manipulation."
      },
      {
        title: "Philips Hue Bridge Investigations",
        url: "https://gh0stshell.cc/philips-hue-bridge-investigations-part-i",
        description: "Deep dive into the Zigbee-based Philips Hue ecosystem — firmware extraction, protocol analysis, and vulnerability discovery."
      }
    ],
  },
  {
    day: 47,
    title: "Automotive Deep Dive — ECUs, OBD-II, and Vehicle Networks",
    hook: "In 2021, a French security researcher named P1kachu bought a 1997 Honda Civic with a 30-year-old ECU. He desoldered the ROM chip, read the firmware, and reverse-engineered the entire engine management system — fuel injection tables, ignition timing maps, and the diagnostic protocol. The ECU used an OKI microprocessor that was obsolete before most of today's researchers were born. But the techniques he used — chip-off, disassembly, protocol analysis — are identical to what modern automotive researchers apply to brand-new vehicles. Cars are just embedded systems on wheels, and every generation builds on the same foundations. Today you'll dive deeper into automotive architecture: how ECUs communicate, what OBD-II reveals, and how researchers map the electronic nervous system of a vehicle.",
    lesson: [
      "A modern vehicle contains 70-100 ECUs (Electronic Control Units), each responsible for a specific subsystem: the Engine Control Module (ECM) manages fuel injection and ignition, the Transmission Control Module (TCM) handles gear shifts, the Body Control Module (BCM) controls lights, locks, and windows, and the Airbag Control Module processes crash sensor data. These ECUs are connected via multiple CAN buses — typically a high-speed bus (500 kbps) for powertrain and a low-speed bus (125 kbps) for body electronics.",
      "OBD-II (On-Board Diagnostics) is a standardized diagnostic interface required on all vehicles sold in the US since 1996. The OBD-II port (a 16-pin connector usually under the dashboard) provides access to the vehicle's CAN bus. Using a $10 ELM327 adapter and free software, anyone can read diagnostic trouble codes (DTCs), monitor real-time sensor data (RPM, speed, temperature, fuel trim), and clear warning lights. For a researcher, it's the front door to the vehicle network.",
      "Diagnostic protocols over OBD-II include UDS (Unified Diagnostic Services), which is the modern standard for ECU communication. UDS uses service IDs: 0x10 (Diagnostic Session Control), 0x22 (Read Data By Identifier), 0x27 (Security Access — challenge-response authentication), 0x2E (Write Data), and 0x31 (Routine Control). The Security Access service (0x27) is particularly interesting — many ECUs use weak seed-key algorithms that researchers have broken, granting full read/write access to ECU memory.",
      "Modern vehicles also use Automotive Ethernet (100BASE-T1) for high-bandwidth connections like cameras and infotainment, and LIN (Local Interconnect Network) for simple sensors like rain detectors and seat controls. The trend is toward centralized architectures — fewer, more powerful ECUs connected by Ethernet instead of dozens of simple ECUs on CAN. But the transition is slow, and the attack surface of today's vehicles spans multiple protocols, each with its own security weaknesses."
    ],
    exercise: {
      type: "terminal",
      prompt: "You're connected to a vehicle's OBD-II port with a CAN adapter. Use diagnostic commands to explore the vehicle network:\n• obd2scan can0\n• obd2read can0 --pid 010C\n• obd2read can0 --pid 0105\n• obd2dtc can0 --read\n• obd2uds can0 --service 0x22 --did 0xF190\n• obd2uds can0 --service 0x27 --analyze",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        obd2scan: (args: string) => {
          if (args.includes("can0")) return "OBD-II ECU Scan on can0\n================================\nScanning standard OBD-II address range (0x7E0-0x7EF)...\n\n  ECU 0x7E0 → 0x7E8  Engine Control Module (ECM)\n    Supported PIDs: 01-20, 21-40, 41-60\n    Protocol: ISO 15765-4 (CAN 500kbps, 11-bit)\n    Calibration ID: TC_ECM_V3.2.1_2022\n\n  ECU 0x7E1 → 0x7E9  Transmission Control Module (TCM)\n    Supported PIDs: 01-20\n    Protocol: ISO 15765-4\n\n  ECU 0x7E2 → 0x7EA  Body Control Module (BCM)\n    Supported PIDs: 01-20\n    Protocol: ISO 15765-4\n    [NOTE] BCM responds to UDS commands on extended diagnostic session\n\n  ECU 0x7E3 → 0x7EB  Airbag Control Module (ACM)\n    Supported PIDs: limited\n    Protocol: ISO 15765-4\n    [NOTE] Security Access (0x27) required for most operations\n\nTotal: 4 ECUs found responding on OBD-II.";
          return "Usage: obd2scan <interface>";
        },
        obd2read: (args: string) => {
          if (args.includes("010C")) return "OBD-II PID 0x010C: Engine RPM\n  Request:  7DF#02010C0000000000\n  Response: 7E8#04410C0FA000000000\n\n  Raw value: 0x0FA0 = 4000\n  Calculated: 4000 / 4 = 1000.0 RPM\n\n  Engine is idling at 1000 RPM.";
          if (args.includes("0105")) return "OBD-II PID 0x0105: Engine Coolant Temperature\n  Request:  7DF#0201050000000000\n  Response: 7E8#0341057D00000000\n\n  Raw value: 0x7D = 125\n  Calculated: 125 - 40 = 85°C\n\n  Normal operating temperature.";
          if (args.includes("010D")) return "OBD-II PID 0x010D: Vehicle Speed\n  Response: 7E8#03410D0000000000\n  Value: 0 km/h (vehicle stationary)";
          return "Usage: obd2read <interface> --pid <PID_hex>";
        },
        obd2dtc: (args: string) => {
          if (args.includes("--read")) return "OBD-II Diagnostic Trouble Codes\n================================\n  ECU 0x7E0 (ECM):\n    P0300 - Random/Multiple Cylinder Misfire Detected\n    P0171 - System Too Lean (Bank 1)\n    [2 active DTCs]\n\n  ECU 0x7E2 (BCM):\n    B1234 - Interior Lamp Circuit Short\n    U0100 - Lost Communication with ECM\n    [2 stored DTCs, currently inactive]\n\n  ECU 0x7E3 (ACM):\n    [Access Denied - Security Access required]\n\nTotal: 4 DTCs found (2 active, 2 stored).\n\n[NOTE] DTC P0300 + P0171 together may indicate a vacuum leak\n       or failing mass air flow sensor.";
          return "Usage: obd2dtc <interface> --read";
        },
        obd2uds: (args: string) => {
          if (args.includes("0x22") && args.includes("0xF190")) return "UDS Service 0x22: Read Data By Identifier\n  DID: 0xF190 (Vehicle Identification Number)\n  Request:  7E0#0322F19000000000\n  Response: 7E8#1062F190574241...\n\n  VIN: WBA12345678901234\n  Manufacturer: BMW\n  Model Year: 2022\n  Plant: Dingolfing, Germany\n\n[INFO] VIN is readable without security access on most vehicles.\n  This is intentional — diagnostic tools need it for identification.\n  But it also means any OBD-II device can read the VIN.";
          if (args.includes("0x27") && args.includes("analyze")) return "UDS Service 0x27: Security Access Analysis\n================================\nPhase 1: Requesting seed from ECM (0x7E0)...\n  Request:  7E0#0227010000000000\n  Response: 7E8#0667010A1B2C3D00\n\n  Seed received: 0A 1B 2C 3D\n\nPhase 2: Analyzing seed-key algorithm...\n  Collected 10 seed-response pairs.\n  Pattern analysis:\n    Seed[0] XOR 0xFF = Key[0]\n    Seed[1] XOR 0xFF = Key[1]\n    Seed[2] XOR 0xFF = Key[2]\n    Seed[3] XOR 0xFF = Key[3]\n\n  [CRITICAL] Security Access uses simple XOR with fixed mask 0xFF.\n  Algorithm is trivially reversible.\n  Any seed can be answered correctly.\n\n  Computed key: F5 E4 D3 C2\n  Sending key...\n  Response: 7E8#0267020000000000\n\n  [SUCCESS] Security Access GRANTED.\n  ECU is now in authenticated diagnostic session.\n  Read/Write memory access is available.";
          return "Usage: obd2uds <interface> --service <hex> --did <hex> | --analyze";
        },
        help: () => "Available commands: obd2scan, obd2read, obd2dtc, obd2uds, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "A researcher collects multiple seed-key pairs from a vehicle ECU's Security Access service (UDS 0x27) and discovers the key is always the bitwise NOT of the seed. Why is this a critical vulnerability?",
      options: [
        { label: "A", value: "The algorithm is standard and all ECUs use the same one, which is publicly documented" },
        { label: "B", value: "A predictable seed-key algorithm means anyone with OBD-II access can bypass authentication and gain full ECU read/write access" },
        { label: "C", value: "The seeds are too long, causing buffer overflows in the ECU" },
        { label: "D", value: "Bitwise NOT is computationally expensive and could crash the ECU" },
      ],
      correct: "B",
      explanation: "UDS Security Access (service 0x27) is the gatekeeper for sensitive ECU operations like reading/writing memory and flashing firmware. If the seed-key algorithm is predictable (like simple XOR or NOT), an attacker can compute the correct key for any seed and bypass authentication entirely. This grants access to reprogram the ECU, disable safety features, manipulate odometer readings, or extract proprietary calibration data. Strong implementations use HMAC or AES-based algorithms with unique per-ECU secret keys.",
    },
    output: "Today you learned the architecture of vehicle networks — how ECUs communicate via CAN bus, what OBD-II diagnostic services reveal, and how weak Security Access algorithms can grant full control over a vehicle's electronic systems.",
    homework: [
      {
        title: "A Tour of Automotive Systems from 20 Years Ago",
        url: "http://p1kachu.pluggi.fr/project/automotive/2018/12/28/subaru-ssm1/",
        description: "P1kachu reverse-engineers the SSM1 diagnostic protocol on a 1990s Subaru — proving that automotive hacking fundamentals haven't changed in decades."
      },
      {
        title: "Dumping Old ECUs (Honda P30 Analysis)",
        url: "http://p1kachu.pluggi.fr/project/automotive/2021/05/30/honda-oki-part1/",
        description: "Deep dive into desoldering and reverse-engineering a Honda ECU's OKI microprocessor — chip-off, disassembly, and fuel map extraction."
      },
      {
        title: "How I Also Hacked My Car",
        url: "https://goncalomb.com/blog/2024/01/30/f57cf19b-how-i-also-hacked-my-car",
        description: "A hands-on account of connecting to a personal vehicle's CAN bus, reverse-engineering message IDs, and building custom diagnostic tools."
      }
    ],
  },
  {
    day: 48,
    title: "Fault Injection — Glitching Hardware to Break Security",
    hook: "In late 2024, security researcher Courk announced that he had bypassed the Raspberry Pi RP2350's hardware security using a laser fault injection attack. The RP2350 was designed with glitch detectors, redundant boot checks, and anti-tamper mechanisms — Raspberry Pi even ran a public $20,000 bounty challenging researchers to break it. Courk focused a precision laser on the chip's die, firing nanosecond pulses timed to the exact clock cycle when the secure boot signature was being verified. One well-placed photon disrupted a single transistor, flipping the verification result from 'fail' to 'pass.' The chip booted unsigned firmware, believing it was legitimate. This is fault injection: instead of finding a software bug, you break the hardware's physics to make it lie. Today you'll learn the four main types and when each is used.",
    lesson: [
      "Fault injection (also called 'glitching') works by disrupting a chip's normal operation at a precise moment to cause it to skip instructions, corrupt comparisons, or produce wrong computation results. The goal is usually to bypass a security check — secure boot verification, PIN comparison, encryption key validation — by causing the CPU to behave incorrectly for one critical clock cycle. It's the hardware equivalent of a race condition.",
      "There are four main types of fault injection. Voltage glitching is the most accessible: you briefly drop or spike the chip's power supply voltage during a critical operation, causing transistors to switch incorrectly. Tools like the ChipWhisperer ($50-$250) automate this. Clock glitching injects extra clock edges or shortens clock periods, causing the CPU to execute instructions before data has stabilized. Both voltage and clock glitching are non-invasive — you don't need to open the chip package.",
      "Electromagnetic fault injection (EMFI) uses a focused electromagnetic pulse from a probe placed near the chip's surface to induce currents in specific circuit paths. It's more targeted than voltage glitching because you can aim at particular functional blocks on the die. Laser fault injection is the most precise: a focused laser beam hits individual transistors through the chip's silicon substrate (from the back side after thinning). It can flip single bits with nanosecond precision, but requires expensive equipment ($50,000+) and chip decapsulation.",
      "Practical fault injection follows a pattern: (1) identify the target operation (e.g., 'if signature_valid then boot'), (2) determine the timing (when does this check happen relative to a trigger signal like a power-on or command), (3) sweep parameters (glitch voltage, duration, and offset) to find the 'sweet spot,' and (4) verify the effect (did the chip skip the check?). Tools like the ChipWhisperer Husky include both the glitching hardware and a Python framework for automated parameter sweeping. Research groups like Riscure and NCC Group use these techniques to evaluate smartcard, automotive ECU, and secure element security."
    ],
    exercise: {
      type: "choice",
      prompt: "You need to bypass the secure boot check on an IoT device's ARM Cortex-M processor. The device costs $15, you have a $250 budget for tools, and you don't have a clean room or chip decapsulation equipment. Which fault injection technique is most appropriate?",
      choices: [
        "Laser fault injection — aim at the boot ROM transistors to flip the verification bit",
        "Voltage glitching with a ChipWhisperer — brief power supply disruption during the signature check",
        "Electromagnetic fault injection with a precision XYZ stage and custom EM probe",
        "Clock glitching by modifying the external crystal oscillator circuit on the PCB"
      ],
      validator: (input: string) => {
        const choice = input.trim().toUpperCase();
        if (choice === "B") {
          return { correct: true, hint: "Correct! Voltage glitching with a ChipWhisperer is the most practical approach given your constraints. It's non-invasive (no chip decapsulation needed), within budget ($50-$250 for a ChipWhisperer Nano/Husky), and well-documented for ARM Cortex-M targets. The ChipWhisperer Python framework provides automated parameter sweeping to find the right glitch timing and voltage." };
        }
        if (choice === "A") {
          return { correct: false, hint: "Laser fault injection requires decapsulating the chip (removing the package to expose the die) and equipment costing $50,000+. Way beyond a $250 budget and requires a clean room environment." };
        }
        if (choice === "C") {
          return { correct: false, hint: "EMFI with a precision XYZ stage is effective but typically costs $5,000-$15,000 for the stage and probe setup. It's used in professional labs, not for budget research." };
        }
        if (choice === "D") {
          return { correct: false, hint: "Clock glitching is viable but tricky on ARM Cortex-M devices since many use internal oscillators or PLLs for the core clock. Voltage glitching is more reliable because it directly affects the CPU's power rail regardless of clock source." };
        }
        return { correct: false, hint: "Choose A, B, C, or D. Consider cost, equipment needs, and practicality for your scenario." };
      },
    },
    quiz: {
      question: "A voltage glitch causes a microcontroller to skip the 'branch if not equal' instruction that would reject an invalid secure boot signature. What happens next?",
      options: [
        { label: "A", value: "The chip detects the glitch and triggers a full reset as a countermeasure" },
        { label: "B", value: "The chip crashes and becomes permanently bricked" },
        { label: "C", value: "The chip continues executing as if the signature was valid, booting the unsigned firmware" },
        { label: "D", value: "The chip enters a debug mode that requires JTAG authentication" },
      ],
      correct: "C",
      explanation: "When a voltage glitch causes the CPU to skip the conditional branch instruction ('BNE fail' becomes a NOP), execution falls through to the 'success' path. The chip proceeds to boot the firmware as if the signature check passed. This is why fault injection is so powerful — you don't need to forge a valid signature, you just need the CPU to skip the check entirely. Countermeasures include redundant checks, instruction flow monitoring, and glitch detection circuits, but as the RP2350 laser attack showed, even multiple layers of defense can be defeated with sufficient precision.",
    },
    output: "Today you learned the four types of fault injection — voltage glitching, clock glitching, electromagnetic, and laser — and how attackers use precisely timed hardware disruptions to bypass security checks that are mathematically unbreakable in software.",
    homework: [
      {
        title: "An Introduction to Fault Injection",
        url: "https://www.nccgroup.com/us/research-blog/an-introduction-to-fault-injection-part-13/",
        description: "NCC Group's comprehensive three-part series covering the theory, practice, and tools of hardware fault injection."
      },
      {
        title: "Laser Fault Injection on RP2350",
        url: "https://courk.cc/rp2350-challenge-laser",
        description: "Courk's write-up on bypassing the Raspberry Pi RP2350's secure boot using laser fault injection — the attack that claimed the $20,000 bounty."
      },
      {
        title: "FaultyCat Introduction",
        url: "https://rossmarks.uk/blog/faultycat-introduction/",
        description: "Introduction to the FaultyCat open-source voltage glitching tool — a budget-friendly entry point for learning fault injection."
      }
    ],
  },
  {
    day: 49,
    title: "Week 7 Capstone — IoT Protocol Analysis Challenge",
    hook: "You've spent this week learning the wireless and automotive protocols that connect billions of devices: BLE smartbands leaking health data, WiFi chips with zero-click vulnerabilities, CAN buses with no authentication, NFC cards that can be cloned, and smart home meshes secured by publicly known keys. Each protocol was designed for a specific purpose — low power, short range, real-time control — and security was an afterthought in every case. Today you'll tie it all together in a multi-protocol analysis challenge. A fictional smart building has BLE sensors, a Zigbee mesh, CAN-connected HVAC, and NFC access control. Your job: find the vulnerabilities across protocols and trace how an attacker could chain them together to compromise the entire building. This is how real IoT penetration tests work — the vulnerability is rarely in one protocol alone. It's in the gaps between them.",
    lesson: [
      "IoT protocol analysis starts with reconnaissance: what protocols are in use, what devices are visible, and what's being transmitted? In a smart building, you might find BLE beacons for indoor positioning, Zigbee for lighting and HVAC sensors, NFC for door access, WiFi for IP cameras and management interfaces, and CAN bus for industrial control systems. Each protocol has its own scanning tools, and a thorough assessment covers all of them.",
      "The real danger in IoT environments is protocol bridging — where a vulnerability in one protocol grants access to another. A compromised BLE sensor might share a network with a Zigbee hub that bridges to WiFi. The WiFi interface exposes a web management portal. The portal has a command injection vulnerability. Suddenly, a BLE exploit chains into full network access. Mapping these bridges is critical for understanding the true impact of any single vulnerability.",
      "Traffic analysis across protocols reveals patterns that individual protocol analysis misses. BLE advertisement intervals can fingerprint device types and firmware versions. CAN bus message frequencies reveal which ECUs are active and their operational states. Zigbee association patterns show when devices were last reset or re-paired (indicating maintenance windows). Correlating timestamps across captures from multiple protocols builds a complete picture of the environment.",
      "Professional IoT assessments produce protocol interaction maps: diagrams showing every device, every protocol it speaks, every bridge between networks, and every identified vulnerability. The deliverable isn't a list of individual bugs — it's an attack narrative showing how an adversary could chain discoveries across the RF spectrum to achieve their objective. Today's exercise simulates exactly that workflow."
    ],
    exercise: {
      type: "terminal",
      prompt: "You're performing a multi-protocol IoT assessment on a smart building. Analyze captured traffic from BLE, Zigbee, and CAN bus systems:\n• ble-analyze capture_lobby.pcap\n• zigbee-decode hvac_mesh.pcap\n• candump-replay building_can.log\n• nfc-audit access_badges.dump\n• protocol-map --correlate\n• attack-chain --summarize",
      placeholder: "$ ",
      validator: (_input: string) => {
        return { correct: true, hint: "" };
      },
      terminalCommands: {
        "ble-analyze": (args: string) => {
          if (args.includes("capture") || args.includes("pcap")) return "BLE Traffic Analysis: capture_lobby.pcap\n========================================\nDevices found: 14\n\n  [1] AA:BB:CC:01:02:03  SmartBadge-Reception (iBeacon)\n      Advertising interval: 1000ms\n      TX Power: -12 dBm\n      UUID: f7826da6-4fa2-4e98-8024-bc5b71e0893e\n      Major: 1, Minor: 101 (Floor 1, Zone 101)\n      [INFO] Broadcasting employee badge ID in advertisement data\n\n  [2] AA:BB:CC:04:05:06  EnvSensor-Lobby-T1\n      Services: Environmental Sensing (0x181A)\n      Temperature: 22.5°C (unencrypted read)\n      Humidity: 45% (unencrypted read)\n      [WARNING] Sensor data readable without pairing\n\n  [3] AA:BB:CC:07:08:09  SmartLock-ServerRoom\n      Services: Vendor Specific (0xFFF0)\n      Lock State: LOCKED\n      [CRITICAL] Lock command characteristic writable without auth\n      [CRITICAL] Same vulnerability as Day 43 smart lock pattern\n\n  ... 11 more devices (beacons, sensors, wearables)\n\nSummary: 3 critical findings, 5 warnings.";
          return "Usage: ble-analyze <capture_file.pcap>";
        },
        "zigbee-decode": (args: string) => {
          if (args.includes("hvac") || args.includes("pcap")) return "Zigbee Traffic Decode: hvac_mesh.pcap\n========================================\nNetwork: SmartBuilding-HVAC\nPAN ID: 0x1A2B\nChannel: 15 (2.425 GHz)\nEncryption: AES-128-CCM\n\n  [CRITICAL] Network key captured during device re-pair event:\n    Key: 5A:69:67:42:65:65:41:6C:6C:69:61:6E:63:65:30:39\n    ASCII: ZigBeeAlliance09 (DEFAULT TRUST CENTER KEY)\n\n  Decrypted traffic summary:\n    Node 0x0001 (Coordinator/Hub) → Bridge to WiFi at 192.168.1.50\n    Node 0x0012 (HVAC-Zone1) → Temperature setpoint: 72°F\n    Node 0x0013 (HVAC-Zone2) → Temperature setpoint: 68°F\n    Node 0x0020 (Door-Sensor-ServerRoom) → Status: CLOSED\n    Node 0x0021 (Motion-Sensor-Lobby) → Last trigger: 14:32:05\n\n  [CRITICAL] Hub bridges Zigbee mesh to IP network (192.168.1.50)\n  [WARNING] HVAC setpoints can be modified by any node with network key\n  [INFO] Door/motion sensor data exposes physical security patterns";
          return "Usage: zigbee-decode <capture_file.pcap>";
        },
        "candump-replay": (args: string) => {
          if (args.includes("building") || args.includes("log")) return "CAN Bus Replay Analysis: building_can.log\n========================================\nInterface: Building Management System (BMS) CAN bus\nBitrate: 250000\nFrames analyzed: 2,847\n\n  Identified subsystems:\n    ID 0x100-0x1FF  HVAC Controllers (12 units)\n    ID 0x200-0x2FF  Lighting Controllers (8 zones)\n    ID 0x300-0x3FF  Access Control System\n    ID 0x400-0x4FF  Fire/Safety Monitoring\n    ID 0x500-0x5FF  Elevator Control\n\n  [CRITICAL] ID 0x301: Door unlock command observed\n    Data: 01 03 00 00 00 00 00 00 (Server Room unlock)\n    No authentication or sequence number\n    Replay attack: inject this frame to unlock server room\n\n  [WARNING] ID 0x201: Lighting zone override\n    All-off command could be used for physical intrusion cover\n\n  [INFO] ID 0x501: Elevator floor commands visible\n    Could track personnel movement patterns\n\nSummary: 1 critical, 2 warnings, 1 informational.";
          return "Usage: candump-replay <log_file>";
        },
        "nfc-audit": (args: string) => {
          if (args.includes("badge") || args.includes("dump")) return "NFC Badge Audit: access_badges.dump\n========================================\nBadge type: MIFARE Classic 1K\nUID: 0x4A 0x3B 0x2C 0x1D\nSectors: 16 (1024 bytes total)\n\n  Sector 0 (Manufacturer):\n    UID + manufacturer data (read-only)\n\n  Sector 1-3 (Access Data):\n    [CRITICAL] Default keys used: FFFFFFFFFFFF\n    Employee ID: EMP-2024-0342\n    Access Level: 3 (General Access)\n    Zones: Lobby, Floors 1-3, Parking\n    [CRITICAL] No diversified keys — same key for all badges\n    [CRITICAL] Full clone possible with Proxmark3 in < 30 seconds\n\n  Sector 4-7 (Unused):\n    Blank sectors with default keys\n\n  [FINDING] Badge can be cloned to a blank MIFARE Classic card.\n  [FINDING] Access level byte at offset 0x14 — modify to 0xFF for\n            maximum access (all zones including server room).\n  [RECOMMENDATION] Migrate to MIFARE DESFire EV3 with per-card keys.";
          return "Usage: nfc-audit <badge_dump_file>";
        },
        "protocol-map": (args: string) => {
          if (args.includes("--correlate")) return "Protocol Interaction Map — Smart Building\n========================================\n\n  [NFC Badge] ─── Reader ──→ [Access Control CAN 0x300]\n       │                              │\n       │                              ├── Door Lock (CAN 0x301)\n       │                              └── Audit Log (CAN 0x302)\n       │\n  [BLE Sensors] ── Gateway ──→ [Cloud API]\n       │                              │\n       ├── SmartLock-ServerRoom       ├── Dashboard\n       └── EnvSensor-Lobby            └── Alerts\n       \n  [Zigbee HVAC] ── Hub ──→ [WiFi 192.168.1.50] ──→ [Corporate LAN]\n       │                              │\n       ├── HVAC Zones                 ├── Web Management (port 80)\n       ├── Door Sensors               └── API (port 8080)\n       └── Motion Sensors\n\n  [BMS CAN Bus] ── Gateway ──→ [Building Management PC]\n       │\n       ├── HVAC / Lighting / Access / Elevator\n       └── [NO AUTHENTICATION ON ANY BUS SEGMENT]\n\n  CRITICAL BRIDGE: Zigbee Hub → WiFi → Corporate LAN\n    Compromising the Zigbee network grants IP network access.";
          return "Usage: protocol-map --correlate";
        },
        "attack-chain": (args: string) => {
          if (args.includes("--summarize")) return "Attack Chain Analysis — Smart Building Compromise\n========================================\n\nChain 1: Physical Access via Badge Cloning\n  Step 1: Clone NFC badge with default MIFARE keys (30 seconds)\n  Step 2: Modify access level byte to gain server room access\n  Step 3: Server room contains BMS CAN bus junction box\n  Step 4: Inject CAN frame 0x301 to unlock additional doors\n  Impact: Full physical access to building\n\nChain 2: Network Pivot via Zigbee\n  Step 1: Capture Zigbee pairing with default trust center key\n  Step 2: Decrypt mesh traffic, identify hub IP bridge (192.168.1.50)\n  Step 3: Access hub web interface (default credentials likely)\n  Step 4: Pivot from hub to corporate LAN\n  Impact: Network access from parking lot with $20 antenna\n\nChain 3: Server Room Entry via BLE\n  Step 1: Write unlock command to SmartLock-ServerRoom BLE characteristic\n  Step 2: No authentication required — unlock from 30 feet away\n  Impact: Direct server room access without any badge or credential\n\n[COMBINED] Chains 2+3: Remote network access + physical server room\n  access = full building compromise without credentials.\n\n  Total cost of attack equipment: < $100\n  Time to execute: < 15 minutes";
          return "Usage: attack-chain --summarize";
        },
        help: () => "Available commands: ble-analyze, zigbee-decode, candump-replay, nfc-audit, protocol-map, attack-chain, help, clear",
        clear: () => "",
      },
    },
    quiz: {
      question: "In a multi-protocol IoT assessment, why is identifying 'protocol bridges' (devices that translate between protocols) the most critical step?",
      options: [
        { label: "A", value: "Protocol bridges are always the most expensive devices and worth stealing" },
        { label: "B", value: "A compromised bridge lets an attacker pivot from a low-security protocol (like BLE) to a high-value network (like corporate WiFi), multiplying the impact of any single vulnerability" },
        { label: "C", value: "Bridges generate the most network traffic, making them easiest to find" },
        { label: "D", value: "Protocol bridges are required by law to have public APIs for interoperability" },
      ],
      correct: "B",
      explanation: "Protocol bridges are the force multipliers in IoT attacks. A Zigbee hub that bridges to WiFi turns a $20 radio attack into a corporate network intrusion. A BLE-to-CAN gateway turns a smartphone exploit into a building control system compromise. Each bridge expands the attacker's reach across protocol boundaries. Without bridges, vulnerabilities are contained within their protocol domain. With bridges, a single weak link in any protocol can compromise everything connected to the mesh.",
    },
    output: "You completed Week 7! You now understand the wireless and automotive protocols that connect the IoT world: BLE, WiFi, CAN bus, NFC, Zigbee, Z-Wave, OBD-II, and fault injection. More importantly, you can analyze how vulnerabilities chain across protocols to create real-world attack scenarios.",
    homework: [
      {
        title: "HEXACON: 0-click RCE on Tesla Model 3",
        url: "https://youtu.be/k_F4wHc4h6k?si=pt-hU__FRPu8JyWM",
        description: "Synacktiv's HEXACON presentation on achieving zero-click remote code execution on a Tesla Model 3 — chaining WiFi, Bluetooth, and CAN bus vulnerabilities."
      },
      {
        title: "Jailbreaking Subaru StarLink",
        url: "https://github.com/sgayou/subaru-starlink-research/blob/master/doc/README.md",
        description: "Detailed research on breaking into Subaru's StarLink infotainment system — firmware extraction, root shell, and CAN bus access from the head unit."
      },
      {
        title: "Nullcon: IoT Hacking 101 — Xiaomi Ecosystem",
        url: "https://www.youtube.com/watch?v=zJ_67Yaeb70",
        description: "Comprehensive talk on attacking the Xiaomi smart home ecosystem — from BLE lightbulbs to WiFi cameras to Zigbee sensors, demonstrating cross-protocol attack chains."
      }
    ],
  },
];
