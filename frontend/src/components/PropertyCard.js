import { Link } from "react-router-dom";
import PropertyImageCarousel from "./PropertyImageCarousel";

function PropertyCard({ property }) {
    return (
        <div className="property-card">
            <PropertyImageCarousel
                photosData={property.L_Photos}
                alt={property.L_Address}
            />

            <Link
                to={`/property/${property.id}`}
                className="property-card-details"
            >
                <h3>{property.L_Address}</h3>
                <p>${Number(property.L_SystemPrice).toLocaleString()}</p>
                <p>{property.L_City}, {property.L_State}</p>
                <p>
                    {property.L_Keyword2} Beds |{" "}
                    {Number(property.LM_Dec_3)} Baths |{" "}
                    {Number(property.LM_Int2_3).toLocaleString()} Sqft
                </p>
            </Link>
        </div>
    );
}

export default PropertyCard;