import { Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const RootLayout = () => (
  <div className="flex min-h-screen flex-col">
    <a href="#main-content" className="skip-link">
      Hoppa till innehåll
    </a>
    <Navigation />
    <main id="main-content" className="flex-grow" tabIndex={-1}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default RootLayout;
