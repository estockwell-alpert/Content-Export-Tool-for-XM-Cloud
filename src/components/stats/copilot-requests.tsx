import { BadgeAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface CopilotRequestStatsProps {}

export const CopilotRequestStats: React.FC<CopilotRequestStatsProps> = () => {
  return (
    <Card className="relative">
      <div className="absolute top-2 right-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <BadgeAlert className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Coming Soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Content Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Prompts</span>
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
};
