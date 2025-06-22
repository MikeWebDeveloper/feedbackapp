# Feedback Platform

A comprehensive feedback management system built with Next.js 14 and Appwrite, featuring role-based access control, real-time updates, and a clean, efficient interface.

## Features

### For End Users
- **Simple Feedback Submission**: Clean form interface for reporting bugs, improvements, and feature requests
- **Project Selection**: Choose from available projects when submitting feedback
- **Screenshot Upload**: Optional image attachment for better context
- **Personal Dashboard**: View only your own submitted feedback and track their status
- **Real-time Status Updates**: See when developers update your feedback status

### For Developers
- **Comprehensive Dashboard**: View all feedback across all projects in one place
- **Real-time Updates**: Dashboard updates automatically when new feedback arrives
- **Status Management**: Update feedback status (open, in-progress, closed) with dropdown menus
- **Detailed View**: Click any feedback to see full details including screenshots
- **Statistics Overview**: Quick stats showing total, open, in-progress, and closed feedback

## Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript
- **UI Components**: Shadcn/UI with Tailwind CSS
- **State Management**: Zustand
- **Backend**: Appwrite (Authentication, Database, Storage, Real-time)
- **Deployment**: Vercel

## Architecture

### Backend (Appwrite)
- **Authentication**: Email/password with role-based access control
- **Database**: Structured collections for Projects and Tasks
- **Storage**: Image upload for screenshots
- **Real-time**: Live updates for developer dashboard
- **Security**: Document-level permissions and team-based access control

### Frontend (Next.js)
- **Server Components**: For initial data fetching and SEO
- **Client Components**: For interactive elements and real-time features
- **Middleware**: Route protection based on authentication and roles
- **State Management**: Global state for user and tasks with Zustand

## Getting Started

### Prerequisites
- Node.js 18+ 
- An Appwrite project (cloud.appwrite.io or self-hosted)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd feedback-platform
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your Appwrite configuration:
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`: Your Appwrite endpoint
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Your Appwrite project ID  
- `APPWRITE_API_KEY`: Your Appwrite API key (with appropriate permissions)

### Appwrite Setup

1. **Create Collections**:
   - `projects`: name (string), description (string)
   - `tasks`: title (string), description (string), type (enum: bug,improvement,feature), status (enum: open,in-progress,closed), projectId (string), submittedBy (string), submittedByName (string), screenshotId (string, optional)

2. **Set up Storage**:
   - Create bucket: `task-screenshots`
   - Configure file permissions for authenticated users

3. **Configure Teams**:
   - Create team: `developers`
   - Add developer users to this team

4. **Set Permissions**:
   - Projects: Read access for any authenticated user
   - Tasks: Create for any user, Read/Update for developers team
   - Enable document-level security on Tasks collection

### Development

Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment

Deploy to Vercel:
\`\`\`bash
npm run build
\`\`\`

Or use the Vercel CLI:
\`\`\`bash
vercel --prod
\`\`\`

Make sure to set your environment variables in the Vercel dashboard.

## Usage

### For End Users
1. Register/Login to the platform
2. Navigate to the dashboard
3. Click "Submit Feedback" to create new feedback
4. Select project, type, add title and description
5. Optionally attach a screenshot
6. Submit and track status updates

### For Developers  
1. Get added to the "developers" team in Appwrite
2. Login to access the developer dashboard
3. View all feedback with real-time updates
4. Click any feedback item to see full details
5. Update status using the dropdown in the detail view
6. Monitor statistics and manage workload

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
