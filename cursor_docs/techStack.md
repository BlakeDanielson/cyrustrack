# Technology Stack - Cannabis Consumption Tracker

## Core Framework & Runtime
- **Frontend Framework**: Next.js 14+ with App Router
  - **Rationale**: Full-stack capabilities, excellent performance, built-in API routes
  - **Benefits**: Server-side rendering, optimized builds, developer experience

- **Language**: TypeScript
  - **Rationale**: Type safety, better developer experience, reduced runtime errors
  - **Configuration**: Strict mode enabled, path mapping with "@/*"

## Styling & UI
- **CSS Framework**: Tailwind CSS
  - **Rationale**: Utility-first approach, responsive design, small bundle size
  - **Benefits**: Rapid development, consistent design system, mobile-first

- **Icons**: Lucide React
  - **Rationale**: Consistent icon set, tree-shakeable, accessible
  - **Benefits**: Professional appearance, scalable SVG icons

## State Management
- **State Library**: Zustand
  - **Rationale**: Lightweight, simple API, excellent TypeScript support
  - **Benefits**: Less boilerplate than Redux, great for local state

## Data Storage & Persistence
- **Primary Storage**: SQLite (via better-sqlite3)
  - **Rationale**: Local-first approach, privacy-focused, no external dependencies
  - **Benefits**: User data stays on device, fast queries, ACID compliance

- **Optional Cloud Sync**: Supabase (PostgreSQL)
  - **Rationale**: Real-time capabilities, authentication, easy scaling
  - **Benefits**: Cross-device sync, backup options, advanced analytics

## Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js configuration
- **Version Control**: Git
- **Deployment**: Vercel (recommended) or self-hosted

## Key Dependencies

### Production Dependencies
```json
{
  "next": "^14.x.x",
  "react": "^18.x.x",
  "react-dom": "^18.x.x",
  "zustand": "^4.x.x",
  "uuid": "^9.x.x",
  "date-fns": "^3.x.x",
  "lucide-react": "^0.x.x",
  "better-sqlite3": "^9.x.x"
}
```

### Development Dependencies
```json
{
  "@types/uuid": "^9.x.x",
  "@types/node": "^20.x.x",
  "@types/react": "^18.x.x",
  "@types/react-dom": "^18.x.x",
  "@types/better-sqlite3": "^7.x.x",
  "typescript": "^5.x.x",
  "tailwindcss": "^3.x.x",
  "eslint": "^8.x.x",
  "eslint-config-next": "^14.x.x"
}
```

## Architecture Decisions

### Frontend Architecture
- **Component Structure**: Feature-based organization
- **State Management**: Zustand stores for different domains
- **Routing**: Next.js App Router for file-based routing
- **Data Fetching**: React Server Components where possible

### Data Architecture
- **Local-First**: SQLite as primary data store
- **Schema Design**: Normalized relational structure
- **Migration Strategy**: Versioned schema migrations
- **Backup/Export**: JSON/CSV export functionality

### Privacy & Security
- **Data Encryption**: AES-256 for sensitive local data
- **Location Data**: Optional with explicit user consent
- **Data Deletion**: Complete user data removal capability
- **No Tracking**: No analytics or tracking without explicit consent

## Performance Considerations
- **Bundle Optimization**: Next.js automatic optimizations
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Appropriate cache headers for static assets

## Mobile Optimization
- **Responsive Design**: Mobile-first Tailwind CSS
- **Touch Interactions**: Touch-friendly interface elements
- **Performance**: Optimized for mobile networks
- **Offline Support**: Service Worker for offline functionality

## Future Scalability
- **Microservices Ready**: Modular architecture for future splitting
- **API Design**: RESTful API design for potential mobile apps
- **Database**: Easy migration path to Supabase/PostgreSQL
- **Internationalization**: Structure ready for i18n

---

*Document Version: 1.0*
*Last Updated: [Current Date]*
*Review Cycle: Monthly or when significant changes occur*
