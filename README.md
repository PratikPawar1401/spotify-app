# Spotify Card

A professional Spotify now-playing widget for GitHub READMEs.

## Endpoints

- `/api/spotify` returns the current Spotify playback data as JSON.
- `/api/card` returns a dynamic SVG card for embedding in a README.

## Environment Variables

Set these in Vercel or your local environment:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

## README Embed

```md
![Spotify card](https://YOUR-PROJECT.vercel.app/api/card)
```

## Local Development

```bash
npm install
npm run start
```

## Notes

The card is intentionally self-contained and serverless-friendly. It caches the access token briefly between requests and falls back to a polished idle state when nothing is playing.
