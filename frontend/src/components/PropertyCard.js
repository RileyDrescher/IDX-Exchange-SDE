import { useState } from "react";
function PropertyCard({ property }) {

    const firstPhoto = getFirstPhoto(property.L_Photos);
    const [imageError, setImageError] = useState(false);
    return (
         <div className="property-card">
            {firstPhoto && !imageError ? (
                <img
                    src={firstPhoto}
                    alt={property.L_Address || "Property"}
                    className="property-image"
                    onError={() => {
                        setImageError(true);
                    }}
                />
            ) : (
                <div className="property-image-placeholder">
                    No Photo Available
                </div>
            )}

            <h3>{property.L_Address}</h3>
            <p>${Number(property.L_SystemPrice).toLocaleString()}</p>
            <p>{property.L_City}, {property.L_State}</p>
            <p>
                {property.L_Keyword2} Beds |{" "}
                {Number(property.LM_Dec_3)} Baths |{" "}
                {Number(property.LM_Int2_3).toLocaleString()} Sqft
            </p>
        </div>
    );
}

function getFirstPhoto(photosData) {
    try {
        if (!photosData) {
            return null;
        }

        const photos = JSON.parse(photosData);

        if (!Array.isArray(photos) || photos.length === 0) {
            return null;
        }

        if (typeof photos[0] !== "string" || !photos[0].trim()) {
            return null;
        }

        return photos[0];
    } catch (error) {
        return null;
    }
}

export default PropertyCard;