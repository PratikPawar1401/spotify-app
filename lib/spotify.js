const axios = require("axios");

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
} = process.env;

let cachedToken = null;
let cachedTokenExpiresAt = 0;

function assertEnv() {
  const missing = [];

  if (!SPOTIFY_CLIENT_ID) missing.push("SPOTIFY_CLIENT_ID");
  if (!SPOTIFY_CLIENT_SECRET) missing.push("SPOTIFY_CLIENT_SECRET");
  if (!SPOTIFY_REFRESH_TOKEN) missing.push("SPOTIFY_REFRESH_TOKEN");

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

async function getAccessToken() {
  assertEnv();

  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  cachedToken = response.data.access_token;
  cachedTokenExpiresAt = Date.now() + 55 * 60 * 1000;

  return cachedToken;
}

async function getCurrentlyPlaying() {
  const token = await getAccessToken();

  const response = await axios.get(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    }
  );

  if (response.status === 204 || !response.data || !response.data.item) {
    return {
      playing: false,
      status: "not_playing",
    };
  }

  const item = response.data.item;
  const artists = Array.isArray(item.artists) ? item.artists.map((artist) => artist.name).join(", ") : "";
  const albumArt = item.album && Array.isArray(item.album.images) && item.album.images[0] ? item.album.images[0].url : "";
  const isPlaying = Boolean(response.data.is_playing);

  return {
    playing: isPlaying,
    status: isPlaying ? "playing" : "paused",
    song: item.name,
    artist: artists,
    albumArt,
    progress: response.data.progress_ms || 0,
    duration: item.duration_ms || 0,
  };
}

module.exports = {
  getCurrentlyPlaying,
};
