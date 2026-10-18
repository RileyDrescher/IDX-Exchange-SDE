export async function fetchProperties(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await fetch(`/api/properties?${query}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch properties: HTTP ${response.status}`);
    }

    return response.json();
}

export async function fetchPropertyDetail(id) {
    const response = await fetch(`/api/properties/${encodeURIComponent(id)}`);

    if (!response.ok) {
        throw new Error(
            `Failed to fetch property details: HTTP ${response.status}`
        );
    }

    return response.json();
}