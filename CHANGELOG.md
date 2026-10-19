# CHANGELOG

## 2026-10-18
- Initialized version tracking (`src/version.ts`) and Hybrid Engine (`src/lib/hybridEngine.ts`).
- Started implementation of automatic versioning and backup mechanisms.
- Updated `src/components/BrahmastraUltraAgent.tsx` to use Hybrid Engine and APP_VERSION.
- Renamed `RESTART_TRACKER.md` to `BACKUP.md` and updated history details (linked to backend storage).
- Fixed linting errors in `src/components/BrahmastraUltraAgent.tsx` by adding missing React imports.
- Updated UI in `src/components/BrahmastraUltraAgent.tsx` from "PWA System Update" to "Hybrid Engine Update".
- Fully transitioned to Hybrid Engine, removed all version numbering in UI.
- Updated all system versioning in sw.js and hybridEngine.ts to HYBRID VERSION.
- Centralized all hybrid versioning, engine mode, and sync status configuration into `src/version.ts`.
- Updated `BACKUP.md` with complete hybrid coding, timestamp, and Gemini Agent details.
- Added `PDF_VERSION` to `src/version.ts` and updated `src/components/Reader.tsx` to fully utilize hybrid centralized versioning.
- Increased top navigation header board height by 20% while preserving exact width, design, and colors.
- Added hybrid engine 5-color blinking 'H' indicator connected to hybrid engine and network status.
- Restored and connected TWA Web App System with Hybrid Engine in `src/version.ts` and `src/components/BrahmastraUltraAgent.tsx`.
- Integrated automatic Service Worker update detection (`src/main.tsx`) and dynamic cache (`public/sw.js`) to ensure all edits instantly reflect in installed mobile PWA/TWA applications.
- Configured direct FTP server, username, and password credentials in `.github/workflows/deploy.yml` to resolve GitHub Actions deployment action failures.
- Generated `public_html_deploy.zip` containing the complete production build (`dist/`) for direct manual upload to cPanel `public_html/`.
- Added `/api/download-cpanel-zip` endpoint in `server.ts` to allow direct browser download of `public_html_deploy.zip`.
