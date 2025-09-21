# Obsidian Reminder Focus Plugin

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/rockbenben/reminder-window-focus?style=for-the-badge&sort=semver)](https://github.com/rockbenben/reminder-window-focus/releases/latest)
[![GitHub License](https://img.shields.io/github/license/rockbenben/reminder-window-focus?style=for-the-badge)](LICENSE)

🇨🇳 中文 | [🇺🇸 English](README.md)

## 描述

**提醒窗口置顶**插件会在检测到 `obsidian-reminder` 插件的提醒弹窗时，自动将 Obsidian 窗口置顶并聚焦。这确保您即使在使用其他应用程序或 Obsidian 在后台运行时也不会错过重要提醒。

## ✨ 核心功能

- 🔔 **智能检测**：智能识别 obsidian-reminder 插件的提醒弹窗
- 🪟 **自动置顶**：提醒出现时自动将 Obsidian 窗口置顶
- ⏱️ **冷却保护**：通过可配置的时间间隔防止频繁置顶
- 🌐 **双语界面**：完整支持中英文界面，支持自动检测
- ⚙️ **自定义设置**：可调节检测间隔、置顶时机和行为

## 📦 安装方法

### 方法一：从 Obsidian 社区插件安装（推荐）

1. 打开 Obsidian 设置 (⚙️)
2. 导航到**社区插件**
3. 如果尚未关闭，请关闭**安全模式**
4. 点击**浏览**并搜索 "Reminder Window Focus"
5. 点击**安装**然后**启用**

### 方法二：手动安装

1. 从 [GitHub Releases](https://github.com/rockbenben/reminder-window-focus/releases) 下载最新版本
2. 解压下载的文件
3. 将插件文件夹复制到您的仓库插件目录：

   ```bash
   您的仓库/.obsidian/plugins/reminder-window-focus/
   ```

4. 重启 Obsidian 或重新加载插件
5. 在**设置 → 社区插件**中启用插件

### 方法三：使用 BRAT（测试版自动更新工具）

1. 安装 [BRAT 插件](https://github.com/TfTHacker/obsidian42-brat)
2. 打开 BRAT 设置并点击**添加测试版插件**
3. 输入仓库地址：`rockbenben/reminder-window-focus`
4. 点击**添加插件**并启用

## ⚙️ 配置选项

通过**设置 → 社区插件 → 提醒窗口置顶**访问插件设置。

### 可用选项

| 设置项           | 说明                           | 默认值     | 范围              |
| ---------------- | ------------------------------ | ---------- | ----------------- |
| **启用窗口置顶** | 开启/关闭自动窗口置顶功能      | ✅ 启用    | 开/关             |
| **最小聚焦间隔** | 两次连续置顶操作之间的最小时间 | 60 秒      | 1 秒或更高        |
| **检测间隔**     | 检测提醒弹窗的频率             | 10000 毫秒 | 100 毫秒或更高    |
| **语言**         | 界面语言设置                   | 自动检测   | 自动/English/中文 |

### 🔧 高级配置技巧

- **较低的检测间隔**（100-500 毫秒）= 响应更快但 CPU 占用更高
- **较高的检测间隔**（2000 毫秒以上）= 响应较慢但性能更好，节省电量
- **较短的聚焦间隔**（1-30 秒）= 适合频繁使用提醒的用户
- **较长的聚焦间隔**（120 秒以上）= 减少干扰，可设置为数小时以获得最小干扰
- **建议**：设置检测间隔 ≤ 聚焦间隔以获得最佳性能

## 🔧 工作原理

插件使用智能检测机制来识别提醒通知：

1. **弹窗检测**：持续监控 Obsidian 中的新弹窗窗口
2. **提醒识别**：分析弹窗内容以识别提醒特定元素
3. **窗口状态检查**：验证 Obsidian 窗口当前是否处于聚焦状态
4. **冷却验证**：确保自上次聚焦操作以来已过最小间隔时间
5. **执行聚焦**：在满足条件时临时将 Obsidian 窗口置顶
6. **状态重置**：成功聚焦后返回正常监控状态

### 🎯 检测逻辑

插件通过以下方式识别提醒弹窗：

- 具有提醒特定类的弹窗容器
- 包含提醒文本模式的元素
- obsidian-reminder 插件使用的特定 DOM 结构
- 基于时间的元素和提醒内容

## 📋 系统要求

| 要求         | 版本/详情                         |
| ------------ | --------------------------------- |
| **Obsidian** | v0.15.0 或更高版本                |
| **平台**     | 仅桌面端（Windows、macOS、Linux） |
| **依赖**     | 必须安装 `obsidian-reminder` 插件 |
| **权限**     | 窗口聚焦功能（自动）              |

> **注意**：此插件专为桌面环境设计，在移动设备上无法运行。

## 🚀 使用方法

1. **安装并启用**：按照上述安装步骤操作
2. **安装 obsidian-reminder**：确保已安装配套的提醒插件
3. **配置设置**：在插件设置中调整时机和行为
4. **创建提醒**：使用 obsidian-reminder 创建基于时间的提醒
5. **正常工作**：插件在后台自动工作
6. **体验聚焦**：当提醒出现时，Obsidian 会自动置顶

### 💡 最佳实践

- **设置合适的间隔**：在响应性和系统性能之间找到平衡
- **测试设置**：创建测试提醒以验证插件正常工作
- **监控性能**：如果发现系统变慢，请调整检测间隔
- **明智使用冷却**：较长的冷却时间可防止过度的窗口切换

## 🐛 故障排除

### 常见问题和解决方案

| 问题         | 可能原因                 | 解决方案                          |
| ------------ | ------------------------ | --------------------------------- |
| 窗口未置顶   | 插件已禁用               | 检查插件是否在设置中启用          |
| 置顶过于频繁 | 冷却间隔过短             | 增加最小聚焦间隔时间              |
| CPU 占用过高 | 检测间隔过低             | 增加检测间隔（1000 毫秒以上）     |
| 无法检测提醒 | 未安装 obsidian-reminder | 安装并启用 obsidian-reminder 插件 |
| 语言未切换   | 缓存问题                 | 更改语言后重启 Obsidian           |

### 调试步骤

1. 检查两个插件都已启用
2. 验证检测间隔合理（500-2000 毫秒）
3. 用简单提醒进行测试
4. 检查浏览器控制台的错误信息
5. 如果问题持续存在，请重启 Obsidian

## 🛠️ 开发

### 开始使用

```bash
# 克隆仓库
git clone https://github.com/rockbenben/reminder-window-focus.git
cd reminder-window-focus

# 安装依赖
npm install

# 开发模式构建（支持热重载）
npm run dev

# 生产模式构建
npm run build
```

### 项目结构

```text
reminder-window-focus/
├── main.ts              # 主插件代码
├── manifest.json        # 插件清单
├── package.json         # Node.js 依赖
├── tsconfig.json        # TypeScript 配置
├── esbuild.config.mjs   # 构建配置
└── README.md           # 文档
```

### 开发指南

- 遵循 TypeScript 最佳实践
- 维护双语支持（中英文）
- 测试各种提醒场景
- 保持最小的性能影响
- 记录任何 API 更改

### 贡献

1. Fork 此仓库
2. 创建功能分支：`git checkout -b feature-name`
3. 进行更改并彻底测试
4. 提交清晰的信息：`git commit -m "添加：功能描述"`
5. 推送并创建 Pull Request

## 许可证

MIT

## 支持

如果您遇到任何问题或有建议，请在 GitHub 上提交 issue。

## 致谢

- 感谢 Obsidian 团队提供的优秀平台
- 感谢 obsidian-reminder 插件的开发者
