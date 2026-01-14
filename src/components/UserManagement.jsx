import { useState, useEffect } from 'react';
import { Users, Factory, UserPlus, Shield, User, Loader2 } from 'lucide-react';
import { adminService } from '../services/admin';
import { authService } from '../services/auth';

export default function UserManagement() {
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
  
  const handlePromoteToIndustry = async (userId) => {
    if (!confirm('Promote user to industry role?')) return;
    
    try {
      await adminService.promoteToIndustry(token, userId);
      setSuccess('User promoted to industry successfully');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      setError('Failed to promote user: ' + err.message);
      setTimeout(() => setError(''), 5000);
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
  
  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;
    
    try {
      await adminService.updateUserRole(token, userId, newRole);
      setSuccess('User role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      setError('Failed to update role: ' + err.message);
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
        return 'bg-purple-100 text-purple-700';
      case 'industry':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <UserPlus size={16} />
          <span>Create Industry User</span>
        </button>
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
      
      {showCreateForm && (
        <form onSubmit={handleCreateIndustry} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <h3 className="font-semibold mb-3 text-gray-900">Create New Industry User</h3>
          <input
            type="text"
            placeholder="Full Name (optional)"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="email"
            placeholder="Email *"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="tel"
            placeholder="Phone (optional, format: +6281234567890)"
            value={formData.phone_e164}
            onChange={(e) => setFormData({...formData, phone_e164: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password *"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex space-x-2">
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Create
            </button>
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
          </div>
        </form>
      )}
      
      {loading ? (
        <div className="text-center py-8 text-gray-600 flex items-center justify-center">
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.full_name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role || 'user'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {user.role !== 'industry' && (
                        <button
                          onClick={() => handlePromoteToIndustry(user.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Make Industry
                        </button>
                      )}
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="industry">Industry</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}







