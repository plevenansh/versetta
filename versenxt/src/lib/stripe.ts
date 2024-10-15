import Stripe from 'stripe';
 
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export { stripeInstance as stripe };