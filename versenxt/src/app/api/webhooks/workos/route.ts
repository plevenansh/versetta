import type { NextApiRequest, NextApiResponse } from 'next';
import { WorkOS } from '@workos-inc/node';
import { appRouter } from '@/server/index';
import { serverTrpc } from '@/trpc/client';
import { NextRequest, NextResponse } from 'next/server';

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

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // Parse the raw body
  const rawBody = await getRawBody(req);
  const sigHeader = req.headers['workos-signature'] as string;

  if (!sigHeader) {
    return NextResponse.json({ error: 'Missing WorkOS signature' }, { status: 400 });
  }

  try {
    const webhook = await workos.webhooks.constructEvent({
      payload: rawBody.toString(),
      sigHeader,
      secret: process.env.WEBHOOK_SECRET!,
    });

    if (webhook.event !== 'user.created') {
      return res.status(200).end();
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

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`);
  }
}

// Helper function to get raw body
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      resolve(Buffer.from(body));
    });
    req.on('error', reject);
  });
}