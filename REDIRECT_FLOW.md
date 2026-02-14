# Redirect Flow Documentation

## Expected Behavior

### Login Page (`/login`)
- **When logged out:** Show login form
- **When logged in:** Redirect to `/dashboard`
- **After successful login:** Redirect to `/dashboard`

### Signup Page (`/signup`)
- **When logged out:** Show signup form
- **When logged in:** Redirect to `/dashboard`
- **After successful signup:** Auto-login and redirect to `/dashboard`

### Dashboard Page (`/dashboard`)
- **When logged in:** Show dashboard with user data and projects
- **When logged out:** Redirect to `/login`

## How It Works

1. **Middleware** (`middleware.ts`):
   - Protects routes (redirects to `/login` if not authenticated)
   - Redirects logged-in users away from `/login` and `/signup` to `/dashboard`

2. **Login/Signup Pages**:
   - Client-side redirect after successful authentication
   - Uses `router.push("/dashboard")` after sign-in

3. **Dashboard Page**:
   - Server-side check for session
   - Redirects to `/login` if no session or missing user ID
   - Shows dashboard content when authenticated

## Testing the Flow

1. **Not logged in, visit `/dashboard`:**
   - Should redirect to `/login`

2. **Not logged in, visit `/login`:**
   - Should show login form

3. **Log in successfully:**
   - Should redirect to `/dashboard`
   - Should show dashboard with sidebar and projects

4. **Logged in, visit `/login`:**
   - Should redirect to `/dashboard` (via middleware)

5. **Log out:**
   - Should redirect to home page
   - Visiting `/dashboard` should redirect to `/login`
