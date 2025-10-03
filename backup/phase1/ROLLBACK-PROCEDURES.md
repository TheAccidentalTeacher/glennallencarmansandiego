# ROLLBACK PROCEDURES
## Emergency Restoration Procedures for Phase 1-4 Implementation

### Quick Emergency Rollback (Any Phase)
```bash
# In case of immediate production issues
cd /workspaces/glennallencarmansandiego

# Stop development servers if running
pkill -f "vite"
pkill -f "node.*server"

# Restore original case files
rm -rf content/cases/*
cp -r backup/phase1/original-cases/* content/cases/

# Verify restoration
ls -la content/cases/
```

### Phase-Specific Rollback Procedures

#### Phase 1 Rollback (Template & Documentation Changes)
```bash
# Restore original files if templates were modified
git status
git checkout -- GAME-FLOW.md  # If modifications went wrong
git checkout -- IMPLEMENTATION-PLAN.md  # If modifications went wrong

# Remove any new template files created
rm -f content/cases/TEMPLATE-*.json
rm -f content/cases/CONVERSION-*.md
```

#### Phase 2 Rollback (First Case Conversions)  
```bash
# Restore original case files (first 2-3 cases)
cp backup/phase1/original-cases/dr-altiplano-andean-mining-sabotage.json content/cases/
cp backup/phase1/original-cases/dr-coral-marine-research-sabotage.json content/cases/
cp backup/phase1/original-cases/dr-meridian-alpine-sabotage.json content/cases/

# Verify API still works
curl localhost:3001/api/content/cases
curl localhost:3001/health
```

#### Phase 3 Rollback (Batch Conversions)
```bash
# Full restoration of all cases
rm -rf content/cases/*
cp -r backup/phase1/original-cases/* content/cases/

# Check for any API changes that need reverting
git diff src/server.ts
git diff src/api/
```

#### Phase 4 Rollback (Testing & Production)
```bash
# Complete system restoration
rm -rf content/cases/*
cp -r backup/phase1/original-cases/* content/cases/

# Revert any server changes
git checkout -- src/server.ts
git checkout -- src/api/

# Restart fresh development environment
npm run dev
```

### Validation After Rollback
```bash
# 1. Check file integrity
ls -la content/cases/ | wc -l  # Should show 16 items (15 cases + README)

# 2. Verify API endpoints
curl localhost:3001/health
curl localhost:3001/api/content/cases | jq length  # Should return 15

# 3. Test frontend loads
curl localhost:5173 | grep -o "<title>.*</title>"

# 4. Test specific case loading
curl localhost:3001/api/content/cases/dr-altiplano-andean-mining-sabotage.json | jq .title

# 5. Verify image serving
curl -I localhost:3001/images/villains/04-dr-altiplano-isabella-santos/generated-image-2025-09-25%20(15).png
```

### Recovery Checklist
- [ ] Original case files restored from backup
- [ ] Development servers restart successfully  
- [ ] Health endpoint returns 200 OK
- [ ] Case list API returns 15 cases
- [ ] Frontend loads without errors
- [ ] At least one full case loads completely
- [ ] Image serving works for villain photos
- [ ] Session creation and clue revealing functional
- [ ] Map guessing and scoring operational

### Backup Verification Commands
```bash
# Verify backups are intact before starting any phase
find backup/phase1 -name "*.json" | wc -l  # Should be 15
find backup/phase1 -name "README.md" | wc -l  # Should be 1
du -sh backup/phase1/  # Should show reasonable size

# Verify specific important cases exist
ls backup/phase1/original-cases/dr-altiplano-andean-mining-sabotage.json
ls backup/phase1/original-cases/dr-coral-marine-research-sabotage.json
ls backup/phase1/original-cases/professor-atlas-boundary-mapping-sabotage.json
```

### Git-Based Rollback (Alternative)
```bash
# If using git tracking (recommended)
git add -A
git commit -m "Pre-implementation backup - Phase X"

# Later rollback:
git log --oneline | head -5  # Find the backup commit
git reset --hard <backup-commit-hash>
```

### Production Railway Rollback
If changes are pushed to production accidentally:
```bash
# Use Railway CLI to rollback
railway rollback  # If Railway CLI is available

# Or redeploy from a known good commit
git checkout <last-good-commit>
git push origin main --force-with-lease
```

### Emergency Contact Information
- **Repository**: /workspaces/glennallencarmansandiego  
- **Backup Location**: /workspaces/glennallencarmansandiego/backup/phase1/
- **Primary Case Count**: 15 villain cases + README.md
- **Critical Files**: All .json files in content/cases/
- **Server Ports**: 3001 (backend), 5173 (frontend)
- **Key API**: /api/content/cases (must return 15 items)

### Prevention Measures
1. Always test rollback procedures in development before production
2. Keep backup verification commands handy
3. Document any new dependencies or breaking changes
4. Test full game flow after any restoration
5. Monitor health endpoints during and after rollback