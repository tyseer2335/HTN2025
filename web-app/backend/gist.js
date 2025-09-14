// backend/gist.js
import { request } from 'undici';

export async function publishGist({ gistId, filename, content }) {
  const body = gistId
    ? { files: { [filename]: { content: JSON.stringify(content, null, 2) } } }
    : {
        description: 'MemoryMosaic Story JSON',
        public: true,
        files: { [filename]: { content: JSON.stringify(content, null, 2) } },
      };

  const url = gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists';
  const method = gistId ? 'PATCH' : 'POST';

  const r = await request(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'User-Agent': 'mm-story-uploader',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify(body),
  });

  if ((r.statusCode || 500) >= 300) {
    const errText = await r.body.text();
    throw new Error(`Gist ${method} failed ${r.statusCode}: ${errText.slice(0, 400)}`);
  }

  const data = await r.body.json();
  const id = data.id;
  const owner = data?.owner?.login || process.env.GITHUB_USER || 'anonymous';
  
  // Use jsDelivr CDN URL which automatically bypasses cache
  const cdnUrl = `https://cdn.jsdelivr.net/gh/gist/${owner}/${id}/raw/${encodeURIComponent(filename)}`;
  // Backup direct URL from GitHub
  const directUrl = `https://gist.githubusercontent.com/${owner}/${id}/raw/${encodeURIComponent(filename)}`;
  
  return { 
    gistId: id, 
    stableRawUrl: cdnUrl,     // Primary URL (CDN with auto cache-bust)
    directUrl: directUrl,     // Backup direct URL
    htmlUrl: data.html_url 
  };
}