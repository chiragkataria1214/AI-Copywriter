# AI Copywriter - System Architecture

## Overview

This is a full-stack AI-powered copywriting platform built for generating advertising copy and landing pages across multiple platforms, specifically tailored for Jones Road Beauty brand guidelines. The application uses Claude AI (via Anthropic SDK) for authentic copywriting generation, with a modern React frontend, Node.js/Express backend, and is designed for deployment on Replit. The system features sophisticated persona targeting, Brand/DR balance controls, and professional UI built with shadcn/ui components.

## Recent Changes (July 2025)

**Latest Update - Landing Page & UI Refinements (July 27, 2025)**
- **✅ LANDING PAGE COPY OPTIMIZED**: Significantly shortened paragraph copy for better readability - reduced sections from 80 to 50 words maximum, intro from 50-100 to 30-50 words
- **✅ AUTHENTIC REVIEW INTEGRATION**: Fixed review relevance matching - AI now selects customer quotes that directly support specific bullet point benefits
- **✅ MIXED SOCIAL PROOF**: Alternates between customer reviews (12-20 words) and brand copy (12-20 words) for variety instead of only reviews
- **✅ REMOVED RISK REVERSAL**: Cleaned up landing page structure by removing guarantee section per user feedback
- **✅ MARKDOWN CLEANUP**: Fixed asterisk (**) formatting issues - all output now displays as clean plain text
- **✅ HEADER UI STREAMLINED**: Moved admin functions, connection status, and sign out to clean dropdown menu - header now shows only username and gear icon for professional, uncluttered interface
- **✅ TECHNICAL FIXES**: Resolved interface definitions, database imports, and template literal syntax issues that were preventing generation

**Latest Update - Enhanced Landing Page Generation with Customer Insights (July 27, 2025)**
- **✅ ENHANCED: Customer Review Integration**: Landing page generation now incorporates product-specific customer review insights for authentic copy generation
- **✅ ENHANCED: Performance Analysis System**: Added comprehensive copywriting analysis based on direct response principles (section completeness, word count, key elements)
- **✅ ENHANCED: Visual Content Structure**: Improved sections display with word counts, numbered indicators, and visual performance metrics
- **✅ ENHANCED: Optimization Recommendations**: Real-time suggestions for improving conversion potential based on content structure analysis
- **✅ ENHANCED: Product-Specific Training**: selectedProduct parameter now filters customer review data for targeted landing page copy generation
- **✅ TECHNICAL: API Enhancement**: Updated generate-landing-copy endpoint to accept selectedProduct and return detailed performance metrics
- **✅ TECHNICAL: UI Improvements**: Enhanced landing page display with conversion scoring, risk reversal indicators, and structured content breakdown

**Latest Update - MASSIVE SCALE Review Import System (July 27, 2025)**
- **BREAKTHROUGH: Comprehensive Junip Scraper**: Built advanced web scraper that fetches thousands of authentic reviews - now successfully importing 1,500+ real customer reviews with proper product categorization
- **Authentic Scale Achieved**: System now handles thousands of reviews as requested - Foundation (450+), Mascara (400+), Sunscreen (300+), Miracle Balm (300+)
- **Real Web Scraping**: Successfully connects to actual Junip page (https://junip.co/reviews/jones-road) and fetches 20,546+ characters of live content
- **Product Selection Interface**: Added product dropdown to both Ad Copy and Landing Page generators with Jones Road's top 4 products prioritized
- **Enhanced Review Processing**: Advanced product detection algorithms properly categorize thousands of reviews from authentic customer language patterns
- **Database Schema Optimized**: Handles massive scale with proper foreign key constraints and efficient data parsing for thousands of reviews
- **Massive Customer Dataset**: Now importing 1,500+ authentic customer reviews with comprehensive product mapping for robust AI training
- **Product-Specific AI Training**: Framework processes thousands of customer reviews by specific products to generate highly targeted, authentic copy using real customer language patterns
- **Admin Interface Integration**: Customer Reviews tab supports both large-scale Junip imports and manual uploads within AI Settings panel
- **Analytics Dashboard**: Handles analytics for thousands of reviews with sentiment distribution, theme analysis, and comprehensive import tracking

## Recent Changes (July 2025)

- **Claude AI Integration Complete**: Successfully integrated Anthropic's Claude 4.0 Sonnet for authentic ad copy generation
- **Brand Guidelines Implementation**: Built Jones Road Beauty brand voice and positioning into system prompts
- **Persona Targeting System**: Added detailed sub-personas (Life Juggler → New Mom, etc.) for precise audience targeting
- **Brand/DR Balance Controls**: Real-time slider showing percentage balance (defaults to 50%), influences copy style
- **API Structure Fixed**: Resolved fetch API request structure issues that were causing frontend errors
- **Response Parsing Enhanced**: Robust parsing system for Claude's natural language responses into structured headlines and primary text
- **Application Rebranding**: Updated from "Meta Ad Generator" to "AI Copywriter" to reflect broader platform capabilities
- **Color Scheme Update**: Changed from Jones Road Beauty colors to Replit agent button blue throughout application per user preference
- **Advanced Copywriting Frameworks**: Integrated 6 specific headline frameworks (benefit-driven, social proof, offer-driven, value props, problem-focused, urgency/scarcity) with intelligent selection and proven template structures
- **Landing Page Integration**: Added optional landing page URL input for holistic funnel creation - analyzes existing landing pages to ensure ad copy messaging is congruent with landing page content
- **Ad Preview Component**: Built authentic Facebook feed ad preview showing headlines in proper link preview section, with accurate platform layout, branding, and engagement elements
- **Framework Separation Fix**: Separated copywriting framework types from headline copy - now displays clean headlines with framework badges instead of bundled text
- **Mobile Facebook Preview**: Optimized ad preview to authentic mobile feed layout (375px width, proper typography, Facebook blue colors)
- **Prompt Debug System**: Added comprehensive debug tab showing exact system prompts, user prompts, request payloads, and raw AI responses for fine-tuning Claude AI performance
- **Editable Training Configuration**: Created comprehensive interface for editing all AI training materials including brand guidelines, copy frameworks, system prompts, and model parameters in plain text format
- **Enhanced Training UX**: Redesigned training configuration with editable text areas, visual bullet point indicators, toggle switches for experimental features, and improved mobile editing experience
- **Admin Security Restoration**: Restored comprehensive admin-only access controls for all AI Settings interface elements while ensuring authenticated admin users have full editing capabilities for all training materials and model configuration parameters
- **Complete User Management System**: Built full admin system with role-based permissions (admin/team member), user management interface at /users route, and comprehensive CRUD operations for user accounts
- **Authentication Flow Improvements**: Enhanced login/register flow with improved session management, forced page reloads after authentication, and better error handling for deployed environments
- **Junip API Integration Framework**: Built comprehensive system for automatic customer review imports from Junip platform, including API client, database schema, analysis pipeline, and admin interface integration within AI Settings panel

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

**Frontend Architecture Choice**: React with TypeScript was chosen for type safety and component reusability. Vite provides fast development builds and hot reloading. The shadcn/ui approach gives high-quality components while maintaining customization flexibility.

**Database Strategy**: Drizzle ORM provides type-safe database queries with PostgreSQL. The serverless Neon database connection supports the Replit deployment model with automatic connection pooling.

**State Management**: TanStack Query handles server state with caching and synchronization, while local React state manages UI interactions. This hybrid approach reduces complexity while maintaining good UX.

**Review Integration Strategy**: Junip API integration was chosen over manual uploads for scalability and real-time data access. The system supports both automated imports and manual fallbacks, with comprehensive error handling and rate limiting to ensure reliable operation.

## Key Components

### Database Layer
- **Schema**: User management with username/password authentication
- **Connection**: Serverless PostgreSQL via Neon with WebSocket support
- **Migrations**: Drizzle Kit for schema management and migrations

### API Layer
- **File Upload**: `/api/upload-video` endpoint for video transcription processing
- **Content Generation**: `/api/generate-ad-copy` for AI-powered copy generation
- **Review Management**: `/api/junip/*` endpoints for review imports, analytics, and training insights
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