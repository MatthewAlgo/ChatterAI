# ChatterAI - AI Chat Platform

ChatterAI is a modern web application that combines AWS Cognito authentication with Azure OpenAI and Azure SQL Database to provide a secure and scalable AI chat experience.

## Features

- **Secure Authentication**: User management through AWS Cognito
- **AI Chat**: Powered by Azure OpenAI Services
- **Persistent Storage**: Chat history stored in Azure SQL Database
- **Modern UI**: Built with Next.js and TailwindCSS
- **Real-time Updates**: Dynamic chat interface with instant responses

## Prerequisites

- Node.js 18.x or higher
- AWS Account with Cognito User Pool
- Azure Account with OpenAI and SQL Database services
- npm or yarn package manager

## Environment Variables

Create a `.env.local` file in the root directory with:

```bash
# AWS Cognito
NEXT_PUBLIC_AWS_REGION=your-region
NEXT_PUBLIC_AWS_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=your-client-id

# Azure OpenAI
NEXT_PUBLIC_AZURE_OPENAI_API_KEY=your-api-key
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=your-endpoint
NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name

# Azure SQL Database
AZURE_DB_SERVER=your-server.database.windows.net
AZURE_DB_NAME=your-database
AZURE_DB_USER=your-username
AZURE_DB_PASSWORD=your-password
```

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chatter-ai.git

# Install dependencies
cd chatter-ai
npm install

# Initialize the database
npm run db:init

# Start the development server
npm run dev
```

## Database Management

```bash
# Create database tables
npm run db:init

# Drop all tables (caution!)
npm run db:drop
```

## Project Structure

```
src/
├── app/             # Next.js app router
├── components/      # React components
├── config/         # Configuration files
├── services/       # Service layer
│   ├── auth.service.ts        # AWS Cognito auth
│   ├── azure-openai.service.ts # Azure OpenAI integration
│   ├── chat.service.ts        # Chat functionality
│   └── user.service.ts        # User management
└── providers/      # React context providers
```

## Authentication Flow

1. User registers with email/password
2. AWS Cognito handles verification
3. Upon login, a unique user hash is generated
4. User data is stored in Azure SQL Database
5. Chat sessions are linked to authenticated users

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Authentication**: AWS Cognito
- **AI Services**: Azure OpenAI
- **Database**: Azure SQL Database
- **API Layer**: Next.js API Routes
- **State Management**: React Context
- **Styling**: TailwindCSS + Material UI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.