# Financier: Your Personal Finance Dashboard

Financier is a comprehensive Finance SaaS Platform built with modern web technologies to help you manage your personal finances efficiently.

## Features

- Dashboard with visual representations of your financial data
- Track income and expenses
- Categorize transactions
- Assign transactions to specific accounts
- Import transactions via CSV
- Responsive design for desktop and mobile

## Tech Stack

- Frontend: React
- Backend: Bun with Hono framework
- Database: PostgreSQL
- ORM: Drizzle
- Styling: Tailwind CSS

## Prerequisites
- Bun (latest version)
- Docker and Docker Compose

## Installation

1. Clone the repository: git clone https://github.com/Keaanm/financier.git
2. Install dependencies: bun install
3. Set up your environment variables: cp .env.example .env. Edit the `.env` file with your database credentials and other necessary configurations.
4. Start the database: docker-compose up -d
5. Run database migrations: bun run generate
6. Start the development server: bun dev

## Environment Variables

To run this project, you need to set up your environment variables:

1. Copy the `.env.example` file to a new file named `.env`: cp .env.example .env
2. Open the `.env` file and fill in your actual values for each variable:
- `DB_URL`: The database URL (default should work with the provided Docker setup)
- `RESEND_API_KEY`: Your API key for the Resend email service
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Your Google OAuth credentials

## Database Setup

This project uses Docker Compose to run a PostgreSQL database. The configuration is in the `docker-compose.yml` file. To start the database, run: docker-compose up -d.
The database will be accessible on port 5432 of your local machine.
  
## Usage
1. Register for an account or log in
2. Add your accounts
3. Start adding transactions manually or import via CSV
4. Categorize your transactions
5. View your financial overview on the dashboard

## Support
If you encounter any issues or have questions, please file an issue on the GitHub repository.
