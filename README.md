# Spotify Card

A professional Spotify widget for GitHub READMEs.

## Endpoints

- `/api/spotify` returns the current Spotify track when playing, or the last played track when idle.
- `/api/card` returns a dynamic SVG card for embedding in a README.

## Environment Variables

Set these in Vercel or your local environment:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

Your refresh token must be generated with these Spotify scopes:

- `user-read-playback-state`
- `user-read-currently-playing`
- `user-read-recently-played`

## README Embed

```md
[![Spotify card](https://spotify-app-git-main-pratiks-projects-fb9812c3.vercel.app/api/card)](https://open.spotify.com/)
```

## Local Development

```bash
npm install
npm run start
```

## Notes

The card is serverless-friendly, caches the access token briefly between requests, and falls back to the most recently played track when Spotify is idle.

The JSON endpoint also returns `songUrl`, so your own UI can deep-link to Spotify directly.

If the API returns `status: "permission_required"`, regenerate the refresh token with the scopes above. If it returns `status: "not_playing"`, Spotify did not report any active or recent track for that account.
