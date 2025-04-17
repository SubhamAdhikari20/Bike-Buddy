// src/app/(app)/[username]/admin/dashboard/page.tsx
import React from 'react';

const AdminDashboard = () => {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-600">
                Welcome to the admin dashboard. Use the sidebar to navigate through the different sections.
            </p>
        </section>
    );
};

export default AdminDashboard;
