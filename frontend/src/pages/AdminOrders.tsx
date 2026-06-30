import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Package, Truck, CheckCircle, XCircle, MapPin, Phone, User, Globe, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const { toast } = useToast();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await api.admin.getOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast({
                title: "Error",
                description: "Failed to load orders.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await api.admin.updateOrderStatus(orderId, newStatus);
            toast({
                title: "Status Updated",
                description: `Order status changed to ${newStatus}.`,
            });
            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Could not update order status.",
                variant: "destructive"
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'placed': return 'bg-yellow-100 text-yellow-800';
            case 'dispatched': return 'bg-blue-100 text-blue-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Manage Orders</h1>
                        <p className="text-slate-400 font-medium">Track and manage customer product orders</p>
                    </div>
                    <Button onClick={fetchOrders} className="bg-white/10 text-white hover:bg-white/20 border-white/10">
                        <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-accent" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700">
                        <Package className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                        <h3 className="text-xl font-bold text-white">No orders found</h3>
                        <p className="text-slate-400">Orders placed by customers will appear here.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="p-6">Order ID</th>
                                        <th className="p-6">Customer</th>
                                        <th className="p-6">Items</th>
                                        <th className="p-6">Amount</th>
                                        <th className="p-6">Date</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-6 font-mono text-xs text-slate-500">#{order.id.substring(0, 8)}...</td>
                                            <td className="p-6">
                                                <div
                                                    className="font-bold text-[#1A1A1A] cursor-pointer hover:text-accent transition-colors flex items-center gap-2 group"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    {order.customer_name}
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all" />
                                                </div>
                                                <div className="text-xs text-slate-400">{order.customer_email}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="space-y-1">
                                                    {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="text-sm text-slate-600">
                                                            {item.quantity}x {item.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-6 font-bold text-emerald-600">RM {parseFloat(order.total_amount).toFixed(2)}</td>
                                            <td className="p-6 text-sm text-slate-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-6">
                                                <Badge className={`${getStatusColor(order.status)} border-none capitalize px-3 py-1`}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-10 w-10 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-full"
                                                        onClick={() => setSelectedOrder(order)}
                                                        title="View Client Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </Button>
                                                    <Select
                                                        value={order.status}
                                                        onValueChange={(val) => handleStatusChange(order.id, val)}
                                                    >
                                                        <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 text-slate-800 font-bold rounded-full shadow-sm hover:border-accent/50 hover:shadow-md transition-all duration-200">
                                                            <SelectValue placeholder="Update Status" />
                                                        </SelectTrigger>
                                                    <SelectContent className="rounded-xl p-1">
                                                        <SelectItem value="placed" className="rounded-lg focus:bg-slate-50 my-1 cursor-pointer">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                                                                    <Package className="w-3.5 h-3.5 text-amber-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-700">Placed</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="dispatched" className="rounded-lg focus:bg-slate-50 my-1 cursor-pointer">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-700">Dispatched</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="delivered" className="rounded-lg focus:bg-slate-50 my-1 cursor-pointer">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-700">Delivered</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="cancelled" className="rounded-lg focus:bg-slate-50 my-1 cursor-pointer">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-700">Cancelled</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                    </Select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden bg-white border-none shadow-2xl">
                    <div className="bg-slate-50 p-6 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-accent" />
                                Shipping Details
                            </DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Delivery information for Order #{selectedOrder?.id?.substring(0, 8)}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {selectedOrder && selectedOrder.shipping_address ? (
                        <div className="p-6 space-y-6">
                            <div className="grid gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipient</p>
                                        <p className="font-semibold text-slate-900 text-lg">
                                            {selectedOrder.customer_name}
                                        </p>
                                        <p className="text-slate-500 text-sm">{selectedOrder.customer_email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</p>
                                        <p className="font-medium text-slate-900">
                                            {selectedOrder.shipping_address?.phone || selectedOrder.customer_phone || selectedOrder.phone || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Address</p>
                                        <p className="font-medium text-slate-900 leading-relaxed">
                                            {selectedOrder.shipping_address.address}
                                            {selectedOrder.shipping_address.apartment && <>, {selectedOrder.shipping_address.apartment}</>}
                                        </p>
                                        <p className="text-slate-600">
                                            {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postalCode || selectedOrder.shipping_address.zip}
                                        </p>
                                        {selectedOrder.shipping_address.country && (
                                            <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm">
                                                <Globe className="w-3.5 h-3.5" />
                                                {selectedOrder.shipping_address.country}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-500 text-sm">Order Status</span>
                                    <Badge className={`${getStatusColor(selectedOrder.status)} border-none capitalize`}>
                                        {selectedOrder.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-sm">Total Amount</span>
                                    <span className="font-bold text-slate-900">RM {parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No shipping address provided for this order.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminOrdersPage;
