import { useFavorites } from "../hooks/useFavorites";

function FavoriteButton({ property, className = "" }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const saved = isFavorite(property.id);
    const name = property.L_Address || "this property";
    const label = saved
        ? `Remove ${name} from favorites`
        : `Save ${name} to favorites`;

    function handleClick(event) {
        // The button sits on top of a clickable card: don't let the click
        // follow the card's link or bubble up to the carousel.
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(property);
    }

    return (
        <button
            type="button"
            className={`favorite-button${saved ? " is-saved" : ""} ${className}`.trim()}
            aria-pressed={saved}
            aria-label={label}
            title={saved ? "Remove from favorites" : "Save to favorites"}
            onClick={handleClick}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 20.6 10.6 19.3C5.4 14.6 2 11.5 2 7.8 2 4.8 4.4 2.5 7.4 2.5c1.7 0 3.4.8 4.6 2.1 1.2-1.3 2.9-2.1 4.6-2.1 3 0 5.4 2.3 5.4 5.3 0 3.7-3.4 6.8-8.6 11.5L12 20.6z" />
            </svg>
        </button>
    );
}

export default FavoriteButton;
