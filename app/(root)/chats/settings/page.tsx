import { UserProfile } from "@clerk/nextjs";
import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col h-full bg-[#0A0A0A] font-sans relative">
            {/* Top Banner */}
            <div className="h-14 bg-gradient-to-r from-blue-600 to-blue-500 w-full flex items-center px-6 shrink-0 relative overflow-hidden shadow-sm z-20">
                <div className="flex items-center gap-3 text-white z-10 w-full">
                    <Settings className="w-[18px] h-[18px] text-blue-200 shrink-0" />
                    <span className="font-semibold text-sm truncate">
                        Account Settings
                    </span>
                </div>
                <div className="absolute top-0 right-0 w-64 h-full bg-white/10 blur-2xl transform skew-x-12 translate-x-10 pointer-events-none" />
            </div>

            {/* Scrollable Main Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 flex justify-center">
                <div className="w-full max-w-4xl">
                    <UserProfile
                        routing="hash"
                        appearance={{
                            elements: {
                                rootBox: "w-full shadow-none",
                                card: "w-full border border-white/10 bg-[#111] shadow-2xl rounded-2xl",
                                headerTitle: "text-white",
                                headerSubtitle: "text-slate-400",
                                navbar: "border-r border-white/5 bg-[#0B0B0B]",
                                navbarButton: "text-slate-300 hover:bg-white/5 hover:text-white",
                                profileSectionTitleText: "text-white",
                                profileSectionPrimaryButton: "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10",
                                profileSectionItem: "border-b border-white/5",
                                accordionTriggerButton: "text-white hover:bg-white/5",
                                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white",
                                formButtonReset: "text-slate-400 hover:text-white hover:bg-white/5",
                                formFieldInput: "bg-[#1A1A1A] border-white/10 text-white placeholder:text-slate-500",
                                formFieldLabel: "text-slate-300",
                                dividerLine: "bg-white/5",
                                userPreviewMainIdentifier: "text-white",
                                userPreviewSecondaryIdentifier: "text-slate-400",
                                avatarImageActionsUpload: "text-indigo-400 hover:text-indigo-300"
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
