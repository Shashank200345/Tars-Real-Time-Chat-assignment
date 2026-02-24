import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        const body = await req.text();

        const svixId = req.headers.get("svix-id");
        const svixTimestamp = req.headers.get("svix-timestamp");
        const svixSignature = req.headers.get("svix-signature");

        if (!svixId || !svixTimestamp || !svixSignature) {
            return new Response("Missing svix headers", { status: 400 });
        }

        // Verify the webhook signature
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
        let event: any;

        try {
            event = wh.verify(body, {
                "svix-id": svixId,
                "svix-timestamp": svixTimestamp,
                "svix-signature": svixSignature,
            });
        } catch (err) {
            console.error("Clerk webhook verification failed:", err);
            return new Response("Invalid signature", { status: 400 });
        }

        // Handle user created or updated
        if (event.type === "user.created" || event.type === "user.updated") {
            const { id, first_name, last_name, email_addresses, image_url } =
                event.data;

            const name =
                [first_name, last_name].filter(Boolean).join(" ") || "Unknown";
            const email = email_addresses?.[0]?.email_address ?? "";

            await ctx.runMutation(api.users.upsertUser, {
                clerkId: id,
                name,
                email,
                imageUrl: image_url ?? "",
            });
        }

        return new Response("OK", { status: 200 });
    }),
});

export default http;
