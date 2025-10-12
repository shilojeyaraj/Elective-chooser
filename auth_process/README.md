# Authentication Process Files

This folder contains all the files needed to implement user authentication, signup, and account creation in your project.

## 📁 File Structure

```
auth_process/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── login/
│       │   │   └── page.tsx              # Login page component
│       │   ├── signup/
│       │   │   └── page.tsx              # Signup page component
│       │   ├── setprofile/
│       │   │   └── page.tsx              # Profile setup page
│       │   └── api/
│       │       └── profile/
│       │           └── route.ts          # Profile API endpoint
│       ├── components/
│       │   ├── LoginForm.tsx             # Reusable login/signup form
│       │   └── ProfileSetup.tsx          # Profile setup component
│       ├── lib/
│       │   ├── custom-auth.ts            # Authentication logic & functions
│       │   ├── supabase.ts               # Supabase client configuration
│       │   └── types.ts                  # TypeScript interfaces
│       └── contexts/
│           └── ThemeContext.tsx          # Theme context (optional)
└── backend/
    └── scripts/
        ├── setup_auth_system.sql         # Complete auth database setup
        ├── setup_functions_only.sql      # Database functions only
        ├── setup_auth_system_simple.sql  # Simplified auth setup
        ├── fix_register_function.sql     # Registration function fixes
        └── fix_register_user_function.sql # Additional registration fixes
```

## 🚀 Quick Setup Guide

### 1. Database Setup
Run the SQL scripts in your Supabase database in this order:
1. `setup_auth_system.sql` - Complete setup
2. `fix_register_function.sql` - Fix any issues
3. `fix_register_user_function.sql` - Additional fixes

### 2. Environment Variables
Add these to your `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Dependencies
Install required packages:
```bash
npm install @supabase/supabase-js
```

## 🔄 Authentication Flow

### Signup Process
1. User visits `/signup` → `SignupPage` component
2. Uses `LoginForm` with `isSignup={true}`
3. Calls `registerUser()` from `custom-auth.ts`
4. Creates user in Supabase `profiles` table
5. Redirects to `/setprofile` for additional setup

### Login Process
1. User visits `/login` → `LoginPage` component
2. Uses `LoginForm` with `isSignup={false}`
3. Calls `loginUser()` from `custom-auth.ts`
4. Validates credentials against database
5. Redirects to main application

### Profile Setup
1. After signup, user goes to `/setprofile`
2. `ProfileSetup` component collects detailed information
3. Updates user profile in database
4. Redirects to main application

## 📋 Key Components

### LoginForm.tsx
- Handles both login and signup
- Form validation and error handling
- Password hashing
- User session management

### ProfileSetup.tsx
- Collects user preferences and interests
- Program selection (engineering programs)
- Career goals and constraints
- GPA and workload preferences

### custom-auth.ts
- `registerUser()` - Create new user accounts
- `loginUser()` - Authenticate existing users
- Password hashing and validation
- Database operations

## 🗄️ Database Schema

The authentication system uses these main tables:
- `users` - Basic user credentials
- `profiles` - Extended user information and preferences

## 🎨 Styling
- Uses Tailwind CSS for styling
- Dark/light theme support via ThemeContext
- Responsive design for mobile and desktop

## 🔧 Customization

### Adding New Fields
1. Update the `UserProfile` interface in `types.ts`
2. Modify `ProfileSetup.tsx` to include new form fields
3. Update the database schema if needed

### Changing Validation Rules
1. Modify validation logic in `LoginForm.tsx`
2. Update password requirements in `custom-auth.ts`

### Styling Changes
1. Update Tailwind classes in components
2. Modify theme colors in `ThemeContext.tsx`

## 🚨 Important Notes

- Password hashing uses basic `btoa()` encoding (consider upgrading to bcrypt for production)
- User sessions are managed via localStorage
- Database operations use Supabase client
- All API calls are made from the frontend (no separate backend API)

## 🔍 Troubleshooting

### Common Issues
1. **Supabase connection errors** - Check environment variables
2. **Database permission errors** - Verify RLS policies
3. **Form validation errors** - Check required field validation
4. **Redirect loops** - Ensure proper authentication state management

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in your environment variables.

## 📞 Support

For issues with these authentication files, check:
1. Supabase documentation
2. Next.js authentication patterns
3. Database schema and RLS policies
4. Environment variable configuration


