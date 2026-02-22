'use client';

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { History, Calendar, ArrowUpRight, TrendingUp, Heart, Wallet, Box, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // Simplified query: removed orderBy to avoid requiring a composite index for now.
  // Firestore automatically creates single-field indices for userId.
  const simulationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "simulations"), 
      where("userId", "==", user.uid),
      limit(20)
    );
  }, [db, user?.uid]);

  const { data: history, isLoading } = useCollection(simulationsQuery);

  // Sort history client-side since we removed server-side ordering
  const sortedHistory = history ? [...history].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) : null;

  return (
    <div className="min-h-screen bg-cyber-gradient relative">
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-10"></div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 max-w-5xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
        >
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-headline font-black text-white neon-text-glow uppercase tracking-tighter">Archives</h1>
            <p className="text-muted-foreground/60 max-w-lg font-medium">Historical data fragments from previous temporal simulations.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-b-2 border-primary flex items-center gap-4 min-w-[200px] neon-glow-primary">
            <div className="bg-primary/20 p-3 rounded-xl">
              <Box className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Nodes</p>
              <p className="font-bold text-3xl font-headline text-primary neon-text-glow">{history?.length || 0}</p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : !sortedHistory || sortedHistory.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="text-center p-24 glass-card border-dashed border-2 border-white/10 bg-transparent rounded-[3rem]">
              <CardContent className="space-y-6">
                <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-white/10">
                  <Search className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">No data fragments found</h2>
                  <p className="text-muted-foreground/60 max-w-xs mx-auto">Begin your first simulation to populate the neural archives.</p>
                </div>
                <Link href="/dashboard" className="inline-block mt-4">
                  <Button className="h-12 px-10 bg-primary text-black font-bold neon-glow-primary hover:bg-primary/90">Initialize Simulation</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {sortedHistory.map((sim: any, idx: number) => {
              const structured = sim.results?.structuredInput;
              const metrics = sim.results?.metricsByHorizon;
              const fiveYearMetric = metrics ? metrics[metrics.length - 1] : null;
              
              return (
                <motion.div
                  key={sim.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="glass-card overflow-hidden hover:border-primary/50 transition-all group hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className="md:w-80 p-8 bg-white/5 border-r border-white/5 space-y-4 flex flex-col justify-center">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                            <Calendar className="h-3 w-3 text-primary" />
                            {new Date(sim.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <h3 className="text-xl font-bold leading-none text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                             {structured?.action || 'Synthesis'}
                          </h3>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Badge variant="outline" className="capitalize text-[10px] bg-white/5 border-white/10">{structured?.category}</Badge>
                            <Badge variant="outline" className={`capitalize text-[10px] border-none bg-opacity-20 ${fiveYearMetric?.riskLevel === 'HIGH' ? 'bg-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-primary text-primary shadow-[0_0_10px_rgba(0,255,255,0.2)]'}`}>
                              {fiveYearMetric?.riskLevel || 'LOW'} Risk
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1 p-8 flex flex-wrap gap-8 items-center justify-between">
                          <div className="grid grid-cols-3 gap-12 flex-1">
                            <HistoryMetric label="Health Index" value={`${fiveYearMetric?.healthScore ?? 0}%`} icon={<Heart className="h-4 w-4" />} />
                            <HistoryMetric label="Wealth Delta" value={`${fiveYearMetric?.moneyDelta?.toLocaleString() || 0}`} icon={<Wallet className="h-4 w-4" />} />
                            <HistoryMetric label="Skill Rank" value={`${fiveYearMetric?.skillScore ?? 0}%`} icon={<TrendingUp className="h-4 w-4" />} />
                          </div>
                          <Link href={`/dashboard?id=${sim.id}`} className="mt-4 md:mt-0">
                            <Button variant="outline" size="lg" className="h-12 px-6 gap-2 border-primary/20 text-primary hover:bg-primary hover:text-black transition-all neon-glow-primary">
                              Access <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryMetric({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-2 text-center md:text-left">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
        {icon} {label}
      </p>
      <p className="font-bold text-2xl font-headline text-white neon-text-glow">{value}</p>
    </div>
  );
}
