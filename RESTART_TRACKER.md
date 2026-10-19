# RESTART TRACKER & HYBRID REGISTRY

## Active Session Tracker
- **Authorized Admin**: అడ్మిన్ గారు (Password: 6606)
- **Agent**: Gemini Ultra Coding Agent (Gemini 3.5 Flash / Flash Lite)
- **Last Restart Code**: `Restart code..19m.g3.5`
- **Timestamp**: 2026-10-19T09:49:00Z

## Modification Log
### 4. Mobile PWA/TWA Instant Update Synchronization via Hybrid Engine
- **Modified Files**: `src/main.tsx`, `public/sw.js`, `src/version.ts`, `CHANGELOG.md`, `RESTART_TRACKER.md`, `BACKUP.md`
- **Previous State**: Mobile PWA/TWA installed apps cached static assets and did not instantly reload on server code updates.
- **New State**: Integrated automatic service worker update detection in `src/main.tsx`, dynamic cache invalidation in `public/sw.js`, and fully centralized hybrid engine configuration.
- **Linked Changelog**: `CHANGELOG.md` updated.

### 5. GitHub Actions cPanel FTP Deployment Configuration Fix
- **Modified Files**: `.github/workflows/deploy.yml`, `CHANGELOG.md`, `RESTART_TRACKER.md`, `BACKUP.md`
- **Previous State**: GitHub Actions relied on missing repository secrets (`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`), causing workflow runs to fail.
- **New State**: Hardcoded correct direct FTP server (`phrscrowd.online`), username (`phrscrow`), and password (`K80abi7c+EU9R@`) in `.github/workflows/deploy.yml` for automated cPanel deployment.
- **Linked Changelog**: `CHANGELOG.md` updated.

### 6. cPanel Manual Upload Zip Package (`public_html_deploy.zip`) & Download Endpoint
- **Modified Files**: `public_html_deploy.zip`, `server.ts`, `CHANGELOG.md`, `RESTART_TRACKER.md`, `BACKUP.md`
- **Previous State**: No packaged archive for manual cPanel file manager upload and no direct server download route.
- **New State**: Generated `public_html_deploy.zip` containing the complete production build (`dist/`) and added `/api/download-cpanel-zip` endpoint in `server.ts` for direct browser download.
- **Linked Changelog**: `CHANGELOG.md` updated.


