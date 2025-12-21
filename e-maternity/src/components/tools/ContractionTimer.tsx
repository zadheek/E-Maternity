'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';

interface Contraction {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export function ContractionTimer() {
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [currentContraction, setCurrentContraction] = useState<Contraction | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentContraction && !currentContraction.endTime) {
      interval = setInterval(() => {
        setTimer(Date.now() - currentContraction.startTime.getTime());
      }, 100);
    }
    return () => clearInterval(interval);
  }, [currentContraction]);

  const startContraction = () => {
    const newContraction: Contraction = {
      id: Date.now().toString(),
      startTime: new Date(),
    };
    setCurrentContraction(newContraction);
    setTimer(0);
  };

  const stopContraction = () => {
    if (currentContraction) {
      const endTime = new Date();
      const duration = endTime.getTime() - currentContraction.startTime.getTime();
      const completedContraction = {
        ...currentContraction,
        endTime,
        duration,
      };
      setContractions([completedContraction, ...contractions]);
      setCurrentContraction(null);
      setTimer(0);
    }
  };

  const resetTimer = () => {
    setContractions([]);
    setCurrentContraction(null);
    setTimer(0);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAverageInterval = () => {
    if (contractions.length < 2) return null;
    const intervals = contractions.slice(0, -1).map((contraction, index) => {
      return contractions[index + 1].startTime.getTime() - contraction.startTime.getTime();
    });
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    return Math.floor(avgInterval / 1000 / 60); // Convert to minutes
  };

  const getAverageDuration = () => {
    if (contractions.length === 0) return null;
    const durations = contractions.filter(c => c.duration).map(c => c.duration!);
    const avgDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    return Math.floor(avgDuration / 1000); // Convert to seconds
  };

  const showAlert = () => {
    const avgInterval = getAverageInterval();
    const avgDuration = getAverageDuration();
    
    if (contractions.length >= 3) {
      if (avgInterval && avgInterval <= 5 && avgDuration && avgDuration >= 60) {
        return {
          type: 'danger',
          message: 'Contractions are regular and strong. Contact your healthcare provider immediately!',
        };
      } else if (avgInterval && avgInterval <= 10) {
        return {
          type: 'warning',
          message: 'Contractions are getting closer. Monitor closely and prepare to contact your provider.',
        };
      }
    }
    return null;
  };

  const alert = showAlert();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.Clock className="w-5 h-5 text-[#2196F3]" />
          Contraction Timer
        </CardTitle>
        <CardDescription>Track the timing and frequency of your contractions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold text-[#2196F3]">
            {formatTime(timer)}
          </div>
          <div className="flex gap-2 justify-center">
            {!currentContraction ? (
              <Button size="lg" onClick={startContraction} className="bg-[#4CAF50] hover:bg-[#45A049]">
                <Icons.Clock className="mr-2 h-5 w-5" />
                Start Contraction
              </Button>
            ) : (
              <Button size="lg" onClick={stopContraction} className="bg-[#F44336] hover:bg-[#D32F2F]">
                <Icons.CheckCircle className="mr-2 h-5 w-5" />
                Stop Contraction
              </Button>
            )}
            {contractions.length > 0 && (
              <Button size="lg" variant="outline" onClick={resetTimer}>
                <Icons.RefreshCw className="mr-2 h-5 w-5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`p-4 rounded-lg ${alert.type === 'danger' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className="flex items-start gap-2">
              <Icons.AlertCircle className={`w-5 h-5 mt-0.5 ${alert.type === 'danger' ? 'text-red-600' : 'text-orange-600'}`} />
              <p className={`text-sm ${alert.type === 'danger' ? 'text-red-800' : 'text-orange-800'}`}>
                {alert.message}
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        {contractions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-[#757575]">Count</p>
              <p className="text-2xl font-bold">{contractions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#757575]">Avg Interval</p>
              <p className="text-2xl font-bold">
                {getAverageInterval() ? `${getAverageInterval()}m` : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#757575]">Avg Duration</p>
              <p className="text-2xl font-bold">
                {getAverageDuration() ? `${getAverageDuration()}s` : '-'}
              </p>
            </div>
          </div>
        )}

        {/* Contraction History */}
        {contractions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Recent Contractions</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {contractions.slice(0, 10).map((contraction, index) => (
                <div key={contraction.id} className="flex items-center justify-between text-sm bg-[#FAFAFA] p-2 rounded">
                  <span className="font-medium">#{contractions.length - index}</span>
                  <span>{contraction.startTime.toLocaleTimeString()}</span>
                  <Badge variant="secondary">
                    {contraction.duration ? formatTime(contraction.duration) : '-'}
                  </Badge>
                  {index < contractions.length - 1 && (
                    <span className="text-xs text-[#757575]">
                      {Math.floor((contraction.startTime.getTime() - contractions[index + 1].startTime.getTime()) / 1000 / 60)}m apart
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

