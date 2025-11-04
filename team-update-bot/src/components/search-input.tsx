'use client';

import { Search } from 'lucide-react';
import { Input } from './ui/input';

export default function SearchInput() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search..."
        className="pl-10 w-[200px]"
      />
    </div>
  );
}
