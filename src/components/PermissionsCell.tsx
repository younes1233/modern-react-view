import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PermissionsCellProps {
  permissions: string;
  userName: string;
}

export function PermissionsCell({ permissions, userName }: PermissionsCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!permissions || permissions === 'N/A') {
    return <span className="text-sm text-muted-foreground">N/A</span>;
  }

  const permissionsList = permissions.split(',').map(p => p.trim()).filter(Boolean);
  const visiblePermissions = permissionsList.slice(0, 3);
  const remainingCount = permissionsList.length - 3;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visiblePermissions.map((permission, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {permission}
        </Badge>
      ))}
      
      {remainingCount > 0 && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs text-primary hover:text-primary-foreground"
            >
              +{remainingCount} more
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>All Permissions - {userName}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <div className="flex flex-wrap gap-2 p-4">
                {permissionsList.map((permission, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}