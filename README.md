# 🚀 Feedback Platform

A modern, real-time feedback management system built with Next.js 14, Appwrite, and deployed on Vercel.

## ✨ Features

- **User Feedback Submission**: Submit bugs, improvements, and feature requests with screenshots
- **Real-time Dashboard**: Live updates for developers to manage feedback
- **Role-based Access**: Separate views for end-users and developers
- **File Uploads**: Screenshot attachments with Appwrite Storage
- **Modern UI**: Built with Shadcn/UI and Tailwind CSS
- **Type Safety**: Full TypeScript support

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router
- **Backend**: Appwrite (Database, Auth, Storage, Teams)
- **UI**: Shadcn/UI components with Radix primitives  
- **Styling**: Tailwind CSS with dark/light mode
- **State**: Zustand for global state management
- **Deployment**: Vercel with automatic CI/CD

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- An Appwrite account (free at [appwrite.io](https://appwrite.io))
- Git

### 1. Clone and Install

\`\`\`bash
git clone https://github.com/MikeWebDeveloper/feedbackapp.git
cd feedbackapp
npm install
\`\`\`

### 2. Environment Setup

Copy the environment template and fill in your Appwrite credentials:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit \`.env.local\` with your Appwrite project details:

\`\`\`bash
# Get these from your Appwrite Console
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Database IDs (will be created in setup)
APPWRITE_DATABASE_ID=feedback-platform-db
APPWRITE_PROJECTS_COLLECTION_ID=projects
APPWRITE_TASKS_COLLECTION_ID=tasks
APPWRITE_STORAGE_BUCKET_ID=task-screenshots
APPWRITE_DEVELOPERS_TEAM_ID=developers-team
\`\`\`

### 3. Appwrite Setup

Follow these steps in your Appwrite Console:

#### Create Database
1. Go to **Databases** → Create Database
2. Name: \`feedback-platform-db\`
3. Database ID: \`feedback-platform-db\`

#### Create Collections

**Projects Collection:**
- Collection ID: \`projects\`
- Attributes:
  - \`name\` (String, 128 chars, required)
  - \`description\` (String, 512 chars, optional)
- Indexes: \`name\` (key index)
- Permissions:
  - Read: \`role:any\`
  - Create/Update/Delete: \`role:team:developers:developer\`

**Tasks Collection:**
- Collection ID: \`tasks\`
- Attributes:
  - \`title\` (String, 256 chars, required)
  - \`description\` (String, 4096 chars, required)
  - \`type\` (Enum: ['bug', 'improvement', 'feature'], required)
  - \`status\` (Enum: ['open', 'in-progress', 'closed'], required, default: 'open')
  - \`projectId\` (String, 36 chars, required)
  - \`submittedBy\` (String, 36 chars, required)
  - \`submittedByName\` (String, 128 chars, required)
  - \`screenshotId\` (String, 36 chars, optional)
- Indexes: 
  - \`projectId\`, \`submittedBy\`, \`status\`, \`type\` (key indexes)
  - \`title\`, \`description\` (fulltext indexes)
- Permissions:
  - Read/Update/Delete: \`role:team:developers:developer\`
  - Create: \`role:user\`
- **Enable Document Security** ✅

#### Create Storage Bucket
1. Go to **Storage** → Create Bucket
2. Bucket ID: \`task-screenshots\`
3. Name: \`Task Screenshots\`
4. File Security: Enabled
5. Max File Size: 5MB
6. Allowed Extensions: jpg, jpeg, png, gif, webp
7. Permissions:
   - Read/Create/Update/Delete: \`role:user\`

#### Create Developer Team
1. Go to **Auth** → **Teams** → Create Team
2. Team ID: \`developers-team\`
3. Name: \`Developers\`
4. Add role: \`developer\`

#### Configure Platform
1. Go to **Settings** → **Platforms** → Add Platform
2. Type: **Web App**
3. Name: \`Feedback Platform Local\`
4. Hostname: \`localhost:3000\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 👥 User Roles

### End Users
- Register and login with email/password
- Submit feedback with screenshots
- View their own submissions and status
- Access: \`/dashboard\`

### Developers
- All end-user capabilities
- View all feedback across projects
- Update task status (open → in-progress → closed)
- Real-time dashboard updates
- Access: \`/dashboard/developer\`

**To make a user a developer:**
1. Go to Appwrite Console → Auth → Teams
2. Select "Developers" team
3. Invite user by email
4. Assign "developer" role

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub (already done!)
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Required Environment Variables for Production

In Vercel dashboard, add all variables from \`.env.local\` **except** make sure:
- \`NEXT_PUBLIC_APPWRITE_PROJECT_ID\` points to your production Appwrite project
- \`APPWRITE_API_KEY\` is your production API key
- Update \`NEXT_PUBLIC_APP_URL\` to your Vercel domain

### Add Production Platform to Appwrite
1. In Appwrite Console → Settings → Platforms
2. Add Web App platform
3. Hostname: \`your-app.vercel.app\`

## 📁 Project Structure

\`\`\`
app/                    # Next.js 14 App Router
├── dashboard/          # User dashboard
├── login/             # Authentication pages  
├── register/
└── layout.tsx         # Root layout

src/
├── components/        # React components
├── lib/
│   ├── appwrite.ts    # Appwrite configuration
│   ├── auth.ts        # Authentication helpers
│   ├── store.ts       # Zustand state management
│   └── types.ts       # TypeScript definitions

components/ui/         # Shadcn/UI components
docs/                  # Architecture documentation
.cursor/rules/         # AI assistant rules
\`\`\`

## 🔧 Development

### Adding Shadcn Components

\`\`\`bash
npx shadcn-ui@latest add button card dialog
\`\`\`

### Type Safety

All data models are defined in \`src/lib/types.ts\`. The app uses strict TypeScript with proper typing for Appwrite responses.

### State Management

Global state is managed with Zustand in \`src/lib/store.ts\`. Real-time updates use Appwrite's subscription API.

## 📚 Documentation

- [Project Implementation Guide](docs/project.md) - Comprehensive architecture guide
- [UX/UI & Architecture Specs](docs/ux-ui-prd-sad) - Design principles and PRD

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure your domain is added in Appwrite Console → Settings → Platforms

**Environment Variables:**
- Client variables must have \`NEXT_PUBLIC_\` prefix
- Server variables (API keys) should NOT have this prefix

**Authentication Issues:**
- Check cookie settings in \`src/lib/auth.ts\`
- Verify team membership in Appwrite Console

**Build Failures:**
- Ensure Node.js version is 18.17.0+
- Check TypeScript errors with \`npm run build\`

Need help? [Open an issue](https://github.com/MikeWebDeveloper/feedbackapp/issues)!
