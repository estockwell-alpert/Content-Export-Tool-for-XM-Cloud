'use client';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

interface InstanceStatsProps {}

export const InstanceStats: React.FC = () => {
  const [instances, setInstances] = useState<IInstance[]>([]);

  useEffect(() => {
    const savedInstances = localStorage.getItem('instances');
    if (savedInstances) {
      try {
        setInstances(JSON.parse(savedInstances));
      } catch (error) {
        console.error('Error loading instances:', error);
      }
    }
  }, []);

  const totalInstances = instances.length;
  const edgeCount = instances.filter((i) => i.instanceType === enumInstanceType.edge).length;
  const authCount = instances.filter((i) => i.instanceType !== enumInstanceType.auth).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instance Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Edge Instances ({edgeCount})</span>
              <span className="text-sm font-medium">
                {totalInstances > 0 ? Math.round((edgeCount / totalInstances) * 100) : 0}%
              </span>
            </div>
            <Progress className="h-3 bg-blue-500" value={totalInstances > 0 ? (edgeCount / totalInstances) * 100 : 0} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Authoring Instances ({authCount})</span>
              <span className="text-sm font-medium">
                {totalInstances > 0 ? Math.round((authCount / totalInstances) * 100) : 0}%
              </span>
            </div>
            <Progress className="h-3 bg-blue-500" value={totalInstances > 0 ? (authCount / totalInstances) * 100 : 0} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
