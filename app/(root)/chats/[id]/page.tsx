import { ChatWindow } from "@/components/chat/ChatWindow";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatPage({ params }: { params: { id: string } }) {
    return (
        <div className="h-full w-full relative">
            <ChatWindow conversationId={params.id as Id<"conversations">} />
        </div>
    );
}
