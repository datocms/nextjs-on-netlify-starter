import { purgeCache } from '@netlify/functions';

import type { CacheTag } from './cache-tags';

export async function invalidateCacheTags(cacheTags: CacheTag[]) {
	await purgeCache({
		tags: cacheTags
	});
}
