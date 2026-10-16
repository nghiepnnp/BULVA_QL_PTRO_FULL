const app = require("./app.json");
const { withEasUpdate } = require("./config/eas-update.cjs");
module.exports = ({ config }) => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  const configured = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/i.test(
    iosClientId ?? "",
  );
  return withEasUpdate(
    {
      ...config,
      ...app.expo,
      plugins: [
        ...app.expo.plugins,
        ...(configured
          ? [
              [
                "@react-native-google-signin/google-signin",
                {
                  iosUrlScheme: iosClientId.split(".").reverse().join("."),
                },
              ],
            ]
          : []),
      ],
    },
    process.env.EAS_BUILD === "true",
  );
};
