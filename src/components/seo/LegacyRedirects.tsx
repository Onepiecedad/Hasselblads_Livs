import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LegacyRedirects = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const redirects: Record<string, string> = {
      "/kundtjanst": "/kundservice",
      "/kontakt": "/kundservice#kontakt",
      "/checkout": "/kassa",
    };

    if (redirects[path]) {
      navigate(redirects[path], { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default LegacyRedirects;
