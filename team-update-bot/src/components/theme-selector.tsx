'use client';

import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

export function ThemeSelector() {
  return (
    <Button variant="ghost" size="sm">
      <Palette className="h-4 w-4" />
    </Button>
  );
}
