// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { CacheTag } from "@/lib/cache-tags";
import { invalidateCacheTags } from "@/lib/netlify-invalidation-strategy";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  cacheTags: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'POST') {
    if (req.headers['Webhook-Token'] !== process.env.WEBHOOK_TOKEN) {
      res.status(401);
      return;
    }
  
    // Read the req content: that's a comma separated list of cache tags sent
    // by DatoCMS as the body of the webhook.
    const body = req.body;
  
    const data = JSON.parse(body);
  
    const cacheTags = data['entity']['attributes']['tags'].map((tag: string) => tag as CacheTag);
  
    await invalidateCacheTags(cacheTags);
  
    return res.json({ cacheTags });

    return;
  }

  res.status(200).json({ cacheTags: [] });
}
