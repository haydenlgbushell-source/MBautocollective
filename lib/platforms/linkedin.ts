// LinkedIn Posts API (REST) — Company Page posts
// Replaces the deprecated UGC Posts v2 + Assets v2 endpoints.
// Requires Community Management API product with w_organization_social scope.

const LI_BASE = 'https://api.linkedin.com/rest';
const LI_VERSION = '202503'; // LinkedIn API versioning: YYYYMM

export interface LinkedInPostResult {
  postId: string;
  postUrl: string;
}

function liHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'LinkedIn-Version': LI_VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
    'Content-Type': 'application/json',
  };
}

// Uploads an image to LinkedIn and returns the image URN.
async function uploadImage(
  imageUrl: string,
  accessToken: string,
  organizationUrn: string
): Promise<string> {
  // 1. Initialize upload — get a pre-signed upload URL and image URN
  const initRes = await fetch(`${LI_BASE}/images?action=initializeUpload`, {
    method: 'POST',
    headers: liHeaders(accessToken),
    body: JSON.stringify({
      initializeUploadRequest: { owner: organizationUrn },
    }),
  });

  if (!initRes.ok) {
    const err = await initRes.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `LinkedIn image init failed: ${initRes.status}`
    );
  }

  const { value } = await initRes.json();
  const uploadUrl: string | undefined = value?.uploadUrl;
  const imageUrn: string | undefined = value?.image;

  if (!uploadUrl || !imageUrn) {
    throw new Error('LinkedIn image init returned no uploadUrl or image URN');
  }

  // 2. Fetch source image
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to fetch image for LinkedIn: ${imageUrl}`);
  const imgBuffer = await imgRes.arrayBuffer();

  // 3. Upload binary to LinkedIn's pre-signed URL (no auth header — signed URL handles auth)
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': imgRes.headers.get('content-type') ?? 'image/jpeg' },
    body: imgBuffer,
  });

  if (!uploadRes.ok) {
    throw new Error(`LinkedIn image upload failed: ${uploadRes.status}`);
  }

  return imageUrn;
}

// ── Company Page Post ──────────────────────────────────────────────────────

export async function postToLinkedIn(opts: {
  accessToken: string;
  organizationId: string;
  text: string;
  photoUrl?: string;
}): Promise<LinkedInPostResult> {
  const { accessToken, organizationId, text, photoUrl } = opts;
  const organizationUrn = `urn:li:organization:${organizationId}`;

  let imageUrn: string | undefined;
  if (photoUrl) {
    imageUrn = await uploadImage(photoUrl, accessToken, organizationUrn);
  }

  const post: Record<string, unknown> = {
    author: organizationUrn,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  if (imageUrn) {
    post.content = {
      media: {
        title: '',
        id: imageUrn,
      },
    };
  }

  const res = await fetch(`${LI_BASE}/posts`, {
    method: 'POST',
    headers: liHeaders(accessToken),
    body: JSON.stringify(post),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `LinkedIn POST /rest/posts ${res.status}`
    );
  }

  // Post URN is returned in x-restli-id header (e.g. urn:li:share:1234567890)
  const postUrn = res.headers.get('x-restli-id') ?? '';
  const encoded = encodeURIComponent(postUrn);
  return {
    postId: postUrn,
    postUrl: `https://www.linkedin.com/feed/update/${encoded}`,
  };
}
