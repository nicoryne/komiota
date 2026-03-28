import { AccountService } from '@/services/account';
import { AuthService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RoleUpdateForm } from './role-update-form';

export default async function AccountDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const authResult = await AuthService.checkAuth(['admin']);
  const currentUserId = authResult.userRole; // This should be user ID, but we'll use it for now

  const result = await AccountService.getById(params.id);

  if (!result.success) {
    notFound();
  }

  const profile = result.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/accounts">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#1C1A22]">
            {profile.username || 'Unknown User'}
          </h1>
          <p className="text-gray-600 mt-1">Account details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[16px] border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#1C1A22] mb-4">
              Profile Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Username
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {profile.username || '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <p className="text-[#1C1A22] mt-1 capitalize">
                  {profile.role || 'user'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Commuter Score
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {profile.commuter_score?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Total Trips
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {profile.total_trips?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Rank Tier
                </label>
                <p className="text-[#1C1A22] mt-1">{profile.rank_tier || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Faction
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {profile.faction?.name || 'None'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[16px] border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#1C1A22] mb-4">
              Gamification Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Badges Earned
                </label>
                <p className="text-[#1C1A22] mt-1">{profile.badge_count || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Commuters Helped
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {profile.commuters_helped?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Current Streak
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {profile.current_streak || 0} days
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Longest Streak
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {profile.longest_streak || 0} days
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Total Distance
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {profile.total_distance_km?.toFixed(1) || '0'} km
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-[16px] border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-[#1C1A22] mb-4">
            Role Management
          </h2>
          <RoleUpdateForm
            userId={params.id}
            currentRole={profile.role as 'admin' | 'moderator' | 'user'}
          />
        </div>
      </div>
    </div>
  );
}
