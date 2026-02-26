# 💬 Calley — Real-time Chat Application

A feature-rich, production-grade real-time chat application built with **Next.js 16**, **Convex**, and **Clerk**. Supports 1:1 DMs, group chats with admin roles, invite links, emoji reactions, typing indicators, read receipts, and more.

---

## ✨ Features

### Core Messaging
- **1:1 Direct Messages** — Instantly start private conversations
- **Group Chats** — Create groups, manage members, assign admins
- **Real-time Sync** — Messages appear instantly across all clients (powered by Convex)
- **Reply to Messages** — Quote and reply to specific messages
- **Forward Messages** — Forward any message to another conversation
- **Soft Delete** — Delete messages gracefully ("This message was deleted")
- **Copy Text** — Right-click context menu to copy message text

### Reactions & Emojis
- **Emoji Reactions** — React to any message with a tap
- **Animated Emojis** — Google Noto animated emojis rendered inline
- **Emoji Picker** — Full picker UI for selecting emojis in messages

### Group Management
- **Admin Roles** — Promote/demote admins, admin-only actions
- **Add/Remove Members** — Manage group membership in real time
- **Leave Group** — Leave a group with automatic admin reassignment
- **Invite Links** — Generate sharable invite URLs (WhatsApp-style)

### Real-time Presence
- **Online/Offline Indicators** — Green dot for online users
- **Typing Indicators** — Animated "typing..." with 3-second auto-expiry
- **Read Receipts** — "Seen" indicator for DMs
- **Unread Badges** — Red badge with count in the sidebar

### User Experience
- **Dark Mode / Light Mode** — Seamless theme toggle
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Contacts Page** — Browse all users, start conversations with one click
- **Broadcast Messages** — Send announcements to all your conversations
- **Settings Page** — Manage account preferences
- **Landing Page** — Beautiful public marketing page with "Get Started" CTA

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Backend** | Convex (real-time database + serverless functions) |
| **Authentication** | Clerk (OAuth, email, webhook sync) |
| **UI Components** | ShadCN UI, Radix UI Primitives |
| **Styling** | Tailwind CSS 4.0 with semantic design tokens |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast notifications) |
| **Date Formatting** | date-fns |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Clerk](https://clerk.com) account (for authentication)
- A [Convex](https://convex.dev) account (for the backend)

### 1. Clone the Repository
```bash
git clone https://github.com/Shashank200345/assignment.git
cd assignment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CLERK_WEBHOOK_SECRET=whsec_...
```

### 4. Start the Development Servers
```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Convex
npx convex dev
```

### 5. Open the App
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
assignment/
├── app/
│   ├── (auth)/          # Clerk sign-in/sign-up pages
│   ├── (root)/
│   │   ├── chats/       # Chat pages (DM & Group)
│   │   ├── contacts/    # Contacts listing page
│   │   └── invite/      # Invite link landing page
│   ├── api/             # Clerk webhook endpoint
│   └── page.tsx         # Public landing page
├── components/
│   ├── chat/            # ChatWindow, MessageBubble, MessageInput, etc.
│   ├── sidebar/         # Sidebar, ConversationItem, UserSearch, etc.
│   └── ui/              # ShadCN UI primitives
├── convex/
│   ├── schema.ts        # Database schema
│   ├── conversations.ts # Group/DM CRUD + invite logic
│   ├── messages.ts      # Send, delete, react, forward, broadcast
│   ├── typing.ts        # Typing indicators
│   ├── presence.ts      # Online/offline presence
│   └── users.ts         # User management
└── middleware.ts         # Clerk auth middleware
```

---

## 📄 License

This project is for educational/portfolio purposes.
