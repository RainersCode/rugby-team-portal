'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, User, UserX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

type UserData = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to sign in if unauthorized
          router.push('/auth/signin');
          return;
        }
        throw new Error('Failed to fetch users');
      }

      const { users } = await response.json();

      const formattedUsers = users.map((user: any) => ({
        id: user.id,
        email: user.email || '',
        role: user.role || 'user',
        created_at: new Date(user.created_at).toLocaleDateString(),
        last_sign_in_at: user.last_sign_in_at 
          ? new Date(user.last_sign_in_at).toLocaleDateString()
          : null
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (updatingRole) return; // Prevent multiple clicks
    setUpdatingRole(userId);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Refresh the users list instead of updating local state
      await fetchUsers();

      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (deletingUser) return; // Prevent multiple clicks
    
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setDeletingUser(userId);

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      // Refresh the users list instead of updating local state
      await fetchUsers();

      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user.",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">User Management</CardTitle>
          <CardDescription>
            Manage user accounts and their roles
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? (
                        <Shield className="h-4 w-4 text-rugby-teal" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell>{user.created_at}</TableCell>
                  <TableCell>{user.last_sign_in_at || 'Never'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingRole === user.id}
                        onClick={() => handleUpdateRole(
                          user.id,
                          user.role === 'admin' ? 'user' : 'admin'
                        )}
                      >
                        {updatingRole === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingUser === user.id}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        {deletingUser === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
} 