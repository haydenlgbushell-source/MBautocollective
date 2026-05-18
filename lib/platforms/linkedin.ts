// LinkedIn Marketing API — Company Page posts (UGC Posts API v2)

const LI_BASE = 'https://api.linkedin.com/v2';

export interface LinkedInPostResult {
  postId: string;
  postUrl: string;
}

// Fetches an image from a URL and uploads it to LinkedIn, returning the asset URN.
async function registerAndUploadImage(
  imageUrl: string,
  accessToken: string,
  organizationUrn: string
): Promise<string> {
  // 1. Register upload
  const registerRes = await fetch(`${LI_BASE}/assets?action=registerUpload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: organizationUrn,
        serviceRelationships: [
          { relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' },
        ],
      },
    }),
  });

  if (!registerRes.ok) {
    const err = await registerRes.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `LinkedIn register upload ${registerRes.status}`
    );
  }

  const registerData = await registerRes.json();
  const uploadUrl: string | undefined =
    registerData.value?.uploadMechanism?.[
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
    ]?.uploadUrl;
  const asset: string | undefined = registerData.value?.asset;

  if (!uploadUrl || !asset) throw new Error('LinkedIn image registration returned no upload URL');

  // 2. Fetch the source image
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to fetch image for LinkedIn: ${imageUrl}`);
  const imgBuffer = await imgRes.arrayBuffer();

  // 3. Upload binary to LinkedIn
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': imgRes.headers.get('content-type') ?? 'image/jpeg',
    },
    body: imgBuffer,
  });

  if (!uploadRes.ok) {
    throw new Error(`LinkedIn image upload failed: ${uploadRes.status}`);
  }

  return asset;
}

// ── Company Page Post ──────────────────────────────────────────────────────

export async function postToLinkedIn(opts: {
  accessToken: string;
  organizationId?: string;
  memberId?: string;
  text: string;
  photoUrl?: string;
}): Promise<LinkedInPostResult> {
  const { accessToken, organizationId, memberId, text, photoUrl } = opts;
  if (!organizationId && !memberId) throw new Error('LinkedIn: organizationId or memberId required');
  const authorUrn = organizationId
    ? `urn:li:organization:${organizationId}`
    : `urn:li:person:${memberId}`;
  const organizationUrn = authorUrn;

  let mediaSection: object | undefined;

  if (photoUrl) {
    const asset = await registerAndUploadImage(photoUrl, accessToken, organizationUrn);
    mediaSection = [
      {
        status: 'READY',
        description: { text: '' },
        media: asset,
        title: { text: '' },
      },
    ];
  }

  const ugcPost = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: photoUrl ? 'IMAGE' : 'NONE',
        ...(mediaSection ? { media: mediaSection } : {}),
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const res = await fetch(`${LI_BASE}/ugcPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(ugcPost),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `LinkedIn ugcPosts ${res.status}`
    );
  }

  // LinkedIn returns the post URN in the x-restli-id header
  const postUrn = res.headers.get('x-restli-id') ?? '';
  const encoded = encodeURIComponent(postUrn);
  return {
    postId: postUrn,
    postUrl: `https://www.linkedin.com/feed/update/${encoded}`,
  };
}
