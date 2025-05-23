# Smart Retail - Competitor Intelligence Platform

A modern web application for retail competitor analysis and price monitoring.

## Features

- Real-time competitor price monitoring
- Product data extraction and analysis
- AI-powered market insights
- Multi-retailer comparison
- Price trend analysis

## Project Structure

```
Smart_Retail/
├── backend/         # Backend services
├── frontend/        # Next.js frontend application
├── mobile/         # Mobile application
└── docs/           # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd Smart_Retail
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the frontend directory with:
```
# Required API Keys
NEXT_PUBLIC_MCP_API_KEY=your_mcp_api_key_here

# API URLs (default for local development)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Variables

The following environment variables are required for the application to function properly:

- `NEXT_PUBLIC_MCP_API_KEY`: Your MCP (Smithery) API key for accessing Firecrawl services
- `NEXT_PUBLIC_API_URL`: The base URL for API endpoints (defaults to http://localhost:3000/api)

To obtain an MCP API key:
1. Sign up at https://smithery.ai
2. Navigate to your account settings
3. Generate a new API key with Firecrawl permissions
4. Add the key to your `.env.local` file

## Tech Stack

- Frontend: Next.js 13+, React, TypeScript, Tailwind CSS
- Backend: Node.js
- APIs: MCP Firecrawl, OpenAI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 