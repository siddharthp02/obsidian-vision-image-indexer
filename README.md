# Vision Image Indexer

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-purple)](https://obsidian.md)

---

## Why this plugin? (Motivation)

Ever pasted a screenshot into Obsidian—maybe from a YouTube video, slide deck, flowchart, or diagram—while taking notes? And later, when trying to find it, you realize the content was inside an image, making it invisible to search?

What if every image came with searchable, indexable metadata—so you could find it by content, not just filename? And if you're using Obsidian with an LLM, imagine feeding it this metadata for smarter, more context-aware queries.

This plugin does exactly that. Every time you paste an image, it automatically generates a detailed summary and keyword list, storing them in a collapsible block. The metadata stays out of the way, but always searchable—turning your image collection into a fully discoverable knowledge base.

---

## Features
- **Instant image analysis:** Paste an image and get a detailed, structured summary and keywords.
- **Multiple vision providers:** Supports GPT-4 Vision, Gemini, and local Ollama models (configurable in settings).
- **Obsidian-native output:** Metadata is inserted as a collapsed `<details><pre>...</pre></details>` block directly below the image.
- **Consistent formatting:** Output is highly structured for easy reading and searching.
- **No manual prompt required:** Uses a robust, enforced prompt for consistent results.

---

## How to Install & Run
1. **Clone or download** this repository.
2. Open a terminal in the plugin folder and run:
   ```sh
   npm install
   npm run build
   ```
3. After building, you will have a `dist/` folder and a `manifest.json` file.
4. **Copy both `dist/` and `manifest.json`** into your Obsidian vault at:
   ```
   <your-vault>/.obsidian/plugins/obsidian-image-meta-search/
   ```
   - The folder structure should look like:
     ```
     <your-vault>
     └── .obsidian
         └── plugins
             └── obsidian-image-meta-search
                 ├── dist
                 └── manifest.json
     ```
5. Enable the plugin in Obsidian's settings under Community Plugins.

---

## Usage
- **Paste an image** into any note.
- The plugin will automatically analyze the image and insert a collapsed metadata block below it.
- The block includes:
  - Title (if inferrable)
  - Summary
  - Codebase, Build & Deployment, AMI Management, Database, Configuration, Service UI & Assets, Special Notes (as relevant)
  - Keywords (comma-separated)

---

## Settings
- **Vision Provider:** Choose between GPT-4V, Gemini, or Ollama.
- **API Key / Model:** Set API keys or local model details as needed.

---

## Example Output
```markdown
![[example-image.png]]
<details>
<summary>Image metadata</summary>
<pre>
- Title: Example Cloud Deployment
- Summary:
A concise 2–3 line explanation of what the image represents.
- Codebase:
List any filenames and what they do.
- Build & Deployment:
Describe CI/CD pipelines or deployment strategies.
- Keywords: AWS, CloudFormation, CodeBuild, CodeDeploy, CI/CD
</pre>
</details>
```

---

## Troubleshooting
- **Image not analyzed?** Make sure your API key is valid and the model is accessible.
- **No metadata block?** Check the developer console for errors or model output. (Open the console with **Ctrl+Shift+I** on Windows/Linux, or **Cmd+Opt+I** on Mac.)
- **Formatting issues?** The plugin enforces a strict prompt, but model output may vary. See logs for the raw output and parsed structure.

---

## License
MIT 
