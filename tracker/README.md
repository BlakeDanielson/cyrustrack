# Cannabis Consumption Tracker

A privacy-first cannabis consumption tracking web application built with Next.js, TypeScript, and Tailwind CSS.

## 🌿 Features

### Core Functionality
- **Complete Consumption Logging**: Track detailed information about each session including:
  - Date, time, and duration
  - Location (with privacy controls)
  - Strain information (name, type, THC/CBD percentages)
  - Consumption method and quantity
  - Effects and ratings
  - Social context and notes

- **Consumption History**: View, search, and filter past sessions
- **Mobile-First Design**: Responsive interface optimized for mobile devices
- **Privacy-Focused**: All data stored locally using localStorage
- **Data Export**: Export your data as JSON for backup or analysis

### User Interface
- Clean, intuitive design with mobile-friendly navigation
- Bottom navigation bar for mobile devices
- Comprehensive filtering and search capabilities
- Settings page for user preferences and privacy controls

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cannabistracker/tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Usage

### Logging a Session
1. Click on "Log Session" in the navigation
2. Fill out the consumption form with your session details
3. Click "Log Session" to save

### Viewing History
1. Navigate to "History" 
2. Use the search bar to find specific sessions
3. Apply filters to narrow down results
4. Click on any session to view details

### Managing Data
1. Go to "Settings"
2. Configure your default preferences
3. Export your data for backup
4. Clear all data if needed

## 🛠️ Technical Details

### Tech Stack
- **Frontend**: Next.js 15.5.2 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with responsive design
- **State Management**: Zustand with persistence
- **Icons**: Lucide React
- **Storage**: localStorage (browser-based)

### Data Storage
- All data is stored locally in your browser's localStorage
- No data is sent to external servers
- Data persists between browser sessions
- Export functionality for data portability

### Privacy Features
- Local-only data storage
- Optional location tracking
- No analytics or tracking by default
- Complete data control and export capabilities

## 📊 Data Structure

Each consumption session includes:
- Temporal information (date, time, duration)
- Location data (city, state, optional GPS)
- Social context (solo or with others)
- Device and accessory information
- Cannabis product details (strain, THC/CBD, quantity)
- Product modifiers (tobacco, kief, concentrate)
- Experience ratings and effects
- Personal notes

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── CannabisTracker.tsx  # Main app component
│   ├── ConsumptionForm.tsx  # Logging form
│   ├── ConsumptionHistory.tsx # History view
│   └── Navigation.tsx       # Navigation component
├── lib/                # Utility libraries
│   ├── storage.ts      # localStorage service
│   └── utils.ts        # General utilities
├── store/              # State management
│   └── consumption.ts  # Zustand store
└── types/              # TypeScript definitions
    └── consumption.ts  # Data type definitions
```

### Key Components
- **ConsumptionForm**: Comprehensive form for logging sessions
- **ConsumptionHistory**: List view with filtering and search
- **Navigation**: Mobile-responsive navigation
- **CannabisTracker**: Main app container

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔮 Future Enhancements

- Analytics dashboard with consumption insights
- Cloud sync options (optional)
- Strain database integration
- Enhanced data visualization
- CSV export format
- Progressive Web App (PWA) capabilities

## 📄 License

This project is for educational and personal use. Please ensure compliance with local laws regarding cannabis consumption and tracking.

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

---

**Note**: This application is designed for legal cannabis users in jurisdictions where cannabis consumption is permitted. Always follow local laws and regulations.