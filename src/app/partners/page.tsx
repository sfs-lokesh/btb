
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Building, Handshake, Mail, User, Phone, ArrowRight, Loader2, Building2 } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  /* Form Logic */
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast({
          title: "Request Sent",
          description: "Thank you for your interest. We will contact you shortly.",
        });
        reset();
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-background text-foreground">
      <section className="relative py-20 md:py-32 px-4 spotlight-effect overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="container mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Text */}
          <div className="text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter animate-fadeInUp">
              Partners & Sponsors
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Behind the Build is powered by visionary companies and communities dedicated to fostering innovation in India.
              <br className="hidden md:block" />
              Join us in celebrating the next generation of builders.
            </p>
            <div className="animate-fadeInUp pt-4" style={{ animationDelay: '0.4s' }}>
              <p className="font-semibold text-primary mb-2">Why join us?</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> Brand visibility to 5000+ specialized tech talent</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> Network with top colleges and industry leaders</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> Direct access to future innovators</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="animate-fadeInUp w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto" style={{ animationDelay: '0.3s' }}>
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Become a Partner
                </CardTitle>
                <CardDescription>
                  Fill in your details and our team will get back to you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Organization Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessName"
                        placeholder="Company / Community Name"
                        className="pl-9"
                        {...register('businessName', { required: 'Organization Name is required' })}
                      />
                    </div>
                    {errors.businessName && <p className="text-xs text-red-500">{errors.businessName.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Contact Person</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Your Name"
                        className="pl-9"
                        {...register('name', { required: 'Name is required' })}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Email"
                          className="pl-9"
                          {...register('email', {
                            required: 'Required',
                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                          })}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="Phone"
                          className="pl-9"
                          {...register('phone', {
                            required: 'Required',
                            pattern: { value: /^[0-9]{10}$/, message: "10 digits" }
                          })}
                          maxLength={10}
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone.message as string}</p>}
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full font-semibold shadow-lg transition-all duration-300">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Send Request <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
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
