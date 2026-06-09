const React = require("react");

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

function createCardModel(data = {}) {
  const playing = Boolean(data.playing);
  const status = data.status || "not_playing";
  const source = data.source || "not_playing";
  const song = data.song || "Not playing right now";
  const artist = data.artist || "Open Spotify to start a session";
  const albumArt = data.albumArt || "";
  const albumArtDataUrl = data.albumArtDataUrl || "";
  const songUrl = data.songUrl || "";
  const duration = Number(data.duration) || 0;
  const progress = Number(data.progress) || 0;
  const isRecent = source === "recently_played";
  const isPaused = status === "paused";

  const stateLabel = isRecent
    ? "LAST PLAYED"
    : isPaused
      ? "PAUSED"
      : playing
        ? "CURRENTLY PLAYING"
        : "NOT PLAYING";

  const progressRatio = playing && duration > 0 ? clamp(progress / duration, 0, 1) : isRecent && duration > 0 ? 1 : 0;
  const progressWidth = Math.round(292 * progressRatio);
  const progressLabel = isRecent ? "Last played" : playing && duration > 0 ? `${formatTime(progress)} / ${formatTime(duration)}` : "Idle";

  return {
    playing,
    status,
    source,
    song,
    artist,
    albumArt,
    albumArtDataUrl,
    songUrl,
    duration,
    progress,
    stateLabel,
    progressRatio,
    progressWidth,
    progressLabel,
    safeSongUrl: songUrl ? escapeXml(songUrl) : "",
    safeTitle: escapeXml(song),
    safeSubtitle: escapeXml(artist),
    progressLabelSafe: escapeXml(progressLabel),
    stateLabelSafe: escapeXml(stateLabel),
    hasAlbumArt: Boolean(albumArt),
    albumArtSource: albumArtDataUrl || albumArt,
  };
}

function AlbumArt({ model }) {
  if (model.albumArtSource) {
    return React.createElement("img", {
      src: model.albumArtSource,
      alt: `${model.song} album art`,
      width: 112,
      height: 112,
      style: {
        width: 112,
        height: 112,
        borderRadius: 20,
        objectFit: "cover",
        display: "block",
      },
    });
  }

  return React.createElement(
    "div",
    {
      style: {
        width: 112,
        height: 112,
        borderRadius: 20,
        background: "linear-gradient(145deg, #1c2541 0%, #111827 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 30% 25%, rgba(29, 185, 84, 0.18), transparent 35%), radial-gradient(circle at 70% 80%, rgba(98, 255, 157, 0.12), transparent 30%)",
      },
    }),
    React.createElement("div", {
      style: {
        width: 42,
        height: 42,
        borderRadius: "50%",
        border: "3px solid rgba(255, 255, 255, 0.86)",
        position: "relative",
        boxSizing: "border-box",
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        left: 52,
        top: 40,
        width: 0,
        height: 0,
        borderTop: "14px solid transparent",
        borderBottom: "14px solid transparent",
        borderLeft: "22px solid rgba(255, 255, 255, 0.92)",
        transform: "translateX(-4px)",
      },
    })
  );
}

function PlaceholderAlbumArt() {
  return React.createElement(
    "div",
    {
      style: {
        width: 112,
        height: 112,
        borderRadius: 20,
        background: "linear-gradient(145deg, #1c2541 0%, #111827 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 30% 25%, rgba(29, 185, 84, 0.18), transparent 35%), radial-gradient(circle at 70% 80%, rgba(98, 255, 157, 0.12), transparent 30%)",
      },
    }),
    React.createElement("div", {
      style: {
        width: 42,
        height: 42,
        borderRadius: "50%",
        border: "3px solid rgba(255, 255, 255, 0.86)",
        position: "relative",
        boxSizing: "border-box",
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        left: 52,
        top: 40,
        width: 0,
        height: 0,
        borderTop: "14px solid transparent",
        borderBottom: "14px solid transparent",
        borderLeft: "22px solid rgba(255, 255, 255, 0.92)",
        transform: "translateX(-4px)",
      },
    })
  );
}

function Waveform({ model }) {
  const bars = [0.28, 0.58, 0.42, 0.8, 0.36, 0.92, 0.46, 0.76, 0.34, 0.64, 0.48, 0.84];

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "end",
        gap: 4,
        height: 44,
      },
    },
    bars.map((height, index) =>
      React.createElement("div", {
        key: index,
        style: {
          width: 4,
          height: `${Math.max(8, Math.round(32 * height * (model.playing ? 1 : 0.35)))}px`,
          borderRadius: 999,
          background: "rgba(29, 185, 84, 0.92)",
          boxShadow: "0 0 14px rgba(29, 185, 84, 0.22)",
        },
      })
    )
  );
}

function CardTemplate({ model }) {
  const shouldUseRemoteAlbumArt = !model.preferInlineAlbumArt;
  return React.createElement(
    "div",
    {
      style: {
        width: 820,
        height: 220,
        position: "relative",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
        background: "linear-gradient(135deg, #05070d 0%, #0b1020 40%, #121a33 100%)",
        color: "#ffffff",
        overflow: "hidden",
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
    },
    React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 90% 20%, rgba(29, 185, 84, 0.16), transparent 24%), radial-gradient(circle at 12% 88%, rgba(98, 255, 157, 0.08), transparent 18%)",
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        inset: 18,
        borderRadius: 24,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
      },
    }),
    React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          left: 24,
          top: 24,
          width: 112,
          height: 112,
          zIndex: 1,
        },
      },
      shouldUseRemoteAlbumArt && model.albumArtSource
        ? React.createElement(AlbumArt, { model })
        : React.createElement(PlaceholderAlbumArt)
    ),
    React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          left: 160,
          top: 24,
          right: 24,
          bottom: 24,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.62)",
              textTransform: "uppercase",
              marginBottom: 14,
            },
          },
          model.stateLabel
        ),
        model.safeSongUrl
          ? React.createElement(
              "a",
              {
                href: model.songUrl,
                target: "_blank",
                rel: "noreferrer noopener",
                style: {
                  color: "#ffffff",
                  textDecoration: "none",
                  display: "inline-block",
                  maxWidth: 490,
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    fontSize: 28,
                    fontWeight: 800,
                    lineHeight: 1.05,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                },
                model.song
              )
            )
          : React.createElement(
              "div",
              {
                style: {
                  fontSize: 28,
                  fontWeight: 800,
                  lineHeight: 1.05,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 490,
                },
              },
              model.song
            ),
        React.createElement(
          "div",
          {
            style: {
              marginTop: 8,
              fontSize: 18,
              fontWeight: 500,
              color: "rgba(255,255,255,0.76)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 520,
            },
          },
          model.artist
        )
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 14,
          },
        },
        React.createElement(
          "div",
          {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
            },
          },
          React.createElement("div", {
            style: {
              height: 10,
              borderRadius: 999,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            },
          },
          React.createElement("div", {
            style: {
              width: `${model.progressWidth}px`,
              maxWidth: 292,
              height: 10,
              borderRadius: 999,
              background: "linear-gradient(90deg, #1db954 0%, #62ff9d 100%)",
            },
          })),
          React.createElement(
            "div",
            {
              style: {
                marginTop: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.55)",
              },
            },
            model.progressLabel
          )
        ),
        React.createElement(
          "div",
          {
            style: {
              width: 132,
              display: "flex",
              justifyContent: "flex-end",
            },
          },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(29,185,84,0.14)",
              },
            },
            React.createElement("div", {
              style: {
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#1db954",
                clipPath: "polygon(30% 20%, 78% 50%, 30% 80%)",
              },
            }),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.78)",
                },
              },
              "Spotify"
            )
          )
        )
      ),
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            right: 40,
            top: 62,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 12,
          },
        },
        React.createElement(Waveform, { model })
      )
    )
  );
}

function renderSvgCard(model) {
  const songAnchorStart = model.safeSongUrl
    ? `<a href="${model.safeSongUrl}" target="_blank" rel="noreferrer noopener">`
    : "";
  const songAnchorEnd = model.safeSongUrl ? "</a>" : "";
  const overlayAnchorStart = model.safeSongUrl
    ? `<a href="${model.safeSongUrl}" target="_blank" rel="noreferrer noopener">`
    : "";
  const overlayAnchorEnd = model.safeSongUrl ? "</a>" : "";
  const albumImage = model.hasAlbumArt
    ? `<image href="${escapeXml(model.albumArt)}" x="24" y="24" width="112" height="112" rx="20" ry="20" preserveAspectRatio="xMidYMid slice" />`
    : `<rect x="24" y="24" width="112" height="112" rx="20" fill="url(#albumFallback)" />
       <path d="M53 79c12-16 20-19 30-19 10 0 18 4 27 19" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="4" stroke-linecap="round" />
       <circle cx="66" cy="67" r="8" fill="rgba(255,255,255,0.92)" />`;
  const waveform = [0.28, 0.58, 0.42, 0.8, 0.36, 0.92, 0.46, 0.76, 0.34, 0.64, 0.48, 0.84]
    .map((height, index) => {
      const x = 372 + index * 8;
      const barHeight = Math.round(32 * height * (model.playing ? 1 : 0.35));
      const y = 126 - barHeight;
      return `<rect x="${x}" y="${y}" width="4" height="${barHeight}" rx="2" fill="rgba(29,185,84,0.9)">
        <animate attributeName="height" values="${barHeight};${Math.max(8, barHeight - 8)};${barHeight}" dur="1.1s" repeatCount="indefinite" begin="${index * 0.08}s" />
        <animate attributeName="y" values="${y};${y + 8};${y}" dur="1.1s" repeatCount="indefinite" begin="${index * 0.08}s" />
      </rect>`;
    })
    .join("");

  return `
<svg width="820" height="220" viewBox="0 0 820 220" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Spotify card">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="820" y2="220" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#05070d" />
      <stop offset="40%" stop-color="#0b1020" />
      <stop offset="100%" stop-color="#121a33" />
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
    <text x="160" y="60" font-size="14" font-weight="700" letter-spacing="0.18em" fill="rgba(255,255,255,0.62)">${model.stateLabelSafe}</text>
    ${songAnchorStart}<text x="160" y="102" font-size="28" font-weight="800">${model.safeTitle}</text>${songAnchorEnd}
    <text x="160" y="134" font-size="18" font-weight="500" fill="rgba(255,255,255,0.76)">${model.safeSubtitle}</text>
    <text x="160" y="176" font-size="13" font-weight="600" fill="rgba(255,255,255,0.55)">${model.progressLabelSafe}</text>
  </g>

  <rect x="160" y="148" width="292" height="10" rx="5" fill="rgba(255,255,255,0.1)" />
  <rect x="160" y="148" width="${model.progressWidth}" height="10" rx="5" fill="url(#accent)">
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

  ${overlayAnchorStart}<rect x="18" y="18" width="784" height="184" rx="24" fill="transparent" />${overlayAnchorEnd}
</svg>`;
}

module.exports = {
  createCardModel,
  CardTemplate,
  renderSvgCard,
  escapeXml,
};
