import Link from 'next/link';
import { SupportButton, SupportButtonIconOnly } from '@/components/support-button';

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-4 md:h-16 md:flex-row md:py-0 px-4 sm:px-8">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          Built with ❤️ for new parents.
          <span className="hidden md:inline"> | </span> 
          <span className="block md:inline">
            <Link href="/impressum" className="hover:underline">Impressum</Link> • <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
          </span>
        </p>
        <div className="flex items-center gap-2">
          <SupportButton />
          <SupportButtonIconOnly />
        </div>
      </div>
    </footer>
  );
}
