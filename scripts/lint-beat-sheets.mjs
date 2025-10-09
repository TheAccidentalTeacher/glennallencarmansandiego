#!/usr/bin/env node
/**
 * Beat Sheet Linter
 * Validates structure of beat sheet markdown files in docs/novel.
 * Checks:
 *  - Presence of required 9 beats (Hook .. Forward Tag) row count in main table
 *  - Required columns existence (#, Type, Title / Focus, Content Summary ... )
 *  - Beat Type tokens limited to allowed set
 *  - Optional: Warn if KB not present when chapter should introduce one (heuristic)
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const NOVEL_DIR = join(process.cwd(), 'docs', 'novel');
const FILE_PATTERN = /^BEAT-SHEET-CH\d+/;
const REQUIRED_COLUMNS = ['#','Type','Title / Focus','Content Summary','Pedagogy','Output'];
const REQUIRED_BEATS = 9; // standard structure
const TYPE_SET = new Set(['LOG','SCN','KB','ETH','INT','SYN','FX','TRN']);

let exitCode = 0;

function lintFile(file){
  const text = readFileSync(file,'utf8');
  const lines = text.split(/\r?\n/);
  const tableStart = lines.findIndex(l => l.startsWith('| # |'));
  if(tableStart === -1){
    console.warn(`[WARN] ${file}: No primary beat table found.`);
    exitCode = 1;
    return;
  }
  const header = lines[tableStart];
  for(const col of REQUIRED_COLUMNS){
    if(!header.includes(col)){
      console.error(`[ERROR] ${file}: Missing required column '${col}'.`);
      exitCode = 1;
    }
  }
  // Collect beat rows until blank or non-table line
  let i = tableStart + 2; // skip separator line
  const beatRows = [];
  while(i < lines.length && lines[i].startsWith('|')){
    const row = lines[i];
    if(/\|\s*#\s*\|/i.test(row)){ i++; continue; }
    // naive detection: first cell after '|' until next '|'
    beatRows.push(row);
    i++;    
  }
  const beatCount = beatRows.length;
  if(beatCount !== REQUIRED_BEATS){
    console.error(`[ERROR] ${file}: Expected ${REQUIRED_BEATS} beat rows, found ${beatCount}.`);
    exitCode = 1;
  }
  // Type validation
  beatRows.forEach(r => {
    const cells = r.split('|').map(c=>c.trim());
    // cells[0] is empty (leading pipe), cells[1] = # or number, cells[2] = Type
    if(cells.length < 4) return;
    const type = cells[2];
    if(type && !TYPE_SET.has(type)){
      console.error(`[ERROR] ${file}: Unknown Type '${type}'.`);
      exitCode = 1;
    }
  });
}

function main(){
  const files = readdirSync(NOVEL_DIR).filter(f => FILE_PATTERN.test(f));
  if(files.length === 0){
    console.log('No beat sheet chapter files found.');
    return;
  }
  files.sort();
  files.forEach(f => lintFile(join(NOVEL_DIR,f)));
  if(exitCode){
    console.error('\nBeat sheet lint failed.');
    process.exit(exitCode);
  } else {
    console.log('Beat sheet lint passed.');
  }
}

main();
