'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';

interface PrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motherId: string;
  onSuccess?: () => void;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

export function PrescriptionForm({ open, onOpenChange, motherId, onSuccess }: PrescriptionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', instructions: '' }
  ]);
  const [instructions, setInstructions] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', instructions: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async () => {
    // Validation
    const validMedications = medications.filter(m => m.name && m.dosage && m.frequency);
    
    if (validMedications.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one medication with name, dosage, and frequency',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/prescriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motherId,
          medications: validMedications,
          instructions,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create prescription');
      }

      toast({
        title: 'Success',
        description: 'Prescription created successfully',
      });

      // Reset form
      setMedications([{ name: '', dosage: '', frequency: '', instructions: '' }]);
      setInstructions('');
      setValidUntil('');
      onOpenChange(false);
      
      if (onSuccess) onSuccess();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create prescription',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.Pill className="w-5 h-5 text-[#2196F3]" />
            Create Prescription
          </DialogTitle>
          <DialogDescription>
            Add medications and instructions for the patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Medications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Medications</Label>
              <Button type="button" size="sm" variant="outline" onClick={addMedication}>
                <Icons.Plus className="mr-1 h-4 w-4" />
                Add Medication
              </Button>
            </div>

            {medications.map((medication, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Medication {index + 1}</Label>
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMedication(index)}
                    >
                      <Icons.Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`med-name-${index}`}>Medication Name *</Label>
                    <Input
                      id={`med-name-${index}`}
                      value={medication.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      placeholder="e.g., Folic Acid"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`med-dosage-${index}`}>Dosage *</Label>
                    <Input
                      id={`med-dosage-${index}`}
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      placeholder="e.g., 400mcg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`med-frequency-${index}`}>Frequency *</Label>
                    <Input
                      id={`med-frequency-${index}`}
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      placeholder="e.g., Once daily"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`med-instructions-${index}`}>Instructions</Label>
                    <Input
                      id={`med-instructions-${index}`}
                      value={medication.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take with food"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* General Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">General Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any additional instructions for the patient..."
              rows={3}
            />
          </div>

          {/* Valid Until */}
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until (Optional)</Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Icons.Save className="mr-2 h-4 w-4" />
                Create Prescription
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

