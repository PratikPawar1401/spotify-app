const React = require("react");
const { ImageResponse } = require("@vercel/og");
const { getCurrentlyPlaying } = require("../lib/spotify");
const { createCardModel, CardTemplate } = require("../lib/cardTemplate");

function createErrorResponse(message) {
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: 820,
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #05070d 0%, #0b1020 40%, #121a33 100%)",
          color: "#ffffff",
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: 24,
          fontWeight: 700,
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: 736,
            padding: "28px 32px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
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
              marginBottom: 12,
            },
          },
          "Spotify card unavailable"
        ),
        React.createElement(
          "div",
          {
            style: {
              fontSize: 20,
              fontWeight: 600,
              color: "rgba(255,255,255,0.88)",
              lineHeight: 1.35,
            },
          },
          message
        )
      )
    ),
    {
      width: 820,
      height: 220,
    }
  );
}

module.exports = async (req, res) => {
  try {
    const data = await getCurrentlyPlaying();
    const model = {
      ...createCardModel(data),
      preferInlineAlbumArt: true,
    };
    const response = new ImageResponse(React.createElement(CardTemplate, { model }), {
      width: 820,
      height: 220,
    });

    const pngBuffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.setHeader("Content-Length", String(pngBuffer.length));
    return res.status(200).send(pngBuffer);
  } catch (error) {
    const response = createErrorResponse(error.message);
    const pngBuffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.setHeader("Content-Length", String(pngBuffer.length));
    return res.status(200).send(pngBuffer);
  }
};
