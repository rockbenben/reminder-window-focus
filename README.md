# Obsidian Reminder Focus Plugin

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/rockbenben/reminder-window-focus?style=for-the-badge&sort=semver)](https://github.com/rockbenben/reminder-window-focus/releases/latest)
[![GitHub License](https://img.shields.io/github/license/rockbenben/reminder-window-focus?style=for-the-badge)](LICENSE)

🇺🇸 English | [🇨🇳 中文](README_zh.md)

## Description

The **Reminder Window Focus** plugin automatically focuses and brings the Obsidian window to the front when a reminder notification from the `obsidian-reminder` plugin appears. This ensures you never miss important reminders, even when working in other applications or when Obsidian is running in the background.

## ✨ Key Features

- 🔔 **Smart Detection**: Intelligently detects reminder popups from the obsidian-reminder plugin
- 🪟 **Auto Window Focus**: Automatically brings Obsidian to the front when reminders appear
- ⏱️ **Cooldown Protection**: Prevents excessive window focusing with configurable time intervals
- 🌐 **Bilingual Interface**: Full support for English and Chinese languages with auto-detection
- ⚙️ **Customizable Settings**: Fine-tune detection intervals, focus timing, and behavior

## 📦 Installation

### Method 1: From Obsidian Community Plugins (Recommended)

1. Open Obsidian Settings (⚙️)
2. Navigate to **Community Plugins**
3. Disable **Safe Mode** if not already done
4. Click **Browse** and search for "Reminder Window Focus"
5. Click **Install** and then **Enable**

### Method 2: Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/rockbenben/reminder-window-focus/releases)
2. Extract the downloaded files
3. Copy the plugin folder to your vault's plugins directory:

   ```bash
   YourVault/.obsidian/plugins/reminder-window-focus/
   ```

4. Restart Obsidian or reload plugins
5. Enable the plugin in **Settings → Community Plugins**

### Method 3: Using BRAT (Beta Reviewers Auto-update Tool)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. Open BRAT settings and click **Add Beta Plugin**
3. Enter the repository URL: `rockbenben/reminder-window-focus`
4. Click **Add Plugin** and enable it

## ⚙️ Configuration

Access plugin settings via **Settings → Community Plugins → Reminder Window Focus**.

### Available Options

| Setting                    | Description                                    | Default     | Range              |
| -------------------------- | ---------------------------------------------- | ----------- | ------------------ |
| **Enable Window Focus**    | Toggle automatic window focusing on/off        | ✅ Enabled  | On/Off             |
| **Minimum Focus Interval** | Minimum time between consecutive focus actions | 60 seconds  | 1 second or higher |
| **Detection Interval**     | How often to check for reminder modals         | 10000ms     | 100ms or higher    |
| **Language**               | Interface language setting                     | Auto-detect | Auto/English/中文  |

### 🔧 Advanced Configuration Tips

- **Lower detection intervals** (100-500ms) = More responsive but higher CPU usage
- **Higher detection intervals** (2000ms+) = Less responsive but better performance, saves battery
- **Shorter focus intervals** (1-30s) = More frequent focusing for heavy reminder users
- **Longer focus intervals** (120s+) = Less intrusive, can be set to hours for minimal interruption
- **Recommended**: Set detection interval ≤ focus interval for optimal performance

## 🔧 How It Works

The plugin uses intelligent detection mechanisms to identify reminder notifications:

1. **Modal Detection**: Continuously monitors for new modal windows in Obsidian
2. **Reminder Identification**: Analyzes modal content to identify reminder-specific elements
3. **Window State Check**: Verifies if Obsidian window is currently focused
4. **Cooldown Verification**: Ensures minimum interval has passed since last focus action
5. **Focus Execution**: Brings Obsidian window to front temporarily when conditions are met
6. **State Reset**: Returns to normal monitoring state after successful focus

### 🎯 Detection Logic

The plugin identifies reminder modals by looking for:

- Modal containers with reminder-specific classes
- Elements containing reminder text patterns
- Specific DOM structures used by obsidian-reminder plugin
- Time-based elements and reminder content

## 📋 Requirements

| Requirement      | Version/Details                              |
| ---------------- | -------------------------------------------- |
| **Obsidian**     | v0.15.0 or higher                            |
| **Platform**     | Desktop only (Windows, macOS, Linux)         |
| **Dependencies** | `obsidian-reminder` plugin must be installed |
| **Permissions**  | Window focus capabilities (automatic)        |

> **Note**: This plugin is designed specifically for desktop environments and will not function on mobile devices.

## 🚀 Usage

1. **Install and Enable**: Follow the installation steps above
2. **Install obsidian-reminder**: Ensure the companion reminder plugin is installed
3. **Configure Settings**: Adjust timing and behavior in plugin settings
4. **Create Reminders**: Use obsidian-reminder to create time-based reminders
5. **Work Normally**: The plugin works automatically in the background
6. **Experience Focus**: When reminders appear, Obsidian will automatically come to front

### 💡 Best Practices

- **Set appropriate intervals**: Balance responsiveness with system performance
- **Test your setup**: Create a test reminder to verify the plugin works correctly
- **Monitor performance**: Adjust detection intervals if you notice any system slowdown
- **Use cooldown wisely**: Longer cooldowns prevent excessive window switching

## 🐛 Troubleshooting

### Common Issues and Solutions

| Issue                   | Possible Cause                  | Solution                                    |
| ----------------------- | ------------------------------- | ------------------------------------------- |
| Window not focusing     | Plugin disabled                 | Check plugin is enabled in settings         |
| Too frequent focusing   | Short cooldown interval         | Increase minimum focus interval             |
| High CPU usage          | Low detection interval          | Increase detection interval (1000ms+)       |
| Not detecting reminders | obsidian-reminder not installed | Install and enable obsidian-reminder plugin |
| Language not changing   | Cache issues                    | Restart Obsidian after language change      |

### Debug Steps

1. Check that both plugins are enabled
2. Verify detection interval is reasonable (500-2000ms)
3. Test with a simple reminder
4. Check browser console for error messages
5. Restart Obsidian if issues persist

## 🛠️ Development

### Getting Started

```bash
# Clone the repository
git clone https://github.com/rockbenben/reminder-window-focus.git
cd reminder-window-focus

# Install dependencies
npm install

# Build in development mode (with hot reload)
npm run dev

# Build for production
npm run build
```

### Project Structure

```text
reminder-window-focus/
├── main.ts              # Main plugin code
├── manifest.json        # Plugin manifest
├── package.json         # Node.js dependencies
├── tsconfig.json        # TypeScript configuration
├── esbuild.config.mjs   # Build configuration
└── README.md           # Documentation
```

### Development Guidelines

- Follow TypeScript best practices
- Maintain bilingual support (English/Chinese)
- Test with various reminder scenarios
- Keep performance impact minimal
- Document any API changes

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add: feature description"`
5. Push and create a Pull Request

## License

MIT

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

## Credits

- Thanks to the Obsidian team for the amazing platform
- Thanks to the obsidian-reminder plugin developers
