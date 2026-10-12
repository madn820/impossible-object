# The Impossible Object — Procedural 3D teaser

15-second 1920×1080 cinematic code-generated animation. Three.js → Playwright → FFmpeg. No Blender, paid rendering API, or premade 3D models.

## GitHub Actions (cloud)
1. Create a **public** GitHub repository (only if you are comfortable sharing source code publicly).
2. Upload **the contents of this folder**, including the hidden `.github/workflows/render.yml` file. For complete folder structure, use GitHub Desktop, or upload ordinary files and create the workflow file via GitHub web editor.
3. Open **Actions → Render Impossible Object → Run workflow**.
4. Leave `preview_only` checked first. After success, run again with it unchecked to render the full 15 seconds.
5. Open completed run, under **Artifacts** download `impossible-object-video` (ZIP containing MP4).

GitHub free runner has **no dedicated GPU**; SwiftShader software rendering can be very slow or fail. Artifacts are retained for 7 days. Don't assume success before logs show it.

## Local Windows
Requires Node.js 22+, FFmpeg available on PATH, and Chromium installed by Playwright.
1. Run `setup.bat` once (internet required to download npm dependencies).
2. Run `preview.bat` for 5 s / 720p.
3. Run `render.bat` for 15 s / 1080p / 60 fps. Or `render-quality.bat` for 3 temporal samples per frame (much slower).
4. Get video from `output/impossible_object_final.mp4`.

## Preview / editor
Run `npm install`, `npm run start`. Open `http://127.0.0.1:5173`; call `window.seek(7.5)` in browser console to inspect a chosen time. Time alone determines all animation transforms. Video rendering uses a fixed viewport.

## Caveats
This is a real, original coded scene, not a recreation of any commercial video. Effects and lighting are rasterized WebGL approximations, not ray tracing. Full cloud render can take hours on CPU. An initial successful preview is essential. Soundtrack uses a standalone deterministic PCM synthesizer in Node.js for reliable WAV generation; it doesn't depend on OfflineAudioContext.
