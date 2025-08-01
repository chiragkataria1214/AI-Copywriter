# AI Copywriter

## Overview
This project is a full-stack AI-powered copywriting platform designed for generating advertising copy and landing pages, specifically tailored to the Jones Road Beauty brand guidelines. It leverages Claude AI (via Anthropic SDK) for copy generation, featuring a React frontend, Node.js/Express backend, and is optimized for Replit deployment. Key capabilities include sophisticated persona targeting, Brand/DR balance controls, a professional UI built with shadcn/ui components, and specialized retention marketing functionalities for Email & SMS campaigns. The business vision is to provide a scalable system for generating authentic, brand-aligned marketing content, ensuring compliance with product claims, and enabling dynamic content configuration through a database-driven approach.

## Recent Changes (August 2025)
- **Email Output Format Optimization**: Updated retention email generation to produce template-ready copy for designed emails rather than plain text format. System now generates copy components (subject lines, preheader, main copy) that integrate seamlessly with professional email templates, matching Jones Road Beauty's actual email structure from milled.com examples.
- **Comprehensive Email Best Practices Integration**: Implemented detailed email copywriting frameworks covering 15 campaign types, subject line optimization, and segmentation strategies based on Jones Road Beauty's proven performance data.

## User Preferences
Preferred communication style: Simple, everyday language.
Preferred color scheme: #004182 blue (replaces Jones Road Beauty brand colors and previous Replit blue).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Library**: shadcn/ui components (Radix UI primitives)
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware-based architecture
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **File Upload**: Multer for handling multipart/form-data
- **Session Management**: Built-in memory storage for user sessions

### Key Design Decisions
- **Frontend Architecture**: React with TypeScript for type safety and component reusability; Vite for fast development; shadcn/ui for high-quality, customizable UI components.
- **Database Strategy**: Drizzle ORM for type-safe PostgreSQL queries; Neon database for serverless Replit deployment with connection pooling. Database-driven configuration for products, personas, and station prompts, eliminating hardcoded values and enabling scalable content management.
- **State Management**: Hybrid approach using TanStack Query for server state (caching, synchronization) and local React state for UI interactions.
- **Review Integration**: Comprehensive Junip web scraper for mass import of authentic customer reviews, enabling product-specific AI training.
- **AI Integration**: Uses Anthropic's Claude 4.0 Sonnet. Implements sophisticated prompt engineering for brand guidelines, persona targeting, Brand/DR balance, and specific copywriting frameworks (e.g., "5 Reasons Why" listicle format for landing pages).
- **Transparency System**: Detailed "Generation Details Modal" to display system/user prompts, model settings, and database configurations used for AI generation, aiding debugging and analysis.
- **Content Optimization**: Automated enforcement of mobile-optimized copy length (e.g., 8-12 words per sentence), integration of product claims validation, and dynamic adjustment of copy based on user feedback (e.g., removing intros from listicles, correcting shipping thresholds).
- **Authentication**: A multi-user system with role-based access (admin/team member) and secure session management, though it can be bypassed for public deployment.
- **Core Functionality**: Includes AI Ad Copy generation, Landing Page generation (single and multi-product, with customer review integration and transcription support), Email & SMS Retention copy generation, and a flexible Custom Request feature with a revision system.

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **@anthropic-ai/sdk**: Claude AI integration

### Development Tools
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production bundling for server code

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling integration