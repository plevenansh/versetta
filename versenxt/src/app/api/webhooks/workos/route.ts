// import { WorkOS } from '@workos-inc/node';
// import { NextRequest, NextResponse } from 'next/server';
// import { serverTrpc } from '@/trpc/client';

// const workos = new WorkOS(process.env.WORKOS_API_KEY);

// interface WorkOSUserCreatedEvent {
//   id: string;
//   data: {
//     id: string;
//     email: string;
//     object: 'user';
//     last_name: string;
//     created_at: string;
//     first_name: string;
//     updated_at: string;
//     email_verified: boolean;
//     profile_picture_url: string | null;
//   };
//   event: 'user.created';
//   created_at: string;
// }

// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

// export async function POST(req: NextRequest) {
//   console.log('Received webhook request');
  
//   const rawBody = await req.text();
//   console.log('Raw body:', rawBody);
  
//   const sigHeader = req.headers.get('workos-signature');
//   console.log('WorkOS Signature:', sigHeader);

//   if (!sigHeader) {
//     console.error('Missing WorkOS signature');
//     return NextResponse.json({ error: 'Missing WorkOS signature' }, { status: 400 });
//   }

//   if (!process.env.WEBHOOK_SECRET) {
//     console.error('WEBHOOK_SECRET is not set');
//     return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
//   }

//   try {
//     console.log('Attempting to construct event');
//     console.log('WEBHOOK_SECRET (first 4 chars):', process.env.WEBHOOK_SECRET.substring(0, 4));
    
//     let webhook;
//     try {
//       webhook = await workos.webhooks.constructEvent({
//         payload: rawBody,
//         sigHeader: sigHeader,
//         secret: process.env.WEBHOOK_SECRET,
//       });
//     } catch (Error) {
//       console.error('Error constructing event:', Error);
//       return NextResponse.json({ error: `Webhook construction error: ${Error}` }, { status: 400 });
//     }
    
//     console.log('Event constructed successfully');
//     console.log('Webhook event:', webhook.event);

//     if (webhook.event !== 'user.created') {
//       console.log('Received non-user.created event');
//       return NextResponse.json({ received: true, message: 'Non-user.created event acknowledged' }, { status: 200 });
//     }

//     // Type guard function
//     function isUserCreatedEvent(event: any): event is WorkOSUserCreatedEvent {
//       return event.event === 'user.created' &&
//              typeof event.data === 'object' &&
//              typeof event.data.id === 'string' &&
//              typeof event.data.email === 'string' &&
//              typeof event.data.first_name === 'string' &&
//              typeof event.data.last_name === 'string';
//     }

//     if (!isUserCreatedEvent(webhook)) {
//       console.error('Invalid user.created event structure');
//       return NextResponse.json({ error: 'Invalid user.created event structure' }, { status: 400 });
//     }

//     const { id: workOsUserId, email, first_name, last_name } = webhook.data;
//     const name = `${first_name} ${last_name}`.trim();

//     console.log('Creating user:', { email, name, workOsUserId });
//     try {
//       await serverTrpc.users.create.mutate({
//         email,
//         name,
//         workOsUserId,
//       });
//       console.log('User created successfully');
//     } catch (Error) {
//       console.error('Error creating user:', Error);
//       return NextResponse.json({ error: `User creation error: ${Error}` }, { status: 500 });
//     }

//     return NextResponse.json({ received: true, message: 'User created successfully' }, { status: 200 });
//   } catch (err) {
//     console.error('Error processing webhook:', err);
//     return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}` }, { status: 400 });
//   }
// }


import type { NextApiRequest, NextApiResponse } from 'next';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const payload = req.body;
      const sigHeader = req.headers['workos-signature'] as string;

      if (!sigHeader) {
        return res.status(400).json({ error: 'Missing WorkOS signature header' });
      }

      await workos.webhooks.constructEvent({
        payload: payload,
        sigHeader: sigHeader,
        secret: process.env.WEBHOOK_SECRET || '',
      });

      // If verification succeeds, send a 200 status
      res.status(200).end();
    } catch (error) {
      console.error('Error processing WorkOS webhook:', error);
      res.status(400).json({ error: 'Webhook verification failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}