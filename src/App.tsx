import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Webshop from "./pages/Webshop";
import Categories from "./pages/Categories";
import Store from "./pages/Store";
import Delivery from "./pages/Delivery";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/webbutik" element={<Webshop />} />
              <Route path="/kategorier" element={<Categories />} />
              <Route path="/hemleverans" element={<Delivery />} />
              <Route path="/butiken" element={<Store />} />
              <Route path="/kontakt" element={<Contact />} />
              <Route path="/om-oss" element={<About />} />
              {/* Placeholder routes for new pages */}
              <Route path="/sasong" element={<Categories />} />
              <Route path="/kundservice" element={<Contact />} />
              <Route path="/kopvillkor" element={<About />} />
              <Route path="/hallbarhet" element={<About />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
