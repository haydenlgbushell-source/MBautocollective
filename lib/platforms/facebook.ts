// Facebook Graph API — Page posts + Instagram Business feed posts

const GRAPH = 'https://graph.facebook.com/v21.0';

export interface FacebookPostResult {
  postId: string;
  postUrl: string;
}

export interface InstagramPostResult {
  mediaId: string;
  permalink?: string;
}

// ── Facebook Page ──────────────────────────────────────────────────────────

export async function postToFacebook(opts: {
  pageId: string;
  pageToken: string;
  message: string;
  photoUrl?: string;
}): Promise<FacebookPostResult> {
  const { pageId, pageToken, message, photoUrl } = opts;

  if (photoUrl) {
    const res = await fetch(`${GRAPH}/${pageId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: photoUrl, message, access_token: pageToken }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `Facebook photos API ${res.status}`);
    }
    const data = await res.json();
    // /photos returns { id, post_id }; post_id is the feed post
    const pid = data.post_id ?? data.id;
    return {
      postId: pid,
      postUrl: `https://www.facebook.com/${pid.replace('_', '/posts/')}`,
    };
  }

  // Text-only feed post
  const res = await fetch(`${GRAPH}/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, access_token: pageToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `Facebook feed API ${res.status}`);
  }
  const data = await res.json();
  return {
    postId: data.id,
    postUrl: `https://www.facebook.com/${data.id.replace('_', '/posts/')}`,
  };
}

// ── Instagram Business (via Facebook Graph API) ────────────────────────────

export async function postToInstagram(opts: {
  igUserId: string;
  pageToken: string;
  caption: string;
  photoUrls: string[];
}): Promise<InstagramPostResult> {
  const { igUserId, pageToken, caption, photoUrls } = opts;

  const photos = photoUrls.slice(0, 10); // carousel max 10

  if (photos.length === 0) throw new Error('At least one photo required for Instagram');

  if (photos.length === 1) {
    // Single image post
    const containerRes = await fetch(`${GRAPH}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: photos[0], caption, access_token: pageToken }),
    });
    if (!containerRes.ok) {
      const err = await containerRes.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `Instagram media create ${containerRes.status}`);
    }
    const { id: creationId } = await containerRes.json();

    const pubRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: creationId, access_token: pageToken }),
    });
    if (!pubRes.ok) {
      const err = await pubRes.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `Instagram publish ${pubRes.status}`);
    }
    const { id: mediaId } = await pubRes.json();
    return { mediaId };
  }

  // Carousel post — create child containers first
  const childIds: string[] = [];
  for (const url of photos) {
    const res = await fetch(`${GRAPH}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: pageToken }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `Instagram child container ${res.status}`);
    }
    const { id } = await res.json();
    childIds.push(id);
  }

  // Create carousel container
  const carouselRes = await fetch(`${GRAPH}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption,
      access_token: pageToken,
    }),
  });
  if (!carouselRes.ok) {
    const err = await carouselRes.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `Instagram carousel create ${carouselRes.status}`);
  }
  const { id: carouselId } = await carouselRes.json();

  // Publish carousel
  const pubRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: carouselId, access_token: pageToken }),
  });
  if (!pubRes.ok) {
    const err = await pubRes.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `Instagram carousel publish ${pubRes.status}`);
  }
  const { id: mediaId } = await pubRes.json();
  return { mediaId };
}
