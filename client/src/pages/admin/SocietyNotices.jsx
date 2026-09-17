/**
 * Admin society notices: publish, edit, and delete notices.
 * @module pages/admin/SocietyNotices
 */
import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Pencil } from 'lucide-react';
import api from '../../api/axios';

export default function SocietyNotices() {
  const [notices, setNotices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchNotices = async () => {
    const { data } = await api.get('/notices');
    setNotices(data);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/notices/${editingId}`, { title, content });
      } else {
        await api.post('/notices', { title, content });
      }
      resetForm();
      await fetchNotices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save notice.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notice) => {
    setEditingId(notice._id);
    setTitle(notice.title);
    setContent(notice.content);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      await fetchNotices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notice.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Society Notices</h1>
        <p className="text-sm text-gray-500">
          Publish circulars visible to every resident and staff member.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Megaphone className="w-5 h-5 text-blue-600" />
          <span>{editingId ? 'Edit Notice' : 'Publish Notice'}</span>
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water Supply Maintenance"
              className="field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full notice details…"
              className="field"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Save Changes' : 'Publish Notice'}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
            No notices published yet.
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice._id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-base font-bold text-gray-800">{notice.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {new Date(notice.createdAt).toLocaleDateString()}
                    {notice.author?.name ? ` • ${notice.author.name}` : ''}
                  </span>
                  <button
                    onClick={() => handleEdit(notice)}
                    className="p-1.5 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="p-1.5 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{notice.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}