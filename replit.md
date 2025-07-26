# AI Copywriter - System Architecture

## Overview

This is a full-stack AI-powered copywriting platform built for generating advertising copy and landing pages across multiple platforms, specifically tailored for Jones Road Beauty brand guidelines. The application uses Claude AI (via Anthropic SDK) for authentic copywriting generation, with a modern React frontend, Node.js/Express backend, and is designed for deployment on Replit. The system features sophisticated persona targeting, Brand/DR balance controls, and professional UI built with shadcn/ui components.

## Recent Changes (July 2025)

- **Claude AI Integration Complete**: Successfully integrated Anthropic's Claude 4.0 Sonnet for authentic ad copy generation
- **Brand Guidelines Implementation**: Built Jones Road Beauty brand voice and positioning into system prompts
- **Persona Targeting System**: Added detailed sub-personas (Life Juggler → New Mom, etc.) for precise audience targeting
- **Brand/DR Balance Controls**: Real-time slider showing percentage balance (defaults to 50%), influences copy style
- **API Structure Fixed**: Resolved fetch API request structure issues that were causing frontend errors
- **Response Parsing Enhanced**: Robust parsing system for Claude's natural language responses into structured headlines and primary text
- **Application Rebranding**: Updated from "Meta Ad Generator" to "AI Copywriter" to reflect broader platform capabilities
- **Advanced Copywriting Frameworks**: Integrated 5 specific headline frameworks (benefit-driven, social proof, offer-driven, value props, problem-focused) with proven template structures

## User Preferences

Preferred communication style: Simple, everyday language.

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

**Frontend Architecture Choice**: React with TypeScript was chosen for type safety and component reusability. Vite provides fast development builds and hot reloading. The shadcn/ui approach gives high-quality components while maintaining customization flexibility.

**Database Strategy**: Drizzle ORM provides type-safe database queries with PostgreSQL. The serverless Neon database connection supports the Replit deployment model with automatic connection pooling.

**State Management**: TanStack Query handles server state with caching and synchronization, while local React state manages UI interactions. This hybrid approach reduces complexity while maintaining good UX.

## Key Components

### Database Layer
- **Schema**: User management with username/password authentication
- **Connection**: Serverless PostgreSQL via Neon with WebSocket support
- **Migrations**: Drizzle Kit for schema management and migrations

### API Layer
- **File Upload**: `/api/upload-video` endpoint for video transcription processing
- **Content Generation**: `/api/generate-ad-copy` for AI-powered copy generation
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Frontend Components
- **Meta Ad Generator**: Main application interface with tabbed navigation
- **UI Components**: Complete shadcn/ui component library (buttons, forms, dialogs, etc.)
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Authentication System
- **User Model**: Simple username/password based authentication
- **Storage**: In-memory storage implementation with interface for future database integration
- **Session Management**: Express session handling

## Data Flow

1. **User Input**: Users provide video files, transcriptions, or text content through the React frontend
2. **File Processing**: Uploaded videos are processed server-side for transcription extraction
3. **Content Generation**: User inputs are sent to AI generation endpoints (placeholder implementation)
4. **State Management**: Generated content is cached client-side using TanStack Query
5. **User Interaction**: Copy-to-clipboard functionality and content refinement through the UI

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production bundling for server code

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling integration

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with React Fast Refresh
- **TypeScript**: Real-time type checking across client and server
- **Database**: Drizzle Kit for schema push and migration management

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Environment**: NODE_ENV-based configuration switching

### Replit Deployment
- **File Structure**: Monorepo with `client/`, `server/`, and `shared/` directories
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Static Serving**: Express serves built frontend assets in production
- **Process Management**: Single Node.js process handling both frontend and API routes

The architecture supports scalable development with clear separation between frontend and backend concerns, while maintaining simplicity for the Replit deployment environment.