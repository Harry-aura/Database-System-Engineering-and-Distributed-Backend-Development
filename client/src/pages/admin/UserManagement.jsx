/**
 * Admin user management: register, edit, and delete society accounts.
 * @module pages/admin/UserManagement
 */
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, UserRound } from 'lucide-react';
import api from '../../api/axios';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'resident',
  flatNumber: '',
  block: '',
  gate: '',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError('Failed to load users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editingId}`, payload);
      } else {
        await api.post('/users', form);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      flatNumber: user.flatNumber || '',
      block: user.block || '',
      gate: user.gate || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500">
          Create and manage resident, security, and admin accounts.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <UserRound className="w-5 h-5 text-blue-600" />
            <span>{editingId ? 'Edit User' : 'Add New User'}</span>
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={form.name} onChange={setField('name')} required className="field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={setField('email')} required className="field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={setField('password')}
                placeholder={editingId ? 'Leave blank to keep current' : 'Min 6 characters'}
                required={!editingId}
                minLength={6}
                className="field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={setField('role')} className="field">
                <option value="resident">Resident</option>
                <option value="security">Security Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {form.role === 'resident' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flat No.</label>
                  <input type="text" value={form.flatNumber} onChange={setField('flatNumber')} className="field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
                  <input type="text" value={form.block} onChange={setField('block')} className="field" />
                </div>
              </div>
            )}
            {form.role === 'security' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Gate</label>
                <input type="text" value={form.gate} onChange={setField('gate')} className="field" />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Save Changes' : 'Create User'}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">
              Registered Users ({users.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Flat / Gate</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-600">
                      {user.role === 'resident'
                        ? `${user.flatNumber || '-'}${user.block ? ` / ${user.block}` : ''}`
                        : user.role === 'security'
                          ? user.gate || '-'
                          : '-'}
                    </td>
                    <td className="py-3 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-1.5 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}