import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default async function ChatsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Sidebar - fixed width on desktop, full width on mobile if sidebar is active */}
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full z-10">
                <Sidebar />
            </div>

            {/* Main Chat Area - fills remaining space */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-900 shadow-inner relative z-0">
                {children}
            </div>
        </div>
    );
}
