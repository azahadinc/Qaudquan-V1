/**
 * Finnhub data normaliser
 * Converts Finnhub news messages to sentiment data
 * Note: Finnhub provides news, not price ticks, so this normalises to a different format
 */

interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface SentimentTick {
  symbol: string;
  timestamp: number;
  headline: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  url: string;
}

export function normaliseFinnhub(raw: FinnhubNews): SentimentTick {
  // Simple sentiment analysis based on keywords
  const text = `${raw.headline} ${raw.summary}`.toLowerCase();
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

  const positiveWords = ['rise', 'gain', 'up', 'bull', 'buy', 'strong', 'growth', 'profit'];
  const negativeWords = ['fall', 'drop', 'down', 'bear', 'sell', 'weak', 'loss', 'decline'];

  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;

  if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  }

  return {
    symbol: raw.related,
    timestamp: raw.datetime * 1000, // Convert to milliseconds
    headline: raw.headline,
    summary: raw.summary,
    sentiment,
    source: raw.source,
    url: raw.url,
  };
}