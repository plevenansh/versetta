import { WorkOS } from '@workos-inc/node';
import { NextRequest, NextResponse } from 'next/server';
import { serverTrpc } from '@/trpc/client';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

interface WorkOSUserCreatedEvent {
  id: string;
  data: {
    id: string;
    email: string;
    object: 'user';
    last_name: string;
    created_at: string;
    first_name: string;
    updated_at: string;
    email_verified: boolean;
    profile_picture_url: string;
  };
  event: 'user.created';
  created_at: string;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sigHeader = req.headers.get('workos-signature');

  if (!sigHeader) {
    return NextResponse.json({ error: 'Missing WorkOS signature' }, { status: 400 });
  }

  try {
    const webhook = await workos.webhooks.constructEvent({
      payload: rawBody,
      sigHeader,
      secret: process.env.WEBHOOK_SECRET!,
    });

    if (webhook.event !== 'user.created') {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Type guard function
    function isUserCreatedEvent(event: any): event is WorkOSUserCreatedEvent {
      return event.event === 'user.created' &&
             typeof event.data === 'object' &&
             typeof event.data.id === 'string' &&
             typeof event.data.email === 'string' &&
             typeof event.data.first_name === 'string' &&
             typeof event.data.last_name === 'string';
    }

    if (!isUserCreatedEvent(webhook)) {
      throw new Error('Invalid user.created event structure');
    }

    const { id: workOsUserId, email, first_name, last_name } = webhook.data;
    const name = `${first_name} ${last_name}`.trim();

    // Directly call the tRPC procedure
    await serverTrpc.users.create.mutate({
      email,
      name,
      workOsUserId,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}` }, { status: 400 });
  }
}