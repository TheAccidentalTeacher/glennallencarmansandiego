import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// Frontend Content types (shape expected by src/api/content.ts on the client)
interface UICase {
  id: string;
  title: string;
  description: string;
  difficultyLevel: number;
  villainId: string;
  villainName?: string;
  targetLocationId: string;
  locationName?: string;
  locationCountry?: string;
  estimatedDurationMinutes?: number;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UIClue {
  id: string;
  caseId: string;
  type: string;
  content: string;
  revealOrder: number;
  difficultyLevel: number;
  pointsValue: number;
  culturalContext?: string;
  isActive: boolean;
}

// Helper: map difficulty strings to numeric scale expected by UI
const mapDifficulty = (d: unknown): number => {
  if (typeof d === 'number' && Number.isFinite(d)) return d as number;
  if (typeof d === 'string') {
    const k = d.toLowerCase();
    const table: Record<string, number> = {
      beginner: 1,
      easy: 1,
      medium: 2,
      intermediate: 3,
      hard: 4,
      advanced: 5,
      expert: 5,
    };
    return table[k] ?? 2;
  }
  return 2;
};

// Helper: naive HTML tag strip for clue content
const stripHtml = (html: string | undefined): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

// Resolve the cases directory relative to the project root
// Using process.cwd() to get the current working directory (project root)
// For Railway deployment, try multiple possible paths
const getCasesDirectory = (): string => {
  const possiblePaths = [
    path.resolve(process.cwd(), 'content', 'cases'),           // Development (project root)
    path.resolve(__dirname, '../../content', 'cases'),        // Built server relative (dist/)
    path.resolve(__dirname, '../../../content', 'cases'),     // Alternative build structure
    path.resolve(__dirname, './content', 'cases'),            // If content copied to dist/
    path.resolve(process.cwd(), '../content', 'cases'),       // Railway alternative
    path.resolve(process.cwd(), 'dist', 'content', 'cases'),  // Another Railway possibility
  ];
  
  for (const dir of possiblePaths) {
    if (fs.existsSync(dir)) {
      console.log(`📂 Found cases directory at: ${dir}`);
      return dir;
    } else {
      console.log(`📂 Checked path (not found): ${dir}`);
    }
  }
  
  console.error('❌ Could not find content/cases directory. Tried:', possiblePaths);
  // Return the most likely path as fallback
  return possiblePaths[0];
};

const casesDir = getCasesDirectory();

// Load and parse a single case JSON by id (filename without .json)
type FsRound = {
  id?: string;
  minutes?: number;
  focus?: unknown;
  clueHtml?: unknown;
  scoring?: { base?: unknown; distanceKmFull?: unknown };
  difficulty?: unknown;
};

type FsCase = {
  id?: string;
  slug?: string;
  title?: string;
  difficulty?: unknown;
  durationMinutes?: unknown;
  villainId?: string;
  briefing?: { headline?: unknown; narrativeHtml?: unknown };
  rounds?: unknown;
};

const loadCaseById = (caseId: string): FsCase | null => {
  const filePath = path.join(casesDir, `${caseId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as FsCase;
  } catch {
    return null;
  }
};

// List all case JSONs
const listAllCaseFiles = (): string[] => {
  if (!fs.existsSync(casesDir)) return [];
  return fs.readdirSync(casesDir).filter(f => f.toLowerCase().endsWith('.json'));
};

// Map a filesystem case JSON to the UI Case shape
const toNumber = (v: unknown, fallback: number): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

const mapFsCaseToUICase = (json: FsCase, mtimeISO: string): UICase => {
  return {
    id: (json.id || json.slug || 'unknown') as string,
    title: json.title || 'Untitled Case',
    description: (json.briefing?.headline as string | undefined) || stripHtml(json.briefing?.narrativeHtml as string | undefined) || '',
    difficultyLevel: mapDifficulty(json.difficulty),
    villainId: json.villainId || 'unknown',
    targetLocationId: '',
    estimatedDurationMinutes: toNumber(json.durationMinutes, 45),
    createdBy: 'filesystem',
    isActive: true,
    createdAt: mtimeISO,
    updatedAt: mtimeISO,
  };
};

// Map FS case rounds to UI clues
const mapFsCaseToUIClues = (json: FsCase): UIClue[] => {
  const caseId: string = (json.id || json.slug || 'unknown') as string;
  const rounds: FsRound[] = Array.isArray(json.rounds) ? (json.rounds as FsRound[]) : [];
  const clues: UIClue[] = [];
  rounds.forEach((r, idx) => {
    const focusArr = Array.isArray(r.focus) ? (r.focus as unknown[]) : [];
    const focusFirst = focusArr.length ? String(focusArr[0]).toLowerCase() : 'geography';
    const type = focusFirst === 'history' ? 'historical' : focusFirst === 'economics' ? 'economic' : focusFirst;
    const base = typeof r.scoring?.base === 'number' ? (r.scoring!.base as number) : 100;
    const level = mapDifficulty(r.difficulty ?? json.difficulty);
    clues.push({
      id: `${caseId}-r${idx + 1}`,
      caseId,
      type,
      content: stripHtml(r.clueHtml as string | undefined) || '',
      revealOrder: idx + 1,
      difficultyLevel: level,
      pointsValue: base,
      isActive: true,
    });
  });
  return clues;
};

const router = Router();

// GET /api/content/cases — list cases from filesystem
router.get('/cases', asyncHandler(async (_req: Request, res: Response) => {
  try {
    console.log('🔍 Cases directory path:', casesDir);
    console.log('🔍 Directory exists:', fs.existsSync(casesDir));
    
    const files = listAllCaseFiles();
    console.log('🔍 Found files:', files.length, files);
    
    const cases: UICase[] = files.map(file => {
      const fp = path.join(casesDir, file);
      console.log('🔍 Processing file:', fp);
      const stat = fs.statSync(fp);
      const json = JSON.parse(fs.readFileSync(fp, 'utf-8')) as FsCase;
      return mapFsCaseToUICase(json, stat.mtime.toISOString());
    });
    res.json({ success: true, data: { cases } });
  } catch (error) {
    console.error('🚨 Filesystem error:', error);
    throw new AppError('Failed to load cases from filesystem', 500);
  }
}));

// GET /api/content/cases/:caseId.json — serve raw case JSON for preview
router.get('/cases/:caseId.json', asyncHandler(async (req: Request, res: Response) => {
  const caseId = req.params.caseId;
  const json = loadCaseById(caseId);
  if (!json) {
    throw new AppError('Case not found', 404);
  }
  res.json(json);
}));

// GET /api/content/cases/:caseId/clues — derive clues from case JSON rounds
router.get('/cases/:caseId/clues', asyncHandler(async (req: Request, res: Response) => {
  const caseId = req.params.caseId;
  const json = loadCaseById(caseId);
  if (!json) {
    throw new AppError('Case not found', 404);
  }
  const clues = mapFsCaseToUIClues(json);
  res.json({ success: true, data: { clues } });
}));

// Optionally: GET /api/content/my-cases — same as list for FS mode
router.get('/my-cases', asyncHandler(async (_req: Request, res: Response) => {
  try {
    const files = listAllCaseFiles();
    const cases: UICase[] = files.map(file => {
      const fp = path.join(casesDir, file);
      const stat = fs.statSync(fp);
      const json = JSON.parse(fs.readFileSync(fp, 'utf-8')) as FsCase;
      return mapFsCaseToUICase(json, stat.mtime.toISOString());
    });
    res.json({ success: true, data: { cases } });
  } catch {
    throw new AppError('Failed to load cases from filesystem', 500);
  }
}));

export default router;
