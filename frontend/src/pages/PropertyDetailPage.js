
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    fetchPropertyDetail,
    fetchPropertyOpenHouses
} from "../api/client";
import PropertyImageGallery from "../components/PropertyImageGallery";
import PropertyMap from "../components/PropertyMap";

function PropertyDetailPage() {
    const { id } = useParams();

    // Property details state
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Open houses state
    const [openHouses, setOpenHouses] = useState([]);
    const [openHousesLoading, setOpenHousesLoading] = useState(true);
    const [openHousesError, setOpenHousesError] = useState(null);

    // Fetch property details
    useEffect(() => {
        let cancelled = false;

        async function loadProperty() {
            setLoading(true);
            setError(null);
            setProperty(null);

            try {
                const data = await fetchPropertyDetail(id);

                if (!cancelled) {
                    setProperty(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadProperty();

        return () => {
            cancelled = true;
        };
    }, [id]);

    // Fetch open houses
    useEffect(() => {
        let cancelled = false;

        async function loadOpenHouses() {
            setOpenHousesLoading(true);
            setOpenHousesError(null);
            setOpenHouses([]);

            try {
                const data = await fetchPropertyOpenHouses(id);

                if (!cancelled) {
                    setOpenHouses(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setOpenHousesError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setOpenHousesLoading(false);
                }
            }
        }

        loadOpenHouses();

        return () => {
            cancelled = true;
        };
    }, [id]);

    // Loading state
    if (loading) {
        return <p>Loading property details...</p>;
    }

    // Error state
    if (error) {
        return (
            <div>
                <Link to="/">← Back to Listings</Link>
                <p>Failed to load property: {error}</p>
            </div>
        );
    }

    // No property found
    if (!property) {
        return <p>Property not found.</p>;
    }

    return (
        <div>
            <Link to="/">← Back to Listings</Link>

            <h1>{property.L_Address}</h1>
            <h2>${Number(property.L_SystemPrice).toLocaleString()}</h2>

            <p>
                {property.L_City}, {property.L_State} {property.L_Zip}
            </p>

            <p>
                {property.L_Keyword2} Beds |{" "}
                {Number(property.LM_Dec_3)} Baths |{" "}
                {Number(property.LM_Int2_3).toLocaleString()} Sqft
            </p>

            {/* Property Image Gallery */}
            <PropertyImageGallery
                photosData={property.L_Photos}
                alt={property.L_Address}
            />

            <h2>About This Property</h2>
            <p>{property.L_Remarks || "No description available."}</p>

            <h2>Property Details</h2>

            <p>Year Built: {property.YearBuilt ?? "N/A"}</p>
            <p>Property Type: {property.L_Type_ || "N/A"}</p>
            <p>
                Lot Size: {property.LotSizeSquareFeet
                    ? `${Number(property.LotSizeSquareFeet).toLocaleString()} Sqft`
                    : "N/A"}
            </p>
            <p>Stories: {property.StoriesTotal ?? "N/A"}</p>
            <p>Flooring: {property.Flooring || "N/A"}</p>
            <p>Heating: {property.Heating || "N/A"}</p>
            <p>Cooling: {property.Cooling || "N/A"}</p>
            <p>Architectural Style: {property.ArchitecturalStyle || "N/A"}</p>
            <p>Open Parking Spaces: {property.OpenParkingSpaces ?? "N/A"}</p>

            {/* Google Map */}
            <PropertyMap
                latitude={property.LMD_MP_Latitude}
                longitude={property.LMD_MP_Longitude}
            />

            {/* Open Houses */}
            <h2>Open Houses</h2>

            {openHousesLoading ? (
                <p>Loading open houses...</p>
            ) : openHousesError ? (
                <p>Unable to load open houses.</p>
            ) : openHouses.length === 0 ? (
                <p>No open houses scheduled.</p>
            ) : (
            <div className="open-houses">
                    {openHouses.map((openHouse, index) => (
                <div
                    key={openHouse.id ?? index}
                    className="open-house-card"
                >
                <p>
                    <strong>Date:</strong>{" "}
                    {formatOpenHouseDate(openHouse.OpenHouseDate)}
                </p>

                <p>
                    <strong>Time:</strong>{" "}
                    {formatOpenHouseTime(openHouse.OH_StartTime)}
                    {" - "}
                    {formatOpenHouseTime(openHouse.OH_EndTime)}
                </p>

                {getOpenHouseRemarks(openHouse.all_data) && (
                <p>
                    <strong>Remarks:</strong>{" "}
                    {getOpenHouseRemarks(openHouse.all_data)}
                </p>
                )}
                </div>
                ))}
            </div>
            )}
        </div>
    );
}

export default PropertyDetailPage;


function formatOpenHouseDate(dateString) {
    if (!dateString) {
        return "N/A";
    }

    // Use the date portion to avoid timezone shifting.
    const date = dateString.slice(0, 10);
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function formatOpenHouseTime(timeString) {
    if (!timeString) {
        return "N/A";
    }

    const [hours, minutes] = timeString.split(":").map(Number);

    const period = hours >= 12 ? "PM" : "AM";
    const formattedHour = hours % 12 || 12;

    return `${formattedHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getOpenHouseRemarks(allData) {
    try {
        if (!allData) {
            return null;
        }

        const data = typeof allData === "string"
            ? JSON.parse(allData)
            : allData;

        return typeof data?.OpenHouseRemarks === "string"
            ? data.OpenHouseRemarks.trim() || null
            : null;
    } catch (error) {
        return null;
    }
}

