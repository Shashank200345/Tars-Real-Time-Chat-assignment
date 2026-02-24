import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ChatsLayoutShell } from "@/components/sidebar/ChatsLayoutShell";

export default async function ChatsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return <ChatsLayoutShell>{children}</ChatsLayoutShell>;
}
