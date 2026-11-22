import { useState } from "react";
import PropTypes from "prop-types";

function PropertyFilters( {onSearch}) {
    const [filters, setfilters] = useState({
        city: "",
        zipcode: "",
        minPrice: "",
        maxPrice: "",
        beds: "",
        baths: "",
    });

    function handleChange(event) {
        const { name, value } = event.target;

        setfilters((previousFilters) => ({
            ...previousFilters,
            [name]: value
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        onSearch(filters);
    }

    function handleClear() {
        setfilters({
            city: "",
            zipcode: "",
            minPrice: "",
            maxPrice: "",
            beds: "",
            baths: ""
        });
        onSearch({});
    }

    return (
        <form className="filters" onSubmit={handleSubmit} aria-label="Filter properties">
            <h2>Filter Properties</h2>
            <input
                type="text"
                name="city"
                placeholder="City"
                aria-label="City"
                value={filters.city}
                onChange={handleChange}
            />

            <input
                type="text"
                name="zipcode"
                placeholder="ZIP Code"
                aria-label="ZIP code"
                inputMode="numeric"
                value={filters.zipcode}
                onChange={handleChange} 
            />

            <input 
                type="number"
                name="minPrice"
                placeholder="Min Price"
                aria-label="Minimum price"
                min="0"
                value={filters.minPrice}
                onChange={handleChange}
            />

            <input 
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                aria-label="Maximum price"
                min="0"
                value={filters.maxPrice}
                onChange={handleChange}
            />

            <select name="beds" aria-label="Bedrooms" value={filters.beds} onChange={handleChange}>
                <option value="">Any Bedrooms</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
            </select>

            <select name="baths" aria-label="Bathrooms" value={filters.baths} onChange={handleChange}>
                <option value="">Any Bathrooms</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
            </select>

            <button type="submit">Search</button>
            <button type="button" onClick={handleClear}>Clear Filters</button>
        </form>
    );
}

PropertyFilters.propTypes = {
    onSearch: PropTypes.func.isRequired
};

export default PropertyFilters;