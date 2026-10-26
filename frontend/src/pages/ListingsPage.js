import { useState, useEffect, useRef } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";

function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState(null);
    const latestRequest = useRef(0);

    useEffect(() => {
        latestRequest.current += 1;
        const requestId = latestRequest.current;

        async function loadProperties() {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchProperties({ limit: 20});

                if (requestId === latestRequest.current) {
                    setProperties(data.results);
                    setTotal(data.total);
                }
            } catch (error) {
                if (requestId === latestRequest.current) {
                    setError(error.message);
                }
            } finally {
                if (requestId === latestRequest.current) {
                    setLoading(false);
                }
            }
        }

        loadProperties();

        return () => {
            if (requestId === latestRequest.current) {
                latestRequest.current += 1;
            }
        };
    }, []);
    
    async function handleSearch(filters) {
        const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== "")
        );

        latestRequest.current += 1;
        const requestId = latestRequest.current;

        setLoading(true);
        setError(null);

        try {
            const data = await fetchProperties(cleanFilters);
            if (requestId === latestRequest.current) {
                setProperties(data.results);
                setTotal(data.total);
            }
        } catch (error) {
            if (requestId === latestRequest.current) {
                setError(error.message);
            }
        } finally {
            if (requestId === latestRequest.current) {
                setLoading(false);
            }
        }
    }
    
    return (
        <div>
            <h1>Property Listings</h1>
            <PropertyFilters onSearch={handleSearch}/>
            {loading && <p>Loading properties...</p>}
            {error && <p>Failed to load properties: {error}</p>}
            
            {!loading && !error && (
                <>
                    <p>Browse available properties</p>
                    <p>Showing {properties.length} of {total.toLocaleString()} properties</p>
                    {properties.length === 0 ? (
                        <p>No properties found. Try adjusting your filters.</p>
                    ) : (
                        <div className="property-grid">
                            {properties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ListingsPage;