'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './sidebar';

interface MobileNavProps {
  userRole: 'admin' | 'moderator';
  username: string;
  onLogout: () => void;
}

export function MobileNav({ userRole, username, onLogout }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-[#4627b6]">Komiota</h1>
          <span className="text-xs text-gray-600">Dashboard</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar
              userRole={userRole}
              username={username}
              onLogout={() => {
                onLogout();
                setIsOpen(false);
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
