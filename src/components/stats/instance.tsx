'use client';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

interface InstanceStatsProps {}

export const InstanceStats: React.FC = () => {
  const [instances, setInstances] = useState<IInstance[]>([]);

  useEffect(() => {
    const savedInstances = sessionStorage.getItem('instances');
    if (savedInstances) {
      try {
        setInstances(JSON.parse(savedInstances));
      } catch (error) {
        console.error('Error loading instances:', error);
      }
    }
  }, []);

  const totalInstances = instances.length;
  const xpCount = instances.filter((i) => i.instanceType === enumInstanceType.xp).length;
  const xmcCount = instances.filter((i) => i.instanceType === enumInstanceType.xmc).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instance Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">XP/XM ({xpCount})</span>
              <span className="text-sm font-medium">
                {totalInstances > 0 ? Math.round((xpCount / totalInstances) * 100) : 0}%
              </span>
            </div>
            <Progress className="h-3 bg-blue-500" value={totalInstances > 0 ? (xpCount / totalInstances) * 100 : 0} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">XM Cloud ({xmcCount})</span>
              <span className="text-sm font-medium">
                {totalInstances > 0 ? Math.round((xmcCount / totalInstances) * 100) : 0}%
              </span>
            </div>
            <Progress className="h-3 bg-blue-500" value={totalInstances > 0 ? (xmcCount / totalInstances) * 100 : 0} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
