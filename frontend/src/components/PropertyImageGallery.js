
import { useState, useEffect } from "react";

function PropertyImageGallery({ photosData, alt }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const photos = parsePhotos(photosData);

    function handlePrevious(event) {
        event.stopPropagation();

        setCurrentIndex((prev) =>
            (prev - 1 + photos.length) % photos.length
        );
    }

    function handleNext(event) {
        event.stopPropagation();

        setCurrentIndex((prev) =>
            (prev + 1) % photos.length
        );
    }

    useEffect(() => {
        if (!isLightboxOpen) {
            return;
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setIsLightboxOpen(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isLightboxOpen]);

    return (
        <div className="property-image-gallery">
            {photos.length === 0 ? (
                <div className="property-image-placeholder">
                    No Photo Available
                </div>
            ) : (
                <>
                    {/* Main Image */}
                    <img
                        src={photos[currentIndex]}
                        alt={`${alt || "Property"} - Photo ${currentIndex + 1}`}
                        className="gallery-main-image"
                        onClick={() => setIsLightboxOpen(true)}
                    />

                    {/* Thumbnail Section */}
                    <div className="gallery-thumbnails">
                        {photos.map((photo, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setCurrentIndex(index)}
                                className={index === currentIndex ? "active" : ""}
                                aria-label={`View photo ${index + 1}`}
                            >
                                <img
                                    src={photo}
                                    alt={`Thumbnail ${index + 1}`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Full-Screen Lightbox */}
                    {isLightboxOpen && (
                        <div
                            className="gallery-lightbox"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <button
                                type="button"
                                className="lightbox-close"
                                onClick={() => setIsLightboxOpen(false)}
                                aria-label="Close gallery"
                            >
                                &times;
                            </button>

                            {photos.length > 1 && (
                                <button
                                    type="button"
                                    className="lightbox-previous"
                                    onClick={handlePrevious}
                                    aria-label="Previous photo"
                                >
                                    &#10094;
                                </button>
                            )}

                            <img
                                src={photos[currentIndex]}
                                alt={`${alt || "Property"} - Photo ${currentIndex + 1}`}
                                className="lightbox-image"
                                onClick={(event) => event.stopPropagation()}
                            />

                            {photos.length > 1 && (
                                <button
                                    type="button"
                                    className="lightbox-next"
                                    onClick={handleNext}
                                    aria-label="Next photo"
                                >
                                    &#10095;
                                </button>
                            )}

                            <span className="lightbox-counter">
                                {currentIndex + 1} / {photos.length}
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default PropertyImageGallery;

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
