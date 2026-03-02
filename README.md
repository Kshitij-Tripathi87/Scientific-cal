# Scientific Calculator

A responsive scientific calculator built with React, Vite, and Tailwind CSS.

## Features

- Basic operations: `+`, `-`, `*`, `/`
- Scientific operations: `sin`, `cos`, `tan`, `sqrt`, `log`, `ln`, `x^y`, `x!`, `abs`, `mod`
- Constants and helpers: `pi`, `e`, `Ans`
- Angle mode toggle: `DEG` / `RAD`
- Memory controls: `MC`, `MR`, `M+`, `M-`
- History panel with reusable entries
- Keyboard support (`Enter`, `Backspace`, `Delete`, numbers, operators)

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3

## Getting Started

### Prerequisites

- Node.js (recommended v18+)
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open `http://127.0.0.1:5173` in your browser.

## Build for Production

```bash
npm run build
```

Production files are generated in the `dist/` directory.

## Deploy

This app is ready for static hosting platforms like Vercel and Cloudflare Pages.

Build settings:

- Build command: `npm run build`
- Output directory: `dist`

## Project Structure

```text
scientific-calculator/
  src/
    App.jsx
    main.jsx
    index.css
  index.html
  package.json
  tailwind.config.js
  postcss.config.cjs
  vite.config.js
```
