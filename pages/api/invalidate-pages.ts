// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { CacheTag } from "@/lib/cache-tags";
import { invalidateCacheTags } from "@/lib/netlify-invalidation-strategy";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  cacheTags: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    if (req.method === 'POST') {
      if (req.headers['webhook-token'] !== process.env.WEBHOOK_TOKEN) {
        res.status(401);
      }
      else {
        const data = req.body;
      
        const cacheTags = data['entity']['attributes']['tags'].map((tag: string) => tag as CacheTag);
      
        await invalidateCacheTags(cacheTags);
      
        res.status(200).json({ cacheTags });
      }
    }
    else {
      res.status(200).json({ cacheTags: [] });
    }
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
}
