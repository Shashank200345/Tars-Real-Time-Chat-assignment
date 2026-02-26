import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, Shield, Smartphone } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();

  // If user is already logged in, redirect them directly to the app
  if (userId) {
    redirect("/chats");
  }

  // Otherwise, render the public landing page
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col font-sans overflow-hidden">
      {/* Navigation Bar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">calley</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up">
              <Button className="rounded-full px-6 font-medium shadow-lg hover:shadow-primary/25 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden flex items-center justify-center min-h-[80vh]">
          {/* Background Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] opacity-40 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border/50 text-sm font-medium text-muted-foreground mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Now in public beta
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Connecting you with the people who matter most.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
              Experience real-time communication that is blindingly fast, gorgeously designed, and securely synced across all your devices.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                  Start Chatting for Free
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-semibold border-border/50 hover:bg-secondary transition-all">
                  Sign In to Account
                </Button>
              </Link>
            </div>

            {/* Visual Chat Preview */}
            <div className="mt-20 w-full max-w-5xl rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden shadow-black/50">
              <div className="h-12 border-b border-border/50 bg-muted/30 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
              </div>
              <div className="aspect-[21/9] bg-gradient-to-tr from-accent/50 to-background flex items-center justify-center text-muted-foreground font-medium">
                [ Interactive Chat Interface Demo ]
              </div>
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-secondary/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need for seamless communication</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Calley is packed with powerful features designed to make conversation feel natural, instantaneous, and expressive.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Built on Convex for instant synchronization across all devices with zero perceived latency." },
                { icon: Shield, title: "Secure by Default", desc: "Clerk authentication ensures your identity and your conversations remain entirely private." },
                { icon: Smartphone, title: "Works Everywhere", desc: "Responsive design that looks equally stunning on your desktop, tablet, and mobile phone." },
                { icon: MessageSquare, title: "Feature Rich", desc: "Group chats, read receipts, typing indicators, animated emojis, and dark mode out of the box." }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border/50 bg-background">
        <p>© {new Date().getFullYear()} Calley. All rights reserved.</p>
      </footer>
    </div>
  );
}
