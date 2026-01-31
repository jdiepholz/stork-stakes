'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stork Stakes
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-foreground">
              Baby Prediction Games Made Easy
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Create fun prediction games for your baby shower. Friends and family guess the baby&apos;s weight, length, and birth date. Share excitement before the big day!
            </p>
          </div>
          
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="text-lg px-8 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'} →
          </Button>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          How It Works
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Three simple steps to create memorable baby predictions
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Step 1 - Create Game */}
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
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
                  <Label htmlFor="demo-name" className="text-sm">Game Name</Label>
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
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
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
                  <Label className="text-sm">Birth Weight (lbs)</Label>
                  <Input placeholder="7.5" disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Birth Length (inches)</Label>
                  <Input placeholder="20" disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Birth Date</Label>
                  <Input type="date" disabled className="bg-muted/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 - Results */}
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <CardTitle className="text-xl">Reveal & Celebrate</CardTitle>
              <CardDescription className="text-base">
                See who had the closest guess when baby arrives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Sarah</span>
                  <span className="text-green-600 font-semibold">98 pts</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Mike</span>
                  <span className="text-blue-600 font-semibold">87 pts</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Lisa</span>
                  <span className="text-purple-600 font-semibold">75 pts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features List */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl my-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="text-2xl">🎮</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Easy Game Creation</h3>
                <p className="text-muted-foreground">Set up custom baby prediction games in minutes</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-2xl">🔗</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Shareable Links</h3>
                <p className="text-muted-foreground">Unique links make sharing with guests simple</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-2xl">👥</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Guest Friendly</h3>
                <p className="text-muted-foreground">No account needed for friends to participate</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Live Results</h3>
                <p className="text-muted-foreground">Real-time overview of predictions and scores</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Custom Questions</h3>
                <p className="text-muted-foreground">Default questions for weight, length, and birth date</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-2xl">📱</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Mobile Friendly</h3>
                <p className="text-muted-foreground">Works perfectly on all devices and screen sizes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          What Parents Are Saying
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
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
                &quot;Made our baby shower so much more interactive! Everyone loved making their predictions and we still talk about who was closest. Such a fun keepsake!&quot;
              </p>
              <div className="mt-3 text-yellow-500">★★★★★</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
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
                &quot;Super easy to set up and share. Our family members from across the country could participate. The scoring system made it competitive and fun!&quot;
              </p>
              <div className="mt-3 text-yellow-500">★★★★★</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
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
                &quot;Perfect for our virtual baby shower! Friends could submit predictions anytime, and we revealed the winner after the babies arrived. Highly recommend!&quot;
              </p>
              <div className="mt-3 text-yellow-500">★★★★★</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 mb-16">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2">
          <CardContent className="flex flex-col items-center text-center space-y-6 py-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Start Your Baby Pool?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Join hundreds of expecting parents making their baby shower unforgettable. It&apos;s free and takes less than a minute!
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="text-lg px-12 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Create Your First Game'} →
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card required • Free forever • Set up in 60 seconds
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 Stork Stakes. Made with 💚 for expecting families.</p>
        </div>
      </footer>
    </div>
  );
}
