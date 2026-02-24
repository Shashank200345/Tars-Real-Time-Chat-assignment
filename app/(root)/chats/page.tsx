import { MessageSquarePlus } from "lucide-react";

export default function ChatsEmptyState() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-900 relative">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />

            <div className="relative z-10 flex flex-col items-center gap-4 max-w-sm animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/10">
                    <MessageSquarePlus className="w-10 h-10 text-indigo-400" />
                </div>

                <h2 className="text-2xl font-semibold text-slate-200 mt-2">
                    Your Messages
                </h2>

                <p className="text-sm text-slate-400 leading-relaxed">
                    Select an existing conversation from the sidebar or search for a user to start a new chat.
                </p>
            </div>
        </div>
    );
}
