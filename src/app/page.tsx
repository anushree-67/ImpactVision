
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, HeartPulse, BrainCircuit } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>Simulate your future with AI</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight">
                Visualize the Impact of Your <span className="text-primary">Daily Choices</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Enter any habit or decision. Our simulator projects its effect on your health, wealth, and career over 1 to 5 years. Start making data-driven decisions for your future self.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <Button size="lg" className="h-14 px-8 text-lg font-semibold gap-2">
                    Try the Simulator <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold">
                    View Sample Report
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative w-full aspect-square max-w-[600px] animate-fade-in animation-delay-300">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl transform rotate-6"></div>
              <div className="relative bg-white rounded-3xl border shadow-2xl p-4 overflow-hidden">
                <Image 
                  src="https://picsum.photos/seed/vision/600/600"
                  alt="Future Visualization"
                  width={600}
                  height={600}
                  className="rounded-2xl object-cover"
                  data-ai-hint="future technology"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Impact Vision?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our deterministic engine combined with advanced AI parsing gives you a clear vision of your trajectory.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<HeartPulse className="h-8 w-8 text-rose-500" />}
              title="Health Projection"
              description="See how your sleep, diet, and exercise habits compound into your long-term vitality score."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-8 w-8 text-accent" />}
              title="Financial Foresight"
              description="Calculate the true cost of small daily habits and the compounding power of consistent saving."
            />
            <FeatureCard 
              icon={<BrainCircuit className="h-8 w-8 text-primary" />}
              title="Career Trajectory"
              description="Project your skill growth and earning potential based on your learning and work patterns."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-headline font-bold">Ready to see your future?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">Join thousands of users who are optimizing their lives through simulation.</p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold">
              Create Your First Simulation
            </Button>
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
      </section>
      
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Impact Vision. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border bg-background decision-card-hover text-center space-y-4">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-headline">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
