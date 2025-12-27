# Cursor Monitor - AI Agent Orchestration Platform

A powerful, production-ready Next.js application for orchestrating AI agents to automate development tasks. Built with modern technologies and best practices. **Now with production-grade Railway deployment support and comprehensive API integration.**

## 🚀 Features

- **Dashboard Overview**: Monitor orchestrations, track performance metrics, and view activity charts
- **Orchestration Management**: Create, monitor, and manage AI agent workflows
- **Cloud Agents**: Manage and configure AI agents for different tasks
- **Repository Integration**: Connect and manage GitHub repositories
- **Prompt Templates**: Create and use reusable prompt templates
- **API Key Management**: Securely manage API keys for various AI providers
- **Responsive Design**: Fully responsive UI that works on all devices
- **Dark Mode**: Support for light and dark themes
- **Production Diagnostics**: Real-time health monitoring, reliability scoring, and incident feeds
- **Smart Configuration**: Built-in API configuration with validation and connection testing

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Charts**: Recharts
- **HTTP Client**: Platform API Client with Adapter Pattern
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest with 41 unit tests

## 📁 Project Structure

```
cursor-monitor/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API endpoints
│   │   │   ├── health/         # Health check
│   │   │   └── asset-check/    # Static asset verification
│   │   ├── login/              # Login page
│   │   ├── orchestrations/     # Orchestrations pages
│   │   │   ├── [id]/          # Orchestration detail
│   │   │   └── new/           # Create orchestration
│   │   ├── agents/            # Cloud agents page
│   │   ├── repositories/      # Repository profiles page
│   │   ├── templates/         # Prompt templates page
│   │   ├── settings/          # Settings page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Dashboard (home)
│   │   └── providers.tsx      # React Query provider
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── diagnostics/       # Production diagnostics components
│   │   └── drawers/           # Configuration drawers
│   ├── platform/              # Platform API integration
│   │   ├── adapter/           # API client, mappers, hooks
│   │   ├── stores/            # Configuration store
│   │   └── __tests__/         # Unit tests (41 tests)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and constants
│   ├── services/              # API service layer
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── Dockerfile                 # Production deployment
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── vitest.config.ts           # Test configuration
└── RAILWAY.md                 # Railway deployment guide
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for production deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cursor-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🧪 Testing

The project includes a comprehensive test suite with 41 unit tests covering:

- **Mappers** (16 tests): API response transformation
- **Config Store** (9 tests): Configuration state management
- **API Client** (16 tests): Request handling and error classification

```bash
# Run tests
npm run test

# Run tests once
npm run test:run
```

## 🚂 Railway Deployment

The application is production-ready for Railway deployment with a deterministic multi-stage Dockerfile.

### Quick Deploy

1. Connect your GitHub repository to Railway
2. Railway automatically detects the Dockerfile
3. Deploy - no additional configuration required

### Manual Docker Deployment

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run

# Or build and run together
npm run docker:buildAndRun
```

### Verification

After deployment:
- Health check: `https://your-app.railway.app/api/health`
- Asset verification: `https://your-app.railway.app/api/asset-check`
- Dashboard: `https://your-app.railway.app/`

See [RAILWAY.md](RAILWAY.md) for detailed deployment instructions.

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | Cursor Monitor |
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:8000 |
| `JWT_SECRET_KEY` | JWT secret for authentication | - |
| `NEXT_PUBLIC_TOKEN_KEY` | Local storage key for token | cursor_monitor_token |

## 🔌 Platform API Integration

The application uses an Adapter Pattern for robust API integration:

### Features
- **x-api-key Authentication**: Secure API key injection on all requests
- **Request Correlation**: Unique x-request-id for tracing
- **Automatic Retry**: Exponential backoff for GET requests
- **Error Classification**: Detailed error types (AUTH, RATE_LIMIT, SERVER, etc.)
- **Rate Limit Handling**: Automatic retry-after support

### Error Response Format
```typescript
{
  kind: 'AUTH' | 'RATE_LIMIT' | 'NETWORK' | 'SERVER' | 'VALIDATION' | 'UNKNOWN',
  message: string,
  status?: number,
  retryAfter?: number,
  requestId?: string
}
```

## 🎨 UI Components

The application includes a comprehensive set of reusable UI components:

- **Button**: Primary, secondary, outline, ghost, and danger variants
- **Input**: Form inputs with labels, errors, and icons
- **Card**: Flexible card component with header, content, and footer
- **Badge**: Status badges and labels
- **Modal**: Dialogs and confirmations
- **Select**: Dropdown select with search
- **Toggle**: Switch/toggle components
- **Spinner**: Loading indicators

## 🔐 Authentication

The application uses JWT-based authentication with:
- Login/Register flows
- Protected routes
- Token refresh mechanism
- Session management

## 📊 Production Diagnostics

Real-time monitoring features:
- **Health Status**: Live platform health with component checks
- **Reliability Score**: Calculated system reliability percentage
- **Incident Feed**: Recent errors and system events
- **Smart Diagnostics**: Contextual error messages with resolution guidance

## 📦 Building for Production

```bash
# Build the Next.js application
npm run build

# Start production server
npm run start

# Or use Docker
npm run docker:build
npm run docker:run
```

## 🏗️ Architecture

The application follows modern architectural patterns:

- **Adapter Pattern**: Clean separation between API and UI layers
- **React Query**: Server-state management with caching and synchronization
- **Zustand**: Lightweight client-state management
- **App Router**: File-based routing with nested layouts
- **Standalone Output**: Optimized production build for minimal deployment size

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Production Status:** ✅ Ready for Railway Deployment
**Build Status:** ✅ Compiled Successfully
**Test Status:** ✅ 41/41 Tests Passing

