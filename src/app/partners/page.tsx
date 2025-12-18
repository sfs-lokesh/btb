
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building, Handshake, Mail } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';

export default function PartnersPage() {
  const partners = [
    { name: "Innovate Hub", logo: "/logo-placeholder.svg", tier: "Platinum" },
    { name: "Tech Solutions Inc.", logo: "/logo-placeholder.svg", tier: "Gold" },
    { name: "Creative Minds", logo: "/logo-placeholder.svg", tier: "Silver" },
    { name: "NextGen Coders", logo: "/logo-placeholder.svg", tier: "Community" },
    { name: "Design Forward", logo: "/logo-placeholder.svg", tier: "Community" },
    { name: "Startup Sphere", logo: "/logo-placeholder.svg", tier: "Community" },
  ];

  const benefits = [
    {
      icon: <Building className="w-10 h-10 text-primary" />,
      title: "Brand Exposure",
      description: "Showcase your brand to thousands of innovators, students, and tech enthusiasts across India.",
    },
    {
      icon: <Handshake className="w-10 h-10 text-primary" />,
      title: "Access to Talent",
      description: "Connect with the brightest minds and top-tier talent in development, design, and product innovation.",
    },
    {
      icon: <Briefcase className="w-10 h-10 text-primary" />,
      title: "Community Engagement",
      description: "Position your organization as a key supporter of the creator and freelancer ecosystem.",
    },
  ];


  return (
    <main className="flex-1 bg-background text-foreground">
        <section className="relative text-center py-24 md:py-32 px-4 spotlight-effect">
           <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
           <div className="container mx-auto relative z-10">
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tighter animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Partners & Sponsors
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              Behind the Build is powered by visionary companies and communities dedicated to fostering innovation in India. Join us in celebrating the next generation of builders.
            </p>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                <Button asChild size="lg" className="glow-border bg-primary/10 hover:bg-primary/20 text-white">
                    <Link href="mailto:rahman@gwdglobal.in">
                        <Mail className="mr-2" /> Become a Partner
                    </Link>
                </Button>
            </div>
          </div>
        </section>

        <section id="our-partners" className="py-20 px-4">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-12">Our Esteemed Partners</h2>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
                    {partners.map((partner, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 animate-fadeInUp" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                            <div className="w-32 h-16 relative grayscale hover:grayscale-0 transition-all duration-300">
                                <Image src="https://picsum.photos/seed/logo${index}/200/100" alt={`${partner.name} Logo`} layout="fill" objectFit="contain" data-ai-hint="logo" />
                            </div>
                            <p className="text-sm font-semibold text-muted-foreground">{partner.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="why-partner" className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Why Partner With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={benefit.title} className="bg-card/50 backdrop-blur-sm p-6 text-center animate-fadeInUp" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <div className="flex justify-center mb-4">{benefit.icon}</div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  <CardContent className="p-0 mt-2">
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-4 text-center">
          <div className="container mx-auto">
            <h2 className="text-4xl font-black mb-6">Ready to Shape the Future?</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                Let's collaborate to build a thriving ecosystem for India's creators and innovators. Get in touch to explore partnership opportunities.
            </p>
            <Button asChild size="lg" className="glow-border bg-primary/10 hover:bg-primary/20 text-white">
                <Link href="mailto:rahman@gwdglobal.in">
                    <Mail className="mr-2" /> Contact Our Team
                </Link>
            </Button>
          </div>
        </section>
        
         <footer className="py-8 px-4 border-t border-border/20 bg-secondary/20">
            <div className="container mx-auto text-center text-muted-foreground">
            <p>© 2025 GWD Global Pvt. Ltd. All rights reserved.</p>
            <p className="text-sm mt-2">Powered by GWD Global Pvt. Ltd. — Building India’s Creator Ecosystem.</p>
            <p className="text-sm mt-4">Contact: <a href="mailto:rahman@gwdglobal.in" className="hover:text-primary">rahman@gwdglobal.in</a></p>
            </div>
        </footer>
    </main>
  );
}
