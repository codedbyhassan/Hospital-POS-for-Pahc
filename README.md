# PAHC POS

A modern, responsive Point of Sale and inventory management application built for Patricia Appiagyei Health Centre (PAHC). This project helps staff process billing transactions quickly, manage services and drugs, maintain receipt history, and back up clinic data with ease.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwindcss)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Data Management](#data-management)
- [Deployment Options](#deployment-options)
- [Contributing](#contributing)
- [License](#license)

## Overview

PAHC POS is designed for real-world clinic operations where speed, accuracy, and reliability matter. The app combines a polished sales interface with administrative tools for product management, receipt tracking, and secure local backups.

It is suitable for:
- day-to-day patient billing
- service and drug item management
- receipt review and reprinting
- backup and restore workflows for operational continuity

## Features

- Fast and intuitive point-of-sale billing workflow
- Support for both Cash and NHIS pricing modes
- Product and category management for services and drugs
- Stock-aware cart behavior with expiry checks for inventory items
- Receipt generation with PDF and Excel export options
- Full receipt history with filtering and summary reporting
- Import/export backup functionality with auto-backup support
- Responsive UI with light and dark theme support
- Cross-platform support through web, Android, and Electron targets

## Tech Stack

- Frontend: React 18 + TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS + shadcn/ui components
- Routing: React Router
- State Management: React Context API
- Data Persistence: LocalStorage with JSON export/import
- Reporting: jsPDF and xlsx
- Testing: Vitest + Testing Library

## Project Structure

```text
src/
├── components/          # Reusable UI and layout components
├── context/             # Billing, product, theme, and loading providers
├── data/                # Seed product and category data
├── hooks/               # Custom hooks
├── lib/                 # Validation, persistence, and utility helpers
├── pages/               # Main application screens
└── test/                # Unit and integration tests
```

## Getting Started

### Prerequisites

Make sure the following are installed on your machine:

- Node.js 18 or higher
- npm 9 or higher

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd Hospital-POS-for-Pahc
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open the application in your browser at:
   ```text
   http://localhost:5173
   ```

### Production Build

```bash
npm run build
```

## Available Scripts

- `npm run dev` — Start the Vite development server
- `npm run build` — Create a production build
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint checks
- `npm run test` — Run the test suite
- `npm run test:watch` — Run tests in watch mode
- `npm run android:build` — Build the Android app and sync Capacitor
- `npm run electron-dev` — Launch the Electron desktop version in development

## Data Management

The application stores products, categories, and receipts locally in the browser. It also supports:

- JSON export for backup purposes
- JSON import to restore or migrate data
- Automatic backup snapshots
- Manual restore from the most recent backup
- Full data reset for administrative cleanup

## Deployment Options

The project supports multiple delivery modes:

- Web application for everyday clinic use
- Android app via Capacitor
- Desktop application via Electron

## Contributing

Contributions are welcome. If you would like to improve the app, please open an issue or submit a pull request with a clear description of the change.

## License

This project is proprietary software for Patricia Appiagyei Health Centre and is intended for internal operational use.
