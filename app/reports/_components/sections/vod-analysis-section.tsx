'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Film, Upload, Clock, Target, TrendingUp, Zap, Activity } from 'lucide-react';

interface VODAnalysisSectionProps {
  teamId: string;
  teamName: string;
}

// Mock AI analysis data
const MOCK_ANALYSIS = {
  strengths: [
    'Excellent site execution on Haven A-site',
    'Strong post-plant positioning and utility usage',
    'Effective map control in mid rounds',
    'Good trade discipline in contested areas',
  ],
  improvements: [
    'Rotate speed could be faster on B-hits',
    'Occasional overpeeks in advantage situations',
    'Early round information gathering needs work',
  ],
  keyMoments: [
    { time: 45, title: 'Ace - Cryo', type: 'ace', description: '1v3 clutch on A-site' },
    { time: 182, title: 'Perfect Execute', type: 'strategic', description: 'Flawless B-site take with util' },
    { time: 298, title: 'Eco Win', type: 'eco', description: 'Sheriff rush success' },
    { time: 445, title: 'Retake Success', type: 'tactical', description: '3v5 retake executed perfectly' },
  ],
  stats: {
    avgRoundTime: '52s',
    siteSuccessRate: 'A: 68% | B: 74%',
    firstBloodRate: '58%',
    clutchWinRate: '45%',
  }
};

export function VODAnalysisSection({ teamId, teamName }: VODAnalysisSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVOD, setShowVOD] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowVOD(true);
  };

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {!showVOD && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                VOD Analysis
              </CardTitle>
              <Badge variant="outline">AI Powered</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!isProcessing ? (
              <div className="text-center py-12">
                <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Match VOD</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload a match recording to get AI-powered insights
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
                <h3 className="text-lg font-semibold mb-2">Processing VOD...</h3>
                <p className="text-sm text-muted-foreground">
                  Analyzing gameplay, detecting key moments
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* VOD Player + Insights - Side by Side */}
      {showVOD && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
          {/* Left: Video Player + Timeline */}
          <div className="flex flex-col gap-4">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Match Recording</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    src="https://fbloukfgdjvwzdgrcnzt.supabase.co/storage/v1/object/public/videos/Hackathon-detected-1.mp4"
                  />
                </div>

                {/* Key Moments Timeline */}
                <div className="space-y-2 overflow-y-auto flex-1">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Key Moments
                  </h4>
                  <div className="space-y-1">
                    {MOCK_ANALYSIS.keyMoments.map((moment, i) => (
                      <button
                        key={i}
                        onClick={() => seekTo(moment.time)}
                        className="w-full text-left p-2 rounded border border-border hover:bg-muted/50 transition-colors text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{moment.title}</span>
                          <span className="text-muted-foreground">
                            {Math.floor(moment.time / 60)}:{(moment.time % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs">{moment.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: AI Insights */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-2">
              <Card className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Avg Round Time</div>
                <div className="text-xl font-bold">{MOCK_ANALYSIS.stats.avgRoundTime}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground mb-1">First Blood</div>
                <div className="text-xl font-bold">{MOCK_ANALYSIS.stats.firstBloodRate}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Site Success</div>
                <div className="text-xs font-semibold">{MOCK_ANALYSIS.stats.siteSuccessRate}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Clutch Rate</div>
                <div className="text-xl font-bold">{MOCK_ANALYSIS.stats.clutchWinRate}</div>
              </Card>
            </div>

            {/* Strengths */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {MOCK_ANALYSIS.strengths.map((strength, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Zap className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-500">
                  <Target className="h-4 w-4" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {MOCK_ANALYSIS.improvements.map((improvement, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Activity className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
