
'use client';

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { History, Calendar, ArrowUpRight, TrendingUp, Heart, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const { user } = useUser();
  const db = useFirestore();

  const simulationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "simulations"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
  }, [db, user?.uid]);

  const { data: history, isLoading } = useCollection(simulationsQuery);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-headline font-bold">Trajectory History</h1>
            <p className="text-muted-foreground">Review your past projections and habit compounding analysis.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Total Simulations</p>
              <p className="font-bold text-2xl">{history?.length || 0}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : !history || history.length === 0 ? (
          <Card className="text-center p-20 border-dashed bg-transparent">
            <CardContent className="space-y-4">
              <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto opacity-50">
                <History className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold">No history found</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">Start by simulating your first habit on the dashboard to see your compounding results here.</p>
              <Link href="/dashboard">
                <Button className="mt-4 px-8">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {history.map((sim: any) => {
              const structured = sim.results?.structuredInput;
              const fiveYearMetric = sim.results?.metricsByHorizon?.[3];
              
              return (
                <Card key={sim.id} className="decision-card-hover group border-l-4 border-l-primary/50">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="md:w-72 p-6 bg-muted/20 border-r space-y-3 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <Calendar className="h-3 w-3" />
                          {new Date(sim.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors capitalize">
                           {structured?.action || 'Unknown Action'}
                        </h3>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="capitalize text-[10px]">{structured?.category}</Badge>
                          <Badge variant="outline" className={`capitalize text-[10px] ${fiveYearMetric?.riskLevel === 'HIGH' ? 'text-destructive' : 'text-accent'}`}>{fiveYearMetric?.riskLevel} Risk</Badge>
                        </div>
                      </div>
                      <div className="flex-1 p-6 flex flex-wrap gap-8 items-center justify-between">
                        <div className="grid grid-cols-3 gap-8 flex-1">
                          <div className="space-y-1 text-center md:text-left">
                            <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                              <Heart className="h-3 w-3" /> Health (5y)
                            </p>
                            <p className="font-bold text-lg">{fiveYearMetric?.healthScore || 0}%</p>
                          </div>
                          <div className="space-y-1 text-center md:text-left">
                            <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                              <Wallet className="h-3 w-3" /> Finance (5y)
                            </p>
                            <p className="font-bold text-lg">{fiveYearMetric?.moneyDelta?.toLocaleString() || 0}</p>
                          </div>
                          <div className="space-y-1 text-center md:text-left">
                            <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                              <TrendingUp className="h-3 w-3" /> Skill (5y)
                            </p>
                            <p className="font-bold text-lg">{fiveYearMetric?.skillScore || 0}%</p>
                          </div>
                        </div>
                        <Link href={`/dashboard?id=${sim.id}`}>
                          <Button variant="outline" size="sm" className="gap-2 group-hover:bg-primary group-hover:text-white transition-all">
                            Details <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
