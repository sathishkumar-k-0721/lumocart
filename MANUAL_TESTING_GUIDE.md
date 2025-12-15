# LUMO E-Commerce - Manual Functional Testing Guide

## Setup
- ✅ Next.js server running on http://localhost:3000
- ✅ Database: MongoDB Atlas connected
- ✅ Prisma schema updated (updatedAt made optional)
- ✅ Images extracted and saved to /public/img

---

## Test 1: ✅ Products Page - Image Display
**Status:** COMPLETED
- [x] Navigate to http://localhost:3000/products
- [x] Verify product images load (no 404 errors)
- [x] Check browser console for errors

**Result:** Images extracted from base64, placeholder created for missing images

---

## Test 2: 🔧 Product Detail Page
**URL:** http://localhost:3000/products/[product-id]

### Steps:
1. From products page, click on any product card
2. Verify product detail page loads

### Expected Elements:
- [ ] Product name displays correctly
- [ ] Product price shows
- [ ] Product description visible
- [ ] Main product image displays
- [ ] Image gallery (if multiple images)
- [ ] Stock status indicator
- [ ] Quantity selector
- [ ] "Add to Cart" button present and clickable

### Browser Console Check:
- Open DevTools (F12)
- Check Console tab for any errors
- Check Network tab - verify API call to `/api/products/[id]` returns 200

### Common Issues to Check:
- [ ] If 404: Product ID might be invalid
- [ ] If 500: Check Prisma connection or data format
- [ ] If blank page: Check React rendering errors

---

## Test 3: 🔧 Add to Cart Functionality
**Prerequisites:** Must be on product detail page

### Steps:
1. Select quantity (try 1, then try 3)
2. Click "Add to Cart" button
3. Observe behavior

### Expected Behavior:
- [ ] Toast/notification appears: "Product added to cart"
- [ ] Cart icon in header updates with item count
- [ ] No page reload
- [ ] Button shows loading state briefly

### Browser Console Check:
- [ ] POST request to `/api/cart` or `/api/cart/add`
- [ ] Response status: 200
- [ ] Response contains updated cart data

### Test Edge Cases:
- [ ] Try adding same product multiple times
- [ ] Try quantity = 0 (should show error)
- [ ] Try quantity > stock (should show error if validation exists)

---

## Test 4: 🔧 Cart Page Operations
**URL:** http://localhost:3000/cart

### Steps:
1. Navigate to /cart (click cart icon)
2. Verify cart displays correctly

### Expected Display:
- [ ] All cart items show with:
  - Product image
  - Product name
  - Price per unit
  - Quantity selector
  - Subtotal (price × quantity)
  - Remove button (X or trash icon)
- [ ] Cart subtotal (sum of all items)
- [ ] "Continue Shopping" button/link
- [ ] "Proceed to Checkout" button

### Operations to Test:

#### Update Quantity:
- [ ] Increase quantity of an item
- [ ] Decrease quantity of an item  
- [ ] Verify subtotal updates automatically
- [ ] Browser console: PUT/PATCH to `/api/cart/update`

#### Remove Item:
- [ ] Click remove button on one item
- [ ] Item disappears from cart
- [ ] Total updates
- [ ] Browser console: DELETE to `/api/cart/remove` or `/api/cart/[id]`

#### Empty Cart:
- [ ] Remove all items
- [ ] Verify "Your cart is empty" message shows
- [ ] "Continue Shopping" link works

---

## Test 5: 🔧 Login Flow from Checkout
**Prerequisites:** Have items in cart, be logged out

### Steps:
1. From cart page, click "Proceed to Checkout"
2. Observe behavior

### Expected Flow - Not Logged In:
- [ ] Redirect to `/login` page
- [ ] Login form displays
- [ ] Message: "Please log in to continue"

### Login Form:
- [ ] Email field
- [ ] Password field
- [ ] "Login" button
- [ ] "Don't have account? Register" link

### Test Login:
- [ ] Enter valid credentials
- [ ] Click Login
- [ ] Expected: Redirect back to `/checkout` with cart preserved

### Browser Console:
- [ ] POST to `/api/auth/login`
- [ ] Response contains `token` or sets cookie
- [ ] Verify redirect happens

---

## Test 6: 🔧 User Registration  
**URL:** http://localhost:3000/register (or /login with register tab)

### Registration Form Fields:
- [ ] Full Name / Name
- [ ] Email
- [ ] Password
- [ ] Confirm Password (if exists)
- [ ] Register button

### Test Cases:

#### Valid Registration:
```
Name: Test User
Email: test123@example.com
Password: Test123!@#
```
- [ ] Fill form with valid data
- [ ] Click Register
- [ ] Expected: Success message OR auto-login + redirect

#### Validation Tests:
- [ ] Empty fields → error messages
- [ ] Invalid email format → "Invalid email"
- [ ] Weak password → "Password must be X characters"
- [ ] Passwords don't match → error message
- [ ] Existing email → "Email already exists"

### Browser Console:
- [ ] POST to `/api/auth/register`
- [ ] Status 201 (created) on success
- [ ] Status 400 with error message on validation fail

### After Registration:
- [ ] User automatically logged in? OR
- [ ] Redirected to login page?
- [ ] Can now access protected pages?

---

## Test 7: 🔧 Checkout Page Form
**URL:** http://localhost:3000/checkout
**Prerequisites:** Logged in + items in cart

### Page Sections:

#### Shipping Address Form:
- [ ] Full Name
- [ ] Address Line 1
- [ ] Address Line 2 (optional)
- [ ] City
- [ ] State / Province
- [ ] PIN Code / Zip Code
- [ ] Phone Number

#### Billing Address:
- [ ] "Same as shipping address" checkbox
- [ ] If unchecked, separate billing form appears
- [ ] Billing form has same fields as shipping

#### Order Summary (Right Side or Bottom):
- [ ] Lists all cart items
- [ ] Shows quantities
- [ ] Shows individual prices
- [ ] Shows subtotal
- [ ] Shows shipping charges (if any)
- [ ] Shows tax (if any)
- [ ] **Grand Total**

### Form Validation:
- [ ] Try submitting empty form → error messages
- [ ] Invalid phone number → error
- [ ] Invalid PIN code → error
- [ ] All required fields marked with *

### Actions:
- [ ] Fill shipping address
- [ ] Check "Same as shipping" for billing
- [ ] Verify billing form auto-fills
- [ ] Uncheck and manually fill billing
- [ ] Click "Place Order" or "Proceed to Payment"

---

## Test 8: 🔧 Payment Flow (Razorpay)
**Prerequisites:** Completed checkout form

### Steps:
1. Click "Place Order" / "Pay Now"
2. Observe Razorpay modal

### Expected Behavior:
- [ ] Razorpay payment modal opens
- [ ] Shows order amount
- [ ] Shows merchant name
- [ ] Payment options visible (Card/UPI/Netbanking)

### Test Payment (TEST MODE):
```
Test Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

- [ ] Enter test card details
- [ ] Click Pay
- [ ] Payment processing animation
- [ ] Success confirmation

### After Payment Success:
- [ ] Razorpay modal closes
- [ ] Order confirmation page loads
- [ ] Shows order number
- [ ] Shows order details
- [ ] Cart is now empty
- [ ] "View Order" or "Continue Shopping" buttons

### Browser Console:
- [ ] POST to `/api/orders` (create order)
- [ ] POST to `/api/orders/verify-payment` (verify Razorpay)
- [ ] Check for Razorpay-related logs

### Payment Failure Test:
- [ ] Use Razorpay test card for failure
- [ ] Or click "X" to cancel payment
- [ ] Verify error message shows
- [ ] Order not created
- [ ] Can retry payment

---

## Test 9: 🔧 Order History Page
**URL:** http://localhost:3000/orders
**Prerequisites:** At least one completed order

### Page Display:
- [ ] List of all user's orders
- [ ] Most recent at top

### Each Order Card Shows:
- [ ] Order number / ID
- [ ] Order date
- [ ] Order status (Processing/Shipped/Delivered)
- [ ] Total amount
- [ ] Number of items
- [ ] "View Details" button

### Click "View Details":
- [ ] Full order information page loads
- [ ] Shows all ordered items with images
- [ ] Quantities and prices
- [ ] Shipping address
- [ ] Billing address  
- [ ] Payment method
- [ ] Payment status (Paid/Pending/Failed)
- [ ] Order timeline / tracking (if implemented)

### Browser Console:
- [ ] GET to `/api/orders`
- [ ] Returns array of orders
- [ ] GET to `/api/orders/[id]` when viewing details

---

## Test 10: 🔧 Account/Profile Page
**URL:** http://localhost:3000/account
**Prerequisites:** Logged in

### Profile Information Display:
- [ ] User's name
- [ ] Email address
- [ ] Member since date (if exists)
- [ ] Edit profile button

### Edit Profile:
- [ ] Click "Edit Profile"
- [ ] Form appears with current values
- [ ] Can update name
- [ ] Email (editable or read-only?)
- [ ] Save button
- [ ] Cancel button

### Test Update:
- [ ] Change name
- [ ] Click Save
- [ ] Success message
- [ ] Page updates with new name

### Change Password Section:
- [ ] "Change Password" button or form
- [ ] Current password field
- [ ] New password field
- [ ] Confirm new password field
- [ ] Submit

### Browser Console:
- [ ] GET to `/api/user` or `/api/auth/me`
- [ ] PUT/PATCH to `/api/user` when updating
- [ ] POST to `/api/auth/change-password`

---

## Test 11: 🔧 Logout Functionality

### Steps:
1. Click "Logout" button (header/profile menu)
2. Observe behavior

### Expected:
- [ ] User logged out immediately
- [ ] Redirect to home page or login page
- [ ] Header shows "Login" instead of user name
- [ ] Cart icon still visible (guest cart)

### Test Cart Persistence:
- Before logout: Add items to cart
- After logout: 
  - [ ] Cart icon still shows count?
  - [ ] Visit /cart - items still there? (session-based)
  OR
  - [ ] Cart cleared (depends on implementation)

### Test Protected Pages:
After logout, try accessing:
- [ ] http://localhost:3000/orders → Redirect to login
- [ ] http://localhost:3000/account → Redirect to login
- [ ] http://localhost:3000/checkout → Redirect to login

### Browser Console:
- [ ] POST to `/api/auth/logout` OR
- [ ] Cookie/token cleared
- [ ] localStorage cleared (if used)

---

## Test 12: 🔧 Cross-Browser & Responsive Testing

### Browser Testing:
Test entire flow in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

### Responsive Breakpoints:

#### Mobile (375px width):
- [ ] Open DevTools → Toggle device toolbar
- [ ] Set to iPhone SE or 375px
- [ ] Navigate through:
  - Products page (grid → 1 column?)
  - Product detail (layout stacks vertically?)
  - Cart page (table → stacked cards?)
  - Checkout form (single column?)
  - Header (hamburger menu?)

#### Tablet (768px width):
- [ ] Set to iPad or 768px
- [ ] Products grid (2 columns?)
- [ ] Forms remain usable
- [ ] Navigation accessible

#### Desktop (1024px+ width):
- [ ] Full layout
- [ ] All features accessible
- [ ] No horizontal scroll

### Touch Interactions (Mobile):
- [ ] Buttons large enough to tap
- [ ] Form fields easy to focus
- [ ] No zoom on input focus (if meta tag set)

---

## Bug Reporting Template

When you find an issue, document it like this:

```
**Test:** [Test number and name]
**URL:** [Page URL]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Browser Console Errors:**
[Copy any errors from console]

**Screenshots:**
[If applicable]

**Priority:** High / Medium / Low
```

---

## Quick Command Reference

### Start Next.js Server:
```bash
cd c:\lumo\lumo-next
npm run dev
```

### Check Server Status:
- Open browser: http://localhost:3000
- Should see homepage

### Check Database Connection:
```bash
cd c:\lumo\lumo-next
npx prisma studio
```
- Opens GUI at http://localhost:5555
- Can view/edit database records

### View Prisma Client:
```bash
npx prisma generate
```
- Regenerates Prisma Client if schema changes

### Check for TypeScript Errors:
```bash
npm run build
```
- Will show any compile errors

---

## Testing Priority Order

**Phase 1 - Core Flow (Highest Priority):**
1. Test 2: Product Detail Page
2. Test 3: Add to Cart
3. Test 4: Cart Operations
4. Test 6: User Registration
5. Test 5: Login Flow
6. Test 7: Checkout Form

**Phase 2 - Payment & Orders:**
7. Test 8: Payment (Razorpay)
8. Test 9: Order History

**Phase 3 - User Management:**
9. Test 10: Account/Profile
10. Test 11: Logout

**Phase 4 - Polish:**
11. Test 12: Responsive Testing

---

## ✅ Completed Tests
- [x] Test 1: Products Page - Image Display

## 🔧 In Progress
- [ ] Test 2: Product Detail Page

## 📋 Pending
- Tests 3-12

---

**Next Action:** Start Test 2 by navigating to http://localhost:3000/products and clicking on a product card.
