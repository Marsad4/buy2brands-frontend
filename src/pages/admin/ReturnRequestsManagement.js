import React, { useState, useEffect } from 'react';
import { RotateCcw, Search, Check, X, Filter } from 'lucide-react';
import * as returnRequestsAPI from '../../api/returnRequests.api';
import { useToast } from '../../contexts/ToastContext';

const ReturnRequestsManagement = () => {
    const toast = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await returnRequestsAPI.getAllReturnRequests();
            if (response.success) {
                setRequests(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching return requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);
            const response = await returnRequestsAPI.updateReturnRequestStatus(selectedRequest._id, {
                status,
                adminResponse
            });

            if (response.success) {
                toast.success(`Request ${status} successfully`);
                fetchRequests();
                setSelectedRequest(null);
                setAdminResponse('');
            } else {
                toast.error('Failed to update request');
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error('An error occurred');
        } finally {
            setProcessing(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch =
            req.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <RotateCcw className="w-6 h-6 text-uk-navy-500" />
                    Return Requests Management
                </h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Order ID or Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-uk-navy-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-uk-navy-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-semibold text-gray-600">Order ID</th>
                            <th className="p-4 font-semibold text-gray-600">Customer</th>
                            <th className="p-4 font-semibold text-gray-600">Reason</th>
                            <th className="p-4 font-semibold text-gray-600">Date</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map(req => (
                            <tr key={req._id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{req.orderId}</td>
                                <td className="p-4">
                                    <div className="font-medium">{req.user?.firstName} {req.user?.lastName}</div>
                                    <div className="text-sm text-gray-500">{req.user?.email}</div>
                                </td>
                                <td className="p-4">
                                    <span className="font-medium text-gray-700">{req.reason}</span>
                                    {req.message && (
                                        <div className="text-xs text-gray-500 italic mt-1 truncate max-w-xs" title={req.message}>
                                            "{req.message}"
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                req.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {req.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => setSelectedRequest(req)}
                                        className="text-uk-navy-500 hover:text-uk-navy-700 font-medium text-sm"
                                    >
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No requests found</div>
                )}
            </div>

            {/* Manage Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center catch-events">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">Manage Request: {selectedRequest.orderId}</h3>
                            <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
                            <p><strong>Customer:</strong> {selectedRequest.user?.firstName} {selectedRequest.user?.lastName}</p>
                            <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                            <p className="mt-2"><strong>Message:</strong></p>
                            <p className="italic text-gray-700">{selectedRequest.message || 'No message'}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
                            <textarea
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-uk-navy-500"
                                rows="3"
                                placeholder="Start typing response to verify..."
                            ></textarea>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => handleUpdateStatus('rejected')}
                                disabled={processing}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('approved')}
                                disabled={processing}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnRequestsManagement;
