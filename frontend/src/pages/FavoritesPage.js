import { Link } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import { useFavorites } from "../hooks/useFavorites";

function FavoritesPage() {
    const { favorites, count } = useFavorites();

    return (
        <div className="favorites-page">
            <header className="page-header">
                <h1>Favorites</h1>
                <p className="page-subtitle" aria-live="polite">
                    {count === 1 ? "1 saved home" : `${count} saved homes`}
                </p>
            </header>

            {count === 0 ? (
                <div className="empty-state">
                    <p>No favorites yet. Tap the heart on any listing to save it here.</p>
                    <Link to="/" className="button button--primary">Browse listings</Link>
                </div>
            ) : (
                <div className="property-grid">
                    {favorites.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default FavoritesPage;
