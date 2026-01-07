'use client';

import { useWalletContext } from '@/hooks/use-wallet-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Zap, Shield, Gift, Flame } from 'lucide-react';

interface ConnectPromptProps {
  title?: string;
  description?: string;
}

const benefits = [
  {
    icon: Zap,
    title: 'Instant Payments',
    description: 'One-tap crypto purchases during live streams',
  },
  {
    icon: Shield,
    title: 'Verified Reviews',
    description: 'Only purchasers can leave authentic reviews',
  },
  {
    icon: Gift,
    title: 'Watch-to-Earn',
    description: 'Earn rewards for watching live streams',
  },
];

export function ConnectPrompt({
  title = 'Connect to Continue',
  description = 'Connect your wallet to access all features of Ember live commerce.',
}: ConnectPromptProps) {
  const { login, isReady } = useWalletContext();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-ember/10 flex items-center justify-center">
            <Flame className="h-8 w-8 text-ember" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <benefit.icon className="h-5 w-5 text-ember" />
                </div>
                <div>
                  <h4 className="font-medium">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={login}
            disabled={!isReady}
            className="w-full bg-ember hover:bg-ember/90"
            size="lg"
          >
            <Wallet className="h-5 w-5 mr-2" />
            {isReady ? 'Connect Wallet' : 'Loading...'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By connecting, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
