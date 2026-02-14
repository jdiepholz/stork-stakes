'use client';

import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SupportButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="hidden gap-2 bg-amber-100 text-amber-900 hover:bg-amber-200 hover:text-amber-950 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50 sm:flex"
      onClick={() => window.open('https://www.buymeacoffee.com/', '_blank')}
    >
      <Coffee className="h-4 w-4" />
      <span>Buy me a coffee</span>
    </Button>
  );
}

export function SupportButtonIconOnly() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30 sm:hidden"
      onClick={() => window.open('https://www.buymeacoffee.com/', '_blank')}
    >
      <Coffee className="h-5 w-5" />
      <span className="sr-only">Buy me a coffee</span>
    </Button>
  );
}
