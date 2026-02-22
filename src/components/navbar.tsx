
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LayoutDashboard, History, Sparkles } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  };

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="bg-primary p-2 rounded-xl neon-glow-primary"
          >
            <Sparkles className="h-6 w-6 text-black" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-headline text-2xl font-black text-white tracking-tighter uppercase neon-text-glow">Impact Vision</span>
            <span className="text-[8px] font-mono text-primary/60 tracking-[0.4em] uppercase -mt-1">Future Simulator v2.0</span>
          </div>
        </Link>

        {mounted && (
          <>
            {user ? (
              <div className="flex items-center gap-8">
                <div className="hidden md:flex items-center gap-8">
                  <NavLink href="/dashboard" active={pathname === "/dashboard"} icon={<LayoutDashboard className="h-4 w-4" />}>
                    Interface
                  </NavLink>
                  <NavLink href="/history" active={pathname === "/history"} icon={<History className="h-4 w-4" />}>
                    Archives
                  </NavLink>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout} 
                    className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-white">Access</Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-primary text-black font-bold neon-glow-primary hover:bg-primary/90">Initialize</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, active, children, icon }: { href: string, active: boolean, children: React.ReactNode, icon: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "relative text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 px-2 py-1",
        active ? "text-primary neon-text-glow" : "text-muted-foreground hover:text-white"
      )}
    >
      {icon}
      {children}
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary neon-glow-primary rounded-full"
        />
      )}
    </Link>
  );
}
