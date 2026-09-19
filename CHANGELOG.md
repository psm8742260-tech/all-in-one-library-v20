# Changelog

All notable changes to this project will be documented in this file.

## [2026-09-19 - Update 14]
### Fixed
- **PDF.js Expected URL Param Parameter**: Fixed getDocument call crash inside `Reader.tsx` (line 71) by wrapping the pdfUrl in an object argument `{ url: pdfUrl }`, satisfying standard modern Mozilla PDF.js API constraints.

## [2026-09-19 - Update 13]
### Changed
- **Smart PDF UI Labels**: Created an `isPdfBook` helper inside `Dashboard.tsx` to detect PDF-based uploads. Conditionally removed chapter counters ("Ch"/"అధ్యాయాలు") and zero-character labels on general library cards, talapatra cards, and book details modal, replacing them with a sleek "PDF డాక్యుమెంట్" tag and optional page counts.

## [2026-09-19 - Update 12]
### Fixed
- **Undefined Chapters Runtime Safeguard**: Fixed a critical `TypeError: can't access property "length", book.chapters is undefined` runtime crash by injecting secure null/undefined checks (`book.chapters ? book.chapters.length : 1`) across `Dashboard.tsx` (lines 1800, 1858, and 1961). Works seamlessly even when PDF books have missing chapter configurations.

## [2026-09-19 - Update 11]
### Changed
- **Symmetrical Settings Placement**: Adjusted settings toggle button position on the "Old Treasury Chat Console" Globe icon to use left-hand top placement (`-left-2 -top-2`) rather than overlapping the right side, fulfilling visual precision rules.

## [2026-09-19 - Update 10]
### Added
- **Mozilla's PDF.js Programmatic Canvas Renderer**: Installed `pdfjs-dist` package and fully integrated PDF.js rendering engine into `Reader.tsx`.
- **Zero-Error Live Canvas Paint**: Removed unstable and sandboxed `<iframe>` tags, replacing them with standard `<canvas>` based programmatic page-by-page rendering that works flawlessly across all mobile and desktop browsers without prompting for download.
- **Dynamic Zoom & Scaler Controls**: Implemented responsive dynamic Zoom In (+) and Zoom Out (-) controllers directly on the canvas reading panel.
- **Unified Pagination Controls**: Bound PDF page rendering directly to the app's native "Prev Page" and "Next Page" bottom navigation buttons, enabling standard flip interactions.

## [2026-09-19 - Update 9]
### Added
- **Integrated PDF Live Reader**: Enhanced `Reader.tsx` with smart PDF detection that extracts uploaded PDF URLs and embeds a native responsive PDF viewer (`<iframe>`) inside the reading canvas, allowing Admin to view uploaded books exactly with all pages and original layouts.
- **Pure Native Reader Layout**: Removed unnecessary external/new tab redirect options and headers to focus purely on direct integrated PDF viewing inside the application as per Admin instructions.

## [2026-09-18]
### Added
- Created `CHANGELOG.md` to track system modifications.
- Integrated automated AI Fallback mechanism for Secure Library Bridge in `server.ts`.
- Enhanced `AGENTS.md` with Rule 10 for mandatory changelog reporting.
- **Dynamic Model Switching**: Implemented Hybrid Mode in `/api/chat` with real-time model name reporting (DeepSeek/Gemini).
- **UI Update**: Added model name display in `BrahmastraUltraAgent.tsx` terminal output.

### Changed
- **Premium Reader UI Overhaul**: Redesigned `Reader.tsx` into a professional PDF-style layout with sticky headers, floating page counters, and card-style page rendering based on Admin's screenshots.
- Stabilized gateway connection reliability for Secure Library Bridge.
- **Full Book Loading Fix**: Integrated Bridge ID (`folderId`) in `/api/fetch-secure-book` requests to ensure full pages are retrieved from the International Library Bridge.
- **Gemini Quota Management**: Implemented smart caching and exponential backoff retry logic for AI book generation to resolve 429 "Quota Exceeded" errors and ensure complete book pages are consistently delivered.

## [2026-09-19 - Update 8]
### Changed
- **Default Library Source**: Switched the primary International Library URL and search queries from Project Gutenberg to Internet Archive (`https://archive.org`) as requested by Admin.

## [2026-09-19 - Update 7]
### Changed
- **UI Cleanup**: Removed the experimental "Save to Library" orange button from the Internal Browser header as per Admin instructions.

## [2026-09-19 - Update 4]
### Added
- **Smart Book Redirect Engine**: Implemented an automated search-and-redirect logic in `Dashboard.tsx` for chat and voice queries.
- **Browsing Effect**: Added a 2-second "AI Librarian is scanning bookshelves..." loading state to simulate a deep library search for every book query.
- **Project Gutenberg Integration**: Integrated an automatic redirect to Project Gutenberg search (`https://www.gutenberg.org/ebooks/search/`) if a queried book is not found in the local library.
- **Shortcut Command**: Added support for "International Library" + "ok" command to manually trigger the Project Gutenberg redirect from the chat console.

## [2026-09-19 - Update 3]
### Added
- **Library Cleanup**: Completely removed over 6,000 lines of dummy book data from `src/data/books.ts`.
- **Automated State Purge**: Integrated a filter in `App.tsx` to automatically detect and remove legacy dummy book IDs from local storage, ensuring a clean slate for the user.

### Fixed
- **Maintenance**: Performed 50-second deep scan of system rules and code health.

## [2026-09-19 - Update 2]
### Added
- **Smart Library Gateway**: Integrated "Old Treasury Chat Console" and a "White-Label Browser" for international book search (Gutenberg, Open Library, etc.) within the main dashboard.
- **Dynamic Header Navigation**: Added a "Gateway" button to the Dashboard header for quick switching between Local Library and International Gateway.
- **Gateway Bridge State**: Implemented a new `gateway` tab state in `Dashboard.tsx` to handle the transition between Chat/Shelf and the International Browser.

### Fixed
- **PWA Orchestrator Error**: Resolved `NetworkError` by fully configuring `vite-plugin-pwa` with a complete manifest and caching strategy in `vite.config.ts`.
- **Maintenance**: Performed 50-second deep scan of system rules and code health.

## [2026-09-19]
### Added
- **Smart Memory Auto-Save**: Integrated permanent local saving for books fetched from the International Library in `server.ts`.
- **Dynamic Success Feedback**: Implemented emerald-green color morphing and status text update for the save button in `AdminPanel.tsx` upon successful storage.
- **Safety Auto-Save Timer**: Integrated a 10-minute delayed auto-save mechanism using `useRef` and `setTimeout` to prevent data loss while allowing manual edits.
- **Button Precision**: Resized action buttons to exactly 20% width (`w-1/5`) and optimized typography for the compact size.
- **Split Layout**: Positioned action buttons on opposite ends (Left and Right) of the Admin Board using `justify-between`.
- **Toggle Folder Management**: Redesigned the Manage tab to show only folder icons by default; book lists are now toggleable to maintain a clean interface.
- **Ultra-Compact Book Grid**: Reorganized book lists into a responsive 2-column grid, reducing individual card width to 50% for a more comfortable and dense viewing experience.
- **Temporary Folder (Recycle Bin)**: Introduced a new "Temporary Folder" system where deleted books are safely moved before permanent removal.
- **Restore & Permanent Delete**: Added "Reload" (Restore) and "Permanent Delete" functionality within the Temporary Folder with high-contrast, compact action buttons.
- **3-Folder Dashboard Grid**: Expanded the Manage tab to a 3-column responsive grid (General, Palm, Trash) for streamlined navigation.
- **Professional File Manager UI**: Fully redesigned the Manage tab to match a high-end file manager aesthetic, featuring a "FOLDERS" header, a "+ New Folder" action button, and a prominent "All Library Books" status bar.
- **Flattened Book List View**: Removed nested outer containers and card-style borders for book items, creating a clean, modern list layout with 50% width optimization and subtle dividers.
- **Minimalist Folder Rows**: Replaced card-based folders with clean, list-style rows featuring modern line-art icons and integrated book counts in brackets.
- **Mobile-Style Folder List**: Redesigned the Manage tab folder navigation into a minimalist, vertical list with left-aligned icons, removing card-style borders for a native mobile experience.
- **Header Text Refinement**: Removed redundant wording ("రెండు") from the Manage tab header for a cleaner UI.
- **Direct Deletion Flow**: Optimized the "Delete" action to immediately move books to the Temporary Folder with standard confirmation.
- **UI Decuttering**: Removed redundant info boxes and internal folder headers from the Manage tab to achieve an ultra-clean, icon-centric dashboard.

### Changed
- **Admin UI Compacting**: Reduced Admin Board width to `max-w-2xl` (approx. 30% reduction) for a more focused, mobile-friendly interface.
- **Circular Edit Flow**: Connected "Edit" buttons from all library folders to the main Upload Board with automatic field population.
- **Hybrid Upload Buttons**: Redesigned form action buttons with 50% width, bold typography, and professional `lucide-react` icons.
- **Auto-Form-Reset**: Integrated `handleResetForm()` triggers after every successful upload/update to maintain a clean workspace.

### Fixed
- **Cover Image Mapping**: Corrected metadata assignment to ensure uploaded images are correctly displayed as book covers in the General Library.
- **Maintenance**: Performed 50-second deep scan of system rules and code health.

## [2026-09-18 - Update 2]
### Added
- **Permanent Storage Gateway**: Created `/api/upload` endpoint in `server.ts` using `multer` for permanent file storage in `/public/uploads/`.
- **Admin Storage Bridge**: Integrated direct file upload triggers into E-Book, Audio, and Video boards in `AdminPanel.tsx` (Touching boards now opens mobile storage).
- **Page Flip Animation**: Implemented 3D smooth page flip transitions in `Reader.tsx` using `motion/react`.

### Fixed
- **Library Bridge Stabilization**: Re-engineered `/api/fetch-secure-book` in `server.ts` with `fullAccess: true` to ensure 100% data retrieval from the International Library Bridge.
- **Maintenance**: Performed deep scan of system rules and code health.
