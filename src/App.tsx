import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/admin/LoginPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { DonatePage } from './pages/DonatePage';
import { GalleryPage } from './pages/GalleryPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { BroadcastPage } from './pages/BroadcastPage';

// Admin Imports
import { AdminLayout } from './pages/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { PagesBuilder } from './pages/admin/PagesBuilder';
import { ThemeCustomizer } from './pages/admin/ThemeCustomizer';
import { EventsManager } from './pages/admin/EventsManager';
import { DonationsManager } from './pages/admin/DonationsManager';
import { FormsBuilder } from './pages/admin/FormsBuilder';
import { MediaLibrary } from './pages/admin/MediaLibrary';
import { NavigationMenu } from './pages/admin/NavigationMenu';
import { LiveDarshan } from './pages/admin/LiveDarshan';
import { SEOManager } from './pages/admin/SEOManager';
import { NotificationCenter } from './pages/admin/NotificationCenter';
import { SecurityCenter } from './pages/admin/SecurityCenter';
import { AuditLogs } from './pages/admin/AuditLogs';
import { UserManagement } from './pages/admin/UserManagement';

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1" style={{ paddingTop: 'var(--header-height, 140px)' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Admin Login Route */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="pages" element={<PagesBuilder />} />
                  <Route path="theme" element={<ThemeCustomizer />} />
                  <Route path="events" element={<EventsManager />} />
                  <Route path="donations" element={<DonationsManager />} />
                  <Route path="forms" element={<FormsBuilder />} />
                  <Route path="media" element={<MediaLibrary />} />
                  <Route path="menus" element={<NavigationMenu />} />
                  <Route path="darshan" element={<LiveDarshan />} />
                  <Route path="seo" element={<SEOManager />} />
                  <Route path="notifications" element={<NotificationCenter />} />
                  <Route path="security" element={<SecurityCenter />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="users" element={<UserManagement />} />
                </Route>
              </Route>

            {/* Main Website Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<AboutPage />} />
              <Route path="/volunteer" element={<AboutPage />} />
              <Route path="/darshan" element={<BroadcastPage />} />
              <Route path="/broadcast" element={<BroadcastPage />} />
            </Route>
          </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
