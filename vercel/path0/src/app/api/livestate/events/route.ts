
import { Emitter } from '@/lib/emitter';

// This tells Vercel to stream the response and not cache it.
export const dynamic = 'force-dynamic';

export async function GET() {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const onStateChange = (data: any) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  Emitter.on('live-state-change', onStateChange);

  // When the client disconnects, stop listening for changes
  writer.closed.catch(() => {
    Emitter.removeListener('live-state-change', onStateChange);
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
