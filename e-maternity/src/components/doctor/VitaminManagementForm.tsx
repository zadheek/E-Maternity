'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import axios from 'axios';

interface VitaminManagementFormProps {
  motherProfileId: string;
  onSuccess?: () => void;
}

const vitaminTypes = [
  { value: 'FOLIC_ACID', label: 'Folic Acid' },
  { value: 'IRON', label: 'Iron' },
  { value: 'CALCIUM', label: 'Calcium' },
  { value: 'VITAMIN_D', label: 'Vitamin D' },
  { value: 'MULTIVITAMIN', label: 'Multivitamin' },
  { value: 'VITAMIN_B12', label: 'Vitamin B12' },
  { value: 'DHA_OMEGA3', label: 'DHA/Omega-3' },
  { value: 'OTHER', label: 'Other' },
];

export function VitaminManagementForm({ motherProfileId, onSuccess }: VitaminManagementFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vitaminType: '',
    vitaminName: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/vitamins', {
        motherProfileId,
        vitaminType: formData.vitaminType,
        vitaminName: formData.vitaminName || vitaminTypes.find(v => v.value === formData.vitaminType)?.label,
        dosage: formData.dosage,
        frequency: formData.frequency,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        notes: formData.notes,
      });

      toast.success('Vitamin prescription added successfully');
      setOpen(false);
      setFormData({
        vitaminType: '',
        vitaminName: '',
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to add vitamin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icons.Plus className="w-4 h-4 mr-2" />
          Prescribe Vitamin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prescribe Vitamin/Supplement</DialogTitle>
          <DialogDescription>
            Add a new vitamin or supplement to the patient's plan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vitaminType">Vitamin Type *</Label>
              <Select
                value={formData.vitaminType}
                onValueChange={(value) => setFormData({ ...formData, vitaminType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vitamin type" />
                </SelectTrigger>
                <SelectContent>
                  {vitaminTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vitaminName">Vitamin Name (Optional)</Label>
              <Input
                id="vitaminName"
                placeholder="Brand name or specific product"
                value={formData.vitaminName}
                onChange={(e) => setFormData({ ...formData, vitaminName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                placeholder="e.g., 400mg, 1 tablet"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Input
                id="frequency"
                placeholder="e.g., Once daily, Twice daily"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Special instructions, side effects to watch for, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Icons.Clock className="w-4 h-4 mr-2 animate-spin" />
                  Prescribing...
                </>
              ) : (
                <>
                  <Icons.Check className="w-4 h-4 mr-2" />
                  Prescribe Vitamin
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
