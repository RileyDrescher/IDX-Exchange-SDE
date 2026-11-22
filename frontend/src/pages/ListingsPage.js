import { useState, useEffect, useRef } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import Pagination from "../components/Pagination";
import SortControl from "../components/SortControl";

const DEFAULT_SORT = { sortBy: "", sortOrder: "" };

function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const[loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [activeFilters, setActiveFilters] = useState({});
    const [sort, setSort] = useState(DEFAULT_SORT);
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

                // Only send sort params when a sort is selected, so the
                // default request is unchanged from Weeks 6-8.
                const sortParams = sort.sortBy
                    ? { sortBy: sort.sortBy, sortOrder: sort.sortOrder }
                    : {};

                const data = await fetchProperties({ 
                    ...activeFilters,
                    ...sortParams,
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
    }, [offset, itemsPerPage, activeFilters, sort]);
    
    function handleSearch(filters) {
    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== "")
    );


    setCurrentPage(1);
    setActiveFilters(cleanFilters);
    // New filters mean a new result set, so sorting goes back to default.
    setSort(DEFAULT_SORT);
}

    function handleSortChange(nextSort) {
        // Sorting changes the order of every page, so start from page 1.
        // The sort stays in state, so page changes keep it.
        setSort(nextSort);
        setCurrentPage(1);
    }

    function handlePageChange(page) {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    }
    
    return (
        <div className="listings-page">
            <header className="page-header">
                <h1>Property Listings</h1>
                <p className="page-subtitle">Homes for sale across California</p>
            </header>
            <PropertyFilters onSearch={handleSearch}/>

            <div className="results-bar">
                <p className="results-count" aria-live="polite">
                    {!loading && !error && (
                        <>
                            Showing{" "}
                            <strong>
                                {total === 0 ? 0 : offset + 1}–{Math.min(offset + properties.length, total)}
                            </strong>{" "}
                            of <strong>{total.toLocaleString()}</strong> properties
                        </>
                    )}
                </p>
                <SortControl
                    sortBy={sort.sortBy}
                    sortOrder={sort.sortOrder}
                    onSortChange={handleSortChange}
                />
            </div>

            {loading && <p className="status-message">Loading properties...</p>}
            {error && (
                <p className="status-message status-message--error">
                    Couldn't load properties ({error}). Check that the backend is running on port 5000, then refresh.
                </p>
            )}
            
            {!loading && !error && (
                <>
                    {properties.length === 0 ? (
                        <p className="status-message">No properties match these filters. Try widening the price range or clearing filters.</p>
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