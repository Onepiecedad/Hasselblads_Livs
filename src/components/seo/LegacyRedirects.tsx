import { Navigate, Route, Routes } from "react-router-dom";

const LegacyRedirects = () => (
  <Routes>
    <Route path="/sasong" element={<Navigate to="/säsong" replace />} />
    <Route path="/kundtjanst" element={<Navigate to="/kundservice" replace />} />
    <Route path="/kontakt" element={<Navigate to="/kundservice#kontakt" replace />} />
    <Route path="/checkout" element={<Navigate to="/kassa" replace />} />
  </Routes>
);

export default LegacyRedirects;
