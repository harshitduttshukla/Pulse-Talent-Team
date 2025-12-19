import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Trash2 } from 'lucide-react';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
}

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(user => user._id !== id));
            } catch (error) {
                console.error('Failed to delete user', error);
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">User Management</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Admin access only.</p>
            </div>
            <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                    <li key={user._id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <p className="text-sm font-medium text-indigo-600 truncate">{user.username}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <p className="text-xs text-gray-400">Role: {user.role}</p>
                            </div>
                            <div className="ml-5 flex-shrink-0">
                                {user.role !== 'admin' && (
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminUsers;
