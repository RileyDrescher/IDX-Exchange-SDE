import { useState, useEffect, useRef } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import Pagination from "../components/Pagination";

function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const[loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [activeFilters, setActiveFilters] = useState({});
    const[error, setError] = useState(null);
    const latestRequest = useRef(0);
    const offset = (currentPage - 1) * itemsPerPage;
    const totalPages = Math.ceil(total / itemsPerPage);
    

    useEffect(() => {
        latestRequest.current += 1;
        const requestId = latestRequest.current;

        async function loadProperties() {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchProperties({ 
                    ...activeFilters,
                    limit: itemsPerPage, 
                    offset: offset
                });

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
    }, [currentPage, itemsPerPage, activeFilters]);
    
    function handleSearch(filters) {
    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== "")
    );


    setCurrentPage(1);
    setActiveFilters(cleanFilters);
}

    function handlePageChange(page) {
        setCurrentPage(page);
        window.scrollTo(0, 0);
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
                    <p>Showing {total === 0 ? 0 : offset + 1} - 
                        {Math.min(offset + properties.length, total)} of {total.toLocaleString} properties
                    </p>
                    {properties.length === 0 ? (
                        <p>No properties found. Try adjusting your filters.</p>
                    ) : (
                        <div className="property-grid">
                            {properties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
}

export default ListingsPage;