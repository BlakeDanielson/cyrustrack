# Codebase Summary - Cannabis Consumption Tracker

## Project Overview
A privacy-first cannabis consumption tracking web application built with Next.js, TypeScript, and Tailwind CSS. The app enables users to log detailed consumption sessions while maintaining full control over their data.

## Current Project Structure

```
cannabistracker/
├── cursor_docs/           # Project documentation
│   ├── projectRoadmap.md  # High-level goals and timeline
│   ├── currentTask.md     # Current objectives and next steps
│   ├── techStack.md       # Technology choices and rationale
│   └── codebaseSummary.md # This file
├── docs/                  # Product documentation
│   └── prd.md            # Original Product Requirements Document
├── public/               # Static assets
├── src/                  # Source code
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components (to be created)
│   ├── lib/              # Utility libraries (to be created)
│   └── types/            # TypeScript type definitions (to be created)
├── .gitignore           # Git ignore rules
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies and scripts
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Key Components & Interactions

### Planned Architecture
- **ConsumptionForm**: Main data entry interface with all PRD fields
- **ConsumptionHistory**: List/filter view of logged sessions
- **AnalyticsDashboard**: Data visualization and insights
- **PrivacyControls**: Data management and privacy settings
- **Navigation**: Mobile-friendly navigation system

### Data Flow
1. User inputs consumption data via ConsumptionForm
2. Data validated and stored in local SQLite database
3. ConsumptionHistory displays data with filtering options
4. AnalyticsDashboard processes data for insights
5. PrivacyControls manage data export/deletion

## External Dependencies

### Core Dependencies
- **Next.js**: React framework with built-in optimizations
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **SQLite**: Local database for data persistence

### Future Dependencies
- **Supabase**: Optional cloud sync and real-time features
- **React Hook Form**: Advanced form handling
- **Chart.js/Recharts**: Data visualization
- **date-fns**: Date manipulation utilities

## Recent Significant Changes

### Project Initialization (Latest)
- ✅ Created Next.js project with TypeScript and Tailwind CSS
- ✅ Installed core dependencies (Zustand, UUID, date-fns, Lucide icons)
- ✅ Established documentation structure in `cursor_docs/`
- ✅ Moved original PRD to `docs/` folder
- 🔄 Setting up database schema and core components

## User Feedback Integration

### Current User Input
- Tech stack preferences confirmed (React/TypeScript/Tailwind/Zustand)
- Privacy-first approach emphasized
- Mobile-first design required
- Comprehensive data logging capabilities needed

### Planned User Testing
- MVP testing with basic logging functionality
- Privacy control usability testing
- Mobile responsiveness validation
- Performance testing on various devices

## Development Status

### Completed Features
- Project scaffolding and configuration
- Documentation framework established
- Technology stack finalized and documented

### In Progress Features
- Database schema design
- Core component architecture
- State management setup
- Basic UI layout and navigation

### Planned Features
- Complete consumption logging form
- Data persistence and retrieval
- History view with filtering
- Privacy controls and data export
- Analytics and insights dashboard

## Known Issues & Technical Debt

### Current
- None identified (fresh project)

### Anticipated
- SQLite integration complexity (mitigating with localStorage fallback)
- Mobile performance optimization (will address with React.memo)
- Location services permissions (will implement optional controls)

## Performance Considerations

### Frontend Optimization
- Next.js automatic code splitting and optimization
- Tailwind CSS purging for smaller bundles
- Component memoization for expensive re-renders
- Image optimization with Next.js Image component

### Database Optimization
- Indexed queries for fast data retrieval
- Efficient schema design to minimize joins
- Background sync for cloud features (future)

## Security & Privacy

### Current Implementation
- Local data storage (no external data sharing by default)
- TypeScript for type safety and reduced runtime errors
- ESLint for code quality and security best practices

### Planned Security Features
- Data encryption for sensitive fields
- Secure data export functionality
- Privacy controls and data deletion
- Optional anonymous usage analytics

---

*Document Version: 1.0*
*Last Updated: [Current Date]*
*Next Review: After MVP completion*
