import Mux from '@mux/mux-node';

// Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

const { Video } = mux;

export interface CreateStreamResponse {
  streamKey: string;
  playbackId: string;
  liveStreamId: string;
}

export async function createLiveStream(title: string): Promise<CreateStreamResponse> {
  try {
    const liveStream = await Video.LiveStreams.create({
      playback_policy: ['public'],
      new_asset_settings: {
        playback_policy: ['public'],
      },
      encoding_tier: 'baseline', // Cost-effective
    });

    return {
      streamKey: liveStream.stream_key!,
      playbackId: liveStream.playback_ids![0].id,
      liveStreamId: liveStream.id!,
    };
  } catch (error) {
    console.error('Mux create stream error:', error);
    throw new Error('Failed to create live stream');
  }
}

export async function getLiveStreamStatus(liveStreamId: string) {
  try {
    const liveStream = await Video.LiveStreams.get(liveStreamId);
    return {
      status: liveStream.status,
      isActive: liveStream.status === 'active',
    };
  } catch (error) {
    console.error('Mux get stream error:', error);
    throw new Error('Failed to get stream status');
  }
}

export async function deleteLiveStream(liveStreamId: string) {
  try {
    await Video.LiveStreams.del(liveStreamId);
  } catch (error) {
    console.error('Mux delete stream error:', error);
    // Don't throw - stream might already be deleted
  }
}

export function getPlaybackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function getThumbnailUrl(playbackId: string): string {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg`;
}

export { Video };