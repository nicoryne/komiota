'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { busStopSchema } from '@/lib/schemas/bus-stop';
import { BusStop } from '@/services/bus-stop';
import { z } from 'zod';

interface BusStopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit';
  busStop: BusStop | null;
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
}

export function BusStopModal({
  open,
  onOpenChange,
  mode,
  busStop,
  onSubmit,
  isSubmitting,
}: BusStopModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    lng: '',
    image_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && busStop) {
      // Extract lat/lng from PostGIS POINT format
      const location = busStop.location as string | null | undefined;
      const locationMatch = location?.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      const lng = locationMatch?.[1] || '';
      const lat = locationMatch?.[2] || '';

      setFormData({
        name: busStop.name,
        lat,
        lng,
        image_url: busStop.image_url || '',
      });
      setErrors({});
    }
  }, [open, busStop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view' || !onSubmit) return;

    setErrors({});

    try {
      const validated = busStopSchema.parse({
        name: formData.name,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        image_url: formData.image_url || null,
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

  const isViewMode = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'Bus Stop Details' : 'Edit Bus Stop'}
          </DialogTitle>
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
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4627b6] disabled:bg-gray-50 disabled:text-gray-600"
              placeholder="Enter bus stop name"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                id="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4627b6] disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="0.0"
              />
              {errors.lat && <p className="text-sm text-red-600 mt-1">{errors.lat}</p>}
            </div>

            <div>
              <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                id="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4627b6] disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="0.0"
              />
              {errors.lng && <p className="text-sm text-red-600 mt-1">{errors.lng}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4627b6] disabled:bg-gray-50 disabled:text-gray-600"
              placeholder="https://example.com/image.jpg"
            />
            {errors.image_url && <p className="text-sm text-red-600 mt-1">{errors.image_url}</p>}
          </div>

          {busStop && (
            <div className="pt-2 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium capitalize">{busStop.status}</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">
                    {busStop.created_at ? new Date(busStop.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isViewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isViewMode && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
