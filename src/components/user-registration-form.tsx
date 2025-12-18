
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const domains = [
  "Web/App Development",
  "3D Animation",
  "VFX",
  "Video Editing",
  "UI/UX Design",
  "Startup Pitch",
  "Other"
];

const colleges = [
    "VJIT (Hyderabad)",
    "CBIT (Hyderabad)",
    "Vasavi College of Engineering (Hyderabad)",
    "St. Martin's Engineering College (Hyderabad)",
    "CMR (Hyderabad)",
    "BVRIT (Hyderabad)",
    "Independent / Freelancer",
    "Other",
]

export function UserRegistrationForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('VJIT (Hyderabad)');
  const [domain, setDomain] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  const [role, setRole] = useState('Participant');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
        setError('You must agree to the event guidelines & terms.');
        return;
    }

    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name, 
            email, 
            password, 
            role, 
            phone,
            college,
            domain,
            teamName,
            teamMembers,
            projectDescription
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: "Registration Submitted!",
        description: "Your registration is complete. Please proceed to login.",
      });

      router.push('/login');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-3xl">Join Behind the Build – Showcase Your Innovation on the Grand Stage</CardTitle>
          <CardDescription className="text-lg">Empowering 1000+ creators through campus partnerships.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Your primary email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input id="phone" placeholder="Your mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="college">Select Your Shortlisting Venue / College</Label>
                 <Select onValueChange={setCollege} defaultValue={college} required disabled={isLoading}>
                    <SelectTrigger id="college">
                        <SelectValue placeholder="Select your venue" />
                    </SelectTrigger>
                    <SelectContent>
                        {colleges.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="domain">Domain / Category</Label>
                 <Select onValueChange={setDomain} value={domain} required disabled={isLoading}>
                    <SelectTrigger id="domain">
                        <SelectValue placeholder="Select your domain" />
                    </SelectTrigger>
                    <SelectContent>
                        {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
               <div className="md:col-span-2 flex flex-col space-y-1.5">
                <Label htmlFor="teamName">Team Name / Project Title</Label>
                <Input id="teamName" placeholder="Your team or project name" value={teamName} onChange={(e) => setTeamName(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="md:col-span-2 flex flex-col space-y-1.5">
                <Label htmlFor="teamMembers">Team Members (Optional)</Label>
                <Textarea id="teamMembers" placeholder="List team members, one per line" value={teamMembers} onChange={(e) => setTeamMembers(e.target.value)} disabled={isLoading} />
              </div>
              <div className="md:col-span-2 flex flex-col space-y-1.5">
                <Label htmlFor="projectDescription">Short Project Description</Label>
                <Textarea id="projectDescription" placeholder="Briefly describe your project or idea" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="md:col-span-2 flex items-center space-x-2">
                <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} disabled={isLoading} />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the event guidelines & terms.
                </label>
              </div>
              {error && <p className="md:col-span-2 text-sm text-destructive text-center">{error}</p>}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full text-lg py-6" onClick={handleSubmit} disabled={isLoading || !agreed}>
             {isLoading ? 'Registering...' : 'Register & Proceed to Payment ₹999'}
          </Button>
           <p className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
