import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Top-level error boundary — catches unhandled render errors and shows
 * a user-friendly fallback instead of a white screen.
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen flex flex-col items-center justify-center font-sans p-8 text-center bg-[#fafaf8] text-[#1a1a1a]">
                    <h1 className="text-2xl mb-3">
                        Något gick fel
                    </h1>
                    <p className="text-[#666] mb-6 max-w-[400px]">
                        Ett oväntat fel inträffade. Försök ladda om sidan.
                    </p>
                    <button
                        onClick={this.handleReload}
                        className="py-2.5 px-6 bg-[#2d5016] text-white border-none rounded-lg cursor-pointer text-[0.95rem]"
                    >
                        Ladda om sidan
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
