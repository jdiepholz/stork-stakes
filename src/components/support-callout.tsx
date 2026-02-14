
import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SupportCallout() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
          <Coffee className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-amber-900 dark:text-amber-200">Support the Developer</h4>
          <p className="text-sm text-amber-800/80 dark:text-amber-300/80">
            Stork Bets is open source and free to use. If you enjoy the game, considering buying me a coffee to keep the servers running!
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-200 bg-white text-amber-900 hover:bg-amber-50 hover:text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/50"
            onClick={() => window.open('https://www.buymeacoffee.com/', '_blank')}
          >
            ☕ Buy me a coffee
          </Button>
        </div>
      </div>
    </div>
  );
}
