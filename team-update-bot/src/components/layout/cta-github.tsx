'use client';

import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

export default function CtaGithub() {
  return (
    <Button variant="ghost" size="sm">
      <Github className="h-4 w-4" />
    </Button>
  );
}
