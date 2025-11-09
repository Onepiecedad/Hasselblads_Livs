import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Webshop from "./pages/Webshop";
import Store from "./pages/Store";
import Delivery from "./pages/Delivery";
import About from "./pages/About";
import Season from "./pages/Season";
import CustomerService from "./pages/CustomerService";
import NotFound from "./pages/NotFound";
import MiniCartDrawer from "./components/shop/MiniCartDrawer";
import { CartProvider } from "./context/CartContext";
import BreadcrumbSchema from "./components/seo/BreadcrumbSchema";
import Checkout from "./pages/Checkout";
import LegacyRedirects from "./components/seo/LegacyRedirects";
import RootLayout from "./layouts/RootLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CartProvider>
        <BrowserRouter>
          <LegacyRedirects />
          <BreadcrumbSchema />
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<Home />} />
              <Route path="webbutik" element={<Webshop />} />
              <Route path="hemleverans" element={<Delivery />} />
              <Route path="butiken" element={<Store />} />
              <Route path="om-oss" element={<About />} />
              <Route path="säsong" element={<Season />} />
              <Route path="kundservice" element={<CustomerService />} />
              <Route path="kassa" element={<Checkout />} />
              <Route path="kopvillkor" element={<About />} />
              <Route path="hallbarhet" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <MiniCartDrawer />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
