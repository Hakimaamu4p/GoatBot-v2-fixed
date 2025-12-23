const axios = require("axios");

module.exports = {
  config: {
    name: "shoti",
    version: "1.0.0",
    author: "April Manalo",
    role: 0,
    category: "media",
    guide: "shoti",
    cooldown: 5
  },

  onStart: async function ({ api, event }) {
    let loadingMsg;

    try {
      loadingMsg = await api.sendMessage(
        "📡 Fetching shoti video...",
        event.threadID
      );

      const res = await axios.get(
        "https://norch-project.gleeze.com/api/shoti",
        { timeout: 15000 }
      );

      const data = res.data;
      if (!data || data.status !== "success" || !data.play) {
        throw new Error("Invalid API response");
      }

      const videoStream = await axios({
        url: data.play,
        method: "GET",
        responseType: "stream",
        timeout: 30000
      });

      const caption =
        `🎬 SHOTI VIDEO\n\n` +
        `📝 Title: ${data.title || "Unknown"}\n` +
        `👤 TikTok: @${data.tiktok_author || "Unknown"}\n` +
        `🔗 Original: ${data.original_url || "N/A"}\n\n` +
        `✨ Requested via GoatBot V2`;

      await api.sendMessage(
        {
          body: caption,
          attachment: videoStream.data
        },
        event.threadID
      );

      if (loadingMsg?.messageID) {
        api.unsendMessage(loadingMsg.messageID);
      }

    } catch (err) {
      console.error("[SHOTI ERROR]", err?.message || err);

      api.sendMessage(
        "❌ Failed to send shoti video. Please try again later.",
        event.threadID,
        String(event.messageID)
      );

      if (loadingMsg?.messageID) {
        api.unsendMessage(loadingMsg.messageID);
      }
    }
  }
};
