import { Component } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Catches errors thrown while rendering any child component and shows a
// recovery screen instead of a blank page. (Error boundaries must be class
// components; they don't catch errors in event handlers or async code,
// which our pages already handle with their own error state.)
export class ErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        // Keep the real error visible to developers.
        console.error("Page crashed:", error, info.componentStack);
    }

    handleRetry = () => {
        this.setState({ error: null });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (!this.state.error) {
            return this.props.children;
        }

        return (
            <div className="error-boundary" role="alert">
                <h1>This page hit a problem</h1>
                <p>
                    Something went wrong while showing this page. Your saved favorites are safe.
                    Try again, or go back to the listings.
                </p>
                <div className="error-boundary-actions">
                    <button type="button" className="button button--primary" onClick={this.handleRetry}>
                        Try again
                    </button>
                    <a href="/" className="button">Back to listings</a>
                    <button type="button" className="button" onClick={this.handleReload}>
                        Reload page
                    </button>
                </div>
                {process.env.NODE_ENV === "development" && (
                    <pre className="error-boundary-details">{String(this.state.error?.message || this.state.error)}</pre>
                )}
            </div>
        );
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node
};

// Resets the boundary whenever the route changes, so one broken page doesn't
// stay stuck on the error screen after the user navigates away.
function RouteErrorBoundary({ children }) {
    const location = useLocation();
    return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>;
}

RouteErrorBoundary.propTypes = {
    children: PropTypes.node
};

export default RouteErrorBoundary;
