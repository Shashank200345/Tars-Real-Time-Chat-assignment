import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    imageUrl?: string;
    name: string;
    isOnline?: boolean;
    className?: string; // allow overriding container size explicitly
}

export function UserAvatar({
    imageUrl,
    name,
    isOnline,
    className,
}: UserAvatarProps) {
    // Generate a deterministic background color based on name string
    const getAvatarColor = (name: string) => {
        const colors = [
            "bg-red-500",
            "bg-orange-500",
            "bg-amber-500",
            "bg-green-500",
            "bg-emerald-500",
            "bg-teal-500",
            "bg-cyan-500",
            "bg-blue-500",
            "bg-indigo-500",
            "bg-violet-500",
            "bg-purple-500",
            "bg-fuchsia-500",
            "bg-pink-500",
            "bg-rose-500",
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash % colors.length);
        return colors[index];
    };

    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const colorClass = getAvatarColor(name);

    return (
        <div className={cn("relative inline-block shrink-0", className || "h-12 w-12")}>
            <Avatar className="h-full w-full border border-slate-700/50 shadow-sm">
                <AvatarImage src={imageUrl} alt={name} className="object-cover" />
                <AvatarFallback
                    className={cn("text-white font-medium shadow-inner", colorClass)}
                >
                    {initials || "?"}
                </AvatarFallback>
            </Avatar>

            {/* Online presence indicator dot */}
            {isOnline && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900 shadow-sm z-10" />
            )}
        </div>
    );
}
