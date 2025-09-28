// app.config.js
export default {
  name: "mir4_clan_app",
  slug: "mir4_clan_app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0b0f1a"
  },
  ios: { supportsTablet: true },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0b0f1a"
    }
  },
  web: { favicon: "./assets/icon.png" },
  plugins: ["expo-sqlite"]
};
