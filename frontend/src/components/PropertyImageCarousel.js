import { useState } from "react";

function PropertyImageCarousel({ photosData, alt }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Parse the photos received from the property
    const photos = parsePhotos(photosData);
    function handlePrevious(event) {
    event.preventDefault();
    event.stopPropagation();

    setCurrentIndex((prev) =>
        (prev - 1 + photos.length) % photos.length
    );
}

function handleNext(event) {
    event.preventDefault();
    event.stopPropagation();

    setCurrentIndex((prev) =>
        (prev + 1) % photos.length
    );
}

    return (
    <div className="property-image-carousel">
        {photos.length === 0 ? (
            <div className="property-image-placeholder">
                No Photo Available
            </div>
        ) : (
            <>
                <img
                    src={photos[currentIndex]}
                    alt={`${alt || "Property"} - Photo ${currentIndex + 1}`}
                    className="property-image"
                />

                {photos.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={handlePrevious}
                            aria-label="Previous photo"
                        >
                            &#10094;
                        </button>

                        <span className="photo-counter">
                            {currentIndex + 1} / {photos.length}
                        </span>

                        <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Next photo"
                        >
                            &#10095;
                        </button>
                    </>
                )}
            </>
        )}
    </div>
);
}

export default PropertyImageCarousel;

function parsePhotos(photosData) {
    try {
        if (!photosData) {
            return [];
        }

        const photos = typeof photosData === "string"
            ? JSON.parse(photosData)
            : photosData;

        if (!Array.isArray(photos)) {
            return [];
        }

        return photos.filter(
            photo => typeof photo === "string" && photo.trim()
        );
    } catch (error) {
        return [];
    }
}