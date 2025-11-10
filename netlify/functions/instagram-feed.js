const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || "hasselbladsfruktochgront";
const IG_APP_ID = process.env.INSTAGRAM_APP_ID || "936619743392459";
const USER_AGENT =
  process.env.INSTAGRAM_USER_AGENT ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const CACHE_SECONDS = Number(process.env.INSTAGRAM_CACHE_SECONDS || 900);

const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

const instagramRequestHeaders = {
  "User-Agent": USER_AGENT,
  "x-ig-app-id": IG_APP_ID,
  Referer: "https://www.instagram.com/",
  "Accept-Language": "sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Dest": "empty",
};

const buildResponse = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    ...baseHeaders,
    "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
    ...extraHeaders,
  },
  body: JSON.stringify(body),
});

const pickPostFields = (edge, username) => {
  const node = edge?.node;
  if (!node) return null;

  const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text || "";
  const takenAt = node.taken_at_timestamp
    ? new Date(node.taken_at_timestamp * 1000).toISOString()
    : null;

  return {
    id: node.id,
    shortcode: node.shortcode,
    caption,
    imageUrl: node.display_url,
    thumbnailUrl: node.thumbnail_src || node.display_url,
    permalink: `https://www.instagram.com/p/${node.shortcode}/`,
    takenAt,
    isVideo: Boolean(node.is_video),
    likeCount: node.edge_liked_by?.count || 0,
    commentCount: node.edge_media_to_comment?.count || 0,
    username,
  };
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return buildResponse(204, {});
  }

  const limitParam = Number(event.queryStringParameters?.limit || 6);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 12) : 6;
  const username = event.queryStringParameters?.username || INSTAGRAM_USERNAME;

  const endpoint = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;

  try {
    const response = await fetch(endpoint, {
      headers: instagramRequestHeaders,
    });

    if (!response.ok) {
      throw new Error(`Instagram responded with ${response.status}`);
    }

    const payload = await response.json();
    const edges = payload?.data?.user?.edge_owner_to_timeline_media?.edges || [];

    const posts = edges
      .slice(0, limit)
      .map((edge) => pickPostFields(edge, username))
      .filter(Boolean);

    return buildResponse(200, {
      username,
      postCount: posts.length,
      posts,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Instagram feed fetch failed", error);
    return buildResponse(502, {
      error: "Kunde inte hämta Instagram-flödet just nu.",
      details: error.message,
    }, {
      "Cache-Control": "public, max-age=60",
    });
  }
};
