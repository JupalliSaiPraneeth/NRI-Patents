import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-white flex items-center justify-center p-6">
                    <div className="max-w-lg w-full">
                        {/* Top red bar */}
                        <div className="h-1 bg-[#b20e0e] rounded-t-2xl" />
                        <div className="bg-white rounded-b-2xl shadow-xl p-8 border border-slate-100 text-center">
                            <div className="w-16 h-16 bg-[#b20e0e]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={32} className="text-[#b20e0e]" />
                            </div>

                            <h1 className="text-2xl font-black text-[#1a1a1a] tracking-tight mb-2">
                                Something went wrong
                            </h1>

                            <p className="text-slate-500 mb-6 text-sm">
                                An unexpected error occurred. Please try reloading the application.
                            </p>

                            <div className="bg-[#f8f8f8] rounded-xl p-4 mb-8 text-left overflow-auto max-h-40 text-xs text-slate-600 border border-slate-200">
                                <span className="font-mono">{this.state.error?.toString()}</span>
                            </div>

                            <button
                                onClick={this.handleReload}
                                className="w-full flex items-center justify-center gap-2 bg-[#b20e0e] hover:bg-[#8a0a0a] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#b20e0e]/25 hover:shadow-[#b20e0e]/40 hover:-translate-y-0.5"
                            >
                                <RefreshCw size={18} />
                                Reload Application
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;