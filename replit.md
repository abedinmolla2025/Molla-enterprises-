# Overview

MOLLA ENTERPRISES Invoice Generator is a professional web application designed for single-user invoice management. The system provides comprehensive client management, invoice creation with real-time calculations, and PDF generation capabilities. Built with a modern tech stack, it features a Blue Ocean-inspired design theme with company branding for MOLLA ENTERPRISES, incorporating premium Google Fonts (Poppins/Montserrat) and a distinctive blue gradient header design.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with Vite for fast development and build tooling
- **Styling**: Tailwind CSS with a custom design system inspired by "Blue Ocean" invoice template
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interfaces
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **PDF Generation**: Dual approach using html2canvas + jsPDF for frontend downloads and backend Puppeteer for server-side PDF generation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **API Design**: RESTful API architecture with Express routes
- **Validation**: Zod schemas shared between frontend and backend for consistent data validation
- **Development**: Hot module replacement via Vite integration for seamless development experience

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Structure**:
  - `clients` table for customer information
  - `invoices` table for invoice headers with status tracking
  - `invoice_items` table for line items with cascading deletes
  - `settings` table for application configuration (currency, payment details)
- **Data Integrity**: Foreign key relationships with proper cascade handling
- **Type Safety**: Drizzle Zod integration for runtime type validation

## Design System
- **Typography**: Premium Google Fonts (Poppins primary, Montserrat secondary)
- **Color Scheme**: Blue Ocean theme with CSS custom properties for consistent theming
- **Layout**: Sidebar navigation with header featuring company branding
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Component Architecture**: Modular UI components with proper separation of concerns

## Business Logic
- **Invoice Calculations**: Real-time computation of subtotals, taxes (optional), discounts, and grand totals
- **Currency Support**: Multi-currency with default INR, extensible to USD, EUR, GBP
- **Status Management**: Invoice lifecycle tracking (draft, sent, paid, overdue)
- **Tax Flexibility**: Optional tax field implementation - when left blank or zero, no tax is applied
- **Payment Integration**: Text-based payment details display (bank transfer, UPI) without QR generation

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migration and schema management tool

## Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI primitives for components
- **@hookform/resolvers**: Form validation resolver for React Hook Form
- **wouter**: Lightweight routing library
- **class-variance-authority**: Utility for component variant management
- **tailwindcss**: Utility-first CSS framework

## PDF Generation
- **html2canvas**: Client-side HTML to canvas conversion
- **jsPDF**: Client-side PDF generation
- **puppeteer**: Server-side PDF generation (planned)

## Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

## Styling and Fonts
- **Google Fonts**: Poppins and Montserrat font families
- **CSS Custom Properties**: Theme management and Blue Ocean color scheme
- **Tailwind CSS**: Responsive design and utility classes

## Database and Validation
- **PostgreSQL**: Primary database with Neon hosting
- **Zod**: Runtime type validation and schema definition
- **connect-pg-simple**: PostgreSQL session store for Express

The application follows a modern full-stack architecture with strong typing throughout, leveraging TypeScript for both frontend and backend development. The design prioritizes user experience with real-time calculations, professional PDF generation, and a polished Blue Ocean-inspired interface.