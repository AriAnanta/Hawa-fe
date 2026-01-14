import AdminLayout from '../components/AdminLayout';
import { Users, Factory, UserPlus, Shield, User, Loader2, Search, Filter, X, AlertTriangle } from 'lucide-react';
import { adminService } from '../services/admin';
import { authService } from '../services/auth';
import { useState, useEffect } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_e164: '',
    password: '',
    language: 'id'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState({ userId: null, newRole: null, oldRole: null, userName: null });
  
  const token = authService.getToken();
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getUsers(token);
      setUsers(data);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRoleChange = (userId, newRole, oldRole, userName) => {
    // Prevent changing admin role
    if (oldRole === 'admin') {
      setError('Admin role cannot be changed');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    // Show confirmation modal
    setPendingRoleChange({ userId, newRole, oldRole, userName });
    setShowConfirmModal(true);
  };
  
  const confirmRoleChange = async () => {
    const { userId, newRole } = pendingRoleChange;
    
    try {
      await adminService.updateUserRole(token, userId, newRole);
      setSuccess(`User role updated to ${newRole} successfully`);
      setTimeout(() => setSuccess(''), 3000);
      setShowConfirmModal(false);
      setPendingRoleChange({ userId: null, newRole: null, oldRole: null, userName: null });
      loadUsers();
    } catch (err) {
      setError('Failed to update role: ' + err.message);
      setTimeout(() => setError(''), 5000);
      setShowConfirmModal(false);
    }
  };
  
  const handleCreateIndustry = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      await adminService.createIndustryUser(token, formData);
      setSuccess('Industry user created successfully');
      setShowCreateForm(false);
      setFormData({ full_name: '', email: '', phone_e164: '', password: '', language: 'id' });
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      setError('Failed to create user: ' + err.message);
      setTimeout(() => setError(''), 5000);
    }
  };
  
  
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} className="text-purple-600" />;
      case 'industry':
        return <Factory size={16} className="text-blue-600" />;
      default:
        return <User size={16} className="text-gray-600" />;
    }
  };
  
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'industry':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                  User Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Manage users, roles, and industry accounts
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <UserPlus size={18} />
              <span>Create Industry User</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}
        
        {/* Create Industry User Modal */}
        {showCreateForm && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateForm(false);
                setFormData({ full_name: '', email: '', phone_e164: '', password: '', language: 'id' });
                setError('');
              }
            }}
          >
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Create New Industry User</h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ full_name: '', email: '', phone_e164: '', password: '', language: 'id' });
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateIndustry} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (optional)</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      placeholder="+6281234567890"
                      value={formData.phone_e164}
                      onChange={(e) => setFormData({...formData, phone_e164: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ full_name: '', email: '', phone_e164: '', password: '', language: 'id' });
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="industry">Industry</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-600 flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" size={20} />
              Loading users...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.full_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role || 'user'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.role === 'admin' ? (
                          <span className="text-gray-400 text-xs italic">No actions available</span>
                        ) : (
                          <select
                            value={user.role || 'user'}
                            onChange={(e) => handleRoleChange(user.id, e.target.value, user.role, user.full_name || user.email)}
                            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            title="Change user role"
                          >
                            <option value="user">User</option>
                            <option value="industry">Industry</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  {searchTerm || roleFilter !== 'all' ? 'No users found matching your filters' : 'No users found'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Confirm Role Change Modal */}
        {showConfirmModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowConfirmModal(false);
                setPendingRoleChange({ userId: null, newRole: null, oldRole: null, userName: null });
              }
            }}
          >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <AlertTriangle className="text-yellow-600" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Role Change</h3>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to change the role for:
                  </p>
                  <p className="font-semibold text-gray-900 mb-4">
                    {pendingRoleChange.userName}
                  </p>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {pendingRoleChange.oldRole}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      {pendingRoleChange.newRole}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setPendingRoleChange({ userId: null, newRole: null, oldRole: null, userName: null });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRoleChange}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Confirm Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

