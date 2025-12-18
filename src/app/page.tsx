
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Trophy, Briefcase, Users, Zap, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';


export default function Home() {
  const howItWorksSteps = [
    {
      step: "01",
      title: "Register",
      description: "Apply individually or through your college club.",
    },
    {
      step: "02",
      title: "Get Shortlisted",
      description: "25+ college clubs host selection rounds.",
    },
    {
      step: "03",
      title: "Showcase Live",
      description: "Top 60 teams perform at the grand stage event.",
    },
    {
      step: "04",
      title: "Get Voted & Discovered",
      description: "Live audience and online viewers decide the winners.",
    },
  ];

  const rewards = [
    {
      icon: <Trophy className="w-10 h-10 text-glow-start" />,
      title: "Launch to Investors",
      description: "Present your project in front of angel investors and VCs.",
    },
    {
      icon: <Briefcase className="w-10 h-10 text-glow-start" />,
      title: "Get Scouted",
      description: "Get scouted by top HR agencies and talent managers.",
    },
     {
      icon: <Zap className="w-10 h-10 text-glow-start" />,
      title: "Your Own Episode",
      description: "Your performance will be professionally recorded and streamed online.",
    },
    {
      icon: <Users className="w-10 h-10 text-glow-start" />,
      title: "Network with Leaders",
      description: "Connect with industry pioneers and build your professional network.",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative text-center py-24 md:py-32 px-4 spotlight-effect">
           <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
           <div className="container mx-auto relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-widest uppercase text-primary mb-4 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                BEHIND THE BUILD <span className='font-light text-muted-foreground'>by GWD</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-black mb-4 leading-tight tracking-tighter animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Where Innovators Take the Stage.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-glow-start to-glow-end">
                Where Talent Meets Spotlight.
              </span>
            </h2>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              Behind the Build by GWD Global Pvt. Ltd. celebrates India's boldest creators, coders, and student innovators — live on stage and across the nation.
            </p>
            <div className="flex justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              <Button asChild size="lg" className="glow-border bg-primary/10 hover:bg-primary/20 text-white">
                <Link href="/register">Register to Showcase</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-secondary/50" disabled>
                <Link href="/live-voting">Watch Live Voting</Link>
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent text-center">
             <p className="text-sm text-primary animate-pulse">Applications closing soon — Be part of India’s most anticipated innovation showcase!</p>
          </div>
        </section>

        {/* The Story Section */}
        <section id="about" className="py-20 px-4 border-t border-b border-border">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-4xl font-bold mb-4">A Stage Built for Builders.</h2>
              <p className="text-lg text-muted-foreground">
                What if students, freelancers, and creators had their own India’s Got Talent? Behind the Build turns that dream into reality — a nationwide hunt for the most creative minds in tech and production.
              </p>
            </div>
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <Image
                src="https://picsum.photos/seed/stage/800/600"
                alt="Innovators presenting on stage"
                layout="fill"
                objectFit="cover"
                data-ai-hint="stage event"
                className="opacity-70"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <div key={step.title} className="flex flex-col items-center text-center p-4 animate-fadeInUp" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <div className="w-16 h-16 mb-4 rounded-full border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary bg-primary/10">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Collaboration Section */}
        <section id="partner" className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">25+ Colleges. 1000+ Participants. <br/> One Grand Stage.</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-12">
               GWD Global collaborates with top college clubs and creative communities to organize shortlisting events under our operational team’s guidance. College clubs receive mentorship, visibility, and opportunities to volunteer in the final event.
            </p>
             <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="font-bold text-lg text-muted-foreground">College Logo</div>
                ))}
            </div>
          </div>
        </section>

        {/* Rewards Section */}
        <section id="rewards" className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto text-center">
            <div className="mb-12">
              <p className="text-lg text-primary font-bold">REWARDS & RECOGNITION</p>
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-glow-start to-glow-end">
                ₹3–5 Lakhs Prize Pool
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rewards.map((reward, index) => (
                <Card key={reward.title} className="bg-card/50 backdrop-blur-sm p-6 text-center animate-fadeInUp" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <div className="flex justify-center mb-4">{reward.icon}</div>
                  <CardTitle className="text-xl">{reward.title}</CardTitle>
                  <CardContent className="p-0 mt-2">
                    <p className="text-muted-foreground">{reward.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 px-4 text-center">
          <div className="container mx-auto">
            <h2 className="text-5xl font-black mb-8">Are You Ready to Be Seen?</h2>
            <div className="flex justify-center gap-4">
               <Button asChild size="lg" className="glow-border bg-primary/10 hover:bg-primary/20 text-white">
                <Link href="/register">Join the Event</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-secondary/50">
                <Link href="mailto:rahman@gwdglobal.in">Partner With Us</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/20 bg-secondary/20">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 GWD Global Pvt. Ltd. All rights reserved.</p>
          <p className="text-sm mt-2">Powered by GWD Global Pvt. Ltd. — Building India’s Creator Ecosystem.</p>
          <p className="text-sm mt-4">Contact: <a href="mailto:rahman@gwdglobal.in" className="hover:text-primary">rahman@gwdglobal.in</a></p>
        </div>
      </footer>
    </div>
  );
}
