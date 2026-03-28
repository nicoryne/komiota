'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { badgeSchema } from '@/lib/schemas/badge';
import { BadgeWithAwardCount } from '@/services/badge';
import { z } from 'zod';

interface BadgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  badge?: BadgeWithAwardCount | null;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export function BadgeModal({
  open,
  onOpenChange,
  mode,
  badge,
  onSubmit,
  isSubmitting,
}: BadgeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_url: '',
    criteria: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && badge) {
        setFormData({
          name: badge.name,
          description: badge.description || '',
          icon_url: badge.icon_url || '',
          criteria: badge.criteria || '',
        });
      } else {
        setFormData({ name: '', description: '', icon_url: '', criteria: '' });
      }
      setErrors({});
    }
  }, [open, mode, badge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = badgeSchema.parse({
        name: formData.name,
        description: formData.description || null,
        icon_url: formData.icon_url || null,
        criteria: formData.criteria || null,
      });
      onSubmit(validated);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Create Badge' : 'Edit Badge'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4627b6]"
              placeholder="Enter badge name"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4627b6]"
              placeholder="Enter badge description"
              rows={2}
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="icon_url" className="block text-sm font-medium text-gray-700 mb-1">
              Icon URL
            </label>
            <input
              id="icon_url"
              type="url"
              value={formData.icon_url}
              onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4627b6]"
              placeholder="https://example.com/icon.png"
            />
            {errors.icon_url && <p className="text-sm text-red-600 mt-1">{errors.icon_url}</p>}
          </div>

          <div>
            <label htmlFor="criteria" className="block text-sm font-medium text-gray-700 mb-1">
              Criteria
            </label>
            <textarea
              id="criteria"
              value={formData.criteria}
              onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4627b6]"
              placeholder="Enter badge criteria"
              rows={2}
            />
            {errors.criteria && <p className="text-sm text-red-600 mt-1">{errors.criteria}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
