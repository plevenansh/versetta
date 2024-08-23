// // app/api/webhook/workos/route.ts

// import { NextResponse } from 'next/server';
// import { WorkOS } from '@workos-inc/node';

// const workos = new WorkOS(process.env.WORKOS_API_KEY);
// const webhookSecret = process.env.WORKOS_WEBHOOK_SECRET;

// export async function POST(request: Request) {
//   const body = await request.text();
//   const signature = request.headers.get('workos-signature');
// console.log('body', body);
//   if (!signature) {
//     return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
//   }

//   try {
//     const event = workos.webhooks.constructEvent({
//       payload: body,
//       sigHeader: signature,
//       secret: webhookSecret,
//     });

//     if (event.type === 'user.created') {
//       const { id, email, first_name, last_name } = event.data;

//       // Instead of creating the user here, we'll call our tRPC mutation
//       // This will be handled in the next step
//       const response = await fetch('http://localhost:3000/api/trpc/users.createFromWorkOS', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           workOsUserId: id,
//           email,
//           name: `${first_name} ${last_name}`.trim(),
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to create user');
//       }

//       console.log('User creation triggered');
//       return NextResponse.json({ success: true });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     return NextResponse.json({ error: 'Invalid signature or user creation failed' }, { status: 400 });
//   }
// }