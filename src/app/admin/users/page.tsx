import { Suspense } from 'react';
import AdminUsersClient from './AdminUsersClient';

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <AdminUsersClient />
      </Suspense>
    </div>
  );
} 