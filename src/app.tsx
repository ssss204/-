import { useCallback, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import BanterLoader from '@/components/portfolio/BanterLoader';
import HomePage from '@/pages/HomePage/HomePage';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const hideLoader = useCallback(() => setShowLoader(false), []);

  return (
    <>
      {showLoader && <BanterLoader onComplete={hideLoader} />}
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
