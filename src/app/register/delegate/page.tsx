'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

export default function DelegateRegister() {
    const { register, handleSubmit } = useForm();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, role: 'Delegate' }),
            });

            if (res.ok) {
                router.push('/login?registered=true');
            } else {
                const error = await res.json();
                alert(error.message);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-card border border-border rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-foreground">Delegate Registration</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground">Name</label>
                    <input {...register('name', { required: true })} className="w-full bg-secondary border-input text-foreground p-2 rounded border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground">Email</label>
                    <input {...register('email', { required: true })} className="w-full bg-secondary border-input text-foreground p-2 rounded border" type="email" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground">Password</label>
                    <input {...register('password', { required: true })} className="w-full bg-secondary border-input text-foreground p-2 rounded border" type="password" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground">Company Name</label>
                    <input {...register('companyName')} className="w-full bg-secondary border-input text-foreground p-2 rounded border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground">Designation</label>
                    <input {...register('designation')} className="w-full bg-secondary border-input text-foreground p-2 rounded border" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90">
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}
