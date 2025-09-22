# Bring Reminders to Front

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/rockbenben/bring-reminders-front?style=for-the-badge&sort=semver)](https://github.com/rockbenben/bring-reminders-front/releases/latest)
[![GitHub License](https://img.shields.io/github/license/rockbenben/bring-reminders-front?style=for-the-badge)](LICENSE)

🇨🇳 中文 | [🇺🇸 English](README.md)

## 描述

当 `obsidian-reminder` 插件的提醒弹窗出现时，Bring Reminders to Front 会自动将 Obsidian 窗口带到前台，并聚焦提醒弹窗的容器，保证你不会错过任何提醒。

## ✨ 核心功能

- 🔔 智能检测：智能识别 obsidian-reminder 插件的提醒弹窗
- 🪟 自动置前：提醒出现时将 Obsidian 窗口带到前台
- ⏱️ 冷却保护：可配置的最小聚焦间隔，防止频繁抢焦
- 🌐 双语界面：完整支持中英文界面，自动检测

## 📦 安装方法

### 方法一：从 Obsidian 社区插件安装（尚未上架）

1. 打开 Obsidian 设置 (⚙️)
2. 导航到 社区插件
3. 如果尚未关闭，请先关闭 安全模式
4. 点击 浏览 并搜索 “Bring Reminders to Front”
5. 点击 安装 然后 启用

### 方法二：手动安装

1. 从 [GitHub Releases](https://github.com/rockbenben/bring-reminders-front/releases) 下载最新版本
2. 解压下载的文件
3. 将插件文件夹复制到你的库的插件目录：

   ```text
   你的库/.obsidian/plugins/bring-reminders-front/
   ```

4. 重启 Obsidian 或重新加载插件
5. 在 设置 → 社区插件 中启用插件

### 方法三：使用 BRAT（测试版自动更新工具）

1. 安装 [BRAT 插件](https://github.com/TfTHacker/obsidian42-brat)
2. 打开 BRAT 设置并点击 添加测试版插件
3. 输入仓库地址：rockbenben/bring-reminders-front
4. 点击 添加插件 并启用

## ⚙️ 配置选项

通过 设置 → 社区插件 → Bring Reminders to Front 访问插件设置。

| 设置项       | 说明                                           | 默认值     | 范围              |
| ------------ | ---------------------------------------------- | ---------- | ----------------- |
| 最小聚焦间隔 | 两次连续聚焦之间的最小时间（防止频繁抢焦）     | 60 秒      | ≥ 1 秒            |
| 检测间隔     | 兜底的周期性检测频率（已启用观察器与初始检查） | 10000 毫秒 | ≥ 100 毫秒        |
| 语言         | 界面语言设置                                   | 自动检测   | 自动/English/中文 |

> 数字输入已优化：设置项采用数字输入框，带最小值与步进，并附带校验逻辑以避免误输。

### 🔧 高级配置技巧

- 较低的检测间隔（100-500 ms）= 响应更快但 CPU 占用更高
- 较高的检测间隔（≥ 2000 ms）= 响应稍慢但更省电
- 较短的聚焦间隔（1-30 s）= 适合频繁提醒
- 较长的聚焦间隔（≥ 120 s）= 减少干扰
- 建议：检测间隔 ≤ 聚焦间隔，以获得更优平衡

## 🔧 工作原理

插件使用智能检测机制来识别提醒通知：

1. 弹窗检测：通过 MutationObserver 监控新的弹窗容器
2. 提醒识别：基于类名/标记/文本特征识别提醒弹窗
3. 窗口置前：必要时将 Obsidian 窗口带到前台
4. 冷却验证：确保距上次聚焦已超过最小间隔
5. 执行聚焦：为弹窗容器设置 tabindex 并尝试多次聚焦，同时滚动到可视区域
6. 状态重置：记录已处理弹窗并恢复常规监听

## 🎯 检测逻辑

- 具有提醒特定类的弹窗容器（如 .reminder-modal）或标记（如 [data-reminder]）
- DOM MutationObserver 实时监听 + 启动时立即检查 + 可配置的定时兜底
- 少量文本/aria 模式兜底（如 Snooze / Done / “提醒”），不依赖 innerHTML

## 🚀 使用步骤

1. 启用本插件（Bring Reminders to Front）
2. 安装并启用 obsidian-reminder 插件
3. 在设置中根据需要调整“最小聚焦间隔/检测间隔”
4. 使用 obsidian-reminder 创建一个测试提醒
5. 等待提醒触发，插件会在后台自动工作
6. 观察效果：Obsidian 被带到前台且提醒弹窗容器已聚焦

## 🐛 故障排除

### 常见问题和解决方案

| 问题         | 可能原因                        | 解决方案                          |
| ------------ | ------------------------------- | --------------------------------- |
| 置顶过于频繁 | 冷却间隔过短                    | 增加“最小聚焦间隔”时间            |
| CPU 占用较高 | 检测间隔过低                    | 增加“检测间隔”（建议 ≥ 1000 ms）  |
| 无法检测提醒 | 未安装/未启用 obsidian-reminder | 安装并启用 obsidian-reminder 插件 |
| 语言未切换   | 缓存或重载问题                  | 更改语言后重启 Obsidian           |

### 调试步骤

1. 确认本插件与 obsidian-reminder 均已启用
2. 将检测间隔设置为 500-2000 ms 范围进行测试
3. 用最简单的提醒内容进行验证
4. 打开开发者工具查看控制台是否有报错
5. 若问题持续，重启 Obsidian 后重试

## 🛠️ 开发

### 开始使用

```bash
# 克隆仓库
git clone https://github.com/rockbenben/bring-reminders-front.git
cd bring-reminders-front

# 安装依赖
npm install

# 开发模式构建（支持热重载）
npm run dev

# 生产模式构建
npm run build
```

### 项目结构

```text
bring-reminders-front/
├── main.ts              # 主插件代码
├── manifest.json        # 插件清单
├── package.json         # Node.js 依赖
├── tsconfig.json        # TypeScript 配置
├── esbuild.config.mjs   # 构建配置
└── README.md           # 文档
```

### 贡献

1. Fork 此仓库
2. 创建功能分支：`git checkout -b feature-name`
3. 进行更改并彻底测试
4. 提交清晰的信息：`git commit -m "feat: 描述本次更改"`
5. 推送并创建 Pull Request

## 许可证

MIT

## 支持

如果你遇到任何问题或有建议，请在 GitHub 提交 issue。

## 致谢

- 感谢 Obsidian 团队提供的优秀平台
- 感谢 obsidian-reminder 插件的开发者
