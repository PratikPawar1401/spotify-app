const { getCurrentlyPlaying } = require("../lib/spotify");
const { createCardModel, renderSvgCard, escapeXml } = require("../lib/cardTemplate");

module.exports = async (req, res) => {
  try {
    const data = await getCurrentlyPlaying();
    const model = createCardModel(data);

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).send(renderSvgCard(model));
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
