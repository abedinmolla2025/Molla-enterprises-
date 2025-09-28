# Overview

This is a personal invoice generator web application for MOLLA ENTERPRISES, designed as a complete fullstack solution for creating, managing, and generating professional invoices. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and supporting PDF generation for invoices.

The system is specifically branded for MOLLA ENTERPRISES with custom styling using Lora and Inter fonts, blue gradient themes, and company-specific branding elements. It supports multi-currency invoicing, client management, and comprehensive invoice tracking with various status states.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with modern React using Vite as the build tool and development server. The application follows a component-based architecture with these key decisions:

- **UI Framework**: Uses Radix UI primitives with Tailwind CSS for styling, providing accessibility and consistency
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Management**: React Hook Form with Zod validation for type-safe forms
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design

The frontend implements a single-page application pattern with dedicated pages for Dashboard, Clients, Invoices, and Settings, all wrapped in a consistent navigation layout.

## Backend Architecture

The server uses Express.js with TypeScript, following a RESTful API design pattern:

- **Framework**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM for type-safe database queries and schema management
- **API Structure**: RESTful endpoints organized by resource (clients, invoices, settings)
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development Tools**: Vite integration for hot module replacement in development

The backend implements a storage abstraction layer that separates database operations from route handlers, making the system more maintainable and testable.

## Data Storage Solutions

The application uses PostgreSQL as the primary database with Drizzle ORM for schema management:

- **Database**: PostgreSQL via Neon Database service
- **ORM**: Drizzle ORM with automatic migration support
- **Schema Design**: Relational design with proper foreign key constraints
- **Data Types**: Uses appropriate PostgreSQL types including enums for status and currency
- **Connection Management**: Connection pooling with @neondatabase/serverless

The database schema includes tables for clients, invoices, invoice items, and settings, with proper relationships and constraints to ensure data integrity.

## PDF Generation

The system implements dual PDF generation capabilities:

- **Frontend Generation**: html2canvas + jsPDF for client-side PDF creation
- **Backend Generation**: Puppeteer for server-side PDF generation (prepared but not fully implemented)
- **Template System**: Custom invoice templates with company branding
- **Styling**: CSS-based invoice layouts that render consistently in PDF format

## Authentication and Authorization

The application is designed for single-user personal use and does not implement authentication mechanisms. This architectural decision simplifies the system while meeting the specific use case of a personal invoice generator for MOLLA ENTERPRISES.

## Component Architecture

The frontend uses a hierarchical component structure:

- **UI Components**: Reusable UI primitives based on Radix UI
- **Feature Components**: Business logic components (InvoiceForm, ClientModal)
- **Layout Components**: Navigation and page structure components
- **Page Components**: Top-level route components

## Development and Build System

The project uses modern tooling for development efficiency:

- **Build Tool**: Vite for fast development and optimized production builds
- **Type Checking**: TypeScript across both frontend and backend
- **Code Quality**: ESLint and TypeScript compiler for code validation
- **Development Experience**: Hot module replacement and error overlays for rapid development

# External Dependencies

## Database Services

- **Neon Database**: PostgreSQL hosting service with serverless capabilities
- **Connection Pooling**: @neondatabase/serverless for efficient database connections

## UI and Styling

- **Radix UI**: Comprehensive set of accessible UI primitives including dialogs, dropdowns, forms, and navigation components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Google Fonts**: Lora and Inter fonts for brand-consistent typography
- **Lucide Icons**: Icon library for consistent iconography throughout the application

## PDF Generation

- **html2canvas**: Client-side HTML to canvas rendering for PDF generation
- **jsPDF**: JavaScript PDF generation library
- **Puppeteer**: Server-side browser automation for PDF generation (prepared for future use)

## Development Tools

- **Vite**: Build tool and development server with React plugin
- **Replit Integration**: Development environment plugins for banner and cartographer
- **ESBuild**: Fast JavaScript bundler for production builds

## Form and Data Management

- **React Hook Form**: Form state management with validation
- **Zod**: TypeScript-first schema validation
- **React Query**: Server state management and caching
- **Drizzle ORM**: Type-safe database queries and schema management

## Utility Libraries

- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **nanoid**: URL-safe unique string generator
- **class-variance-authority**: Variant-based component styling utility

The application integrates these dependencies to create a cohesive system that supports the complete invoice generation workflow from client management through PDF export.