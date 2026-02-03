'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Upload,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Film,
  Clock,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface VODAnalysisSectionProps {
  teamId: string;
  teamName: string;
}

// Mock data for demo - in production this would come from API
const MOCK_VOD = {
  id: 'vod_demo_1',
  title: 'Match Analysis - Round Breakdown',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  thumbnailUrl: '/api/placeholder/640/360',
  durationSeconds: 120,
  status: 'ready',
  uploadedAt: new Date().toISOString(),
};

const MOCK_KEY_MOMENTS = [
  {
    id: '1',
    timestamp: 15,
    title: 'Pistol Round Ace',
    description: 'Player TenZ secures 5K with Sheriff',
    momentType: 'ace',
    importance: 'critical',
  },
  {
    id: '2',
    timestamp: 45,
    title: 'Clutch 1v3',
    description: 'Yay clutches crucial round with 20HP',
    momentType: 'clutch',
    importance: 'high',
  },
  {
    id: '3',
    timestamp: 75,
    title: 'Strategic Execute',
    description: 'Perfect A-site execute with utility coordination',
    momentType: 'strategic_play',
    importance: 'high',
  },
  {
    id: '4',
    timestamp: 100,
    title: 'Round Win',
    description: 'Clean round victory with minimal trades',
    momentType: 'round_win',
    importance: 'medium',
  },
];

const MOCK_ANALYSIS = {
  summary: 'Strong individual performances with strategic depth in mid-round adjustments.',
  strengths: [
    'Excellent pistol round win rate (75%)',
    'Effective utility usage in post-plant situations',
    'Strong trader efficiency (85%)',
  ],
  weaknesses: [
    'Slow rotations on defense (avg 12s)',
    'Predictable A-site default setup',
    'Low eco round conversion (30%)',
  ],
  keyTakeaways: [
    'Continue aggressive pistol strategies',
    'Work on faster rotation timing',
    'Vary defense setups to counter opponent reads',
  ],
};

export function VODAnalysisSection({ teamId, teamName }: VODAnalysisSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasVOD, setHasVOD] = useState(true); // Set to true for demo
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        setHasVOD(true);
      }, 3000);
    }, 2000);
  };

  const seekToMoment = (timestamp: number) => {
    setCurrentTime(timestamp);
    const video = document.getElementById('vod-player') as HTMLVideoElement;
    if (video) {
      video.currentTime = timestamp;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getMomentIcon = (type: string) => {
    switch (type) {
      case 'ace':
        return <Star className="h-4 w-4" />;
      case 'clutch':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Film className="h-4 w-4" />;
    }
  };

  if (!hasVOD && !uploading && !processing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>VOD Analysis</CardTitle>
            <CardDescription>
              Upload a VOD to get AI-powered analysis of key moments, player performance, and tactical insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold">No VOD uploaded yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Upload a match VOD to receive automated analysis including key moments, player highlights, and tactical breakdowns
                </p>
              </div>
              <Button onClick={handleUpload} size="lg">
                <Upload className="h-4 w-4 mr-2" />
                Upload VOD
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (uploading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 text-center">
              <h3 className="font-semibold">Uploading VOD...</h3>
              <p className="text-sm text-muted-foreground">Please wait while we upload your video</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (processing) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Film className="h-6 w-6 animate-pulse text-primary" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-semibold">Processing VOD...</h3>
              <p className="text-sm text-muted-foreground">
                AI is analyzing the video for key moments and insights
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{MOCK_VOD.title}</CardTitle>
              <CardDescription className="mt-1">
                Duration: {Math.floor(MOCK_VOD.durationSeconds / 60)}:{(MOCK_VOD.durationSeconds % 60)
                  .toString()
                  .padStart(2, '0')}
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Analysis Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Element */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              id="vod-player"
              className="w-full h-full"
              controls
              src={MOCK_VOD.videoUrl}
              poster={MOCK_VOD.thumbnailUrl}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>

          {/* Show/Hide Analysis Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAnalysis(!showAnalysis)}
          >
            {showAnalysis ? 'Hide' : 'Show'} AI Analysis
          </Button>
        </CardContent>
      </Card>

      {/* AI Analysis (collapsible) */}
      {showAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI-Generated Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">{MOCK_ANALYSIS.summary}</p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-semibold mb-3 text-green-600">Strengths</h4>
              <ul className="space-y-2">
                {MOCK_ANALYSIS.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="font-semibold mb-3 text-red-600">Areas for Improvement</h4>
              <ul className="space-y-2">
                {MOCK_ANALYSIS.weaknesses.map((weakness, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Takeaways */}
            <div>
              <h4 className="font-semibold mb-3">Key Takeaways</h4>
              <ul className="space-y-2">
                {MOCK_ANALYSIS.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Moments Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Key Moments
          </CardTitle>
          <CardDescription>Click to jump to important moments in the VOD</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_KEY_MOMENTS.map((moment) => (
              <div
                key={moment.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => seekToMoment(moment.timestamp)}
              >
                <div className="flex-shrink-0 mt-0.5">{getMomentIcon(moment.momentType)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{moment.title}</span>
                    <Badge variant={getImportanceColor(moment.importance)} className="text-xs">
                      {moment.importance}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{moment.description}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {Math.floor(moment.timestamp / 60)}:{(moment.timestamp % 60)
                      .toString()
                      .padStart(2, '0')}
                  </span>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
