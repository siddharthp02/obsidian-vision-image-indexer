import { App, PluginSettingTab, Setting } from 'obsidian';
import type VisionImageIndexer from './main';

export interface VisionSettings {
  visionProvider: 'gpt4v' | 'gemini' | 'ollama';
  apiKey: string;
  ollamaModel: string;
  ollamaUrl: string;
  imagePrompt: string;
}

export const DEFAULT_SETTINGS: VisionSettings = {
  visionProvider: 'gpt4v',
  apiKey: '',
  ollamaModel: 'llava-llama3',
  ollamaUrl: 'http://localhost:11434',
  imagePrompt: 'Please output ONLY a bullet-point summary (lines start `- `), then a blank line, then the literal `image_keywords:`, then 5–10 keywords with lines starting `- `'
};

export class VisionSettingsTab extends PluginSettingTab {
  plugin: VisionImageIndexer;

  constructor(app: App, plugin: VisionImageIndexer) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Vision Image Indexer Settings' });

    new Setting(containerEl)
      .setName('Vision Provider')
      .setDesc('Choose the vision model backend')
      .addDropdown((dd) => {
        dd.addOption('gpt4v', 'OpenAI GPT-4 Vision')
          .addOption('gemini', 'Google Gemini Vision')
          .addOption('ollama', 'Local Ollama')
          .setValue(this.plugin.settings.visionProvider)
          .onChange(async (v) => {
            this.plugin.settings.visionProvider = v as VisionSettings['visionProvider'];
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Key for cloud Vision APIs')
      .addText((t) =>
        t.setPlaceholder('sk-...')
         .setValue(this.plugin.settings.apiKey)
         .onChange(async (v) => {
           this.plugin.settings.apiKey = v;
           await this.plugin.saveSettings();
         })
      );

    new Setting(containerEl)
      .setName('Ollama Model')
      .setDesc('Local Ollama model name')
      .addText((t) =>
        t.setPlaceholder('llava-llama3')
         .setValue(this.plugin.settings.ollamaModel)
         .onChange(async (v) => {
           this.plugin.settings.ollamaModel = v;
           await this.plugin.saveSettings();
         })
      );

    new Setting(containerEl)
      .setName('Ollama URL')
      .setDesc('Endpoint for local Ollama API')
      .addText((t) =>
        t.setPlaceholder('http://localhost:11434')
         .setValue(this.plugin.settings.ollamaUrl)
         .onChange(async (v) => {
           this.plugin.settings.ollamaUrl = v;
           await this.plugin.saveSettings();
         })
      );

    new Setting(containerEl)
      .setName('Image Analysis Prompt')
      .setDesc('Prompt template for image analysis')
      .addTextArea((text) =>
        text.setPlaceholder(DEFAULT_SETTINGS.imagePrompt)
          .setValue(this.plugin.settings.imagePrompt)
          .onChange(async (v) => {
            this.plugin.settings.imagePrompt = v;
            await this.plugin.saveSettings();
          })
      );
  }
} 