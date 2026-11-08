
function PropertyMap({ latitude, longitude }) {
    if (!latitude || !longitude) {
        return null;
    }

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey || "")}&q=${encodeURIComponent(`${latitude},${longitude}`)}`;

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}`;

    return (
        <div className="property-map">
            <h2>Property Location</h2>

            {apiKey ? (
                <iframe
                    title="Property Location Map"
                    src={mapUrl}
                    width="100%"
                    height="350"
                    style={{ border: 0, borderRadius: "12px" }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                />
            ) : (
                <p>Map unavailable. Google Maps API key is not configured.</p>
            )}

            <p>
                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Get Directions
                </a>
            </p>
        </div>
    );
}

export default PropertyMap;
