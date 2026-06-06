const { getCurrentlyPlaying } = require("../lib/spotify");

module.exports = async (req, res) => {
  try {
    const data = await getCurrentlyPlaying();

    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
