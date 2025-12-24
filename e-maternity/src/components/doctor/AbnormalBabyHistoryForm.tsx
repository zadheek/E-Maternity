'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import axios from 'axios';

interface AbnormalBabyRecord {
  id: string;
  year: number;
  condition: string;
  description: string;
  outcome: 'stillbirth' | 'neonatal_death' | 'survived_with_condition';
}

interface AbnormalBabyHistoryProps {
  motherProfileId: string;
  initialData?: AbnormalBabyRecord[];
  onUpdate?: () => void;
}

export function AbnormalBabyHistoryForm({ motherProfileId, initialData = [], onUpdate }: AbnormalBabyHistoryProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AbnormalBabyRecord[]>(initialData);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    condition: '',
    description: '',
    outcome: 'survived_with_condition' as const,
  });

  useEffect(() => {
    setRecords(initialData);
  }, [initialData]);

  const handleAddRecord = () => {
    const newRecord: AbnormalBabyRecord = {
      id: Date.now().toString(),
      year: parseInt(formData.year),
      condition: formData.condition,
      description: formData.description,
      outcome: formData.outcome,
    };

    setRecords([...records, newRecord]);
    setFormData({
      year: new Date().getFullYear().toString(),
      condition: '',
      description: '',
      outcome: 'survived_with_condition',
    });
  };

  const handleRemoveRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`/api/mothers/${motherProfileId}/abnormal-history`, {
        hadAbnormalBabies: records.length > 0,
        abnormalBabyDetails: records,
      });

      toast.success('Pregnancy history updated successfully');
      setOpen(false);
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icons.AlertCircle className="w-4 h-4 mr-2" />
          {initialData.length > 0 ? 'View/Edit' : 'Add'} Abnormal Pregnancy History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Abnormal Pregnancy History</DialogTitle>
          <DialogDescription>
            Record previous pregnancies with complications or abnormal outcomes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Records */}
          {records.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Previous Records</h3>
              {records.map((record) => (
                <Card key={record.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-lg">{record.year}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            record.outcome === 'survived_with_condition'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.outcome.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{record.condition}</p>
                        <p className="text-sm text-muted-foreground mt-1">{record.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecord(record.id)}
                      >
                        <Icons.X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add New Record Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-sm">Add New Record</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Select
                  value={formData.outcome}
                  onValueChange={(value: any) => setFormData({ ...formData, outcome: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="survived_with_condition">Survived with Condition</SelectItem>
                    <SelectItem value="neonatal_death">Neonatal Death</SelectItem>
                    <SelectItem value="stillbirth">Stillbirth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition/Complication</Label>
              <Input
                id="condition"
                placeholder="e.g., Congenital heart defect, Neural tube defect"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the condition and circumstances"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddRecord}
              disabled={!formData.condition || !formData.description}
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setRecords(initialData);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Icons.Clock className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icons.Check className="w-4 h-4 mr-2" />
                  Save History
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
