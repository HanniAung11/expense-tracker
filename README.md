# Expense Tracker

A full-stack expense tracking application built with Next.js that allows users to record, categorize, visualize, and analyze their expenses.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.3-2D3748?style=flat&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)

## Features

### Core Features

✅ **Expense Management**
- Add, edit, and delete expenses
- Track amount, category, date, description, and payment method
- Validation with real-time feedback

✅ **Categories**
- 10 pre-defined categories with icons and colors
- Color-coded category badges
- Support for custom categories (via database)

✅ **Dashboard**
- Summary cards: Monthly/Yearly totals, Average daily spending, Top category
- Visualizations: Pie charts, Bar charts, Line charts
- Recent transactions list

✅ **Filtering & Search**
- Date range filtering (Today, This Week, This Month, This Year, Custom)
- Category filtering
- Amount range filtering
- Real-time search by description

✅ **Reports & Analytics**
- Monthly summary with category breakdown
- Category analysis with percentages
- Monthly comparison charts
- Daily spending trends
- CSV export functionality

✅ **Responsive Design**
- Mobile-first approach
- Dark mode support
- Optimized for all screen sizes

## Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **React 18+**
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **React Hook Form** for form management
- **Zod** for validation
- **next-themes** for dark mode

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **SQLite** (development) / **PostgreSQL** (production optional)

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **Prettier** (recommended)

## Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker/expensetracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # Next.js (optional)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
expensetracker/
├── app/
│   ├── api/
│   │   └── expenses/
│   │       ├── [id]/
│   │       │   └── route.ts          # GET, PUT, DELETE expense
│   │       ├── route.ts              # GET (list), POST (create)
│   │       └── stats/
│   │           └── route.ts          # Analytics endpoint
│   ├── expenses/
│   │   ├── [id]/
│   │   │   └── edit/
│   │   │       └── page.tsx          # Edit expense page
│   │   ├── add/
│   │   │   └── page.tsx              # Add expense page
│   │   └── page.tsx                  # All expenses list
│   ├── analytics/
│   │   └── page.tsx                  # Analytics & reports
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Dashboard
│   └── globals.css                   # Global styles
├── components/
│   ├── features/                     # Feature-specific components
│   │   ├── charts/                   # Chart components
│   │   ├── category-badge.tsx
│   │   ├── confirmation-modal.tsx
│   │   ├── expense-card.tsx
│   │   ├── expense-form.tsx
│   │   ├── filter-bar.tsx
│   │   ├── pagination.tsx
│   │   └── summary-card.tsx
│   ├── layout/
│   │   └── navbar.tsx                # Navigation bar
│   ├── providers/
│   │   └── theme-provider.tsx        # Dark mode provider
│   └── ui/                           # Reusable UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── loading.tsx
│       ├── modal.tsx
│       └── select.tsx
├── lib/
│   ├── db.ts                         # Prisma client
│   ├── utils.ts                      # Utility functions
│   └── validations.ts                # Zod schemas
├── prisma/
│   └── schema.prisma                 # Database schema
├── types/
│   └── index.ts                      # TypeScript types
└── public/                           # Static assets
```

## Database Schema

### Expense Model
```prisma
model Expense {
  id            String   @id @default(uuid())
  amount        Float
  category      String
  date          DateTime
  description   String?
  paymentMethod String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([date])
  @@index([category])
}
```

### Category Model (Optional)
```prisma
model Category {
  id        String   @id @default(uuid())
  name      String   @unique
  icon      String
  color     String
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## API Routes

### Expenses

- `GET /api/expenses` - List expenses with filtering, sorting, and pagination
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/[id]` - Get a single expense
- `PUT /api/expenses/[id]` - Update an expense
- `DELETE /api/expenses/[id]` - Delete an expense
- `GET /api/expenses/stats` - Get analytics data

### Query Parameters (GET /api/expenses)

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `category` - Filter by category
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `minAmount` - Minimum amount filter
- `maxAmount` - Maximum amount filter
- `search` - Search in description
- `sortBy` - Sort field (date, amount, category)
- `sortOrder` - Sort order (asc, desc)

## Usage

### Adding an Expense

1. Navigate to **Expenses** → **Add Expense**
2. Fill in the form:
   - **Amount**: Positive number (max 2 decimal places)
   - **Category**: Select from predefined categories
   - **Date**: Select date (defaults to today)
   - **Description**: Optional note (max 200 characters)
   - **Payment Method**: Select payment method
3. Click **Add Expense**

### Filtering Expenses

1. Go to **Expenses** page
2. Use the search bar for quick description search
3. Click **Show Filters** for advanced filtering:
   - Category filter
   - Date range (start/end dates)
   - Amount range (min/max)
   - Sort options

### Viewing Analytics

1. Navigate to **Analytics** page
2. Select time period (This Month, This Year, All Time)
3. View charts and breakdowns
4. Export data as CSV using the **Export CSV** button

## Data Validation

- **Amount**: Required, positive number, max 2 decimal places, max 1,000,000
- **Category**: Required, must be from predefined list
- **Date**: Required, cannot be future date
- **Description**: Optional, max 200 characters
- **Payment Method**: Required, must be from predefined list

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL` (for production, use PostgreSQL)
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Database Migration

For production, run migrations:
```bash
npx prisma migrate deploy
```

## Future Improvements

- [ ] Receipt upload functionality
- [ ] Budget limits and warnings
- [ ] Notifications (budget exceeded, daily summary)
- [ ] Offline support (PWA)
- [ ] Multi-user support with authentication
- [ ] Recurring expenses
- [ ] Multi-currency support
- [ ] Budget forecasting
- [ ] Tags system
- [ ] AI categorization
- [ ] Email reports

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Screenshots

*Add screenshots of key screens here*

- Dashboard with summary cards and charts
- Expenses list with filtering
- Analytics page with detailed breakdowns

---

Built with ❤️ using Next.js and TypeScript
