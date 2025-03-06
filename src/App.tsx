import { useState, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import "../public/assets/css/style.css";
import RedirectHandler from "./component/auth/redirect-handler.tsx";
import "./App.css";
import './styles/global.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Loader from "./component/Loader/Loader.tsx";
import AppRoutes from "./component/routing/AppRoutes";
import { AppRouteMap } from "./component/routing/AppRouteKeys";

function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const currentRoute = AppRouteMap[location.pathname as keyof typeof AppRouteMap];
    if (currentRoute) {
      document.title = currentRoute.label;
    } else {
      document.title = "Clearly Care";
    }
  }, [location]);
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <>
          {/* <!-- Start Preloader  ============================================= --> */}
          <Loader />
          {/* <!-- preloader end --> */}
        </>
      ) : (
        <BrowserRouter>
          <RedirectHandler />
          <PageTitleWrapper>
            <AppRoutes />
          </PageTitleWrapper>
        </BrowserRouter>
      )}
    </>
  );
}

function PageTitleWrapper({ children }: { children: React.ReactNode }) {
  usePageTitle();
  return <>{children}</>;
}

export default App;
