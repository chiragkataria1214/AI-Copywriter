# AI Copywriter

## Overview

This is a full-stack AI-powered copywriting platform for generating advertising copy and landing pages, specifically tailored for Jones Road Beauty brand guidelines. The application uses Claude AI (via Anthropic SDK) for authentic copywriting, featuring sophisticated persona targeting, Brand/DR balance controls, and a professional UI. The system is designed for deployment on Replit. Its core purpose is to provide an efficient and brand-consistent content generation tool for marketing teams.

## User Preferences

Preferred communication style: Simple, everyday language.
Preferred color scheme: #004182 blue (replaces Jones Road Beauty brand colors and previous Replit blue).

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui components (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React hooks with TanStack Query
- **Routing**: Wouter
- **UI/UX Decisions**: Professional interface built with shadcn/ui. Consistent grid selection patterns, unified conditional display, and consistent upload buttons across sections. Focus on seamless user experience with identical styling and behavior. Color scheme preference is #004182 blue.

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **File Upload**: Multer
- **Session Management**: Built-in memory storage

### Key Design Decisions
- **Frontend Architecture**: React with TypeScript for type safety and component reusability. Vite for fast development. shadcn/ui for high-quality, customizable components.
- **Database Strategy**: Drizzle ORM for type-safe PostgreSQL queries. Neon Database for serverless, Replit-compatible deployment with connection pooling. Comprehensive database includes a full Jones Road Beauty product catalog (12 products).
- **State Management**: TanStack Query for server state (caching, sync) and React state for UI interactions.
- **Review Integration**: Junip API integration for scalable, real-time customer review data. System supports automated imports and manual uploads, processing thousands of product-specific reviews for AI training.
- **AI Integration**: Claude AI (Anthropic SDK) for authentic copy generation, incorporating Jones Road Beauty brand voice, "Makeup Simplified" philosophy, and product-specific optimization.
- **Feature Specifications**:
    - **Ad Copy Generation**: Supports various platforms (e.g., Facebook, Instagram, TikTok), content goals, and tone options. Includes ad preview component.
    - **Landing Page Generation**: Integrates video transcription content, optimizes for mobile readability (8-12 word sentences), and supports various page types including multi-product pages. Incorporates real customer review insights and performance analysis.
    - **Organic Social Captions**: Full end-to-end functionality for generating captions from video transcriptions or product images, tailored for different social media platforms.
    - **Persona Targeting**: Detailed sub-personas for precise audience targeting.
    - **Brand/DR Balance**: Slider control to influence copy style.
    - **Product Claims Validation**: System built from Google Sheets data to enforce accurate, approved product claims, especially with higher DR settings.
    - **Custom Request**: Flexible tab for open-ended copywriting requests with revision capabilities, maintaining Jones Road voice.
    - **Authentication System**: Secure login/registration flow with role-based access (admin/team member) and user management. Authentication is currently bypassed for immediate app access on deployed version.

### Data Flow
User input (video files, transcriptions, text) -> Server-side processing (transcription extraction) -> AI generation endpoints -> Client-side caching (TanStack Query) -> UI display and interaction.

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **Anthropic SDK**: For Claude AI integration

### Development Tools
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production bundling for server code

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling integration

### Third-Party Services
- **Claude AI (Anthropic)**: Core AI for copy generation.
- **Neon Database**: Serverless PostgreSQL database.
- **Junip**: Platform for comprehensive customer review scraping and import.