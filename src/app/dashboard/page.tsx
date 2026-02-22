
'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runSimulation } from "@/ai/flows/run-simulation-flow";
import { SimulationCharts } from "@/components/simulation-charts";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Sparkles, Brain, Zap, Loader2, CheckCircle2, RefreshCw, Activity, TrendingUp, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { motion, AnimatePresence } from "framer-motion";

function DashboardContent() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulationId = searchParams.get('id');
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeResult, setActiveResult] = useState<any>(null);

  const simRef = useMemoFirebase(() => {
    if (!db || !simulationId) return null;
    return doc(db, 'simulations', simulationId);
  }, [db, simulationId]);

  const { data: loadedSim, isLoading: isDocLoading } = useDoc(simRef);

  useEffect(() => {
    if (loadedSim) {
      setActiveResult(loadedSim.results);
    }
  }, [loadedSim]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleSimulate = async () => {
    if (!inputText || !user || !db) return;
    setIsSimulating(true);
    setActiveResult(null);
    try {
      const res = await runSimulation({ rawText: inputText });
      setActiveResult(res);
      
      const decisionData = {
        userId: user.uid,
        rawText: inputText,
        structuredInput: res.structuredInput,
        createdAt: new Date().toISOString()
      };

      const decisionRef = await addDocumentNonBlocking(collection(db, 'decisions'), decisionData);
      
      if (decisionRef) {
        const simData = {
          userId: user.uid,
          decisionId: decisionRef.id,
          results: {
            metricsByHorizon: res.metricsByHorizon,
            recommendations: res.recommendations,
            structuredInput: res.structuredInput
          },
          createdAt: new Date().toISOString()
        };
        addDocumentNonBlocking(collection(db, 'simulations'), simData);
      }

      toast({
        title: "Simulation Initialized",
        description: "Future data streams synthesized successfully."
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Simulation Failure",
        description: e.message || "Neuro-link error. Please retry."
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const clearView = () => {
    router.push("/dashboard");
    setActiveResult(null);
    setInputText("");
  };

  if (isUserLoading || isDocLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary neon-glow-primary" />
      </div>
    );
  }

  const result = activeResult;

  return (
    <div className="min-h-screen bg-cyber-gradient relative">
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20"></div>
      
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <Navbar />

      <main className="container mx-auto px-4 pt-12 max-w-6xl relative z-10 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-12 gap-8"
        >
          {/* Left Column: Input */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="glass-card neon-border-primary border-t-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary neon-text-glow tracking-widest">
                  <Activity className="h-5 w-5" />
                  {simulationId ? "Data Archive" : "Temporal Input"}
                </CardTitle>
                <CardDescription className="text-muted-foreground/80">
                  {simulationId ? "Reviewing historical timeline." : "Synthesize a new decision pathway."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!simulationId && (
                  <>
                    <div className="relative">
                      <textarea
                        className="w-full min-h-[140px] p-4 rounded-xl border border-white/10 bg-black/40 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none text-sm transition-all resize-none"
                        placeholder="e.g., 'Learn neural-interface coding 2 hours daily'..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                      <div className="absolute bottom-3 right-3 opacity-30">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <Button 
                      className="w-full h-14 gap-2 bg-primary text-black hover:bg-primary/90 neon-glow-primary font-bold transition-transform active:scale-95" 
                      onClick={handleSimulate}
                      disabled={isSimulating || !inputText}
                    >
                      {isSimulating ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 fill-current" />
                          Simulate Future
                        </>
                      )}
                    </Button>
                  </>
                )}
                {simulationId && (
                  <Button variant="outline" className="w-full h-12 gap-2 border-primary/30 text-primary hover:bg-primary/10" onClick={clearView}>
                    <RefreshCw className="h-4 w-4" />
                    New Projection
                  </Button>
                )}
              </CardContent>
            </Card>

            <AnimatePresence>
              {result && result.structuredInput && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="glass-card border-l-2 border-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Neural Extraction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs text-muted-foreground uppercase">Sector</span>
                        <Badge variant="outline" className="capitalize bg-primary/10 text-primary border-primary/20 px-3">{result.structuredInput.category}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs text-muted-foreground uppercase">Action</span>
                        <span className="text-sm font-bold text-foreground neon-text-glow">{result.structuredInput.action}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs text-muted-foreground uppercase">Magnitude</span>
                        <span className="text-sm font-bold">{result.structuredInput.value} {result.structuredInput.unit}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs text-muted-foreground uppercase">Cycle</span>
                        <span className="text-sm font-bold capitalize">{result.structuredInput.frequency}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Projections */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[600px] flex flex-col items-center justify-center text-center space-y-8 glass-card rounded-[2rem] p-12 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
                  <div className="bg-primary/10 p-10 rounded-full neon-glow-primary relative z-10">
                    <Sparkles className="h-20 w-20 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <h2 className="text-4xl font-headline font-bold text-white neon-text-glow">Awaiting Input</h2>
                    <p className="text-muted-foreground/60 max-w-sm mx-auto text-lg">Input a life decision to visualize its compounding impact on your future timeline.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-3 gap-4">
                    <MetricCard 
                      label="Health Score" 
                      value={`${result.metricsByHorizon[3].healthScore}%`} 
                      sub="Vitality Index" 
                      trend={result.metricsByHorizon[3].healthScore > 70 ? 'pos' : 'neg'}
                      icon={<Activity className="h-4 w-4" />}
                    />
                    <MetricCard 
                      label="Wealth Delta" 
                      value={`${result.metricsByHorizon[3].moneyDelta.toLocaleString()}`} 
                      sub={result.structuredInput?.unit || 'Units'} 
                      trend={result.metricsByHorizon[3].moneyDelta >= 0 ? 'pos' : 'neg'}
                      icon={<TrendingUp className="h-4 w-4" />}
                    />
                    <MetricCard 
                      label="Risk Matrix" 
                      value={result.metricsByHorizon[3].riskLevel} 
                      sub="Compounding Threat" 
                      trend={result.metricsByHorizon[3].riskLevel === 'LOW' ? 'pos' : 'neg'}
                      isRisk
                      icon={<Info className="h-4 w-4" />}
                    />
                  </div>

                  <div className="glass-card p-6 rounded-2xl border-t-2 border-primary/20">
                    <SimulationCharts data={result.metricsByHorizon} />
                  </div>

                  <Card className="glass-card border-l-4 border-accent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-accent neon-text-glow uppercase tracking-widest">
                        <CheckCircle2 className="h-5 w-5" />
                        Neural Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {result.recommendations.map((rec: string, i: number) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="flex gap-4 p-5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                          >
                            <div className="bg-accent/20 text-accent font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,0,255,0.2)]">
                              {i+1}
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{rec}</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, sub, trend, isRisk = false, icon }: { label: string, value: string, sub: string, trend: 'pos' | 'neg', isRisk?: boolean, icon: React.ReactNode }) {
  const isPos = trend === 'pos';
  const colorClass = isRisk 
    ? (value === 'HIGH' ? 'text-red-500' : value === 'MEDIUM' ? 'text-orange-500' : 'text-primary') 
    : (isPos ? 'text-primary' : 'text-red-500');
  const glowClass = isRisk 
    ? (value === 'HIGH' ? 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' : '') 
    : (isPos ? 'neon-glow-primary' : '');

  return (
    <Card className={`glass-card border-b-2 ${glowClass}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          <div className={`p-1.5 rounded-md bg-white/5 ${colorClass}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-end gap-2">
          <h3 className={`text-3xl font-bold font-headline ${colorClass} neon-text-glow`}>
            {value}
          </h3>
          <span className="text-[10px] text-muted-foreground/60 mb-1 font-mono">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <DashboardContent />
    </Suspense>
  );
}
