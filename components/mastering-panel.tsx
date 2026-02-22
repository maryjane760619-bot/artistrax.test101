'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Music, Wand2, Check, Loader2 } from 'lucide-react';

interface MasteringPanelProps {
  trackId: string;
  trackTitle: string;
  audioUrl: string;
  onMasteringComplete?: (masteredUrl: string) => void;
}

export function MasteringPanel({ trackId, trackTitle, audioUrl, onMasteringComplete }: MasteringPanelProps) {
  const [style, setStyle] = useState('balanced');
  const [loudness, setLoudness] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobStatus, setJobStatus] = useState<'idle' | 'pending_payment' | 'processing' | 'completed'>('idle');
  const { toast } = useToast();

  const handleMaster = async () => {
    setIsProcessing(true);
    
    try {
      // Create mastering job
      const response = await fetch('/api/mastering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId,
          style,
          loudness: loudness < 33 ? 'low' : loudness > 66 ? 'high' : 'medium'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create mastering job');
      }

      setJobStatus('pending_payment');
      
      toast({
        title: 'Mastering Job Created',
        description: 'Proceed to payment to start mastering.',
      });

      // Open payment (in production, this would integrate with Stripe)
      const payResponse = await fetch(`/api/mastering/pay/${data.job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: 'pm_test' })
      });

      const payData = await payResponse.json();

      if (payResponse.ok) {
        setJobStatus('processing');
        toast({
          title: 'Payment Successful',
          description: 'Mastering in progress... This takes about 30 seconds.',
        });

        // Poll for completion
        pollStatus(data.job.id);
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start mastering',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pollStatus = async (jobId: string) => {
    const checkStatus = setInterval(async () => {
      try {
        const response = await fetch(`/api/mastering?jobId=${jobId}`);
        const data = await response.json();

        if (data.job?.status === 'completed') {
          clearInterval(checkStatus);
          setJobStatus('completed');
          toast({
            title: 'Mastering Complete!',
            description: 'Your track has been professionally mastered.',
          });
          onMasteringComplete?.(data.job.mastered_audio_url);
        } else if (data.job?.status === 'failed') {
          clearInterval(checkStatus);
          setJobStatus('idle');
          toast({
            title: 'Mastering Failed',
            description: 'Please try again or contact support.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 5000); // Check every 5 seconds
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          AI Mastering
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Track Info */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Music className="w-10 h-10 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{trackTitle}</p>
            <p className="text-sm text-muted-foreground">Ready for mastering</p>
          </div>
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Mastering Style</label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warm">Warm - Smooth, analog feel</SelectItem>
              <SelectItem value="balanced">Balanced - Natural, dynamic</SelectItem>
              <SelectItem value="open">Open - Airy, spacious</SelectItem>
              <SelectItem value="loud">Loud - Punchy, competitive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loudness Slider */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Loudness: {loudness}%</label>
          <Slider
            value={[loudness]}
            onValueChange={(value) => setLoudness(value[0])}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low (Dynamic)</span>
            <span>Medium</span>
            <span>High (Loud)</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-2xl font-bold">$9.99</p>
            <p className="text-sm text-muted-foreground">per track</p>
          </div>
          
          <Button 
            onClick={handleMaster}
            disabled={isProcessing || jobStatus === 'processing'}
            className="gap-2"
          >
            {jobStatus === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : jobStatus === 'completed' ? (
              <>
                <Check className="w-4 h-4" />
                Complete
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Master Track
              </>
            )}
          </Button>
        </div>

        {/* Status */}
        {jobStatus === 'processing' && (
          <p className="text-sm text-center text-muted-foreground">
            Mastering in progress... This takes about 30 seconds
          </p>
        )}
      </CardContent>
    </Card>
  );
}