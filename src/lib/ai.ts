/**
 * AI Behavioral Analysis Module
 * Handles communication with the AI server for emotion detection,
 * engagement scoring, and behavioral analysis
 */

const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:8000';

export interface FrameAnalysis {
  emotions: Record<string, number>;
  attention: number;
  engagement: number;
  gaze_direction?: { x: number; y: number };
}

export interface AudioAnalysis {
  emotion: string;
  confidence: number;
  energy: number;
}

export interface SessionMetrics {
  engagement_score: number;
  attention_score: number;
  emotion_distribution: Record<string, number>;
  gaze_patterns: Record<string, any>;
  speech_emotions: Record<string, number>;
  recommendations: string[];
}

/**
 * Analyze a video frame for emotions and engagement
 */
export async function analyzeFrame(frameBlob: Blob): Promise<FrameAnalysis> {
  try {
    const formData = new FormData();
    formData.append('frame', frameBlob, 'frame.jpg');

    const response = await fetch(`${AI_SERVER_URL}/vision/frame`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`AI server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing frame:', error);
    // Fallback to default values if AI server is unavailable
    return {
      emotions: {},
      attention: 0.5,
      engagement: 0.5,
    };
  }
}

/**
 * Analyze an audio chunk for speech emotions
 */
export async function analyzeAudio(audioBlob: Blob): Promise<AudioAnalysis> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    const response = await fetch(`${AI_SERVER_URL}/audio/chunk`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`AI server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing audio:', error);
    // Fallback
    return {
      emotion: 'neutral',
      confidence: 0.5,
      energy: 0.5,
    };
  }
}

/**
 * Finalize a game session and get aggregated metrics
 */
export async function finalizeSession(
  sessionId: string,
  frames: FrameAnalysis[],
  audioChunks: AudioAnalysis[]
): Promise<SessionMetrics> {
  try {
    const response = await fetch(`${AI_SERVER_URL}/session/finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        frames,
        audio_chunks: audioChunks,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error finalizing session:', error);
    // Fallback metrics based on game performance
    return {
      engagement_score: 0.5,
      attention_score: 0.5,
      emotion_distribution: {},
      gaze_patterns: {},
      speech_emotions: {},
      recommendations: [],
    };
  }
}

/**
 * Calculate fallback engagement metrics from game performance
 */
export function calculateFallbackMetrics(
  accuracy: number,
  reactionTimes: number[],
  errors: number,
  duration: number
): SessionMetrics {
  const avgReactionTime = reactionTimes.length > 0
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    : 0;

  // Enhanced engagement calculation based on multiple factors
  const accuracyWeight = 0.35;
  const reactionTimeWeight = 0.25;
  const completionTimeWeight = 0.20;
  const errorRateWeight = 0.20;

  // Normalize reaction time (lower is better, max 3000ms)
  const reactionTimeScore = Math.max(0, 1 - Math.min(avgReactionTime / 3000, 1));
  
  // Normalize completion time (shorter is better, but not too short)
  const optimalDuration = 120; // 2 minutes is optimal
  const completionTimeScore = Math.max(0, 1 - Math.abs(duration - optimalDuration) / optimalDuration);
  
  // Error rate (lower is better)
  const errorRate = errors / Math.max(duration, 1);
  const errorRateScore = Math.max(0, 1 - Math.min(errorRate, 1));

  const engagementScore = Math.min(
    (accuracy / 100) * accuracyWeight +
    reactionTimeScore * reactionTimeWeight +
    completionTimeScore * completionTimeWeight +
    errorRateScore * errorRateWeight,
    1
  );

  // Attention score based on accuracy and consistency
  const reactionTimeVariance = reactionTimes.length > 1
    ? calculateVariance(reactionTimes)
    : 0;
  const consistencyScore = Math.max(0, 1 - (reactionTimeVariance / 1000000)); // Normalize variance
  const attentionScore = (accuracy * 0.7) + (consistencyScore * 30);

  return {
    engagement_score: engagementScore * 100,
    attention_score: Math.min(attentionScore, 100),
    emotion_distribution: {},
    gaze_patterns: {},
    speech_emotions: {},
    recommendations: generateRecommendations(engagementScore, accuracy, avgReactionTime, duration),
  };
}

function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

function generateRecommendations(engagement: number, accuracy: number, avgReactionTime: number, duration: number): string[] {
  const recommendations: string[] = [];

  if (engagement < 0.5) {
    recommendations.push('Consider shorter game sessions to maintain focus');
  }

  if (accuracy < 70) {
    recommendations.push('Practice with simpler difficulty levels first');
  }

  if (avgReactionTime > 2000) {
    recommendations.push('Try exercises to improve reaction speed');
  }

  if (duration > 300) {
    recommendations.push('Take breaks between sessions to avoid fatigue');
  }

  if (engagement > 0.8 && accuracy > 85) {
    recommendations.push('Great progress! Consider increasing difficulty');
  }

  if (accuracy >= 90 && avgReactionTime < 1500) {
    recommendations.push('Excellent performance! Ready for more challenging games');
  }

  return recommendations.length > 0 ? recommendations : ['Keep practicing to maintain progress'];
}

