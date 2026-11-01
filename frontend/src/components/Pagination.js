function Pagination({ currentPage, totalPages, onPageChange}) {

    const pages =[];

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1 || (currentPage <= 3 && i <= 4) || 
            (currentPage >= totalPages - 2 && i >= totalPages - 3)) {
            pages.push(i);
        }
    }

    const displayPages = [];
    
    for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
            const gap = pages[i] - pages[i - 1];
            
            if (gap === 2) {
                displayPages.push(pages[i-1] + 1);
            } else if (gap > 2) {
                displayPages.push("...");
            }
        }

        displayPages.push(pages[i]);
    }

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav aria-label="Property pagination">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Previous
            </button>

            {displayPages.map((page, index) => (
                page === "..." ? (
                    <span key={`ellipsis-${index}`}>
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                    >
                        {page}
                </button>
                )
            ))}

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}    
            >
                Next
            </button>

        </nav>
    );
}

export default Pagination;