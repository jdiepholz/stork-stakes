'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/join');
  };

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
              Stork Stakes
            </h1>
            <p className="text-foreground text-2xl font-semibold md:text-3xl">
              Baby Prediction Games Made Easy
            </p>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
              Create fun prediction games for your baby shower. Friends and family guess the
              baby&apos;s weight, length, and birth date. Share excitement before the big day!
            </p>
          </div>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="h-auto px-8 py-6 text-lg font-semibold shadow-lg transition-all hover:shadow-xl"
          >
            Get Started →
          </Button>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">How It Works</h2>
        <p className="text-muted-foreground mb-12 text-center text-lg">
          Three simple steps to create memorable baby predictions
        </p>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {/* Step 1 - Create Game */}
          <Card className="hover:border-primary/50 border-2 transition-all">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <CardTitle className="text-xl">Create Your Game</CardTitle>
              <CardDescription className="text-base">
                Set up a new baby prediction game in seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 opacity-90">
                <div className="space-y-2">
                  <Label htmlFor="demo-name" className="text-sm">
                    Game Name
                  </Label>
                  <Input
                    id="demo-name"
                    placeholder="Emma's Baby Pool"
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <Button disabled variant="default" className="w-full">
                  Create Game
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 - Share & Predict */}
          <Card className="hover:border-primary/50 border-2 transition-all">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</span>
              </div>
              <CardTitle className="text-xl">Share & Get Predictions</CardTitle>
              <CardDescription className="text-base">
                Friends make their guesses for baby details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm">Birth Weight (g)</Label>
                  <Input placeholder="3400" disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Birth Length (cm)</Label>
                  <Input placeholder="50" disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Birth Date</Label>
                  <Input type="date" disabled className="bg-muted/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 - Results */}
          <Card className="hover:border-primary/50 border-2 transition-all">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <CardTitle className="text-xl">Reveal & Celebrate</CardTitle>
              <CardDescription className="text-base">
                See who had the closest guess when baby arrives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                  <span className="font-medium">Sarah</span>
                  <span className="font-semibold text-green-600">98 pts</span>
                </div>
                <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                  <span className="font-medium">Mike</span>
                  <span className="font-semibold text-blue-600">87 pts</span>
                </div>
                <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                  <span className="font-medium">Lisa</span>
                  <span className="font-semibold text-purple-600">75 pts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features List */}
      <section className="bg-muted/30 container mx-auto my-16 rounded-3xl px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Everything You Need</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="text-2xl">🎮</div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Easy Game Creation</h3>
                <p className="text-muted-foreground">
                  Set up custom baby prediction games in minutes
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">🔗</div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Shareable Links</h3>
                <p className="text-muted-foreground">
                  Unique links make sharing with guests simple
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">👥</div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Guest Friendly</h3>
                <p className="text-muted-foreground">
                  No account needed for friends to participate
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Live Results</h3>
                <p className="text-muted-foreground">
                  Real-time overview of predictions and scores
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Custom Questions</h3>
                <p className="text-muted-foreground">
                  Default questions for weight, length, and birth date
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">📱</div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Mobile Friendly</h3>
                <p className="text-muted-foreground">
                  Works perfectly on all devices and screen sizes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          What Parents Are Saying
        </h2>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-lg font-bold text-white">
                  S
                </div>
                <div>
                  <CardTitle className="text-base">Sarah Johnson</CardTitle>
                  <CardDescription className="text-sm">First-time mom</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                &quot;Made our baby shower so much more interactive! Everyone loved making their
                predictions and we still talk about who was closest. Such a fun keepsake!&quot;
              </p>
              <div className="mt-3 text-yellow-500">★★★★★</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-lg font-bold text-white">
                  M
                </div>
                <div>
                  <CardTitle className="text-base">Michael Chen</CardTitle>
                  <CardDescription className="text-sm">Expecting father</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                &quot;Super easy to set up and share. Our family members from across the country
                could participate. The scoring system made it competitive and fun!&quot;
              </p>
              <div className="mt-3 text-yellow-500">★★★★★</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-lg font-bold text-white">
                  E
                </div>
                <div>
                  <CardTitle className="text-base">Emily Rodriguez</CardTitle>
                  <CardDescription className="text-sm">Mom of twins</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                &quot;Perfect for our virtual baby shower! Friends could submit predictions anytime,
                and we revealed the winner after the babies arrived. Highly recommend!&quot;
              </p>
              <div className="mt-3 text-yellow-500">★★★★★</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto mb-16 px-4 py-16">
        <Card className="mx-auto max-w-3xl border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <CardContent className="flex flex-col items-center space-y-6 py-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to Start Your Baby Pool?</h2>
            <p className="text-muted-foreground max-w-xl text-lg">
              Join hundreds of expecting parents making their baby shower unforgettable. It&apos;s
              free and takes less than a minute!
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="h-auto px-12 py-6 text-lg font-semibold shadow-lg transition-all hover:shadow-xl"
            >
              Get Started →
            </Button>
            <p className="text-muted-foreground text-sm">
              No credit card required • Free forever • Set up in 60 seconds
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="text-muted-foreground container mx-auto px-4 text-center">
          <p>© 2026 Stork Stakes. Made with 💚 for expecting families.</p>
        </div>
      </footer>
    </div>
  );
}
