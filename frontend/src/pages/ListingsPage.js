import { useState, useEffect } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState(null);

    useEffect(() => {
        async function loadProperties() {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchProperties({ limit: 20});

                setProperties(data.results);
                setTotal(data.total);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadProperties();
    }, []);
    
    if (loading) {
        return <p>Loading properties...</p>;
    }

    if (error) {
        return <p>Failed to load properties: {error}</p>;
    }
    return (
        <div>
            <h1>Property Listings</h1>
            <p>Browse available properties</p>
            <p>Showing {properties.length} of {total.toLocaleString()} properties</p>
            <div className="property-grid">
                {properties.map((property) => (
                    <PropertyCard
                        key={property.id}
                        property={property}
                    />
                ))}
            </div>
        </div>
    );
}

export default ListingsPage;