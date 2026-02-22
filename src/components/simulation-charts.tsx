
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricsHorizon } from "@/lib/simulation-engine";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimulationChartsProps {
  data: MetricsHorizon[];
}

export function SimulationCharts({ data }: SimulationChartsProps) {
  const chartData = data.map(m => ({
    horizon: m.horizonDays === 1825 ? '5 Years' : m.horizonDays === 365 ? '1 Year' : m.horizonDays === 180 ? '6 Months' : '30 Days',
    health: m.healthScore,
    money: m.moneyDelta,
    career: m.skillScore,
    rawDays: m.horizonDays
  }));

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="health">Health Impact</TabsTrigger>
          <TabsTrigger value="finance">Financial Delta</TabsTrigger>
          <TabsTrigger value="career">Career Skill</TabsTrigger>
        </TabsList>
        
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projected Health Score</CardTitle>
              <CardDescription>Estimated vitality based on your daily habits.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="horizon" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="health" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>Financial Impact</CardTitle>
              <CardDescription>Net savings or costs over time horizons.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="horizon" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()}`, 'Amount']} />
                  <Line type="monotone" dataKey="money" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="career">
          <Card>
            <CardHeader>
              <CardTitle>Skill Progression</CardTitle>
              <CardDescription>Growth in professional capabilities.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="horizon" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="career" stroke="hsl(var(--chart-3))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
