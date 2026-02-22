
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useUser } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously
} from "firebase/auth";
import { Sparkles, Mail, Lock, Loader2, ArrowRight, Zap, UserCircle, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function LoginPage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Auth error:", error.code, error.message);
      
      let message = error.message;
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        message = isLogin 
          ? "No neural record found. Check credentials or create a new Neural ID." 
          : "Invalid credentials. Ensure your email is correct and password is at least 6 characters.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Please sign in instead.";
      }

      toast({
        variant: "destructive",
        title: "Synchronization Failure",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      toast({
        title: "Guest Access Initialized",
        description: "Welcome to the simulation. Your data will be temporary."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Guest Uplink Error",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-gradient relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20"></div>
      
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card neon-border-primary border-t-2 overflow-hidden bg-black/60 backdrop-blur-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 neon-glow-primary border border-primary/30">
                <Sparkles className="text-primary h-8 w-8 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-3xl font-headline font-black text-white neon-text-glow tracking-tighter uppercase">
                  {isLogin ? "Neural Access" : "Network Entry"}
                </CardTitle>
                <CardDescription className="text-muted-foreground/80 font-medium mt-2">
                  {isLogin ? "Initialize temporal synchronization." : "Register your neural signature in the archive."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="email" 
                      placeholder="Neural ID (Email)" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      className="pl-12 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" 
                      placeholder="Encryption Key (Password)" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      className="pl-12 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all"
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full h-12 bg-primary text-black font-bold neon-glow-primary hover:bg-primary/90 rounded-xl transition-all active:scale-95 group" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      {isLogin ? "Initialize Access" : "Confirm Entry"}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-black/40 px-3 text-muted-foreground font-bold">Alternative Pathways</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-12 gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent/30 text-white rounded-xl transition-all active:scale-95" 
                onClick={handleGuestSignIn}
                disabled={isLoading}
              >
                <UserCircle className="h-4 w-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-widest">Instant Guest Access</span>
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t border-white/5 bg-white/5 py-6">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-primary hover:text-primary/80 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                <Zap className="h-3 w-3 fill-current" />
                {isLogin ? "Request New Neural ID" : "Neural Archive Member? Login"}
              </button>
              
              <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong>Neural Tip:</strong> For the fastest experience without an account, use <strong>Guest Access</strong> to begin your simulation immediately.
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
