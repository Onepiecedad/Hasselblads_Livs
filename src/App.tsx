import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load pages for code splitting - reduces initial bundle from 820KB to ~200KB
const Home = lazy(() => import("./pages/Home"));
const Webshop = lazy(() => import("./pages/Webshop"));
const Delivery = lazy(() => import("./pages/Delivery"));
const About = lazy(() => import("./pages/About"));
const CustomerService = lazy(() => import("./pages/CustomerService"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));

import MiniCartDrawer from "./components/shop/MiniCartDrawer";
import { CartProvider } from "./context/CartContext";
import BreadcrumbSchema from "./components/seo/BreadcrumbSchema";
import LegacyRedirects from "./components/seo/LegacyRedirects";
import RootLayout from "./layouts/RootLayout";
import ScrollToTop from "./components/ScrollToTop";
import { useScrollRestoration } from "./hooks/useScrollRestoration";

const queryClient = new QueryClient();

// Simple loading fallback - matches site background
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-primary/50">Laddar...</div>
  </div>
);

// Auto-scroll to top on route changes
function ScrollRestoration() {
  useScrollRestoration();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CartProvider>
        <BrowserRouter>
          <ScrollRestoration />
          <LegacyRedirects />
          <BreadcrumbSchema />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<Home />} />
                <Route path="webbutik" element={<Webshop />} />
                <Route path="hemleverans" element={<Delivery />} />
                <Route path="butiken" element={<About />} />
                <Route path="om-oss" element={<About />} />

                <Route path="kundservice" element={<CustomerService />} />
                <Route path="kassa" element={<Checkout />} />
                <Route path="kopvillkor" element={<About />} />
                <Route path="hallbarhet" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
          <MiniCartDrawer />
          <ScrollToTop />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

