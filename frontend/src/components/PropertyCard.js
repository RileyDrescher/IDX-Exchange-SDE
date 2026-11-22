import { Link } from "react-router-dom";
import PropertyImageCarousel from "./PropertyImageCarousel";
import FavoriteButton from "./FavoriteButton";
import { formatPrice, formatNumber } from "../utils/format";
import { propertyShape } from "../utils/propTypes";

function PropertyCard({ property }) {
    return (
        <article className="property-card">
            <div className="property-card-media">
                <PropertyImageCarousel
                    photosData={property.L_Photos}
                    alt={property.L_Address}
                />
                <FavoriteButton property={property} className="favorite-button--overlay" />
            </div>

            <Link
                to={`/property/${property.id}`}
                className="property-card-details"
            >
                <p className="property-card-price">{formatPrice(property.L_SystemPrice)}</p>
                <h3 className="property-card-address">{property.L_Address || "Address not listed"}</h3>
                <p className="property-card-location">
                    {[property.L_City, property.L_State].filter(Boolean).join(", ")}
                </p>
                <ul className="property-card-stats">
                    <li><strong>{formatNumber(property.L_Keyword2)}</strong> Beds</li>
                    <li><strong>{formatNumber(property.LM_Dec_3)}</strong> Baths</li>
                    <li><strong>{formatNumber(property.LM_Int2_3)}</strong> Sqft</li>
                </ul>
            </Link>
        </article>
    );
}

PropertyCard.propTypes = {
    property: propertyShape.isRequired
};

export default PropertyCard;
