#!/usr/bin/env node
// Validate villain dossiers (Markdown) against available images and basic schema.
// Usage: node scripts/validate-villain-dossiers.mjs [--write-stubs]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Project root is the parent of the scripts/ directory
const root = path.resolve(__dirname, '..');
const villainsDir = path.join(root, 'content', 'villains');
const imagesBase = path.join(villainsDir, 'images');
const templatePath = path.join(villainsDir, 'TEMPLATE.md');
const logsDir = path.join(root, 'logs');
const writeStubs = process.argv.includes('--write-stubs');

const ensureDir = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };

const readText = (p) => fs.readFileSync(p, 'utf-8');

const isDirectory = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };

const listDirs = (p) => {
  if (!isDirectory(p)) return [];
  return fs.readdirSync(p).filter((name) => isDirectory(path.join(p, name)));
};

const listMarkdown = (p) => {
  if (!isDirectory(p)) return [];
  return fs.readdirSync(p).filter((name) => name.toLowerCase().endsWith('.md'));
};

const toTitleCase = (s) => s.replace(/(^|[-_\s])([a-z])/g, (_, b, c) => (b ? ' ' : '') + c.toUpperCase());

const hyphenTokens = (slug) => slug.split('-').filter(Boolean);

// Heuristic: convert directory slug like "01-dr-meridian-elena-fossat" to { codename: "Dr. Meridian", fullName: "Elena Fossat" }
const inferNamesFromSlug = (slug) => {
  // Strip numeric prefix if present
  const parts = hyphenTokens(slug.replace(/^[0-9]+-/, ''));
  if (parts.length < 2) return { codename: toTitleCase(parts.join(' ')), fullName: '' };
  const titleToken = parts[0];
  let codeTokens = [titleToken];
  // If second token is a codename extension (e.g., dr + meridian, professor + tectonic)
  if (parts.length >= 2 && parts[1].length <= 12) {
    codeTokens = parts.slice(0, 2);
  }
  const nameTokens = parts.slice(codeTokens.length);
  const titleMap = { dr: 'Dr.', professor: 'Professor' };
  const title = titleMap[codeTokens[0]] || toTitleCase(codeTokens[0]);
  const codenameWord = codeTokens.length > 1 ? toTitleCase(codeTokens[1]) : '';
  const codename = codenameWord ? `${title} ${codenameWord}` : title;
  const fullName = nameTokens.map((t) => toTitleCase(t)).join(' ');
  return { codename, fullName };
};

// Parse key bullets from "Character Profile" section
const extractProfile = (mdText) => {
  const profile = {};
  const lines = mdText.split(/\r?\n/);
  let inProfile = false;
  for (const line of lines) {
    if (/^##\s+Character Profile/i.test(line)) { inProfile = true; continue; }
    if (inProfile && /^##\s+/.test(line)) break;
    if (inProfile) {
      const m = /^-\s*\*\*(.+?)\*\*:\s*(.+)$/.exec(line.trim());
      if (m) {
        const key = m[1].toLowerCase().replace(/\s+/g, '_');
        profile[key] = m[2].trim();
      }
    }
  }
  return profile; // expects codename, full_name, specialty, region, cultural_inspiration, difficulty
};

const loadDossiers = () => {
  const files = listMarkdown(villainsDir).filter((f) => f.toLowerCase() !== 'template.md');
  const dossiers = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/i, '');
    const text = readText(path.join(villainsDir, file));
    // Skip files that are placeholders indicating archival/move
    if (/^\s*this file has been archived/i.test(text) || /\barchived\b/i.test(text.split(/\r?\n/)[0] || '')) {
      continue;
    }
    const profile = extractProfile(text);
    dossiers.push({ file, slug, profile });
  }
  return dossiers;
};

const loadImageDirs = () => listDirs(imagesBase);

const validate = () => {
  const dossiers = loadDossiers();
  const imageDirs = loadImageDirs();
  const dossierSlugs = new Set(dossiers.map((d) => d.slug));
  const imageSlugs = new Set(imageDirs);

  const missingDossiers = imageDirs.filter((dir) => !dossierSlugs.has(dir));
  const orphanDossiers = dossiers.filter((d) => !imageSlugs.has(d.slug));

  // Basic schema checks
  const schemaIssues = [];
  for (const d of dossiers) {
    const p = d.profile;
    const required = ['codename', 'full_name', 'specialty', 'region', 'cultural_background', 'difficulty'];
    const missing = required.filter((k) => !(k in p) || !String(p[k]).trim());
    const difficultyNum = parseInt(String(p.difficulty || ''), 10);
    if (missing.length || !(difficultyNum >= 1 && difficultyNum <= 5)) {
      schemaIssues.push({ slug: d.slug, file: d.file, missing, difficulty: p.difficulty || null });
    }
  }

  return { dossiers, imageDirs, missingDossiers, orphanDossiers, schemaIssues };
};

const generateStubFor = (slug) => {
  const tpl = readText(templatePath);
  const { codename, fullName } = inferNamesFromSlug(slug);
  let stub = tpl;
  stub = stub.replace('[Professional title, not cultural reference]', codename || 'Dr. [Codename]');
  stub = stub.replace('[Culturally appropriate name without stereotyping]', fullName || '[Full Name]');
  // Fill a few helpful defaults
  stub = stub.replace('[Professional field of expertise]', 'Geography Researcher');
  stub = stub.replace('[Geographic area of professional focus]', '');
  stub = stub.replace('[Professional tradition, academic background]', '');
  stub = stub.replace('[How character avoids stereotypes and shows dignity]', 'Focuses on professional expertise and geography.');
  stub = stub.replace('[1-5 scale based on geographic complexity]', '3');
  const outPath = path.join(villainsDir, `${slug}.md`);
  fs.writeFileSync(outPath, `# ${codename || 'Villain'}: ${fullName || ''}\n\n` + stub, 'utf-8');
  return outPath;
};

const main = () => {
  ensureDir(logsDir);
  if (!isDirectory(villainsDir)) {
    console.error('Missing directory:', villainsDir);
    process.exit(1);
  }
  if (!isDirectory(imagesBase)) {
    console.error('Missing images directory:', imagesBase);
    process.exit(1);
  }

  const report = validate();

  if (writeStubs && report.missingDossiers.length) {
    console.log(`Generating ${report.missingDossiers.length} dossier stub(s) to match images...`);
    for (const slug of report.missingDossiers) {
      try {
        generateStubFor(slug);
        console.log('  ✓ Created', slug + '.md');
      } catch (e) {
        console.warn('  ✗ Failed to create stub for', slug, e?.message || e);
      }
    }
  }

  // Recompute after possible stub generation
  const finalReport = validate();
  const outJson = path.join(logsDir, 'villain-validation-report.json');
  const outMd = path.join(logsDir, 'villain-validation-report.md');

  fs.writeFileSync(outJson, JSON.stringify(finalReport, null, 2), 'utf-8');

  const md = [];
  md.push('# Villain Dossier Validation Report');
  md.push('');
  md.push(`- Dossiers: ${finalReport.dossiers.length}`);
  md.push(`- Image folders: ${finalReport.imageDirs.length}`);
  md.push(`- Missing dossiers: ${finalReport.missingDossiers.length}`);
  md.push(`- Orphan dossiers: ${finalReport.orphanDossiers.length}`);
  md.push(`- Schema issues: ${finalReport.schemaIssues.length}`);
  md.push('');
  if (finalReport.missingDossiers.length) {
    md.push('## Missing Dossiers (have images, no MD)');
    finalReport.missingDossiers.forEach((s) => md.push(`- ${s}`));
    md.push('');
  }
  if (finalReport.orphanDossiers.length) {
    md.push('## Orphan Dossiers (have MD, no images)');
    finalReport.orphanDossiers.forEach((d) => md.push(`- ${d.slug} (${d.file})`));
    md.push('');
  }
  if (finalReport.schemaIssues.length) {
    md.push('## Schema Issues');
    finalReport.schemaIssues.forEach((s) => md.push(`- ${s.slug}: missing [${s.missing.join(', ')}], difficulty: ${s.difficulty}`));
    md.push('');
  }

  fs.writeFileSync(outMd, md.join('\n'), 'utf-8');
  console.log('Report written to:\n ', outJson, '\n ', outMd);
};

main();
