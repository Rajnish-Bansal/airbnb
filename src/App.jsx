import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HostProvider } from './context/HostContext';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';

const Home = lazy(() => import('./pages/Home'));
const HostLayout = lazy(() => import('./layouts/HostLayout'));
const HostLanding = lazy(() => import('./pages/Host/HostLanding'));
const HostDashboard = lazy(() => import('./pages/Host/HostDashboard'));
const HostStep1 = lazy(() => import('./pages/Host/HostStep1'));
const HostStep2 = lazy(() => import('./pages/Host/HostStep2'));
const HostStep3 = lazy(() => import('./pages/Host/HostStep3'));
const HostStep4 = lazy(() => import('./pages/Host/HostStep4'));
const HostStep5 = lazy(() => import('./pages/Host/HostStep5'));
const HostStep6 = lazy(() => import('./pages/Host/HostStep6'));
const HostStep7 = lazy(() => import('./pages/Host/HostStep7'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminListings = lazy(() => import('./pages/Admin/AdminListings'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const ProtectedAdminRoute = lazy(() => import('./components/atoms/ProtectedAdminRoute/ProtectedAdminRoute'));
const ProtectedRoute = lazy(() => import('./components/atoms/ProtectedRoute/ProtectedRoute'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const Bookings = lazy(() => import('./pages/Bookings/Bookings'));
const Wishlist = lazy(() => import('./pages/Wishlist/Wishlist'));
const Account = lazy(() => import('./pages/Account/Account'));
const Wallet = lazy(() => import('./pages/Wallet/Wallet'));
const RoomDetails = lazy(() => import('./pages/Rooms/RoomDetails'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Inbox = lazy(() => import('./pages/Inbox/Inbox'));
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Legal/Terms'));
const RefundPolicy = lazy(() => import('./pages/Legal/RefundPolicy'));
const Contact = lazy(() => import('./pages/Legal/Contact'));
const About = lazy(() => import('./pages/Legal/About'));

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <HostProvider>
          <BookingProvider>
            <BrowserRouter>
              <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/rooms/:id" element={<RoomDetails />} />
                  {/* Legal Pages */}
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />

                {/* Protected Routes - Require Login */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/booking" element={<Checkout />} />
                  <Route path="/book/stays/:id" element={<Checkout />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/wishlists" element={<Wishlist />} />
                  <Route path="/inbox" element={<Inbox />} />
                </Route>
                <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Routes - Protected */}
                <Route element={<ProtectedAdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="listings" element={<AdminListings />} />
                  </Route>
                </Route>

              {/* Host Flow Routes */}
              <Route path="/become-a-host" element={<HostLayout />}>
                <Route index element={<HostLanding />} />
                <Route path="dashboard" element={<HostDashboard />} />
                <Route path="step1" element={<HostStep1 />} />
                <Route path="step2" element={<HostStep3 />} />
                <Route path="step3" element={<HostStep2 />} />
                <Route path="step4" element={<HostStep4 />} />
                <Route path="step5" element={<HostStep5 />} />
                <Route path="step6" element={<HostStep6 />} />
                <Route path="step7" element={<HostStep7 />} />
                {/* Future steps will go here */}
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        </BookingProvider>
      </HostProvider>
      </SearchProvider>
    </AuthProvider>
  )
}

export default App
