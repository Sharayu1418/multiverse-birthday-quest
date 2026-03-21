# Multiverse Birthday Quest

Multiverse Birthday Quest is a custom React and TypeScript web experience built as a birthday adventure. The player moves through a set of themed worlds, completes puzzles, unlocks story moments, and restores the multiverse one world at a time.

The project is designed as a playful, cinematic single-page app rather than a traditional game. Each world has its own visual language, puzzle flow, audio cues, and finale sequence, while the hub ties progress together and unlocks the final reward.

## Worlds

- Marvel Universe
  - Intro video, riddle flow, and themed puzzle sequence
- Harry Potter World
  - Marauder's Map inspired challenge with a story-driven reveal
- Stranger Things
  - Signal decoding, light puzzles, and Vecna clock moments
- Friends
  - Trivia-driven image reveal, finale questions, and an in-app gang video
- Percy Jackson
  - Camp Half-Blood intro, temple puzzle, prophecy, and Olympus blessing sequence

The repository also includes support for hidden or extra worlds through the shared puzzle page.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Vitest

## Project Structure

```text
src/
  components/
    friends/
    marvel/
    potter/
    stranger/
    ui/
  hooks/
  lib/
  pages/
  utils/

public/
  audio/
  images/
```

Key files:

- `src/App.tsx`
  - Application routes
- `src/pages/HubPage.tsx`
  - World hub, progress display, and final reward reveal
- `src/lib/worldsData.ts`
  - Shared world metadata
- `src/components/*`
  - World-specific interactions and shared UI pieces

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app runs at:

```text
http://localhost:8080
```

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the production bundle into `dist/`.

```bash
npm run preview
```

Serves the production build locally.

```bash
npm run lint
```

Runs ESLint across the codebase.

```bash
npm run test
```

Runs the test suite once with Vitest.

```bash
npm run test:watch
```

Runs Vitest in watch mode.

## Deployment

This project is ready to deploy to Vercel as a standard Vite app.

Recommended settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

If you connect the repository to Vercel, each push to the selected branch will trigger a fresh deployment.

## Notes

- Most media used by the experience is loaded from `public/` or imported from `src/assets/`.
- Several worlds include inline video and audio playback, so browser autoplay rules can affect behavior depending on the environment.
- The project is highly presentation-driven. Small styling or timing changes can noticeably affect the feel of a world, so test visual updates in the browser whenever possible.

## License

This project was built as a custom personal experience. Reuse of code or assets should be reviewed before redistribution.
