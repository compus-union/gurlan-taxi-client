import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.novdataxi.app",
  appName: "Novda Taxi",
  webDir: "dist",
  server: {
    androidScheme: "http",
    cleartext: true,
  },

  android: {
    buildOptions: {
      keystorePath:
        "d:WORKprojects\taxi-appclientandroidapp\taxi-app-key.keystore",
      keystoreAlias: "taxi-app-alias",
    },
  },
};

export default config;
