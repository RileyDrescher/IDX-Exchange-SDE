import PropTypes from "prop-types";

// Values are "<column>:<order>", using the backend's whitelisted
// rets_property column names so they can be sent straight to the API.
export const SORT_OPTIONS = [
    { value: "", label: "Default" },
    { value: "L_SystemPrice:asc", label: "Price: Low to High" },
    { value: "L_SystemPrice:desc", label: "Price: High to Low" },
    { value: "ListingContractDate:desc", label: "Newest Listed" },
    { value: "ListingContractDate:asc", label: "Oldest Listed" },
    { value: "LM_Int2_3:desc", label: "Square Feet: Largest" },
    { value: "LM_Int2_3:asc", label: "Square Feet: Smallest" },
    { value: "L_Keyword2:desc", label: "Bedrooms: Most" },
    { value: "L_Keyword2:asc", label: "Bedrooms: Fewest" }
];

function SortControl({ sortBy, sortOrder, onSortChange }) {
    const currentValue = sortBy ? `${sortBy}:${sortOrder}` : "";

    function handleChange(event) {
        const [nextSortBy = "", nextSortOrder = ""] = event.target.value.split(":");
        onSortChange({ sortBy: nextSortBy, sortOrder: nextSortOrder });
    }

    return (
        <div className="sort-control">
            <label htmlFor="sort-select">Sort by</label>
            <select id="sort-select" value={currentValue} onChange={handleChange}>
                {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

SortControl.propTypes = {
    sortBy: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
    onSortChange: PropTypes.func.isRequired
};

export default SortControl;
