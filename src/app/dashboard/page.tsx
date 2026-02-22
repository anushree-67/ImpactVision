
'use client';

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runSimulationAction } from "@/app/actions/simulation";
import { SimulationCharts } from "@/components/simulation-charts";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Sparkles, Brain, Zap, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [inputText, setInputText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSimulate = async () => {
    if (!inputText || !user || !db) return;
    setIsSimulating(true);
    try {
      const res = await runSimulationAction(inputText);
      if (res.success) {
        setResult(res);
        
        // Save to Firestore on client
        const decisionsRef = collection(db, 'decisions');
        const decisionData = {
          uid: user.uid,
          rawText: inputText,
          structuredInput: res.structuredInput,
          createdAt: new Date().toISOString()
        };

        addDoc(decisionsRef, decisionData)
          .then((docRef) => {
            const simulationsRef = collection(db, 'simulations');
            const simData = {
              uid: user.uid,
              decisionId: docRef.id,
              results: {
                metricsByHorizon: res.metricsByHorizon,
                recommendations: res.recommendations
              },
              createdAt: new Date().toISOString()
            };
            addDoc(simulationsRef, simData).catch(async (e) => {
               errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: simulationsRef.path,
                operation: 'create',
                requestResourceData: simData,
              }));
            });
          })
          .catch(async (e) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: decisionsRef.path,
              operation: 'create',
              requestResourceData: decisionData,
            }));
          });

        toast({
          title: "Simulation Complete",
          description: "We've projected your future based on this habit."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Simulation Failed",
          description: res.error
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong during simulation."
      });
    } finally {
      setIsSimulating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-8 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  New Decision
                </CardTitle>
                <CardDescription>
                  Describe a habit or decision in natural language.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="w-full min-h-[120px] p-3 rounded-lg border bg-muted/50 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                  placeholder='e.g., "sleep 6 hours daily", "save ₹5000 every month", "study 2 hours daily"'
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
                      Processing Future...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 fill-current" />
                      Simulate Impact
                    </>
                  )}
                </Button>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3 px-6 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Powered by GenAI
              </CardFooter>
            </Card>

            {result && (
              <Card className="animate-fade-in shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Parsed Data</CardTitle>
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
                    <span className="text-sm text-muted-foreground">Quantity</span>
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

          {/* Results Section */}
          <div className="lg:col-span-8">
            {!result ? (
              <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-6 bg-white/50 border border-dashed rounded-3xl p-12">
                <div className="bg-muted p-8 rounded-full">
                  <Sparkles className="h-16 w-16 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-headline font-bold">No Simulation Run Yet</h2>
                  <p className="text-muted-foreground max-w-sm">Enter a habit on the left to see how it shapes your future self over the next 5 years.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-3 gap-4">
                  <MetricSummaryCard 
                    label="Health Score" 
                    value={`${result.metricsByHorizon[3].healthScore}%`} 
                    sub="at 5 years" 
                    trend={result.metricsByHorizon[3].healthScore > 70 ? 'up' : 'down'}
                  />
                  <MetricSummaryCard 
                    label="Financial Impact" 
                    value={`${result.metricsByHorizon[3].moneyDelta.toLocaleString()}`} 
                    sub={result.structuredInput.unit} 
                    trend={result.metricsByHorizon[3].moneyDelta >= 0 ? 'up' : 'down'}
                  />
                  <MetricSummaryCard 
                    label="Risk Level" 
                    value={result.metricsByHorizon[3].riskLevel} 
                    sub="Composite risk" 
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
                    <CardDescription>Actionable steps to optimize your trajectory.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {result.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="bg-accent/10 text-accent font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">
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

function MetricSummaryCard({ label, value, sub, trend, isRisk = false }: { label: string, value: string, sub: string, trend: 'up' | 'down', isRisk?: boolean }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <div className="flex items-end gap-2">
          <h3 className={`text-3xl font-bold font-headline ${isRisk ? (value === 'HIGH' ? 'text-destructive' : value === 'MEDIUM' ? 'text-orange-500' : 'text-accent') : (trend === 'up' ? 'text-accent' : 'text-destructive')}`}>
            {value}
          </h3>
          <span className="text-xs text-muted-foreground mb-1">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}
