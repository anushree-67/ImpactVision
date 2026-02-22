
'use client';

import { useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { History, Calendar, ArrowUpRight, TrendingUp, Heart, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const { user } = useUser();
  const db = useFirestore();

  const simulationsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "simulations"), 
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
  }, [db, user]);

  const { data: history, loading: isLoading } = useCollection(simulationsQuery);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-headline font-bold">Simulation History</h1>
            <p className="text-muted-foreground">Review your past projections and trajectory changes.</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">{history?.length || 0} <span className="text-muted-foreground text-sm font-normal">Records</span></span>
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
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto opacity-50">
                <History className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold">No simulations found</h2>
              <p className="text-muted-foreground">Run your first simulation from the dashboard.</p>
              <Link href="/dashboard">
                <Badge className="cursor-pointer py-1.5 px-4">Go to Dashboard</Badge>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {history.map((sim: any) => (
              <Card key={sim.id} className="decision-card-hover group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className="md:w-64 p-6 bg-muted/30 border-r space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Calendar className="h-3 w-3" />
                        {new Date(sim.createdAt).toLocaleDateString()}
                      </div>
                      <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                         Simulation
                      </h3>
                      <Badge variant="secondary" className="capitalize">{sim.results.metricsByHorizon[0].riskLevel} Risk</Badge>
                    </div>
                    <div className="flex-1 p-6 flex flex-wrap gap-8 items-center justify-between">
                      <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Heart className="h-3 w-3" /> Health (5y)
                          </p>
                          <p className="font-bold">{sim.results.metricsByHorizon[3].healthScore}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Wallet className="h-3 w-3" /> Finance (5y)
                          </p>
                          <p className="font-bold">{sim.results.metricsByHorizon[3].moneyDelta.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Skill (5y)
                          </p>
                          <p className="font-bold">{sim.results.metricsByHorizon[3].skillScore}%</p>
                        </div>
                      </div>
                      <Link href={`/dashboard?id=${sim.id}`}>
                        <Badge variant="outline" className="h-10 px-4 gap-2 hover:bg-primary hover:text-white transition-colors cursor-pointer border-primary text-primary">
                          View Details <ArrowUpRight className="h-4 w-4" />
                        </Badge>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
