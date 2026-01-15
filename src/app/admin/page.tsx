'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Download, Edit, Eye, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { safeLocalStorage } from '@/lib/utils';

type InfluencerCoupon = {
  _id: string;
  code: string;
  discountAmount: number;
  usageLimit: number | null;
  usedCount: number;
  expiryDate: Date | null;
  isActive: boolean;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [colleges, setColleges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<InfluencerCoupon[]>([]);
  const [stalls, setStalls] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [contestants, setContestants] = useState<any[]>([]);
  const [sponsorRequests, setSponsorRequests] = useState<any[]>([]);
  const [qrSearch, setQrSearch] = useState('');
  const [qrFilter, setQrFilter] = useState('All'); // All, Scanned, Unscanned
  const [loading, setLoading] = useState(true);

  // Form States
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [isContestantModalOpen, setIsContestantModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isStallEditModalOpen, setIsStallEditModalOpen] = useState(false);

  const [couponType, setCouponType] = useState<'influencer' | 'college'>('influencer');
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountAmount: 200,
    usageLimit: null as number | null,
    expiryDate: ''
  });
  const [newContestant, setNewContestant] = useState({
    name: '',
    teamName: '',
    projectTitle: '',
    projectDescription: '',
    category: 'Web Development',
    projectLinks: '',
    image: ''
  });
  const [newManager, setNewManager] = useState({ name: '', email: '', password: '', phone: '' });
  const [newCollege, setNewCollege] = useState({
    name: '',
    couponCode: '',
    discountAmount: 200
  });

  // Edit States
  const [editingStall, setEditingStall] = useState<any>(null);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingContestant, setEditingContestant] = useState<any>(null);

  const [contestantImageFile, setContestantImageFile] = useState<File | null>(null);

  // Modal States
  const [isEditCollegeOpen, setIsEditCollegeOpen] = useState(false);
  const [isEditCouponOpen, setIsEditCouponOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [isVoteViewModalOpen, setIsVoteViewModalOpen] = useState(false);
  const [viewingVotes, setViewingVotes] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (['Admin', 'SuperAdmin'].indexOf(data.user.role) === -1) {
            router.push('/login');
          } else {
            fetchData();
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed', error);
        router.push('/login');
      }
    };
    checkAuth();
  }, []);

  const getAuthHeaders = () => {
    const token = safeLocalStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const ts = new Date().getTime();
      const [collegesRes, usersRes, couponsRes, stallsRes, ticketsRes, contestantsRes, sponsorsRes] = await Promise.all([
        fetch(`/api/admin/college?t=${ts}`, { headers, cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/admin/reports?type=master&t=${ts}`, { headers, cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/admin/coupon?t=${ts}`, { headers, cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/stall/book?t=${ts}`, { headers, cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/admin/tickets?t=${ts}`, { headers, cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/admin/contestants?t=${ts}`, { headers, cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/contact/sponsor?t=${ts}`, { headers, cache: 'no-store', next: { revalidate: 0 } })
      ]);

      if (collegesRes.ok) setColleges(await collegesRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (couponsRes.ok) {
        const data = await couponsRes.json();
        setCoupons(data.data || []);
      }
      if (stallsRes.ok) setStalls(await stallsRes.json());
      if (ticketsRes.ok) setTickets(await ticketsRes.json());
      if (contestantsRes.ok) setContestants(await contestantsRes.json());
      if (sponsorsRes.ok) setSponsorRequests(await sponsorsRes.json());

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    safeLocalStorage.removeItem('token');
    router.push('/login');
  };

  // --- Actions ---
  const downloadReport = async (type: string, format: 'csv' | 'excel') => {
    try {
      const res = await fetch(`/api/admin/reports?type=${type}&format=${format}`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Download failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert('Failed to download report: ' + e.message);
    }
  };

  const createCoupon = async () => {
    try {
      console.log('Creating coupon:', { type: couponType, data: newCoupon });
      console.log('Auth headers:', getAuthHeaders());

      if (couponType === 'college') {
        // Create college coupon
        const payload = {
          name: newCoupon.code,
          couponCode: newCoupon.code,
          discountAmount: newCoupon.discountAmount
        };
        console.log('College coupon payload:', payload);

        const res = await fetch('/api/admin/college', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('College coupon response:', { status: res.status, data });

        if (res.ok) {
          setIsCouponModalOpen(false);
          setNewCoupon({ code: '', discountAmount: 200, usageLimit: null, expiryDate: '' });
          fetchData();
          alert('College Coupon created successfully!');
        } else {
          console.error('College coupon creation failed:', data);
          alert(`Error: ${data.error || 'Failed to create college coupon'}`);
        }
      } else {
        // Create influencer coupon
        console.log('Influencer coupon payload:', newCoupon);

        const res = await fetch('/api/admin/coupon', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newCoupon)
        });

        const data = await res.json();
        console.log('Influencer coupon response:', { status: res.status, data });

        if (res.ok) {
          setIsCouponModalOpen(false);
          setNewCoupon({ code: '', discountAmount: 200, usageLimit: null, expiryDate: '' });
          fetchData();
          alert('Influencer Coupon created successfully!');
        } else {
          console.error('Influencer coupon creation failed:', data);
          alert(`Error: ${data.error || data.success === false ? data.error : 'Failed to create influencer coupon'}`);
        }
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Network error: Failed to create coupon');
    }
  };

  const toggleCoupon = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/coupon', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, isActive: !isActive })
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const createCollege = async () => {
    try {
      // Auto-generate code and default discount since they are removed from UI
      const generatedCode = newCollege.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6) + '2025';
      const payload = {
        name: newCollege.name,
        couponCode: generatedCode,
        discountAmount: 200 // Default discount
      };

      console.log('Creating college with data:', payload);
      console.log('Auth headers:', getAuthHeaders());

      const res = await fetch('/api/admin/college', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log('College creation response:', { status: res.status, data });

      if (res.ok) {
        setIsCollegeModalOpen(false);
        setNewCollege({ name: '', couponCode: '', discountAmount: 200 });
        fetchData();
        alert('College created successfully!');
      } else {
        console.error('College creation failed:', data);
        alert(`Error: ${data.error || 'Failed to create college'}`);
      }
    } catch (error) {
      console.error('Error creating college:', error);
      alert('Network error: Failed to create college');
    }
  };

  const handleStallEdit = (stall: any) => {
    setEditingStall({
      _id: stall._id,
      name: stall.name,
      category: stall.category,
      price: stall.price,
      status: stall.status,
      bookingDetails: stall.bookingDetails || {
        firstName: '',
        lastName: '',
        contact: '',
        email: ''
      }
    });
    setIsStallEditModalOpen(true);
  };

  const updateStall = async () => {
    try {
      const isNew = editingStall._id === 'new';
      const url = isNew ? '/api/stall/create' : '/api/stall/update';
      const method = isNew ? 'POST' : 'PATCH';

      const payload = isNew ? {
        name: editingStall.name,
        category: editingStall.category,
        price: editingStall.price,
        location: 'TBD' // Add location default if required
      } : {
        stallId: editingStall._id,
        updates: {
          name: editingStall.name,
          category: editingStall.category,
          price: editingStall.price,
          status: editingStall.status,
          bookingDetails: editingStall.bookingDetails
        }
      };

      const res = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsStallEditModalOpen(false);
        setEditingStall(null);
        fetchData();
        alert(`Stall ${isNew ? 'created' : 'updated'} successfully!`);
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || error.error}`);
      }
    } catch (error) {
      console.error('Error updating stall:', error);
    }
  };

  const handleApproveReject = async (stallId: string, action: 'approve' | 'reject') => {
    try {
      console.log(`${action}ing stall:`, stallId);
      const res = await fetch('/api/stall/approve', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stallId, action })
      });

      if (res.ok) {
        fetchData();
        alert(`Booking ${action}d successfully!`);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`Failed to ${action} booking`);
    }
  };

  const { toast } = useToast();

  const handleViewVotes = (votes: any[]) => {
    setViewingVotes(votes || []);
    setIsVoteViewModalOpen(true);
  };

  const createContestant = async () => {
    try {
      const payload: any = editingContestant ? { ...newContestant, ...editingContestant } : { ...newContestant };
      const url = '/api/admin/contestants';
      const method = editingContestant ? 'PUT' : 'POST';

      let body;
      const headers: any = { 'Authorization': getAuthHeaders().Authorization };

      if (contestantImageFile) {
        const formData = new FormData();
        formData.append('image', contestantImageFile);
        Object.keys(payload).forEach(key => {
          // We might want to remove existing 'image' string if we are uploading a new one,
          // or keep it if it's external URL and user wants to use that instead (handled by UI logic preferably).
          // Here, if file is present, we send it.
          if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
          }
        });
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(payload);
      }

      const res = await fetch(url, {
        method,
        headers: headers,
        body: body
      });

      if (res.ok) {
        fetchData();
        setIsContestantModalOpen(false);
        setEditingContestant(null);
        setContestantImageFile(null);
        setNewContestant({
          name: '', teamName: '', projectTitle: '', projectDescription: '', category: 'Web Development', projectLinks: '', image: ''
        });
        toast({ title: editingContestant ? "Contestant Updated" : "Contestant Added" });
      } else {
        const err = await res.json();
        toast({ title: "Failed", description: err.error, variant: "destructive" });
      }
    } catch (e) { console.error(e); }
  };

  const toggleContestantStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/contestants', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ _id: id, isActive: !currentStatus })
      });
      if (res.ok) {
        fetchData();
        toast({ title: "Status Updated" });
      }
    } catch (e) { console.error(e); }
  };

  const deleteContestant = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/contestants?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchData();
        toast({ title: "Contestant Deleted" });
      }
    } catch (e) { console.error(e); }
  };

  const createManager = async () => {
    try {
      const res = await fetch('/api/register', { // Use register route but with Manager role? Or specialized route? 
        // Register route defaults to Participant. 
        // I should create a specific route for admin to create user or use '/api/admin/users'. 
        // I don't have '/api/admin/users' create logic.
        // I will use '/api/register' and assume I can pass 'role'.
        // Wait, register route forces 'Participant'.
        // I'll create a quick Client-side fetch to a NEW '/api/admin/managers' or just use '/api/auth/signup' if it exists?
        // The user said "add manager section... when admin create manager".
        // I'll add a simple create logic here calling /api/register but I need to modify /api/register to accept Role if Admin?
        // Or better: Create `api/admin/managers/route.ts`.
        // I'll Assume I'll create that route next.
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...newManager, role: 'Manager' })
      });
      const data = await res.json();
      if (res.ok) {
        fetchData();
        setIsManagerModalOpen(false);
        setNewManager({ name: '', email: '', password: '', phone: '' });
        toast({ title: "Manager Created" });
      } else {
        toast({ title: "Error", description: data.error || data.message, variant: "destructive" });
      }
    } catch (e) { console.error(e); }
  };

  const deleteManager = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    deleteUser(id); // Reuse deleteUser
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  // --- Views ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Colleges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{colleges.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.filter(c => c.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Booked Stalls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stalls.filter(s => s.status === 'Booked').length} / {stalls.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h3 className="font-semibold">Master Database</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => downloadReport('master', 'csv')}><Download className="w-4 h-4 mr-2" /> CSV</Button>
                <Button size="sm" variant="outline" onClick={() => downloadReport('master', 'excel')}><Download className="w-4 h-4 mr-2" /> Excel</Button>
                <Button size="sm" variant="secondary" onClick={() => downloadReport('coupons', 'csv')}><Download className="w-4 h-4 mr-2" /> Coupons</Button>
                <Button size="sm" variant="secondary" onClick={() => downloadReport('qr', 'csv')}><Download className="w-4 h-4 mr-2" /> QR Logs</Button>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h3 className="font-semibold">College Summary</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => downloadReport('college', 'csv')}><Download className="w-4 h-4 mr-2" /> CSV</Button>
                <Button size="sm" variant="outline" onClick={() => downloadReport('college', 'excel')}><Download className="w-4 h-4 mr-2" /> Excel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const handleEditCollege = (college: any) => {
    setEditingCollege({ ...college });
    setIsEditCollegeOpen(true);
  };

  const updateCollege = async () => {
    try {
      const res = await fetch('/api/admin/college', {
        method: 'PUT', // Assuming PUT for update, or I'll check/add it
        headers: getAuthHeaders(),
        body: JSON.stringify(editingCollege)
      });

      if (res.ok) {
        setIsEditCollegeOpen(false);
        setEditingCollege(null);
        fetchData();
        alert('College updated successfully!');
      } else {
        alert('Failed to update college');
      }
    } catch (error) {
      console.error('Error updating college:', error);
    }
  };

  const toggleCollege = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/college', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ _id: id, isActive: !isActive })
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling college:', error);
    }
  };

  const renderColleges = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Colleges</h2>
        <Button onClick={() => setIsCollegeModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add College
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colleges.map((college, idx) => (
                <TableRow key={college._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell className="font-medium">{college.name}</TableCell>
                  <TableCell>{college.registrations || 0}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${college.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {college.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleCollege(college._id, college.isActive !== false)}>
                        {college.isActive !== false ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditCollege(college)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {colleges.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8">No colleges found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const handleEditCoupon = (coupon: any) => {
    setEditingCoupon({ ...coupon });
    setIsEditCouponOpen(true);
  };

  const updateCoupon = async () => {
    try {
      const res = await fetch('/api/admin/coupon', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingCoupon)
      });

      if (res.ok) {
        setIsEditCouponOpen(false);
        setEditingCoupon(null);
        fetchData();
        alert('Coupon updated successfully!');
      } else {
        alert('Failed to update coupon');
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  };

  const renderCoupons = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Coupons</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={() => {
              setCouponType('influencer');
              setIsCouponModalOpen(true);
            }}
            variant="default"
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Influencer Coupon
          </Button>
          <Button
            onClick={() => {
              setCouponType('college');
              setIsCouponModalOpen(true);
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> College Coupon
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Influencer Coupons</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon._id}>
                      <TableCell className="font-mono">{coupon.code}</TableCell>
                      <TableCell>₹{coupon.discountAmount}</TableCell>
                      <TableCell>{coupon.usedCount} / {coupon.usageLimit || '∞'}</TableCell>
                      <TableCell>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleCoupon(coupon._id, coupon.isActive)}>
                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditCoupon(coupon)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {coupons.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8">No influencer coupons found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>College Coupons</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>College Name</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colleges.map((college) => (
                    <TableRow key={college._id}>
                      <TableCell className="font-mono">{college.code}</TableCell>
                      <TableCell>{college.name}</TableCell>
                      <TableCell>₹{college.discountAmount}</TableCell>
                      <TableCell>{college.registrations || 0} / {college.usageLimit || '∞'}</TableCell>
                      <TableCell>{college.expiryDate ? new Date(college.expiryDate).toLocaleDateString() : 'Never'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${college.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {college.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleCollege(college._id, college.isActive !== false)}>
                            {college.isActive !== false ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditCollege(college)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {colleges.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8">No college coupons found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStalls = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Stall Bookings</h2>
        <Button onClick={() => {
          setEditingStall({ _id: 'new', name: '', category: 'Standard', price: 10000, status: 'Available', bookingDetails: {} });
          setIsStallEditModalOpen(true);
        }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Stall
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stall Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Request Status</TableHead>
                <TableHead>Booked By</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stalls.map((stall) => (
                <TableRow key={stall._id}>
                  <TableCell className="font-bold">{stall.name}</TableCell>
                  <TableCell>{stall.category}</TableCell>
                  <TableCell>₹{stall.price}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${stall.status === 'Available' ? 'bg-green-100 text-green-700' :
                      stall.status === 'Booked' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {stall.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${stall.requestStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      stall.requestStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {stall.requestStatus || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {stall.bookingDetails?.firstName ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{stall.bookingDetails.firstName} {stall.bookingDetails.lastName}</span>
                        <span className="text-xs text-muted-foreground">{stall.bookingDetails.email}</span>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{stall.bookingDetails?.contact || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {stall.requestStatus === 'Pending' && (
                        <>
                          <Button variant="default" size="sm" onClick={() => handleApproveReject(stall._id, 'approve')}>
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleApproveReject(stall._id, 'reject')}>
                            Reject
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleStallEdit(stall)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {stalls.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8">No stalls found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const handleEditUser = (user: any) => {
    setEditingUser({ ...user });
    setIsEditUserOpen(true);
  };

  const handleViewUser = (user: any) => {
    setViewingUser(user);
    setIsViewUserOpen(true);
  };

  const updateUser = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingUser)
      });

      if (res.ok) {
        setIsEditUserOpen(false);
        setEditingUser(null);
        fetchData();
        alert('User updated successfully!');
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        fetchData();
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const renderRegistrations = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Registrations</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, idx) => (
                <TableRow key={user._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{user.category || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 w-fit">
                        {user.teamType === 'Solo' || !user.teamMembers?.length ? 'Solo' : user.teamType}
                      </span>
                      {user.teamMembers && user.teamMembers.length > 0 && user.teamType !== 'Solo' && (
                        <div className="text-xs text-muted-foreground">
                          {user.teamMembers.length} members
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                      user.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {user.paymentStatus || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>{user.collegeName || user.collegeId?.name || user.college || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)} title="View Credentials">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="Edit User">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteUser(user._id)} title="Delete User">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8">No registrations found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>Payment Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Stripe/Razorpay credentials are configured in the <code className="bg-yellow-100 px-1 rounded">.env.local</code> file.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Current Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Provider</Label>
                <Input value="Razorpay" disabled />
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Input value="Test Mode" disabled />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Email Configuration</h3>
            <div className="space-y-2">
              <Label>SMTP Server</Label>
              <Input placeholder="smtp.gmail.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input placeholder="587" />
              </div>
              <div className="space-y-2">
                <Label>Email Username</Label>
                <Input type="email" placeholder="your-email@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Password</Label>
              <Input type="password" placeholder="Enter your email password or app password" />
            </div>
            <Button className="w-full">Save Configuration</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContestants = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Live Voting Contestants</h2>
        <Button onClick={() => { setEditingContestant(null); setIsContestantModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Contestant</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contestants.map((c: any) => (
                <TableRow key={c._id}>
                  <TableCell><img src={c.image || 'https://via.placeholder.com/40'} alt="avatar" className="w-10 h-10 rounded-full object-cover" /></TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.teamName}</TableCell>
                  <TableCell>{c.category}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={c.projectTitle}>{c.projectTitle}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={c.projectTitle}>{c.projectTitle}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{c.votes?.length || 0}</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleViewVotes(c.votes)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => toggleContestantStatus(c._id, c.isActive)}>
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingContestant(c); setIsContestantModalOpen(true); }}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteContestant(c._id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {contestants.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8">No contestants found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderManagers = () => {
    const managers = users.filter(u => u.role === 'Manager');
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Managers</h2>
          <Button onClick={() => setIsManagerModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Manager</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map(m => (
                  <TableRow key={m._id}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.phone || '-'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => deleteManager(m._id)}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {managers.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-4">No managers found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const toggleTicketStatus = async (ticketId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Valid' ? 'Used' : 'Valid';
      if (!confirm(`Mark this ticket as ${newStatus}?`)) return;

      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ticketId, status: newStatus })
      });

      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to update ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const renderQRLogs = () => {
    const filtered = tickets.filter(t => {
      const matchesSearch =
        (t.userId?.name || '').toLowerCase().includes(qrSearch.toLowerCase()) ||
        (t.qrCodeData || '').toLowerCase().includes(qrSearch.toLowerCase()) ||
        (t._id || '').toLowerCase().includes(qrSearch.toLowerCase());

      const matchesFilter =
        qrFilter === 'All' ? true :
          qrFilter === 'Scanned' ? t.status === 'Used' :
            t.status === 'Valid'; // Unscanned

      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">QR Scan Logs</h2>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Search by ID, Name or QR Data..."
            value={qrSearch}
            onChange={(e) => setQrSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Button variant={qrFilter === 'All' ? 'default' : 'outline'} onClick={() => setQrFilter('All')}>All</Button>
            <Button variant={qrFilter === 'Scanned' ? 'default' : 'outline'} onClick={() => setQrFilter('Scanned')}>Scanned (Used)</Button>
            <Button variant={qrFilter === 'Unscanned' ? 'default' : 'outline'} onClick={() => setQrFilter('Unscanned')}>Not Scanned</Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scanned By</TableHead>
                  <TableHead>QR Data (ID)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {ticket.scannedAt && <span className="text-xs text-muted-foreground">Scanned: {new Date(ticket.scannedAt).toLocaleTimeString()}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {ticket.userId?.name || 'Unknown'}
                      <div className="text-xs text-muted-foreground">{ticket.userId?.email}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${ticket.status === 'Valid' ? 'bg-green-100 text-green-700' :
                        ticket.status === 'Used' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {ticket.status === 'Valid' ? 'Not Scanned' : ticket.status}
                      </span>
                    </TableCell>
                    <TableCell>{ticket.scannedBy?.name || '-'}</TableCell>
                    <TableCell className="font-mono text-xs">{ticket.qrCodeData}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => toggleTicketStatus(ticket._id, ticket.status)}>
                        {ticket.status === 'Valid' ? 'Mark Used' : 'Mark Valid'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8">No tickets found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSponsorRequests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sponsor Requests</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>

              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsorRequests.map((req: any) => (
                <TableRow key={req._id}>
                  <TableCell>
                    {req.logo ? (
                      <img src={req.logo} alt="logo" className="w-10 h-10 object-contain border rounded bg-white" />
                    ) : (
                      <div className="w-10 h-10 border rounded bg-gray-50 flex items-center justify-center text-[10px] text-gray-400">No Logo</div>
                    )}
                  </TableCell>
                  <TableCell className="font-bold">{req.businessName}</TableCell>
                  <TableCell>{req.name}</TableCell>

                  <TableCell>{req.email}</TableCell>
                  <TableCell>{req.phone}</TableCell>
                  <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                      {req.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {sponsorRequests.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8">No sponsor requests found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <header className="mb-8 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">Welcome back, Admin</div>
          <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Refresh Data
          </Button>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'colleges' && renderColleges()}
        {activeTab === 'coupons' && renderCoupons()}
        {activeTab === 'stalls' && renderStalls()}
        {activeTab === 'registrations' && renderRegistrations()}
        {activeTab === 'qr-logs' && renderQRLogs()}
        {activeTab === 'voting' && renderContestants()}
        {activeTab === 'sponsors' && renderSponsorRequests()}
        {activeTab === 'managers' && renderManagers()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* --- MOUNTED DIALOGS --- */}

      {/* Add College Modal */}
      <Dialog open={isCollegeModalOpen} onOpenChange={setIsCollegeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New College</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>College Name</Label>
              <Input value={newCollege.name} onChange={e => setNewCollege({ ...newCollege, name: e.target.value })} placeholder="e.g. IIT Delhi" />
            </div>
            {/* Coupon Code and Discount are auto-generated/defaulted */}
            <Button className="w-full" onClick={createCollege}>Create College</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit College Modal */}
      <Dialog open={isEditCollegeOpen} onOpenChange={setIsEditCollegeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit College Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>College Name</Label>
              <Input
                value={editingCollege?.name || ''}
                onChange={e => setEditingCollege({ ...editingCollege, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Coupon Code</Label>
              <Input
                value={editingCollege?.code || ''} // Uses 'code' from model
                onChange={e => setEditingCollege({ ...editingCollege, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Discount Amount (₹)</Label>
              <Input
                type="number"
                value={editingCollege?.discountAmount || 0}
                onChange={e => setEditingCollege({ ...editingCollege, discountAmount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input
                type="number"
                value={editingCollege?.usageLimit || ''}
                onChange={e => setEditingCollege({ ...editingCollege, usageLimit: e.target.value ? Number(e.target.value) : null })}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={editingCollege?.expiryDate ? new Date(editingCollege.expiryDate).toISOString().split('T')[0] : ''}
                onChange={e => setEditingCollege({ ...editingCollege, expiryDate: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={updateCollege}>Update College</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Coupon Modal */}
      <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create {couponType === 'influencer' ? 'Influencer' : 'College'} Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {couponType === 'college' ? (
              // College Coupon Form
              <>
                <div className="space-y-2">
                  <Label>Select College</Label>
                  <Select
                    onValueChange={(val) => {
                      const selected = colleges.find(c => c.code === val || c.name === val);
                      setNewCoupon({ ...newCoupon, code: selected?.code || val });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((c) => (
                        <SelectItem key={c._id} value={c.code || c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              // Influencer Coupon Form
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="INF2024" />
              </div>
            )}

            {/* Common Fields */}
            <div className="space-y-2">
              <Label>Discount (₹)</Label>
              <Input type="number" value={newCoupon.discountAmount} onChange={e => setNewCoupon({ ...newCoupon, discountAmount: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input type="number" placeholder="Unlimited" value={newCoupon.usageLimit || ''} onChange={e => setNewCoupon({ ...newCoupon, usageLimit: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={newCoupon.expiryDate} onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} />
            </div>

            <Button className="w-full" onClick={createCoupon}>Create {couponType === 'influencer' ? 'Influencer' : 'College'} Coupon</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Modal */}
      <Dialog open={isEditCouponOpen} onOpenChange={setIsEditCouponOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          {editingCoupon && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={editingCoupon.code}
                  onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount (₹)</Label>
                <Input
                  type="number"
                  value={editingCoupon.discountAmount}
                  onChange={e => setEditingCoupon({ ...editingCoupon, discountAmount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  value={editingCoupon.usageLimit || ''}
                  onChange={e => setEditingCoupon({ ...editingCoupon, usageLimit: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={editingCoupon.expiryDate ? new Date(editingCoupon.expiryDate).toISOString().split('T')[0] : ''}
                  onChange={e => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={updateCoupon}>Update Coupon</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editingUser?.name || ''}
                onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email (Read-only)</Label>
              <Input
                value={editingUser?.email || ''}
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={editingUser?.category || ''} onChange={e => setEditingUser({ ...editingUser, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Team Name</Label>
                <Input value={editingUser?.teamName || ''} onChange={e => setEditingUser({ ...editingUser, teamName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Team Type</Label>
                <Select
                  value={editingUser?.teamType || 'Solo'}
                  onValueChange={v => setEditingUser({ ...editingUser, teamType: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solo">Solo</SelectItem>
                    <SelectItem value="Team of 2">Team of 2</SelectItem>
                    <SelectItem value="Team of 3">Team of 3</SelectItem>
                    <SelectItem value="Team of 4">Team of 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Team Members (Comma separated)</Label>
              <Input
                value={Array.isArray(editingUser?.teamMembers) ? editingUser.teamMembers.join(', ') : (editingUser?.teamMembers || '')}
                onChange={e => setEditingUser({ ...editingUser, teamMembers: e.target.value.split(',').map((s: string) => s.trim()) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input value={editingUser?.projectTitle || ''} onChange={e => setEditingUser({ ...editingUser, projectTitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Project Links</Label>
              <Input value={editingUser?.projectLinks || ''} onChange={e => setEditingUser({ ...editingUser, projectLinks: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={editingUser?.projectDescription || ''} onChange={e => setEditingUser({ ...editingUser, projectDescription: e.target.value })} />
            </div>
            <Button className="w-full" onClick={updateUser}>Update User</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div><Label>Name</Label><div className="font-medium">{viewingUser.name}</div></div>
              <div><Label>Email</Label><div className="font-medium">{viewingUser.email}</div></div>
              <div><Label>Role</Label><div className="font-medium">{viewingUser.role}</div></div>
              <div><Label>Phone</Label><div className="font-medium">{viewingUser.phone || '-'}</div></div>
              <div><Label>College</Label><div className="font-medium">{viewingUser.college || '-'}</div></div>
              <div><Label>Registration Date</Label><div className="font-medium">{new Date(viewingUser.createdAt).toLocaleDateString()}</div></div>
              <div><Label>Coupon Used</Label><div className="font-medium">{viewingUser.couponUsed || 'None'}</div></div>
              <div className="col-span-2"><Label>Team Members</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {viewingUser.teamMembers?.map((m: any, i: number) => <span key={i} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">{m}</span>) || '-'}
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <div className="font-medium">{viewingUser.category || '-'}</div>
              </div>
              <div>
                <Label>Project Title</Label>
                <div className="font-medium">{viewingUser.projectTitle || '-'}</div>
              </div>
              <div className="col-span-2">
                <Label>Project Description</Label>
                <div className="text-sm mt-1">{viewingUser.projectDescription || '-'}</div>
              </div>
              <div>
                <Label>Payment Amount</Label>
                <div className="font-medium">₹{viewingUser.paymentAmount || (viewingUser.role === 'Participant' ? '129' : '0')}</div>
              </div>
              {viewingUser.projectLinks && (
                <div className="col-span-2"><Label>Documents / Project Links</Label>
                  <div className="mt-1"><a href={viewingUser.projectLinks} target="_blank" className="text-blue-600 hover:underline">{viewingUser.projectLinks}</a></div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Stall Modal */}
      <Dialog open={isStallEditModalOpen} onOpenChange={setIsStallEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Stall Details</DialogTitle>
          </DialogHeader>
          {editingStall && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stall Name</Label>
                  <Input value={editingStall.name} onChange={e => setEditingStall({ ...editingStall, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editingStall.category} onValueChange={(value) => setEditingStall({ ...editingStall, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Economy">Economy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={editingStall.price} onChange={e => setEditingStall({ ...editingStall, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editingStall.status} onValueChange={(value) => setEditingStall({ ...editingStall, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Booked">Booked</SelectItem>
                      <SelectItem value="OnHold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={editingStall.bookingDetails.firstName} onChange={e => setEditingStall({ ...editingStall, bookingDetails: { ...editingStall.bookingDetails, firstName: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={editingStall.bookingDetails.lastName} onChange={e => setEditingStall({ ...editingStall, bookingDetails: { ...editingStall.bookingDetails, lastName: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <Input value={editingStall.bookingDetails.contact} onChange={e => setEditingStall({ ...editingStall, bookingDetails: { ...editingStall.bookingDetails, contact: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={editingStall.bookingDetails.email} onChange={e => setEditingStall({ ...editingStall, bookingDetails: { ...editingStall.bookingDetails, email: e.target.value } })} />
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={updateStall}>Update Stall</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contestant Modal */}
      <Dialog open={isContestantModalOpen} onOpenChange={setIsContestantModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingContestant ? 'Edit Contestant' : 'Add New Contestant'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={editingContestant ? editingContestant.name : newContestant.name}
                  onChange={e => editingContestant ? setEditingContestant({ ...editingContestant, name: e.target.value }) : setNewContestant({ ...newContestant, name: e.target.value })} />
              </div>
              <div>
                <Label>Team Name</Label>
                <Input value={editingContestant ? editingContestant.teamName : newContestant.teamName}
                  onChange={e => editingContestant ? setEditingContestant({ ...editingContestant, teamName: e.target.value }) : setNewContestant({ ...newContestant, teamName: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={editingContestant ? editingContestant.category : newContestant.category}
                onValueChange={v => editingContestant ? setEditingContestant({ ...editingContestant, category: v }) : setNewContestant({ ...newContestant, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="App Development">App Development</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="IoT">IoT</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project Title</Label>
              <Input value={editingContestant ? editingContestant.projectTitle : newContestant.projectTitle}
                onChange={e => editingContestant ? setEditingContestant({ ...editingContestant, projectTitle: e.target.value }) : setNewContestant({ ...newContestant, projectTitle: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={editingContestant ? editingContestant.projectDescription : newContestant.projectDescription}
                onChange={e => editingContestant ? setEditingContestant({ ...editingContestant, projectDescription: e.target.value }) : setNewContestant({ ...newContestant, projectDescription: e.target.value })} />
            </div>
            <div>
              <Label>Project Link</Label>
              <Input value={editingContestant ? editingContestant.projectLinks : newContestant.projectLinks}
                onChange={e => editingContestant ? setEditingContestant({ ...editingContestant, projectLinks: e.target.value }) : setNewContestant({ ...newContestant, projectLinks: e.target.value })} />
            </div>
            <div>
              <Label>Profile/Logo Image (Upload)</Label>
              <Input type="file" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setContestantImageFile(e.target.files[0]);
                }
              }} />
              <div className="text-sm text-gray-500 my-1">OR</div>
              <Label>Image URL (Optional)</Label>
              <Input value={editingContestant ? editingContestant.image : newContestant.image}
                onChange={e => editingContestant ? setEditingContestant({ ...editingContestant, image: e.target.value }) : setNewContestant({ ...newContestant, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <Button className="w-full" onClick={createContestant}>{editingContestant ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manager Modal */}
      <Dialog open={isManagerModalOpen} onOpenChange={setIsManagerModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Manager</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Name</Label><Input value={newManager.name} onChange={e => setNewManager({ ...newManager, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={newManager.email} onChange={e => setNewManager({ ...newManager, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={newManager.phone} onChange={e => setNewManager({ ...newManager, phone: e.target.value })} /></div>
            <div><Label>Password</Label><Input type="password" value={newManager.password} onChange={e => setNewManager({ ...newManager, password: e.target.value })} /></div>
            <Button className="w-full" onClick={createManager}>Create Manager</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vote Details Modal */}
      <Dialog open={isVoteViewModalOpen} onOpenChange={setIsVoteViewModalOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Vote Details</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {viewingVotes.length === 0 ? (
              <p className="text-muted-foreground text-center">No votes yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingVotes.map((v: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="font-medium">{v.userId?.name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{v.userId?.email}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${v.type === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {v.type === 'up' ? 'Upvote' : 'Downvote'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(v.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
