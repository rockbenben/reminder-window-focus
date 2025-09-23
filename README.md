# Bring Reminders to Front

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/rockbenben/bring-reminders-front?style=for-the-badge&sort=semver)](https://github.com/rockbenben/bring-reminders-front/releases/latest)
[![GitHub License](https://img.shields.io/github/license/rockbenben/bring-reminders-front?style=for-the-badge)](LICENSE)

🇺🇸 English | [🇨🇳 中文](README_zh.md)

## Description

When a reminder modal from the `obsidian-reminder` plugin appears, Bring Reminders to Front automatically brings the Obsidian window to the foreground and focuses the reminder modal container, ensuring you won't miss any reminders.

## ✨ Key Features

- 🔔 Smart detection: Recognizes reminder modals from the obsidian-reminder plugin
- 🪟 Auto bring-to-front: Brings Obsidian to the foreground when reminders appear
- ⏱️ Cooldown protection: Configurable minimum focus interval to avoid focus thrashing
- 🌐 Bilingual UI: Full English/Chinese support with auto detection

## 📦 Installation

### Method 1: From Obsidian Community Plugins (Not published yet)

1. Open Obsidian Settings (⚙️)
2. Navigate to Community Plugins
3. Disable Safe Mode if it's enabled
4. Click Browse and search for "Bring Reminders to Front"
5. Click Install then Enable

### Method 2: Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/rockbenben/bring-reminders-front/releases)
2. Extract the downloaded files
3. Copy the plugin folder to your vault's plugins directory:

   ```text
   YourVault/.obsidian/plugins/bring-reminders-front/
   ```

4. Restart Obsidian or reload plugins
5. Enable the plugin in Settings → Community Plugins

### Method 3: Using BRAT (Beta Reviewers Auto-update Tool)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. Open BRAT settings and click Add Beta Plugin
3. Enter the repository: rockbenben/bring-reminders-front
4. Click Add Plugin and enable it

## ⚙️ Configuration

Open Settings → Community Plugins → Bring Reminders to Front.

| Setting                | Description                                                         | Default     | Range                 |
| ---------------------- | ------------------------------------------------------------------- | ----------- | --------------------- |
| Minimum focus interval | Minimum time between consecutive focus actions (avoid focus thrash) | 10 seconds  | ≥ 1 second            |
| Detection interval     | Fallback periodic scan (Observer + initial scan are already used)   | 5000 ms     | ≥ 100 ms              |
| Language               | Interface language                                                  | Auto-detect | Auto / English / 中文 |

> Numeric inputs are optimized with min/step and validation to prevent invalid values.

### 🔧 Advanced Tips

- Lower detection interval (100–500 ms) = faster response, higher CPU
- Higher detection interval (≥ 2000 ms) = slower response, better efficiency
- Shorter focus interval (1–30 s) = for frequent reminders
- Longer focus interval (≥ 120 s) = less intrusive
- Recommendation: Detection interval ≤ focus interval for a better balance

## 🧰 How It Works

The plugin identifies reminder notifications with a lightweight detection flow:

1. Modal detection: Use MutationObserver to watch for new modal containers
2. Reminder identification: Check classes/markers/text traits to confirm reminder modals
3. Bring to front: Raise Obsidian window when necessary
4. Cooldown check: Ensure the minimum interval has elapsed since last focus
5. Focus execution: Set tabindex and focus the modal container with retries; scroll into view
6. State reset: Track processed modals and resume normal observation

## 🎯 Detection Logic

- Modal containers with reminder classes (e.g., .reminder-modal) or markers (e.g., [data-reminder])
- Real-time DOM MutationObserver + immediate initial scan + configurable periodic fallback
- Minimal text/aria patterns (e.g., Snooze / Done / "reminder"), without relying on innerHTML

## 🚀 Usage

1. Enable this plugin (Bring Reminders to Front)
2. Install and enable the obsidian-reminder plugin
3. Adjust Minimum Focus Interval / Detection Interval in settings as needed
4. Create a test reminder with obsidian-reminder
5. Wait for the reminder; the plugin runs automatically in the background
6. Observe: Obsidian is brought to front and the reminder modal container is focused

## 🐛 Troubleshooting

### Common Issues and Solutions

| Issue                  | Possible Cause                          | Solution                                 |
| ---------------------- | --------------------------------------- | ---------------------------------------- |
| Too frequent focusing  | Focus interval too short                | Increase Minimum Focus Interval          |
| High CPU usage         | Detection interval too low              | Increase Detection Interval (≥ 1000 ms)  |
| Not detecting          | obsidian-reminder not installed/enabled | Install and enable obsidian-reminder     |
| Language not switching | Cache/reload issue                      | Restart Obsidian after changing language |

### Debug Steps

1. Confirm both this plugin and obsidian-reminder are enabled
2. Test with a detection interval between 500–2000 ms
3. Validate with a simple reminder
4. Open devtools console to check for errors
5. Restart Obsidian if the issue persists

## 🛠️ Development

### Getting Started

```bash
# Clone the repository
git clone https://github.com/rockbenben/bring-reminders-front.git
cd bring-reminders-front

# Install dependencies
npm install

# Dev build with hot reload
npm run dev

# Production build
npm run build
```

### Project Structure

```text
bring-reminders-front/
├── main.ts              # Main plugin code
├── manifest.json        # Plugin manifest
├── package.json         # Node.js dependencies
├── tsconfig.json        # TypeScript configuration
├── esbuild.config.mjs   # Build configuration
└── README.md           # Documentation
```

### Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit with clear messages: `git commit -m "feat: describe the change"`
5. Push and open a Pull Request

## License

MIT

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

## Credits

- Thanks to the Obsidian team for the great platform
- Thanks to the obsidian-reminder plugin developers
