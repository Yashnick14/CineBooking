import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      // Note: This endpoint should be added to userRoutes if not already there
      const { data } = await axios.get('/api/users', config);
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>
      <div className="w-full overflow-x-auto rounded-xl glass-card">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">ID</th>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Name</th>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Email</th>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="hover:bg-white/5 transition">
                <td className="p-5 border-b border-border-glass text-sm text-text-muted font-mono">{user._id}</td>
                <td className="p-5 border-b border-border-glass text-sm">{user.name}</td>
                <td className="p-5 border-b border-border-glass text-sm">{user.email}</td>
                <td className="p-5 border-b border-border-glass text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${user.isAdmin ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gray-500/20 text-gray-400'}`}>
                    {user.isAdmin ? 'ADMIN' : 'USER'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
