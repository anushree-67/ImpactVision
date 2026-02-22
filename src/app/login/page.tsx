
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useUser } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously
} from "firebase/auth";
import { Sparkles, Mail, Lock, Loader2, ArrowRight, Zap, UserCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleAuth = async (isLogin: boolean) => {
    if (!auth) return;
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Neural Link Established", description: "Welcome back to the simulation." });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Neural Signature Registered", description: "Your profile has been archived." });
      }
    } catch (error: any) {
      console.error("Auth error:", error.code, error.message);
      
      let message = error.message;
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = isLogin 
          ? "No record found. Did you mean to Register (Network Entry) instead?" 
          : "Invalid signature. Ensure email is valid and password is 6+ characters.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Email already in archives. Switch to Login (Neural Access).";
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
        title: "Guest Uplink Active",
        description: "Welcome. Temporary data stream initialized."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uplink Error",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-gradient relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20"></div>
      
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card neon-border-primary border-t-2 overflow-hidden bg-black/60 backdrop-blur-2xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="mx-auto bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 neon-glow-primary border border-primary/30">
                <Sparkles className="text-primary h-8 w-8 animate-pulse" />
              </div>
              <CardTitle className="text-3xl font-headline font-black text-white neon-text-glow tracking-tighter uppercase">
                Future-You Portal
              </CardTitle>
              <CardDescription className="text-muted-foreground/80 font-medium">
                Establish your temporal synchronization link.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 border border-white/10 rounded-xl p-1">
                  <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest text-[10px]">
                    Neural Access
                  </TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-black font-bold uppercase tracking-widest text-[10px]">
                    Network Entry
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-4 mb-6">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="email" 
                      placeholder="Neural ID (Email)" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" 
                      placeholder="Encryption Key" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl"
                    />
                  </div>
                </div>

                <TabsContent value="login" className="mt-0">
                  <Button 
                    className="w-full h-12 bg-primary text-black font-bold neon-glow-primary hover:bg-primary/90 rounded-xl group" 
                    onClick={() => handleAuth(true)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <span className="flex items-center gap-2">
                        Initialize Access <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <Button 
                    className="w-full h-12 bg-accent text-black font-bold neon-glow-accent hover:bg-accent/90 rounded-xl group" 
                    onClick={() => handleAuth(false)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <span className="flex items-center gap-2">
                        Confirm Registry <ShieldCheck className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </span>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em]">
                  <span className="bg-[#05060f] px-3 text-muted-foreground/60 font-bold">Priority Override</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-14 gap-3 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-primary rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,255,0.05)]" 
                onClick={handleGuestSignIn}
                disabled={isLoading}
              >
                <div className="bg-primary/20 p-2 rounded-lg">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest leading-none">Instant Guest Access</p>
                  <p className="text-[9px] opacity-60 font-medium">Zero-link entry (No account needed)</p>
                </div>
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t border-white/5 bg-white/5 py-6">
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] text-white font-bold uppercase tracking-widest">Temporal Log</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    If you haven't created a Neural ID yet, use the <strong>Network Entry</strong> tab or bypass security with <strong>Guest Access</strong>.
                  </p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
