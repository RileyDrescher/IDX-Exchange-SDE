import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import SiteHeader from "./components/SiteHeader";
import ListingsPage from "./pages/ListingsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import RouteErrorBoundary from "./components/ErrorBoundary";

// Opt in to React Router v7 behavior now; this removes the future-flag
// console warnings without hiding any real errors.
const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

function App() {
    return (
        <BrowserRouter future={ROUTER_FUTURE}>
            <div className="App">
                <SiteHeader />
                <main className="site-main">
                    <RouteErrorBoundary>
                    <Routes>
                        <Route path="/" element={<ListingsPage />} />
                        <Route path="/property/:id" element={<PropertyDetailPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                    </Routes>
                    </RouteErrorBoundary>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
