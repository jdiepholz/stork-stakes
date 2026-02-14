import Link from 'next/link';
import { SupportButton, SupportButtonIconOnly } from '@/components/support-button';

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 sm:px-8">
        <p className="text-sm text-muted-foreground">
          Built with ❤️ for new parents.
          <span className="hidden sm:inline"> | </span> 
          <span className="block sm:inline">
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
