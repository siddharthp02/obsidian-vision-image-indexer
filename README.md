<<<<<<< HEAD
# obsidian-vision-image-indexer
=======
# Vision Image Indexer

Extracts image summaries and keywords via vision models (OpenAI GPT-4 Vision, Google Gemini, or Ollama) and indexes them in a collapsed, Obsidian-friendly metadata block.

## Features
- Paste an image into your note and get an instant, detailed analysis and keyword extraction.
- Uses GPT-4 Vision, Gemini, or local Ollama models (configurable in settings).
- Metadata is inserted as a collapsed `<details><pre>...</pre></details>` block directly below the image.
- Output is highly structured for easy reading and searching.
- No manual prompt required—uses a robust, enforced prompt for consistent results.

## Installation
1. Clone or download this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to generate the `dist/` folder.
4. Copy `dist/` and `manifest.json` into your vault's `.obsidian/plugins/obsidian-image-meta-search/` directory.
5. Enable the plugin in Obsidian's settings.

## Usage
- Paste an image into any note.
- The plugin will automatically analyze the image and insert a collapsed metadata block below it.
- The block includes:
  - Title (if inferrable)
  - Summary
  - Codebase, Build & Deployment, AMI Management, Database, Configuration, Service UI & Assets, Special Notes (as relevant)
  - Keywords (comma-separated)

## Settings
- Choose your vision provider (GPT-4V, Gemini, or Ollama).
- Set API keys or local model details as needed.

## Development
- During development, keep `dist/` in `.gitignore`.
- For releases, commit `dist/` and `manifest.json` so users can install without building.
- See the plugin code for details on prompt structure and parsing.

## Release Workflow
1. Run `npm run build`.
2. Commit `dist/` and `manifest.json` for the release.
3. Tag the release if desired.
4. After release, you may re-add `dist/` to `.gitignore` for ongoing development.

## Example Output
```
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

## License
MIT 
>>>>>>> 32b57c5 (Initial functionality implemented)
