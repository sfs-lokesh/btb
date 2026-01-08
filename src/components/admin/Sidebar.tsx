'use client';

import {
    LayoutDashboard,
    GraduationCap,
    Ticket,
    Store,
    Settings,
    LogOut,
    QrCode,
    Vote,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

export function AdminSidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'colleges', label: 'Colleges', icon: GraduationCap },
        { id: 'coupons', label: 'Coupons', icon: Ticket },
        { id: 'stalls', label: 'Stall Bookings', icon: Store },
        { id: 'registrations', label: 'Registrations', icon: GraduationCap },
        { id: 'voting', label: 'Live Voting', icon: Vote },
        { id: 'sponsors', label: 'Sponsors', icon: Users },
        { id: 'managers', label: 'Managers', icon: Users },
        { id: 'qr-logs', label: 'QR Scan Logs', icon: QrCode },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col p-4 shadow-sm">
            <div className="mb-8 px-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Admin Panel
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            activeTab === item.id
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="pt-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={onLogout}
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
