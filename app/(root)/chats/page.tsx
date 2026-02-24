import { Settings } from "lucide-react";

export default function ChatsEmptyState() {
    return (
        <div className="h-full flex flex-col bg-[#0A0A0A] relative text-sm font-sans">
            {/* Blue Banner Header */}
            <div className="h-14 bg-gradient-to-r from-blue-600 to-blue-500 w-full flex items-center px-6 shrink-0 relative overflow-hidden shadow-md">
                <div className="flex items-center gap-3 text-white">
                    <Settings className="w-5 h-5 text-blue-200" />
                    <span className="font-semibold text-[15px]">Welcome to calley Pro</span>
                </div>
                {/* Subtle decorative glow in banner */}
                <div className="absolute top-0 right-0 w-64 h-full bg-white/10 blur-2xl transform skew-x-12 translate-x-10" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="h-16 w-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-lg backdrop-blur-sm">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <h2 className="text-lg font-medium text-slate-300 mt-2">
                        No Chat Selected
                    </h2>

                    <p className="text-[13px] text-slate-500 max-w-[250px] leading-relaxed">
                        Select an existing conversation from the Customers tab or search for a user to start.
                    </p>
                </div>
            </div>
        </div>
    );
}
