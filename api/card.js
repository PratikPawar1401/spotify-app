const { getCurrentlyPlaying } = require("../lib/spotify");

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function buildCard({ playing, status, source, song, artist, albumArt, progress, duration, songUrl }) {
  const stateLabel = source === "recently_played" ? "LAST PLAYED" : status === "paused" ? "PAUSED" : playing ? "CURRENTLY PLAYING" : "NOT PLAYING";
  const title = song ? song : "Not playing right now";
  const subtitle = artist ? artist : "Open Spotify to start a session";
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const safeProgress = playing && duration > 0 ? clamp(progress / duration, 0, 1) : source === "recently_played" && duration > 0 ? 1 : 0;
  const progressWidth = Math.round(292 * safeProgress);
  const progressLabel = source === "recently_played" ? "Last played" : playing && duration > 0 ? `${formatTime(progress)} / ${formatTime(duration)}` : "Idle";
  const progressLabelSafe = escapeXml(progressLabel);
  const albumImage = albumArt
    ? `<image href="${escapeXml(albumArt)}" x="24" y="24" width="112" height="112" rx="20" ry="20" preserveAspectRatio="xMidYMid slice" />`
    : `<rect x="24" y="24" width="112" height="112" rx="20" fill="url(#albumFallback)" />
       <path d="M53 79c12-16 20-19 30-19 10 0 18 4 27 19" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="4" stroke-linecap="round" />
       <circle cx="66" cy="67" r="8" fill="rgba(255,255,255,0.92)" />`;
  const safeSongUrl = songUrl ? escapeXml(songUrl) : "";

  const waveform = [0.28, 0.58, 0.42, 0.8, 0.36, 0.92, 0.46, 0.76, 0.34, 0.64, 0.48, 0.84]
    .map((height, index) => {
      const x = 372 + index * 8;
      const barHeight = Math.round(32 * height * (playing ? 1 : 0.35));
      const y = 126 - barHeight;
      return `<rect x="${x}" y="${y}" width="4" height="${barHeight}" rx="2" fill="rgba(29,185,84,0.9)">
        <animate attributeName="height" values="${barHeight};${Math.max(8, barHeight - 8)};${barHeight}" dur="1.1s" repeatCount="indefinite" begin="${index * 0.08}s" />
        <animate attributeName="y" values="${y};${y + 8};${y}" dur="1.1s" repeatCount="indefinite" begin="${index * 0.08}s" />
      </rect>`;
    })
    .join("\n");

  return `
<svg width="820" height="220" viewBox="0 0 820 220" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Spotify now playing card">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="820" y2="220" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0b1020" />
      <stop offset="55%" stop-color="#121a33" />
      <stop offset="100%" stop-color="#05070d" />
    </linearGradient>
    <linearGradient id="accent" x1="180" y1="20" x2="690" y2="210" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1db954" />
      <stop offset="100%" stop-color="#62ff9d" />
    </linearGradient>
    <linearGradient id="albumFallback" x1="24" y1="24" x2="136" y2="136" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1c2541" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <rect x="0" y="0" width="820" height="220" rx="28" fill="url(#bg)" />
  <rect x="1" y="1" width="818" height="218" rx="27" stroke="rgba(255,255,255,0.08)" />
  <circle cx="750" cy="48" r="86" fill="rgba(29,185,84,0.08)" />
  <circle cx="90" cy="170" r="56" fill="rgba(98,255,157,0.06)" />

  <g filter="url(#shadow)">
    <rect x="18" y="18" width="784" height="184" rx="24" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
  </g>

  ${albumImage}

  <g font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" fill="#ffffff">
    <text x="160" y="60" font-size="14" font-weight="700" letter-spacing="0.18em" fill="rgba(255,255,255,0.62)">${escapeXml(stateLabel)}</text>
    ${safeSongUrl ? `<a href="${safeSongUrl}" target="_blank" rel="noreferrer noopener"><text x="160" y="102" font-size="28" font-weight="800">${safeTitle}</text></a>` : `<text x="160" y="102" font-size="28" font-weight="800">${safeTitle}</text>`}
    <text x="160" y="134" font-size="18" font-weight="500" fill="rgba(255,255,255,0.76)">${safeSubtitle}</text>
    <text x="160" y="176" font-size="13" font-weight="600" fill="rgba(255,255,255,0.55)">${progressLabelSafe}</text>
  </g>

  <rect x="160" y="148" width="292" height="10" rx="5" fill="rgba(255,255,255,0.1)" />
  <rect x="160" y="148" width="${progressWidth}" height="10" rx="5" fill="url(#accent)">
    <animate attributeName="opacity" values="0.85;1;0.85" dur="2.4s" repeatCount="indefinite" />
  </rect>

  <g transform="translate(360 64)">
    ${waveform}
  </g>

  <g transform="translate(686 42)">
    <circle cx="24" cy="24" r="24" fill="rgba(29,185,84,0.14)" />
    <path d="M18 33V15l16 9-16 9Z" fill="#1db954" />
    <text x="58" y="29" font-size="16" font-weight="700" fill="rgba(255,255,255,0.75)">Spotify</text>
  </g>

  ${safeSongUrl ? `<a href="${safeSongUrl}" target="_blank" rel="noreferrer noopener"><rect x="18" y="18" width="784" height="184" rx="24" fill="transparent" /></a>` : ""}
</svg>`;
}

module.exports = async (req, res) => {
  try {
    const data = await getCurrentlyPlaying();

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).send(buildCard(data));
  } catch (error) {
    res.setHeader("Content-Type", "image/svg+xml");
    return res.status(500).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="820" height="220" viewBox="0 0 820 220">
        <rect width="820" height="220" rx="28" fill="#0b1020" />
        <text x="40" y="88" fill="#ffffff" font-size="22" font-family="Inter, Arial, sans-serif" font-weight="700">Spotify card unavailable</text>
        <text x="40" y="124" fill="rgba(255,255,255,0.72)" font-size="16" font-family="Inter, Arial, sans-serif">${escapeXml(error.message)}</text>
      </svg>
    `);
  }
};
