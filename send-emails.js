import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const contacts = [
  {
    email: 'myselfgopie@gmail.com',
    name: 'Tosh',
    subject: "How Anakin's pricing intelligence can supercharge your GTM motion",
    body: `Hi Tosh,

Given your focus on AI-led growth and GTM strategy at Anakin, I wanted to share a quick overview of what Anakin does.

Anakin (YC S21) is a competitive pricing intelligence platform built for large eCommerce brands and retailers. We monitor competitor pricing, product assortments, and availability across 30+ countries in real time — covering 100M+ SKUs.

Companies like Walmart and Uber use Anakin to automatically reprice products at scale, boosting revenue by up to 12%.

Happy to share case studies or talk through use cases if helpful.

Best,
Gopiechand S S`
  },
  {
    email: 'myselfgopie@gmail.com',
    name: 'Viral',
    subject: 'Anakin — Enterprise Pricing Intelligence for Your Book of Business',
    body: `Hi Viral,

With your enterprise sales background — from Danaher and SenseHawk to now leading sales at Anakin — you know how much competitive data matters to close deals.

Anakin (YC S21) is a real-time competitive pricing and market intelligence platform. Our pricing engine automatically adjusts prices across hundreds of millions of SKUs in 30+ countries.

We're SOC 2 + ISO 27001 certified and already working with several multi-billion dollar companies.

Would love to connect and see if there's a fit.

Best,
Gopiechand S S`
  },
  {
    email: 'myselfgopie@gmail.com',
    name: 'Viral',
    subject: "Quick intro to Anakin's pricing intelligence platform",
    body: `Hi Viral,

Reaching out via your personal email — hope that's okay.

Anakin (YC S21) is a competitive pricing intelligence platform that helps eCommerce companies track competitor prices and market movements in real time, across 30+ countries. Companies like Walmart and Uber use us to protect margins and grow revenue.

We're profitable, growing fast, and backed by Y Combinator and HOF Capital.

Happy to share more if this resonates.

Best,
Gopiechand S S`
  }
];

async function sendEmails() {
  for (const contact of contacts) {
    try {
      const response = await resend.emails.send({
        from: 'Gopiechand <onboarding@resend.dev>',
        to: contact.email,
        subject: contact.subject,
        text: contact.body
      });
      console.log(`Full response for ${contact.name}:`, JSON.stringify(response));
    } catch (err) {
      console.error(`❌ Failed for ${contact.name}:`, err.message);
    }
    // Wait 1 second between each email
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

sendEmails();