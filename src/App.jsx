import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import adminFetch from './utils/adminFetch';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingFaqButton from './components/FloatingFaqButton';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import HowItWorks from './pages/HowItWorks';
import Impact from './pages/Impact';
import Transparency from './pages/Transparency';
import Community from './pages/Community';
import Contact from './pages/Contact';
import Registration from './pages/Registration';
import ChennaiEvent from './pages/ChennaiEvent';
import Faq from './pages/Faq';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';

// Scroll to top on page change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

// Public Shell Layout with Website Navbar and Footer
function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <FloatingFaqButton />
      <Footer />
    </div>
  );
}

// Protected Route Guard for Admin
function AdminRoute({ children }) {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setAuthState({ isLoading: false, isAuthenticated: false });
      return;
    }

    let isMounted = true;
    adminFetch('/api/admin/me')
      .then((res) => {
        if (res.ok) {
          return res.json().then(() => {
            if (isMounted) setAuthState({ isLoading: false, isAuthenticated: true });
          });
        } else {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          if (isMounted) setAuthState({ isLoading: false, isAuthenticated: false });
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (isMounted) setAuthState({ isLoading: false, isAuthenticated: false });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (authState.isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
        color: '#F8FAFC',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(255,255,255,0.2)',
            borderTopColor: '#A51C1F',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 500 }}>Verifying administrative session...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ── ADMIN ROUTES (Separate from Public Navbar/Footer) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        />

        {/* ── PUBLIC WEBSITE ROUTES (With Normal Navbar & Footer) ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/community" element={<Community />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chennai-event" element={<ChennaiEvent />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/register/:slug" element={<Registration />} />
          <Route path="/events/book" element={<Registration />} />
          <Route path="/events/:slug/book" element={<Registration />} />
          <Route path="/events/:eventId/book" element={<Registration />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/faq.html" element={<Faq />} />
          {/* Catch-all route within public layout */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
