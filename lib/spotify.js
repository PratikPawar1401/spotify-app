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

function mapTrack(item, metadata = {}) {
  const artists = Array.isArray(item.artists) ? item.artists.map((artist) => artist.name).join(", ") : "";
  const albumArt = item.album && Array.isArray(item.album.images) && item.album.images[0] ? item.album.images[0].url : "";

  return {
    playing: Boolean(metadata.playing),
    status: metadata.status || "not_playing",
    source: metadata.source || "recently_played",
    song: item.name,
    artist: artists,
    albumArt,
    songUrl: item.external_urls && item.external_urls.spotify ? item.external_urls.spotify : "",
    progress: metadata.progress_ms || 0,
    duration: item.duration_ms || 0,
    playedAt: metadata.played_at || null,
  };
}

async function fetchAlbumArtDataUrl(albumArtUrl) {
  if (!albumArtUrl) {
    return "";
  }

  try {
    const response = await axios.get(albumArtUrl, {
      responseType: "arraybuffer",
      validateStatus: () => true,
    });

    if (response.status !== 200 || !response.data) {
      return "";
    }

    const contentType = response.headers && response.headers["content-type"] ? response.headers["content-type"] : "image/jpeg";
    const buffer = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);

    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (error) {
    return "";
  }
}

async function enrichTrack(track) {
  if (!track || !track.albumArt) {
    return track;
  }

  return {
    ...track,
    albumArtDataUrl: await fetchAlbumArtDataUrl(track.albumArt),
  };
}

async function getCurrentlyPlaying(token) {
  const response = await axios.get(
    "https://api.spotify.com/v1/me/player",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    }
  );

  if (response.status === 204 || !response.data || !response.data.item) {
    return null;
  }

  const isPlaying = Boolean(response.data.is_playing);

  return mapTrack(response.data.item, {
    playing: isPlaying,
    status: isPlaying ? "playing" : "paused",
    source: isPlaying ? "currently_playing" : "paused",
    progress_ms: response.data.progress_ms || 0,
  });
}

async function getRecentlyPlayed(token) {
  const response = await axios.get(
    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    }
  );

  if (response.status === 401 || response.status === 403) {
    return {
      playing: false,
      status: "permission_required",
      source: "permission_required",
      error: "Spotify token is missing required playback scopes.",
    };
  }

  if (response.status !== 200 || !response.data || !Array.isArray(response.data.items) || response.data.items.length === 0) {
    return {
      playing: false,
      status: "not_playing",
      source: "not_playing",
    };
  }

  const lastItem = response.data.items[0];
  if (!lastItem.track) {
    return {
      playing: false,
      status: "not_playing",
      source: "not_playing",
    };
  }

  return mapTrack(lastItem.track, {
    playing: false,
    status: "recently_played",
    source: "recently_played",
    played_at: lastItem.played_at || null,
  });
}

async function getCurrentlyPlayingOrLastPlayed() {
  const token = await getAccessToken();
  const currentTrack = await getCurrentlyPlaying(token);

  if (currentTrack) {
    return enrichTrack(currentTrack);
  }

  const recentTrack = await getRecentlyPlayed(token);

  if (recentTrack && recentTrack.status === "permission_required") {
    return recentTrack;
  }

  return enrichTrack(recentTrack);
}

module.exports = {
  getCurrentlyPlaying: getCurrentlyPlayingOrLastPlayed,
};
