
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
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { Sparkles, Chrome, Mail, Lock, Loader2, ArrowRight, Zap } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Redirect if already logged in
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
      // Redirection is handled by the useEffect above
    } catch (error: any) {
      console.error("Auth error:", error.code, error.message);
      
      let message = "An unexpected error occurred. Please try again.";
      
      if (error.code === 'auth/invalid-credential') {
        message = isLogin 
          ? "Invalid email or password. Please check your credentials." 
          : "The email address is already in use or the credentials provided are invalid.";
      } else if (error.code === 'auth/user-not-found') {
        message = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Try signing in.";
      } else if (error.code === 'auth/weak-password') {
        message = "Password should be at least 6 characters.";
      }

      toast({
        variant: "destructive",
        title: "Authentication Failure",
        description: message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Error",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-gradient relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20"></div>
      
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <Navbar />

      <div className="container mx-auto px-4 py-20 flex justify-center items-center relative z-10">
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

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-black/40 px-3 text-muted-foreground font-bold">External Verification</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-12 gap-3 border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 text-white rounded-xl transition-all active:scale-95" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Chrome className="h-5 w-5 text-primary" />
                <span className="font-bold">Sync with Google</span>
              </Button>
            </CardContent>
            <CardFooter className="justify-center border-t border-white/5 bg-white/5 py-6">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-primary hover:text-primary/80 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                <Zap className="h-3 w-3 fill-current" />
                {isLogin ? "Request New Neural ID" : "Already Registered? Login"}
              </button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
