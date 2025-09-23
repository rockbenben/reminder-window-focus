import { App, Plugin, PluginSettingTab, Setting, Notice } from "obsidian";

// 定义 Electron 相关的接口
interface ElectronWindow extends Window {
  require?: <T = unknown>(module: string) => T;
}

interface ElectronRemote {
  getCurrentWindow(): ElectronBrowserWindow;
}

interface ElectronBrowserWindow {
  isMinimized(): boolean;
  restore(): void;
  isVisible(): boolean;
  show(): void;
  isFocused(): boolean;
  isAlwaysOnTop(): boolean;
  setAlwaysOnTop(flag: boolean): void;
  focus(): void;
}

interface ObsidianApp extends App {
  vault: {
    config?: {
      language?: string;
    };
  } & App["vault"];
}

// 定义翻译键类型
type TranslationKey =
  | "focusInterval"
  | "focusIntervalDesc"
  | "detectionInterval"
  | "detectionIntervalDesc"
  | "language"
  | "languageDesc"
  | "debugMode"
  | "debugModeDesc"
  | "auto"
  | "chinese"
  | "english"
  | "reminderDetected"
  | "focusSkipped"
  | "focusCooldown"
  | "settingsSaved"
  | "invalidInterval"
  | "invalidDetectionInterval";

// 定义翻译记录类型
type TranslationRecord = Record<TranslationKey, string>;

// 定义翻译对象类型
type Translations = {
  en: TranslationRecord;
  zh: TranslationRecord;
};

// 多语言支持
const translations: Translations = {
  en: {
    focusInterval: "Minimum focus interval (seconds)",
    focusIntervalDesc: "Minimum time between two consecutive window focus actions",
    detectionInterval: "Detection interval (milliseconds)",
    detectionIntervalDesc: "How often to check for reminder modals (lower values = more responsive, higher CPU usage)",
    language: "Language",
    languageDesc: "Select display language for this plugin",
    debugMode: "Debug mode",
    debugModeDesc: "Enable detailed logging for troubleshooting (for developers)",
    auto: "Auto",
    chinese: "中文",
    english: "English",
    reminderDetected: "Reminder detected, focusing window",
    focusSkipped: "Window already active, skipping focus",
    focusCooldown: "Focus on cooldown, skipping",
    settingsSaved: "Settings saved successfully",
    invalidInterval: "Please enter a valid number for focus interval (1 second or higher)",
    invalidDetectionInterval: "Please enter a valid number for detection interval (100ms or higher)",
  },
  zh: {
    focusInterval: "最小聚焦间隔（秒）",
    focusIntervalDesc: "两次窗口置顶之间的最小时间间隔",
    detectionInterval: "检测间隔（毫秒）",
    detectionIntervalDesc: "检测提醒弹窗的频率（数值越小响应越快，但CPU占用越高）",
    language: "语言",
    languageDesc: "选择插件的显示语言",
    debugMode: "调试模式",
    debugModeDesc: "启用详细日志记录用于故障排除（供开发者使用）",
    auto: "自动",
    chinese: "中文",
    english: "English",
    reminderDetected: "检测到提醒，正在置顶窗口",
    focusSkipped: "窗口已处于活动状态，跳过置顶",
    focusCooldown: "聚焦冷却中，跳过置顶",
    settingsSaved: "设置已成功保存",
    invalidInterval: "请输入有效的聚焦间隔数字（1秒或更高）",
    invalidDetectionInterval: "请输入有效的检测间隔数字（100毫秒或更高）",
  },
};

interface ReminderFocusSettings {
  focusInterval: number;
  detectionInterval: number; // 检测间隔（毫秒）
  language: "auto" | "zh" | "en";
  debugMode: boolean; // 调试模式
}

const DEFAULT_SETTINGS: ReminderFocusSettings = {
  focusInterval: 10,
  detectionInterval: 5000, // 默认每5秒检测一次
  language: "auto",
  debugMode: false, // 默认关闭调试模式
};

export default class ReminderFocusPlugin extends Plugin {
  settings!: ReminderFocusSettings;
  private lastFocusTime: number = 0;
  private focusedModals: Set<string> = new Set();
  private modalObserver: MutationObserver | null = null;
  private detectionTimer: number | null = null;
  public t!: (key: TranslationKey) => string;

  // Debug logging method
  private debug(message: string, ...args: unknown[]) {
    if (this.settings?.debugMode) {
      console.log(`[Reminder Focus] ${message}`, ...args);
    }
  }

  async onload() {
    await this.loadSettings();
    this.updateTranslations();

    this.debug("Plugin loaded");

    // 添加设置标签页
    this.addSettingTab(new ReminderFocusSettingTab(this.app, this));

    // 开始监听弹窗
    this.setupModalDetection();
  }

  onunload() {
    this.debug("Plugin unloaded");
    this.cleanup();
  }

  private cleanup() {
    // 清理观察器
    if (this.modalObserver) {
      this.modalObserver.disconnect();
      this.modalObserver = null;
    }

    // 清理定时器
    if (this.detectionTimer) {
      clearInterval(this.detectionTimer);
      this.detectionTimer = null;
    }

    // 清空记录
    this.focusedModals.clear();
    this.lastFocusTime = 0;
  }

  private setupModalDetection() {
    // 监听 DOM 变化以检测新的弹窗
    this.modalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            this.checkForReminderModal(node);
          }
        });
      });
    });

    // 开始观察 body 元素
    this.modalObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 定时检测机制
    this.detectionTimer = window.setInterval(() => {
      this.checkAllModals();
    }, this.settings.detectionInterval);
    // 确保卸载时自动清理
    this.registerInterval(this.detectionTimer);

    // 同时监听 Obsidian 的 Modal 打开事件
    this.registerEvent(
      this.app.workspace.on("window-open", (leaf, win) => {
        setTimeout(() => {
          this.checkAllModals();
        }, 100);
      })
    );

    // 初始立即检查一次，避免首次漏检
    this.checkAllModals();
  }

  private checkForReminderModal(element: HTMLElement) {
    // 检查是否是 reminder 插件的弹窗
    // 特征：包含 "reminder" 相关的类名或内容
    const textContent = element.textContent || "";

    // 检查按钮元素中是否包含特定文本
    const hasSnoozeButton = this.hasButtonWithText(element, "Snooze");
    const hasDoneButton = this.hasButtonWithText(element, "Done");

    const isReminderModal = element.classList.contains("modal-container") && this.isObsidianReminderModal(element, textContent, hasSnoozeButton, hasDoneButton);

    if (isReminderModal) {
      this.debug("Detected reminder modal");
      this.handleReminderModal(element);
    }
  }

  private checkAllModals() {
    // 检查所有当前存在的弹窗
    const modals = document.querySelectorAll(".modal-container");
    modals.forEach((modal) => {
      if (modal instanceof HTMLElement) {
        this.checkForReminderModal(modal);
      }
    });
  }

  private handleReminderModal(modalElement: HTMLElement) {
    // 检查是否已经处理过这个弹窗
    const modalId = this.getModalId(modalElement);
    if (this.focusedModals.has(modalId)) {
      this.debug(`Modal ${modalId} already focused, skipping`);
      return;
    }

    // 标记为已处理
    this.focusedModals.add(modalId);
    this.debug(`Processing modal: ${modalId}`);

    // 监听弹窗关闭，清理标记
    const observer = new MutationObserver(() => {
      if (!document.body.contains(modalElement)) {
        this.debug(`Modal ${modalId} closed, removing from focused set`);
        this.focusedModals.delete(modalId);
        observer.disconnect();
      }
    });

    observer.observe(modalElement.parentElement || document.body, {
      childList: true,
      subtree: true, // 确保能检测到深层变化
    });

    // 聚焦提醒弹窗（而不是整个窗口）
    this.focusModal(modalElement, modalId);
  }

  private getModalId(element: HTMLElement): string {
    // 优先使用现有的ID
    if (element.id) {
      return element.id;
    }

    // 检查是否有数据属性
    if (element.dataset.modalId) {
      return element.dataset.modalId;
    }

    // 基于元素内容和结构生成稳定的ID
    const textContent = element.textContent?.substring(0, 100) || "";
    const className = element.className || "";
    // 使用标签名和属性而不是innerHTML来生成ID
    const tagStructure = this.getElementStructure(element);

    // 生成基于内容的哈希ID（简化版）
    const contentHash = this.simpleHash(textContent + className + tagStructure);
    const modalId = `reminder-modal-${contentHash}`;

    // 将ID存储到元素上，便于后续识别
    element.dataset.modalId = modalId;

    return modalId;
  }

  private getElementStructure(element: HTMLElement): string {
    // 安全地获取元素结构信息，不使用innerHTML
    const tagName = element.tagName.toLowerCase();
    const attributeInfo = Array.from(element.attributes)
      .slice(0, 5) // 限制属性数量以避免过长
      .map((attr) => `${attr.name}="${attr.value.substring(0, 20)}"`)
      .join(" ");

    // 获取子元素信息而不是完整HTML
    const childTags = Array.from(element.children)
      .slice(0, 5) // 限制子元素数量
      .map((child) => child.tagName.toLowerCase())
      .join(",");

    return `${tagName}[${attributeInfo}]>{${childTags}}`;
  }

  private hasButtonWithText(element: HTMLElement, text: string): boolean {
    // 安全地检查按钮中是否包含特定文本
    const buttons = element.querySelectorAll<HTMLButtonElement>("button");
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      if (button.textContent?.includes(text)) {
        return true;
      }
    }
    return false;
  }

  private isObsidianReminderModal(element: HTMLElement, textContent: string, hasSnoozeButton: boolean, hasDoneButton: boolean): boolean {
    // 基于 obsidian-reminder 插件源代码的精确识别规则

    // 快速检查：如果没有任何按钮，很可能不是 reminder 弹窗
    if (!hasSnoozeButton && !hasDoneButton && !element.querySelector("button")) {
      return false;
    }

    // 1. 检查是否包含 "Done" 和 "Snooze" 按钮（reminder 插件的核心特征）
    const hasBothButtons = hasDoneButton && hasSnoozeButton;
    if (hasBothButtons) {
      this.debug("Detected reminder modal: has both Done and Snooze buttons");
      return true;
    }

    // 2. 检查是否有 reminder 相关的 CSS 类和结构
    const hasReminderClass =
      element.querySelector(".reminder-modal") !== null ||
      element.querySelector(".reminder-title") !== null ||
      element.querySelector(".reminder-actions") !== null ||
      element.querySelector(".reminder-file") !== null;

    if (hasReminderClass) {
      this.debug("Detected reminder modal: has reminder CSS classes");
      return true;
    }

    // 3. 检查 modal 内容结构（基于 Reminder.svelte 的结构）
    const hasReminderStructure =
      element.querySelector("h3") !== null && // reminder-title 使用 h3
      element.querySelector("select") !== null && // Snooze 下拉选择
      element.querySelector("select option[selected][disabled][hidden]") !== null; // Snooze placeholder

    if (hasReminderStructure && (hasSnoozeButton || hasDoneButton)) {
      this.debug("Detected reminder modal: has reminder structure and buttons");
      return true;
    }

    // 4. 检查 aria-label 属性（obsidian-reminder 会设置特定的 aria-label）
    const hasReminderAriaLabel =
      element.querySelector('button[aria-label*="reminder"]') !== null ||
      element.querySelector('[aria-label*="Remind me later"]') !== null ||
      element.querySelector('[aria-label*="Mark as Done"]') !== null ||
      element.querySelector('button[aria-label*="Done"]') !== null;

    if (hasReminderAriaLabel) {
      this.debug("Detected reminder modal: has reminder aria-labels");
      return true;
    }

    // 5. 检查特定的按钮组合和文本模式
    const hasSpecificButtonCombination =
      (hasSnoozeButton || textContent.includes("Snooze")) &&
      (hasDoneButton || textContent.includes("Done")) &&
      (textContent.includes("minutes") || textContent.includes("hours") || textContent.includes("Tomorrow") || textContent.includes("Next week"));

    if (hasSpecificButtonCombination) {
      this.debug("Detected reminder modal: has specific button combination and time options");
      return true;
    }

    // 6. 检查 NotificationModal 的特征（基于源代码中的实现）
    const hasNotificationModalFeatures =
      element.querySelector(".mod-cta") !== null && // "Done" 按钮使用 mod-cta 类
      element.querySelector("select.dropdown") !== null; // Snooze 下拉使用 dropdown 类

    if (hasNotificationModalFeatures && (hasSnoozeButton || hasDoneButton)) {
      this.debug("Detected reminder modal: has NotificationModal features");
      return true;
    }

    // 7. 检查文件链接特征（reminder 弹窗会显示文件链接）
    const hasFileLink =
      element.querySelector(".reminder-file") !== null || element.querySelector('button[aria-label*=".md"]') !== null || (textContent.includes(".md") && (hasSnoozeButton || hasDoneButton));

    if (hasFileLink) {
      this.debug("Detected reminder modal: has file link");
      return true;
    }

    // 8. 检查 Svelte 组件特征（obsidian-reminder 使用 Svelte）
    const hasSvelteFeatures = element.querySelector("[data-svelte]") !== null || element.classList.toString().includes("svelte");

    if (hasSvelteFeatures && (hasSnoozeButton || hasDoneButton)) {
      this.debug("Detected reminder modal: has Svelte features");
      return true;
    }

    // 9. 回退检查：基本的 reminder 文本匹配（更严格的条件）
    const hasBasicReminderIndicators = (textContent.includes("reminder") || textContent.includes("提醒")) && (hasSnoozeButton || hasDoneButton) && textContent.length < 2000; // 避免匹配过长的内容

    if (hasBasicReminderIndicators) {
      this.debug("Detected reminder modal: has basic reminder indicators");
      return true;
    }

    return false;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  private async focusModal(modalElement: HTMLElement, modalId: string) {
    // 检查冷却时间
    const now = Date.now();
    const timeSinceLastFocus = (now - this.lastFocusTime) / 1000;
    if (timeSinceLastFocus < this.settings.focusInterval) {
      this.debug(this.t("focusCooldown") + ` (Modal: ${modalId})`);
      return;
    }

    // 更新最后聚焦时间
    this.lastFocusTime = now;

    try {
      // 第一步：确保 Obsidian 窗口可见并等待完成
      await this.ensureWindowVisible();

      // 第二步：等待一小段时间确保窗口完全激活
      await this.delay(150);

      // 第三步：聚焦弹窗元素
      this.focusModalElement(modalElement);

      this.debug(this.t("reminderDetected") + ` (Modal: ${modalId})`);
    } catch (error) {
      console.error("Failed to focus modal:", error, `(Modal: ${modalId})`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async ensureWindowVisible(): Promise<void> {
    return new Promise((resolve) => {
      // 先聚焦主窗口，确保 Obsidian 在前台
      window.focus();

      // 如果在 Electron 环境中，使用更强大的方法
      const electronWindow = window as ElectronWindow;
      if (electronWindow.require) {
        try {
          const electron = electronWindow.require<{ remote?: ElectronRemote }>("electron");
          const remote = electron?.remote;
          if (remote) {
            const currentWindow = remote.getCurrentWindow();
            if (currentWindow) {
              let needsActivation = false;

              // 如果窗口最小化，先还原
              if (currentWindow.isMinimized()) {
                currentWindow.restore();
                this.debug("Window restored from minimized state");
                needsActivation = true;
              }

              // 如果窗口不可见，显示窗口
              if (!currentWindow.isVisible()) {
                currentWindow.show();
                this.debug("Window made visible");
                needsActivation = true;
              }

              // 如果窗口不在前台（被其他窗口遮盖），激活它
              if (!currentWindow.isFocused()) {
                this.debug("Window is not focused, bringing to front");
                needsActivation = true;
              }

              if (needsActivation) {
                // 短暂置顶确保窗口在最前面
                if (!currentWindow.isAlwaysOnTop()) {
                  currentWindow.setAlwaysOnTop(true);
                  // 等待置顶完成后恢复状态并resolve
                  setTimeout(() => {
                    currentWindow.setAlwaysOnTop(false);
                    currentWindow.focus(); // 确保获得焦点
                    resolve();
                  }, 200);
                } else {
                  currentWindow.focus();
                  setTimeout(resolve, 100);
                }
              } else {
                // 窗口已经在前台，直接resolve
                resolve();
              }
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        } catch (error) {
          this.debug("Failed to access Electron remote:", error);
          resolve();
        }
      } else {
        // 非Electron环境，等待短暂时间后resolve
        setTimeout(resolve, 50);
      }
    });
  }

  private focusModalElement(modalElement: HTMLElement) {
    // 聚焦整个弹窗容器
    if (!modalElement.hasAttribute("tabindex")) {
      modalElement.setAttribute("tabindex", "-1");
    }
    this.focusWithRetry(modalElement, 3);
    this.debug("Focusing modal container");

    // 滚动到弹窗位置，确保用户能看到
    modalElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  private async focusWithRetry(element: HTMLElement, maxRetries: number) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        element.focus();

        // 检查聚焦是否成功
        if (document.activeElement === element) {
          this.debug(`Focus successful on attempt ${i + 1}`);
          return;
        }

        // 如果聚焦失败，等待一小段时间后重试
        if (i < maxRetries - 1) {
          this.debug(`Focus attempt ${i + 1} failed, retrying...`);
          await this.delay(50);
        }
      } catch (error) {
        this.debug(`Focus attempt ${i + 1} error:`, error);
        if (i < maxRetries - 1) {
          await this.delay(50);
        }
      }
    }
    this.debug(`Failed to focus element after ${maxRetries} attempts`);
  }

  private updateTranslations() {
    const lang = this.getLanguage();
    this.t = (key: TranslationKey) => {
      return translations[lang][key] || translations["en"][key] || key;
    };
  }

  private getLanguage(): "en" | "zh" {
    if (this.settings.language === "zh") return "zh";
    if (this.settings.language === "en") return "en";

    // 自动检测语言
    const obsidianApp = this.app as ObsidianApp;
    const obsidianLang = obsidianApp.vault?.config?.language;
    const systemLang = navigator.language.toLowerCase();

    if (obsidianLang?.includes("zh") || systemLang.includes("zh")) {
      return "zh";
    }

    return "en";
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.updateTranslations();
  }

  restartDetection() {
    // 清理现有的检测机制
    if (this.modalObserver) {
      this.modalObserver.disconnect();
      this.modalObserver = null;
    }

    if (this.detectionTimer) {
      clearInterval(this.detectionTimer);
      this.detectionTimer = null;
    }

    // 重新启动检测机制
    this.setupModalDetection();
  }
}

class ReminderFocusSettingTab extends PluginSettingTab {
  plugin: ReminderFocusPlugin;

  constructor(app: App, plugin: ReminderFocusPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();

    // 语言选择
    new Setting(containerEl)
      .setName(this.plugin.t("language"))
      .setDesc(this.plugin.t("languageDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("auto", this.plugin.t("auto"))
          .addOption("zh", this.plugin.t("chinese"))
          .addOption("en", this.plugin.t("english"))
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as "auto" | "zh" | "en";
            await this.plugin.saveSettings();
            // 重新显示设置页面以更新语言
            this.display();
            new Notice(this.plugin.t("settingsSaved"));
          })
      );

    // 最小聚焦间隔（数字输入）
    new Setting(containerEl)
      .setName(this.plugin.t("focusInterval"))
      .setDesc(this.plugin.t("focusIntervalDesc"))
      .addText((text) => {
        text
          .setPlaceholder("10")
          .setValue(String(this.plugin.settings.focusInterval))
          .onChange(async (value) => {
            const num = parseInt(value);
            if (!isNaN(num) && num >= 1) {
              this.plugin.settings.focusInterval = num;
              await this.plugin.saveSettings();
            } else {
              new Notice(this.plugin.t("invalidInterval"));
            }
          });
        // 使用数字输入体验
        const input = text.inputEl;
        input.type = "number";
        input.min = "1";
        input.step = "1";
      });

    // 检测间隔（数字输入）
    new Setting(containerEl)
      .setName(this.plugin.t("detectionInterval"))
      .setDesc(this.plugin.t("detectionIntervalDesc"))
      .addText((text) => {
        text
          .setPlaceholder("5000")
          .setValue(String(this.plugin.settings.detectionInterval))
          .onChange(async (value) => {
            const num = parseInt(value);
            if (!isNaN(num) && num >= 100) {
              this.plugin.settings.detectionInterval = num;
              await this.plugin.saveSettings();
              // 重新启动检测机制以应用新间隔
              this.plugin.restartDetection();
            } else {
              new Notice(this.plugin.t("invalidDetectionInterval"));
            }
          });
        // 使用数字输入体验
        const input = text.inputEl;
        input.type = "number";
        input.min = "100";
        input.step = "100";
      });

    // 调试模式
    new Setting(containerEl)
      .setName(this.plugin.t("debugMode"))
      .setDesc(this.plugin.t("debugModeDesc"))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.debugMode).onChange(async (value) => {
          this.plugin.settings.debugMode = value;
          await this.plugin.saveSettings();
        })
      );
  }
}
