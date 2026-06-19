// One-time: create the Pro ($19/mo) and Business ($49/mo) products/prices in your Stripe
// (test mode) and write their price IDs into apps/api/.env. Run: pnpm --filter @kanban/api stripe:setup
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Stripe from 'stripe';

const envPath = fileURLToPath(new URL('../.env', import.meta.url));
const env = readFileSync(envPath, 'utf8');
const secret = env.match(/^STRIPE_SECRET_KEY=(.+)$/m)?.[1]?.trim();

if (!secret || secret.startsWith('sk_test_...')) {
  console.error('Set a real STRIPE_SECRET_KEY in apps/api/.env before running this.');
  process.exit(1);
}

const stripe = new Stripe(secret);

async function createPrice(name, unitAmount) {
  const product = await stripe.products.create({ name });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  return price.id;
}

const pro = await createPrice('Lane Pro', 1900);
const business = await createPrice('Lane Business', 4900);

const updated = env
  .replace(/^STRIPE_PRICE_PRO=.*$/m, `STRIPE_PRICE_PRO=${pro}`)
  .replace(/^STRIPE_PRICE_BUSINESS=.*$/m, `STRIPE_PRICE_BUSINESS=${business}`);
writeFileSync(envPath, updated);

console.log(
  `Created Stripe prices and wrote them to apps/api/.env:\n  Pro:      ${pro}\n  Business: ${business}`,
);
