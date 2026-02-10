# Authentication & Registration Improvements

## ✅ Changes Implemented

### 1. **Centered Login & Register Pages**

Both login and register pages now feature:
- **Fully centered layout** with gradient background
- **Responsive container** (max-width: xs for login, sm for register)
- **Elevated paper card** with backdrop blur effect
- **Icon badges** with gradient backgrounds (Lock for login, PersonAdd/AdminShield for register)
- **Professional spacing** and typography
- **Footer** with copyright notice

### 2. **"Create New Account" Button on Login Page**

Added a prominent "Create New Account" button on the login page:
- Located below the Sign In button
- Separated with a divider ("OR")
- Outlined style for visual hierarchy
- Navigates to `/register` page
- Allows cashiers to request accounts

### 3. **Cashier Account Approval Workflow**

#### Backend Changes

**UserService.java**:
- Modified `register()` method to set status based on role:
  - **CASHIER** accounts → Created with `INACTIVE` status
  - **ADMIN** accounts → Created with `ACTIVE` status
- Added `activateUser(Long id)` method
- Added `deactivateUser(Long id)` method

**UserController.java**:
- Added `PATCH /api/users/{id}/activate` endpoint
- Added `PATCH /api/users/{id}/deactivate` endpoint

#### Frontend Changes

**Register.jsx**:
- Role selection dropdown (ADMIN or CASHIER)
- Dynamic icon based on selected role
- Info alert for CASHIER registration explaining approval process
- Helper text indicating "Needs admin approval" for CASHIER role

**Login.jsx**:
- "Create New Account" button with PersonAdd icon
- Divider separating login and registration options

**usersApi.js**:
- Added `activateUser(id)` function
- Added `deactivateUser(id)` function

### 4. **How It Works**

#### For Cashiers:
1. Click "Create New Account" on login page
2. Fill out registration form
3. Select "Cashier" as account type
4. See info message: "Your account will be created with INACTIVE status. An administrator must activate it before you can login."
5. Submit registration
6. Toast message: "Account request submitted! Please wait for admin approval."
7. Redirected to login page
8. **Cannot login** until admin activates the account

#### For Admins:
1. Register as ADMIN (first user or through admin creation)
2. Account is immediately ACTIVE
3. Can login right away
4. Navigate to Users page
5. See list of all users with their status
6. Click "Activate" button for INACTIVE cashier accounts
7. Cashier can now login

### 5. **Login Validation**

The login process now checks:
1. Username and password match
2. **User status is ACTIVE**
   - If INACTIVE, shows error: "User is INACTIVE"
   - Prevents inactive cashiers from logging in

### 6. **Visual Improvements**

#### Login Page:
- Centered card with gradient purple background
- Lock icon in gradient box
- "Welcome Back" title
- Username and password fields
- Show/hide password toggle
- "Sign In" button with gradient
- Divider with "OR" text
- "Create New Account" outlined button
- Copyright footer

#### Register Page:
- Centered card with gradient purple background
- Dynamic icon (Shield for admin, PersonAdd for cashier)
- "Create Account" title with dynamic subtitle
- 2-column grid form layout:
  - Full Name, Username
  - Phone, Account Type
  - Password, Confirm Password
- Info alert for cashier accounts
- "Create Account" button with gradient
- "Already have an account? Sign In" link
- Copyright footer

### 7. **User Experience Flow**

```
Cashier Registration Flow:
┌─────────────────┐
│  Login Page     │
│  Click "Create  │
│  New Account"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Register Page   │
│ Select CASHIER  │
│ Fill form       │
│ See info alert  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend Creates │
│ User with       │
│ INACTIVE status │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Toast: "Account │
│ request         │
│ submitted!"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│ Login Page      │
│ (Cannot login)  │
└─────────────────┘

Admin Approval Flow:
┌─────────────────┐
│ Admin logs in   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Navigate to     │
│ Users page      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ See INACTIVE    │
│ cashier account │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click "Activate"│
│ button          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend updates │
│ status to ACTIVE│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cashier can now │
│ login           │
└─────────────────┘
```

### 8. **API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (CASHIER=INACTIVE, ADMIN=ACTIVE) |
| POST | `/api/auth/login` | Login (checks ACTIVE status) |
| GET | `/api/users` | Get all users |
| PATCH | `/api/users/{id}/activate` | Activate user (admin only) |
| PATCH | `/api/users/{id}/deactivate` | Deactivate user (admin only) |

### 9. **Files Modified**

#### Backend:
- `src/main/java/com/grocersmart/service/UserService.java`
- `src/main/java/com/grocersmart/controller/UserController.java`

#### Frontend:
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/api/usersApi.js`

### 10. **Testing the Feature**

1. **Start both servers** (backend and frontend)
2. **Register as Admin**:
   - Go to register page
   - Select "Admin" role
   - Fill form and submit
   - Should be able to login immediately
3. **Register as Cashier**:
   - Logout
   - Go to login page
   - Click "Create New Account"
   - Select "Cashier" role
   - Fill form and submit
   - See info alert about approval
   - Try to login → Should fail with "User is INACTIVE"
4. **Activate Cashier** (as Admin):
   - Login as admin
   - Go to Users page
   - Find the cashier account (status: INACTIVE)
   - Click "Activate" button
   - Status changes to ACTIVE
5. **Login as Cashier**:
   - Logout
   - Login with cashier credentials
   - Should work now!

---

## 🎯 Summary

✅ Login and Register pages are now **perfectly centered**  
✅ "Create New Account" button added to login page  
✅ Cashier accounts require **admin approval**  
✅ Backend validates user status on login  
✅ Activate/Deactivate endpoints for admins  
✅ Professional UI with gradients and icons  
✅ Clear user feedback with toasts and alerts  

**The authentication system is now production-ready with proper approval workflows!** 🚀
