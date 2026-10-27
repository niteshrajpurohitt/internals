import { PostWithCompany } from "./types";

/**
 * Fair Feed Interleaving: Prevents any single high-volume blog (e.g. OpenAI, Vercel)
 * from dominating consecutive cards on the general feed while preserving recency.
 */
export function interleavePostsByCompany(
  posts: PostWithCompany[],
  maxConsecutive: number = 2
): PostWithCompany[] {
  if (posts.length <= maxConsecutive) return posts;

  const result: PostWithCompany[] = [];
  const deferred: PostWithCompany[] = [];

  for (const post of posts) {
    const compId = post.company_id;
    const len = result.length;
    let consecutiveCount = 0;

    for (let i = len - 1; i >= 0 && i >= len - maxConsecutive; i--) {
      if (result[i].company_id === compId) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    if (consecutiveCount >= maxConsecutive) {
      deferred.push(post);
    } else {
      result.push(post);
      // Re-inject a deferred post from an alternate company if available
      if (deferred.length > 0) {
        const altIndex = deferred.findIndex((d) => d.company_id !== compId);
        if (altIndex !== -1) {
          result.push(deferred.splice(altIndex, 1)[0]);
        }
      }
    }
  }

  // Append any remaining deferred items
  result.push(...deferred);
  return result;
}

