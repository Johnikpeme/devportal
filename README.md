# Dash Studios Dev Portal

Professional game development project management portal for Dash Studios.

## Features

- 🔐 Secure authentication & role-based access control
- 📊 Real-time project dashboard with analytics
- 🎮 Game project management & tracking
- 🐛 Integrated QA bug tracker
- 📚 Documentation hub
- 👥 Team management
- 📈 Progress tracking & milestones
- 🎨 Figma-inspired design system

## Tech Stack

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS, Framer Motion
- **State Management:** Zustand, React Query
- **Icons:** Lucide React
- **Font:** Inter

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/dashstudios/devportal.git
cd dashstudios-devportal
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Start development server
```bash
npm run dev
```

5. Open browser to `http://localhost:3000/devportal`

### Demo Credentials

- **Super User:** admin@dashstudios.tech / admin123
- **Developer:** dev@dashstudios.tech / dev123

## Build for Production
```bash
npm run build
```

## Deployment

Deploy to Vercel:
```bash
vercel --prod
```

## Project Structure
```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── services/       # API services
├── utils/          # Utility functions
└── styles/         # Global styles
```

## License

Proprietary - Dash Studios © 2024