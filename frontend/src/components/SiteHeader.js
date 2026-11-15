import { Link, NavLink } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";

function SiteHeader() {
    const { count } = useFavorites();

    return (
        <header className="site-header">
            <div className="site-header-inner">
                <Link to="/" className="site-brand">IDX Homes</Link>
                <nav aria-label="Main">
                    <NavLink to="/" end className="site-nav-link">Listings</NavLink>
                    <NavLink to="/favorites" className="site-nav-link">
                        Favorites
                        <span className={`favorites-count${count === 0 ? " is-empty" : ""}`}>
                            {count}
                        </span>
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}

export default SiteHeader;
