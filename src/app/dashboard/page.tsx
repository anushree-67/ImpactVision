
'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runSimulation } from "@/ai/flows/run-simulation-flow";
import { SimulationCharts } from "@/components/simulation-charts";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { Sparkles, Brain, Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

function DashboardContent() {
  const { user } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const simulationId = searchParams.get('id');
  
  const [inputText, setInputText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeResult, setActiveResult] = useState<any>(null);
  const { toast } = useToast();

  // Load specific simulation if ID is provided
  const simRef = useMemoFirebase(() => {
    if (!db || !simulationId) return null;
    return doc(db, 'simulations', simulationId);
  }, [db, simulationId]);

  const { data: loadedSim, isLoading: isPageLoading } = useDoc(simRef);

  useEffect(() => {
    if (loadedSim) {
      setActiveResult(loadedSim.results);
      // We don't have the original rawText in simulation doc usually, 
      // but in this app it's stored in the linked decision doc.
      // For simplicity in this view, we'll just show the result.
    }
  }, [loadedSim]);

  const handleSimulate = async () => {
    if (!inputText || !user || !db) return;
    setIsSimulating(true);
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
        title: "Simulation Complete",
        description: "Your future trajectory has been projected."
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Simulation Error",
        description: e.message || "Something went wrong during simulation."
      });
    } finally {
      setIsSimulating(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const result = activeResult;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-8 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  New Decision
                </CardTitle>
                <CardDescription>
                  Enter a habit (e.g., "sleep 8 hours daily", "spend ₹200 on coffee").
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="w-full min-h-[120px] p-3 rounded-lg border bg-muted/50 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                  placeholder='Describe your habit here...'
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <Button 
                  className="w-full h-12 gap-2" 
                  onClick={handleSimulate}
                  disabled={isSimulating || !inputText}
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 fill-current" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {result && result.structuredInput && (
              <Card className="animate-fade-in shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Current Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge variant="outline" className="capitalize text-primary border-primary/30">{result.structuredInput.category}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-sm text-muted-foreground">Action</span>
                    <span className="text-sm font-semibold">{result.structuredInput.action}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-sm text-muted-foreground">Value</span>
                    <span className="text-sm font-semibold">{result.structuredInput.value} {result.structuredInput.unit}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Frequency</span>
                    <span className="text-sm font-semibold capitalize">{result.structuredInput.frequency}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-8">
            {!result ? (
              <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-6 bg-white/50 border border-dashed rounded-3xl p-12">
                <div className="bg-muted p-8 rounded-full">
                  <Sparkles className="h-16 w-16 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-headline font-bold">Ready to simulate</h2>
                  <p className="text-muted-foreground max-w-sm">Enter a habit on the left to see your projected future.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-3 gap-4">
                  <MetricSummaryCard 
                    label="Health (5y)" 
                    value={`${result.metricsByHorizon[3].healthScore}%`} 
                    sub="Vitality" 
                    trend={result.metricsByHorizon[3].healthScore > 70 ? 'up' : 'down'}
                  />
                  <MetricSummaryCard 
                    label="Money (5y)" 
                    value={`${result.metricsByHorizon[3].moneyDelta.toLocaleString()}`} 
                    sub={result.structuredInput?.unit || '₹'} 
                    trend={result.metricsByHorizon[3].moneyDelta >= 0 ? 'up' : 'down'}
                  />
                  <MetricSummaryCard 
                    label="Risk Level" 
                    value={result.metricsByHorizon[3].riskLevel} 
                    sub="Overall" 
                    trend={result.metricsByHorizon[3].riskLevel === 'LOW' ? 'up' : 'down'}
                    isRisk
                  />
                </div>

                <SimulationCharts data={result.metricsByHorizon} />

                <Card className="border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {result.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border-l-2 border-accent/30">
                          <div className="bg-accent/10 text-accent font-bold w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs">
                            {i+1}
                          </div>
                          <p className="text-sm leading-relaxed">{rec}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function MetricSummaryCard({ label, value, sub, trend, isRisk = false }: { label: string, value: string, sub: string, trend: 'up' | 'down', isRisk?: boolean }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <div className="flex items-end gap-2">
          <h3 className={`text-2xl font-bold font-headline ${isRisk ? (value === 'HIGH' ? 'text-destructive' : value === 'MEDIUM' ? 'text-orange-500' : 'text-accent') : (trend === 'up' ? 'text-accent' : 'text-destructive')}`}>
            {value}
          </h3>
          <span className="text-[10px] text-muted-foreground mb-1">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}
