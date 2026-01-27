import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, Trash2, User } from 'lucide-react';
import * as usersAPI from '../../api/users.api';
import { useToast } from '../../contexts/ToastContext';

const UsersManagement = () => {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'user' });
    const [roleFilter, setRoleFilter] = useState('all'); // all, admin, user
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await usersAPI.getAllUsers();
            console.log('getAllUsers response:', response);
            console.log('response.data:', response.data);

            if (response.success) {
                setUsers(response.data.users);
            } else {
                console.error('API returned success: false');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            console.error('Error response:', error.response);
            toast.error(error.response?.data?.message || 'Failed to load users');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await usersAPI.createUser(formData);
            toast.success('User created successfully!');
            setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'user' });
            setShowCreateForm(false);
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await usersAPI.updateUserRole(userId, newRole);
            loadUsers();
            toast.success(`User role updated to ${newRole} successfully!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersAPI.deleteUser(userId);
                loadUsers();
                toast.success('User deleted successfully!');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    // Fuzzy search helper
    const fuzzyMatch = (text, query) => {
        if (!query) return true;
        const textLower = text.toLowerCase();
        const queryLower = query.toLowerCase();

        // Check if query is contained in text
        if (textLower.includes(queryLower)) return true;

        // Check character-by-character fuzzy match
        let queryIndex = 0;
        for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
            if (textLower[i] === queryLower[queryIndex]) {
                queryIndex++;
            }
        }
        return queryIndex === queryLower.length;
    };

    // Filter and search users
    const filteredUsers = users.filter(user => {
        // Role filter
        if (roleFilter !== 'all' && user.role !== roleFilter) {
            return false;
        }

        // Search filter
        if (searchQuery) {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const email = user.email.toLowerCase();
            const query = searchQuery.toLowerCase();

            return fuzzyMatch(fullName, query) || fuzzyMatch(email, query);
        }

        return true;
    });

    // Count by role
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent mb-2">
                            User Management
                        </h2>
                        <p className="text-gray-600">Manage users and admin access</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                        <UserPlus className="w-5 h-5" />
                        {showCreateForm ? 'Cancel' : 'Create User'}
                    </motion.button>
                </div>

                {/* Filter and Search */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
                    <div className="flex gap-4 mb-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRoleFilter('all')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${roleFilter === 'all'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            All ({users.length})
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRoleFilter('admin')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${roleFilter === 'admin'
                                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Shield className="w-4 h-4" />
                            Admins ({adminCount})
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRoleFilter('user')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${roleFilter === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            Users ({userCount})
                        </motion.button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                    />
                </div>

                {/* Create User Form */}
                <AnimatePresence>
                    {showCreateForm && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleCreateUser}
                            className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New User</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                                />
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-3 rounded-xl hover:shadow-lg font-semibold"
                            >
                                Create User
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>

            {/* Users List */}
            <div className="grid gap-4">
                {filteredUsers.map((user, index) => (
                    <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                                    {user.role === 'admin' ? (
                                        <Shield className="w-6 h-6 text-purple-600" />
                                    ) : (
                                        <User className="w-6 h-6 text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}`.trim() : 'No Name'}
                                    </h3>
                                    <p className="text-gray-600">{user.email}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleToggleRole(user._id, user.role)}
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${user.role === 'admin' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                                >
                                    {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                    <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {users.length === 0 ? 'No Users Found' : 'No matching users'}
                    </h3>
                    <p className="text-gray-600">
                        {users.length === 0 ? 'Create your first user to get started' : 'Try adjusting your filters or search query'}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default UsersManagement;

