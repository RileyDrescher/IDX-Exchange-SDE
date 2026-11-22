import PropTypes from "prop-types";

const numberOrString = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

// A rets_property row as used by the listing UI. MySQL returns DECIMAL
// columns (e.g. LM_Dec_3) as strings, so numeric fields accept both.
export const propertyShape = PropTypes.shape({
    id: numberOrString.isRequired,
    L_Address: PropTypes.string,
    L_SystemPrice: numberOrString,
    L_City: PropTypes.string,
    L_State: PropTypes.string,
    L_Zip: PropTypes.string,
    L_Keyword2: numberOrString,
    LM_Dec_3: numberOrString,
    LM_Int2_3: numberOrString,
    L_Photos: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
});

export const photosDataType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
]);

export { numberOrString };
