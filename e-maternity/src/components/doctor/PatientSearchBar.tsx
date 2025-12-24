'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { RiskLevel } from '@/types';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchResult {
  id: string;
  userId: string;
  nic: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  pregnancyWeek: number;
  riskLevel: RiskLevel;
  expectedDeliveryDate: string;
}

export function PatientSearchBar() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: 'Search Required',
        description: 'Please enter a search query',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(false);

    try {
      const response = await fetch(
        `/api/doctor/search?q=${encodeURIComponent(query)}&type=${searchType}`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setHasSearched(true);
      } else {
        toast({
          title: 'Search Failed',
          description: data.error?.message || 'Failed to search patients',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during search',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getRiskBadgeVariant = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case RiskLevel.CRITICAL:
        return 'destructive';
      case RiskLevel.HIGH:
        return 'destructive';
      case RiskLevel.MODERATE:
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Search by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="nic">NIC Number</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="phone">Phone Number</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search for a patient..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isSearching}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <Icons.Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Icons.Activity className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icons.AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No patients found</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Found {results.length} patient{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => router.push(`/dashboard/doctor/patients/${result.userId}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {result.firstName} {result.lastName}
                          </h3>
                          <Badge variant={getRiskBadgeVariant(result.riskLevel)}>
                            {result.riskLevel}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Icons.Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">NIC:</span>
                            <span className="font-mono">{result.nic}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icons.Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{result.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icons.Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Week:</span>
                            <span className="font-semibold">{result.pregnancyWeek}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icons.Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">EDD:</span>
                            <span>
                              {new Date(result.expectedDeliveryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Icons.CheckCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
