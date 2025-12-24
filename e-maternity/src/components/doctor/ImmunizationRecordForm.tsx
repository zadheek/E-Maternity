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

interface ImmunizationRecordFormProps {
  motherProfileId: string;
  onSuccess?: () => void;
}

const immunizationTypes = [
  { value: 'TETANUS', label: 'Tetanus (Td/Tdap)' },
  { value: 'RUBELLA', label: 'Rubella (MMR)' },
  { value: 'HEPATITIS_B', label: 'Hepatitis B' },
  { value: 'INFLUENZA', label: 'Influenza (Flu)' },
  { value: 'COVID19', label: 'COVID-19' },
  { value: 'OTHER', label: 'Other' },
];

const injectionSites = [
  'Left Upper Arm',
  'Right Upper Arm',
  'Left Thigh',
  'Right Thigh',
  'Other',
];

export function ImmunizationRecordForm({ motherProfileId, onSuccess }: ImmunizationRecordFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    immunizationType: '',
    vaccineName: '',
    doseNumber: '1',
    administeredDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    batchNumber: '',
    site: '',
    sideEffects: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/immunizations', {
        motherProfileId,
        immunizationType: formData.immunizationType,
        vaccineName: formData.vaccineName || immunizationTypes.find(i => i.value === formData.immunizationType)?.label,
        doseNumber: parseInt(formData.doseNumber),
        administeredDate: new Date(formData.administeredDate).toISOString(),
        nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate).toISOString() : undefined,
        batchNumber: formData.batchNumber || undefined,
        site: formData.site || undefined,
        sideEffects: formData.sideEffects || undefined,
        notes: formData.notes || undefined,
      });

      toast.success('Immunization recorded successfully');
      setOpen(false);
      setFormData({
        immunizationType: '',
        vaccineName: '',
        doseNumber: '1',
        administeredDate: new Date().toISOString().split('T')[0],
        nextDueDate: '',
        batchNumber: '',
        site: '',
        sideEffects: '',
        notes: '',
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to record immunization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icons.Plus className="w-4 h-4 mr-2" />
          Record Immunization
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Immunization</DialogTitle>
          <DialogDescription>
            Record a new vaccination for the patient
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="immunizationType">Immunization Type *</Label>
              <Select
                value={formData.immunizationType}
                onValueChange={(value) => setFormData({ ...formData, immunizationType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select immunization type" />
                </SelectTrigger>
                <SelectContent>
                  {immunizationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vaccineName">Vaccine Name (Optional)</Label>
              <Input
                id="vaccineName"
                placeholder="Brand or specific vaccine name"
                value={formData.vaccineName}
                onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doseNumber">Dose Number *</Label>
              <Select
                value={formData.doseNumber}
                onValueChange={(value) => setFormData({ ...formData, doseNumber: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Dose 1</SelectItem>
                  <SelectItem value="2">Dose 2</SelectItem>
                  <SelectItem value="3">Dose 3</SelectItem>
                  <SelectItem value="4">Dose 4</SelectItem>
                  <SelectItem value="5">Booster</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                placeholder="Vaccine batch/lot number"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="administeredDate">Administered Date *</Label>
              <Input
                id="administeredDate"
                type="date"
                value={formData.administeredDate}
                onChange={(e) => setFormData({ ...formData, administeredDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextDueDate">Next Due Date (Optional)</Label>
              <Input
                id="nextDueDate"
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site">Injection Site</Label>
            <Select
              value={formData.site}
              onValueChange={(value) => setFormData({ ...formData, site: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select injection site" />
              </SelectTrigger>
              <SelectContent>
                {injectionSites.map((site) => (
                  <SelectItem key={site} value={site}>
                    {site}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sideEffects">Side Effects (Optional)</Label>
            <Textarea
              id="sideEffects"
              placeholder="Any observed side effects or reactions"
              value={formData.sideEffects}
              onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or observations"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
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
                  Recording...
                </>
              ) : (
                <>
                  <Icons.Check className="w-4 h-4 mr-2" />
                  Record Immunization
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
