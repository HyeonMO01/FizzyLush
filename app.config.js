const appJson = require("./app.json");

const easProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || appJson.expo.extra.eas.projectId;

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      eas: {
        projectId: easProjectId,
      },
    },
  },
};
