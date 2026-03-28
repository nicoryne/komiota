'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { updateAccountRole } from '@/actions/account';
import { useRouter } from 'next/navigation';

interface RoleUpdateFormProps {
  userId: string;
  currentRole: 'admin' | 'moderator' | 'user';
}

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'user', label: 'User' },
];

export function RoleUpdateForm({ userId, currentRole }: RoleUpdateFormProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateAccountRole(userId, selectedRole);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">
          Select Role
        </label>
        <select
          value={selectedRole}
          onChange={(e) =>
            setSelectedRole(e.target.value as 'admin' | 'moderator' | 'user')
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-[#4627b6] focus:border-transparent"
          disabled={isPending}
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[12px] text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending || selectedRole === currentRole}
        className="w-full"
      >
        {isPending ? 'Updating...' : 'Update Role'}
      </Button>
    </form>
  );
}
