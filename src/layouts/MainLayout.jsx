import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollProgress from '../components/common/ScrollProgress';
import BackToTop from '../components/common/BackToTop';
import WhatsAppFloat from '../components/common/WhatsAppFloat';
import Loader from '../components/common/Loader';
import { ToastProvider } from '../components/common/Toast';
import { captureAttribution, initAnalytics, trackPageView } from '../utils/tracking';

export default function MainLayout() {
  const { pathname } = useLocation();

  // Analytics + marketing attribution (runs once)
  useEffect(() => {
    captureAttribution();
    initAnalytics();
  }, []);

  // Scroll to top + SPA page view on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    trackPageView(pathname);
  }, [pathname]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <ScrollProgress />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:bg-white focus:px-4 focus:py-2 focus:text-primary-700"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          <Suspense fallback={<Loader label="Loading page…" />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
        <BackToTop />
        <WhatsAppFloat />
      </div>
    </ToastProvider>
  );
}
