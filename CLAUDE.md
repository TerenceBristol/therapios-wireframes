# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks

### Package Management
This project uses npm as the package manager (package-lock.json present). Install dependencies with `npm install`.

## Architecture

### Project Purpose
This is a Next.js wireframing tool for creating interactive mockups of Therapios (therapy management system) features. The tool runs locally and is used for client presentations and screen recordings, not production deployment.

### Core Structure
- **Next.js 15.2.1** with React 19, TypeScript, and Tailwind CSS
- **App Router** structure under `src/app/`
- **Component-based wireframe system** with reusable components
- **Stagewise integration** for development tooling (@stagewise packages)

### Wireframe Architecture
The wireframe system is organized into two categories:
- **Final Wireframes** (`src/app/wireframes/`) - Production-ready mockups
- **Draft Wireframes** (`src/app/wireframes/drafts/`) - Work-in-progress mockups

Each wireframe is a separate page under its own directory with a `page.tsx` file.

### Key Components
Located in `src/components/`:

**Core Layout Components:**
- `WireframeLayout` - Main page layout with optional sidebar and Therapios branding
- `Navbar` - Navigation header with user info and custom nav items

**Wireframe Building Blocks:**
- `WireframeBox` - Dashed border placeholder containers with labels
- `WireframeButton` - Buttons with variants (primary, secondary, outline, text) and sizes
- `WireframeFormControl` - Form inputs supporting text, select, checkbox, radio, textarea
- `WireframeImage` - Image placeholders
- `WireframeThumbnail` - Wireframe preview cards for the main listing page

**Feature-Specific Components:**
- `AnnouncementBanner` & `AnnouncementManager` - Announcement system components
- Various modal components for specific workflows (PrescriptionActionModal, CancelRenewalModal, etc.)

### Design System
- **Primary color**: `#0f2c59` (dark blue)
- **Typography**: Geist Sans and Geist Mono fonts
- **Framework**: Tailwind CSS with custom Therapios branding
- **Icons**: Lucide React for consistent iconography

### Special Features
- **ECH Resource Management** - Complex wireframe with dedicated components for managing therapist assignments to Elderly Care Homes
- **Treatment Documentation** - Multi-version treatment logging and documentation system
- **VO (Prescription) Management** - Various workflows for prescription ordering, renewals, and terminations

### Development Workflow
1. Create new wireframes in appropriate directory (`wireframes/` or `wireframes/drafts/`)
2. Use existing wireframe components for consistency
3. Add new wireframes to the main listing in `src/app/wireframes/page.tsx`
4. Follow the existing naming and organizational patterns

### Navigation Structure
The main wireframe listing (`/wireframes`) categorizes wireframes into "Final" and "Draft" sections. Each wireframe entry includes a thumbnail, title, description, and direct link.