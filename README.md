# Cursor Monitor - AI Agent Orchestration Platform

A powerful, production-ready Next.js application for orchestrating AI agents to automate development tasks. Built with modern technologies and best practices.

## 🚀 Features

- **Dashboard Overview**: Monitor orchestrations, track performance metrics, and view activity charts
- **Orchestration Management**: Create, monitor, and manage AI agent workflows
- **Cloud Agents**: Manage and configure AI agents for different tasks
- **Repository Integration**: Connect and manage GitHub repositories
- **Prompt Templates**: Create and use reusable prompt templates
- **API Key Management**: Securely manage API keys for various AI providers
- **Responsive Design**: Fully responsive UI that works on all devices
- **Dark Mode**: Support for light and dark themes

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## 📁 Project Structure

```
cursor-monitor/
├── src/
│   ├── app/                    # Next.js App Router pages
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
│   │   └── dashboard/         # Dashboard components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and constants
│   ├── services/              # API service layer
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

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

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | Cursor Monitor |
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:8000 |
| `JWT_SECRET_KEY` | JWT secret for authentication | - |
| `NEXT_PUBLIC_TOKEN_KEY` | Local storage key for token | cursor_monitor_token |

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

## 📊 Dashboard Features

- **Stats Cards**: Key metrics at a glance
- **Activity Chart**: Visual representation of orchestrations and tasks
- **Recent Activity**: Latest orchestration activities

## 🔌 API Integration

The application is designed to work with a FastAPI backend. Services are organized in `src/services/` and include:
- `auth.service.ts` - Authentication
- `orchestration.service.ts` - Orchestration management
- `agent.service.ts` - Agent management
- `repository.service.ts` - Repository management
- `template.service.ts` - Template management
- `dashboard.service.ts` - Dashboard data

## 🧪 Development

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode enabled

### Building for Production
```bash
npm run build
npm run start
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
