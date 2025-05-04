import { Plugin, Notice, TFile } from 'obsidian';
import { VisionSettingsTab, DEFAULT_SETTINGS, VisionSettings } from './settings';
import { analyzeImage } from './utils';

const STRUCTURED_PROMPT = `Please analyze the image and output your findings in the following format, with NO blank lines between sections. Each section header MUST start with a dash and a space, exactly as shown. Fill in the content after each header. Do not add any extra sections or lines.

Example:

- Title: Example Cloud Deployment
- Summary:
A concise 2–3 line explanation of what the image represents.
- Codebase:
List any filenames and what they do.
- Build & Deployment:
Describe CI/CD pipelines or deployment strategies.
- AMI Management:
Describe how Amazon Machine Images are created or used.
- Database:
Describe the database technology used and any secret management.
- Configuration:
How configuration and parameter storage is handled.
- Service UI & Assets:
Describe frontend or UI build processes, including build tools and deployment.
- Special Notes:
Any other observations like cross-account access or account names.
- Keywords: AWS, CloudFormation, CodeBuild, CodeDeploy, CI/CD, S3, RDS, Secrets Manager, AMI, Infrastructure as Code

Now, output your analysis in this format, using only the sections that are relevant to the image.`;

export default class VisionImageIndexer extends Plugin {
  settings!: VisionSettings;

  async onload() {
    console.log('[VisionImageIndexer] Plugin loaded');
    await this.loadSettings();
    this.addSettingTab(new VisionSettingsTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on('editor-paste', async (evt: ClipboardEvent, editor: any) => {
        console.log('[VisionImageIndexer] editor-paste event detected');
        const files = evt.clipboardData?.files;
        if (files?.length && files[0].type.startsWith('image/')) {
          console.log('[VisionImageIndexer] Image detected in clipboard');
          // Poll for the image markdown for up to 1 second
          (async () => {
            let attempts = 0;
            let imagePath: string | null = null;
            let line = '';
            let cursor = editor.getCursor();
            while (attempts < 20) { // Try for up to ~1 second (20 x 50ms)
              cursor = editor.getCursor();
              line = editor.getLine(cursor.line);
              console.log('[VisionImageIndexer] Polling for image markdown, attempt', attempts, 'line:', line);
              let match = line.match(/!\[.*?\]\((.+?)\)/); // standard Markdown
              if (!match) {
                // Try Obsidian wikilink
                const wl = line.match(/!\[\[([^\]]+)\]\]/);
                if (wl) match = wl;
              }
              if (match) {
                imagePath = match[1];
                break;
              }
              await new Promise(res => setTimeout(res, 50));
              attempts++;
            }
            if (!imagePath) {
              console.log('[VisionImageIndexer] No image markdown found after polling');
              return;
            }
            console.log('[VisionImageIndexer] Found image path:', imagePath);
            const file = this.app.vault.getAbstractFileByPath(imagePath);
            if (!file || !(file instanceof TFile)) {
              console.log('[VisionImageIndexer] Could not find pasted image file in vault');
              new Notice('Could not find pasted image file.');
              return;
            }
            // Read image as base64
            console.log('[VisionImageIndexer] Reading image file as base64');
            const arrayBuffer = await this.app.vault.readBinary(file);
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let b of bytes) binary += String.fromCharCode(b);
            const base64 = btoa(binary);
            const dataUri = `data:image/png;base64,${base64}`;
            // Always use the improved structured prompt
            const promptToUse = STRUCTURED_PROMPT;
            console.log('[VisionImageIndexer] Using prompt:', promptToUse);
            new Notice('Analyzing image...');
            console.log('[VisionImageIndexer] Calling analyzeImage');
            const { summary } = await analyzeImage(dataUri, this.settings, promptToUse);
            console.log('[VisionImageIndexer] Formatted summary block:', summary);
            // Insert the formatted summary block (already wrapped in <details><pre>...</pre></details>)
            await editor.replaceRange('\n' + summary, { line: cursor.line + 1, ch: 0 });
            new Notice('Collapsed metadata inserted!');
          })();
        } else {
          console.log('[VisionImageIndexer] No image found in clipboard');
        }
      })
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
} 