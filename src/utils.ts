import { requestUrl } from 'obsidian';
import { VisionSettings } from './settings';
import { GoogleGenAI } from '@google/genai';

let genai: GoogleGenAI | null = null;
function getClient(apiKey: string) {
  if (!genai) genai = new GoogleGenAI({ apiKey });
  return genai;
}

function formatGeminiOutputToObsidian(details: {
  title?: string,
  summary: string,
  codebase?: string[],
  buildDeployment?: string[],
  amiManagement?: string[],
  database?: string[],
  configuration?: string[],
  serviceUIAssets?: string[],
  specialNotes?: string[],
  keywords: string[]
}): string {
  const lines = [];
  if (details.title) lines.push(`- Title: ${details.title}`);
  lines.push('- Summary:');
  lines.push(...details.summary.trim().split(/\n+/).map(l => l.trim()).filter(Boolean));
  if (details.codebase?.length) {
    lines.push('- Codebase:');
    lines.push(...details.codebase.map(l => l.trim()).filter(Boolean));
  }
  if (details.buildDeployment?.length) {
    lines.push('- Build & Deployment:');
    lines.push(...details.buildDeployment.map(l => l.trim()).filter(Boolean));
  }
  if (details.amiManagement?.length) {
    lines.push('- AMI Management:');
    lines.push(...details.amiManagement.map(l => l.trim()).filter(Boolean));
  }
  if (details.database?.length) {
    lines.push('- Database:');
    lines.push(...details.database.map(l => l.trim()).filter(Boolean));
  }
  if (details.configuration?.length) {
    lines.push('- Configuration:');
    lines.push(...details.configuration.map(l => l.trim()).filter(Boolean));
  }
  if (details.serviceUIAssets?.length) {
    lines.push('- Service UI & Assets:');
    lines.push(...details.serviceUIAssets.map(l => l.trim()).filter(Boolean));
  }
  if (details.specialNotes?.length) {
    lines.push('- Special Notes:');
    lines.push(...details.specialNotes.map(l => l.trim()).filter(Boolean));
  }
  lines.push('- Keywords: ' + details.keywords.join(', '));
  return [
    '<details>',
    '<summary>Image metadata</summary>',
    '<pre>',
    lines.join('\n'),
    '</pre>',
    '</details>'
  ].join('\n');
}

function parseGeminiStructured(text: string): {
  title?: string,
  summary: string,
  codebase?: string[],
  buildDeployment?: string[],
  amiManagement?: string[],
  database?: string[],
  configuration?: string[],
  serviceUIAssets?: string[],
  specialNotes?: string[],
  keywords: string[]
} {
  const lines = text.split(/\r?\n/);
  let section = '';
  let title: string | undefined = undefined;
  let summary: string[] = [];
  let codebase: string[] = [];
  let buildDeployment: string[] = [];
  let amiManagement: string[] = [];
  let database: string[] = [];
  let configuration: string[] = [];
  let serviceUIAssets: string[] = [];
  let specialNotes: string[] = [];
  let keywords: string[] = [];
  for (let line of lines) {
    const trimmed = line.trim();
    if (/^- Title:/i.test(trimmed)) {
      title = trimmed.replace(/^- Title:/i, '').trim();
      section = '';
    } else if (/^- Summary:/i.test(trimmed)) {
      section = 'summary';
    } else if (/^- Codebase:/i.test(trimmed)) {
      section = 'codebase';
    } else if (/^- Build.*Deployment:/i.test(trimmed)) {
      section = 'buildDeployment';
    } else if (/^- AMI Management:/i.test(trimmed)) {
      section = 'amiManagement';
    } else if (/^- Database:/i.test(trimmed)) {
      section = 'database';
    } else if (/^- Configuration:/i.test(trimmed)) {
      section = 'configuration';
    } else if (/^- Service UI.*Assets:/i.test(trimmed)) {
      section = 'serviceUIAssets';
    } else if (/^- Special Notes:/i.test(trimmed)) {
      section = 'specialNotes';
    } else if (/^- Keywords:/i.test(trimmed)) {
      section = 'keywords';
      // Parse keywords from the rest of the line
      const rest = trimmed.replace(/^- Keywords:/i, '').trim();
      if (rest) {
        keywords.push(...rest.split(/,\s*/).map(k => k.trim()).filter(Boolean));
      }
    } else if (trimmed.length > 0) {
      // Indented or sub-bullet lines: treat as content for the current section
      if (section === 'summary') summary.push(trimmed.replace(/^[-*]\s*/, ''));
      else if (section === 'codebase') codebase.push(trimmed.replace(/^[-*]\s*/, ''));
      else if (section === 'buildDeployment') buildDeployment.push(trimmed.replace(/^[-*]\s*/, ''));
      else if (section === 'amiManagement') amiManagement.push(trimmed.replace(/^[-*]\s*/, ''));
      else if (section === 'database') database.push(trimmed.replace(/^[-*]\s*/, ''));
      else if (section === 'configuration') configuration.push(trimmed.replace(/^[-*]\s*/, ''));
      else if (section === 'serviceUIAssets') serviceUIAssets.push(trimmed.replace(/^[-*]\s*/, ''));
      else if (section === 'specialNotes') specialNotes.push(trimmed.replace(/^[-*]\s*/, ''));
      else if (section === 'keywords') {
        keywords.push(...trimmed.replace(/^[-*]\s*/, '').split(/,\s*/).map(k => k.trim()).filter(Boolean));
      }
    }
  }
  return {
    title,
    summary: summary.join(' '),
    codebase: codebase.length ? codebase : undefined,
    buildDeployment: buildDeployment.length ? buildDeployment : undefined,
    amiManagement: amiManagement.length ? amiManagement : undefined,
    database: database.length ? database : undefined,
    configuration: configuration.length ? configuration : undefined,
    serviceUIAssets: serviceUIAssets.length ? serviceUIAssets : undefined,
    specialNotes: specialNotes.length ? specialNotes : undefined,
    keywords
  };
}

export async function analyzeImage(
  imageData: string,
  settings: VisionSettings,
  prompt: string
): Promise<{ summary: string; keywords: string[] }> {
  const { visionProvider, apiKey, ollamaModel, ollamaUrl } = settings;

  let text = '';
  if (visionProvider === 'gpt4v') {
    const res = await requestUrl({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          { role: 'user', content: [
            { type: 'image_url', image_url: { url: imageData } },
            { type: 'text', text: prompt }
          ] }
        ]
      })
    });
    text = res.json.choices[0].message.content;
  } else if (visionProvider === 'gemini') {
    const client = getClient(apiKey);
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/png', data: imageData.split(',')[1] } }
          ]
        }
      ]
    });
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (typeof content === 'string') {
        text = content;
      } else if (content && typeof content === 'object') {
        if ('text' in content && typeof content.text === 'string') {
          text = content.text;
        } else if (Array.isArray(content.parts)) {
          text = content.parts.map((p: any) => p.text || '').join(' ');
        }
      }
    }
  } else {
    const res = await requestUrl({
      url: `${ollamaUrl}/v1/models/${ollamaModel}/chat`,
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        images: [imageData.split(',')[1]]
      })
    });
    text = res.json.response;
  }

  console.log('[VisionImageIndexer] Raw model output:', text);
  // Parse and format the output for Obsidian
  const structured = parseGeminiStructured(text);
  console.log('[VisionImageIndexer] Parsed structure:', structured);
  const formatted = formatGeminiOutputToObsidian(structured);
  // For compatibility, return summary as the formatted block, and keywords as the parsed keywords
  return { summary: formatted, keywords: structured.keywords };
} 