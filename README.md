\# VillaSaya



A comprehensive villa management application built for landlords, agents, tenants, and staff. Streamline your villa operations with modern mobile-first design and powerful management features.



\## 🏡 Features



\- \*\*Dashboard\*\* - Real-time overview of your villa operations

\- \*\*Task Management\*\* - Assign and track tasks with real-time updates

\- \*\*Expense Tracking\*\* - Submit, approve, and track expenses with receipt uploads

\- \*\*Calendar System\*\* - Manage events with Google Calendar \& Microsoft Outlook sync

\- \*\*Messaging\*\* - Real-time communication between all stakeholders

\- \*\*Staff Management\*\* - Clock in/out, leave requests, and geolocation tracking

\- \*\*Multi-Villa Support\*\* - Manage multiple properties from a single account

\- \*\*Document Upload\*\* - Secure file storage for receipts and documents



\## 🚀 Quick Start



\### Prerequisites



\- Node.js 18+ or Bun

\- Supabase account (\[create one for free](https://supabase.com))

\- npm, yarn, or bun package manager



\### 1. Clone and Install



```bash

git clone <repository-url>

cd villasaya

npm install

```



\### 2. Environment Setup



Create a `.env` file in the root directory:



```bash

cp .env.example .env

```



Fill in your Supabase credentials in `.env`:



```env

VITE\_SUPABASE\_PROJECT\_ID=your\_project\_id\_here

VITE\_SUPABASE\_ANON\_KEY=your\_anon\_key\_here

```



\*\*Where to find these values:\*\*

1\. Go to \[Supabase Dashboard](https://app.supabase.com)

2\. Select your project

3\. Navigate to Settings → API

4\. Copy:

&nbsp;  - \*\*Project ID\*\*: Found in project URL or settings

&nbsp;  - \*\*Anon/Public Key\*\*: Use the `anon` `public` key (safe for frontend)



Additionally, configure the Supabase Edge Function secrets once per project:



```bash

supabase secrets set SUPABASE\_SERVICE\_ROLE\_KEY=your\_service\_role\_key SUPABASE\_ANON\_KEY=your\_anon\_key

```



The function validates these variables on every request and fails fast if they are missing, preventing deployments that would point at `https://.supabase.co`.



\### 3. Database Setup



Run the database migration to create required tables:



```bash

\# Using Supabase CLI

npx supabase db push



\# OR manually: Run the SQL in supabase/migrations/001\_create\_kv\_store.sql

\# in your Supabase SQL Editor

```



\### 4. Deploy Edge Functions



Deploy the backend API to Supabase:



```bash

\# Set your project ID

export VITE\_SUPABASE\_PROJECT\_ID=your\_project\_id



\# Deploy functions

./deploy-edge-functions.sh



\# OR using Supabase CLI

npx supabase functions deploy make-server-41a1615d

\# (Run once per project) Ensure runtime secrets exist

supabase secrets list

supabase secrets set SUPABASE\_SERVICE\_ROLE\_KEY=your\_service\_role\_key SUPABASE\_ANON\_KEY=your\_anon\_key

```



\### 5. Run Development Server



```bash

npm run dev

```



The app will be available at `http://localhost:5000`



\## 📦 Project Structure



```

villasaya/

├── src/

│   ├── components/          # React components

│   │   ├── dashboard/       # Dashboard components

│   │   ├── expense/         # Expense tracking

│   │   ├── messaging/       # Chat \& messaging

│   │   ├── staff/           # Staff management

│   │   ├── shared/          # Reusable components (PageHeader, DataList)

│   │   └── ui/              # UI primitives (Radix UI)

│   ├── hooks/               # Custom React hooks

│   │   ├── useChatThread.ts        # Messaging logic

│   │   ├── useClockStatus.ts       # Clock in/out management

│   │   ├── useExpenseTemplates.ts  # Template CRUD

│   │   ├── useExpenseSubmit.ts     # Form validation

│   │   └── useCalendarIntegration.ts # Calendar sync

│   ├── utils/               # Utility functions

│   │   ├── api.ts          # API request helper

│   │   ├── formValidation.ts # Form validation utilities

│   │   └── supabase/       # Supabase client config

│   └── types/               # TypeScript type definitions

├── supabase/

│   ├── functions/           # Edge Functions (backend API)

│   │   └── make-server-41a1615d/  # Main server function

│   └── migrations/          # Database migrations

├── public/                  # Static assets

└── dist/                    # Production build output



```



\## 🔧 Development



\### Available Scripts



```bash

\# Start development server

npm run dev



\# Build for production

npm run build



\# Run tests

npm test



\# Run tests with UI

npm run test:ui



\# Generate test coverage

npm run test:coverage

```



\### Development Tools



\- \*\*Framework\*\*: React 18 + TypeScript

\- \*\*Build Tool\*\*: Vite 6

\- \*\*Styling\*\*: Tailwind CSS + Custom Design Tokens

\- \*\*UI Components\*\*: Radix UI primitives

\- \*\*Backend\*\*: Supabase (PostgreSQL, Auth, Storage, Edge Functions)

\- \*\*State Management\*\*: React Hooks + Context API

\- \*\*Testing\*\*: Vitest + Testing Library



\## 🎨 Design System



VillaSaya follows \*\*Apple Human Interface Guidelines 2025\*\* with:



\- Mobile-first responsive design

\- Primary brand color: `#6B4FDB`

\- SF Pro font family

\- 44×44pt minimum touch targets

\- iOS-native spring animations

\- Fluid gestures (swipe-to-delete, pull-to-refresh)



\## 📱 Progressive Web App



VillaSaya is a full PWA with:



\- Offline support via service worker

\- App manifest for installation

\- Optimized caching strategies

\- Theme colors matching brand



\## 🔐 Authentication



Supabase Auth provides:



\- Email/password authentication

\- OAuth providers (Google, GitHub, etc.)

\- Secure session management

\- Row Level Security (RLS)



\## 🚢 Deployment



\### Deploy to Replit (Recommended)



1\. Import this repository to Replit

2\. Set environment variables in Replit Secrets:

&nbsp;  - `VITE\_SUPABASE\_PROJECT\_ID`

&nbsp;  - `VITE\_SUPABASE\_ANON\_KEY`

3\. Click "Deploy" to publish



\### Deploy to Vercel/Netlify



```bash

\# Build the project

npm run build



\# Deploy the dist/ folder

\# Set environment variables in your hosting platform

```



\### Important: Production Checklist



Before deploying to production:



\- \[ ] Set `ENABLE\_DEV\_ENDPOINTS=false` (or remove the variable)

\- \[ ] Verify all environment variables are set

\- \[ ] Run database migrations

\- \[ ] Deploy Edge Functions to Supabase

\- \[ ] Test authentication flow

\- \[ ] Verify file uploads work

\- \[ ] Test on mobile devices



\## 🔒 Security Notes



\### Development Endpoints



The `/seed-test-users` endpoint is \*\*ONLY\*\* available when:

\- `ENABLE\_DEV\_ENDPOINTS=true` is set, OR

\- `NODE\_ENV=development`



\*\*This endpoint is automatically disabled in production\*\* to prevent security issues.



\### Environment Variables



\- Never commit `.env` file to git

\- Use `.env.example` as a template

\- Store secrets in your hosting platform's environment variables

\- Frontend only uses `VITE\_\*` prefixed variables



\## 📖 Documentation



\- \[Supabase Documentation](https://supabase.com/docs)

\- \[React Documentation](https://react.dev)

\- \[Vite Documentation](https://vitejs.dev)

\- \[Tailwind CSS](https://tailwindcss.com)



\## 🤝 Contributing



1\. Fork the repository

2\. Create a feature branch (`git checkout -b feature/amazing-feature`)

3\. Commit your changes (`git commit -m 'Add amazing feature'`)

4\. Push to the branch (`git push origin feature/amazing-feature`)

5\. Open a Pull Request



\## 📄 License



This project is proprietary and confidential.



\## 🆘 Troubleshooting



\### "Failed to fetch" errors



\- Verify your `.env` file has the correct Supabase credentials

\- Check that Edge Functions are deployed

\- Ensure database tables exist (run migrations)



\### Build errors



\- Clear `node\_modules` and reinstall: `rm -rf node\_modules \&\& npm install`

\- Clear Vite cache: `rm -rf node\_modules/.vite`



\### Authentication issues



\- Verify Supabase project is active

\- Check anon key is correct

\- Ensure email confirmation is disabled for development



\## 💬 Support



For issues and questions:

\- Check existing issues in the repository

\- Create a new issue with detailed information

\- Include error messages and steps to reproduce



---



Built with ❤️ using React, TypeScript, and Supabase



