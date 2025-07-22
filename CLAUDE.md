# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**meshi-search-v0.1** - AI-powered restaurant reservation agent service that helps users find and book restaurants based on their requirements.

### Core Value Proposition
- **Target**: Generate 20-30M JPY annual profit with minimal team
- **Speed**: MVP deployment within hours
- **Cost**: Monthly operational cost under 10% of revenue
- **Automation**: Minimal manual operation

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL with auth)
- **AI**: OpenAI GPT-4 for restaurant recommendations
- **Deployment**: Vercel (planned)
- **Language**: TypeScript

## Development Commands

```bash
# Development
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Dependencies
npm install          # Install all dependencies
```

## Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── search/         # Search form and related components
│   ├── restaurant/     # Restaurant display components
│   └── reservation/    # Reservation form components
├── lib/                # Utility libraries
│   ├── supabase.ts    # Supabase client configuration
│   ├── api/           # API helper functions
│   └── hooks/         # Custom React hooks
├── api/               # API routes
│   ├── recommend/     # AI restaurant recommendation endpoint
│   ├── search/        # Search functionality
│   └── reservation/   # Reservation request handling
├── globals.css        # Global styles with Tailwind
├── layout.tsx         # Root layout component
└── page.tsx          # Homepage

supabase/
└── schema.sql        # Database schema definition
```

## Database Schema

### Core Tables
- `users`: User profiles and preferences
- `search_histories`: Search requests and AI recommendations  
- `reservations`: Reservation requests and status

### Setup
Run the SQL in `supabase/schema.sql` in your Supabase project to set up the database.

## Environment Variables

Create `.env.local` based on `.env.local.example`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

## Key Features Implemented

### MVP Phase 1 ✅
- Basic UI (homepage, search form)
- Next.js + Supabase setup
- OpenAI API integration for restaurant recommendations
- Database schema design

### Pending Implementation
- Restaurant recommendation display
- Reservation request flow
- User authentication (Supabase Auth)
- Results page with restaurant cards

## API Endpoints

### POST /api/recommend
Generates AI-powered restaurant recommendations based on search criteria.

**Request Body:**
```typescript
{
  date: string;           // Reservation date
  time: string;          // Preferred time
  numberOfPeople: number; // Party size
  area: string;          // Location (station/area name)
  budget: number;        // Budget per person
  purpose?: string;      // Occasion type
  genre?: string[];      // Cuisine preferences
  requirements?: string; // Special requests
}
```

**Response:**
```typescript
{
  restaurants: Array<{
    name: string;        // Restaurant name
    reason: string;      // Why recommended
    address: string;     // Address
    access: string;      // Access info
    budget: number;      // Price per person
    features: string[];  // Features (private room, etc.)
    genre: string;       // Cuisine type
    phone: string;       // Phone number
  }>
}
```

## Development Guidelines

1. **Speed Priority**: Focus on rapid MVP iteration
2. **BaaS Utilization**: Leverage Supabase and external APIs to minimize custom backend code
3. **Cost Efficiency**: Use free tiers and scale gradually
4. **Automation**: Build for minimal manual intervention

## Repository Information

- **Remote**: https://github.com/muractice/meshi-search-v0.1.git
- **Main Branch**: main