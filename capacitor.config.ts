import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.compuss.taxi.starter",
  appName: "Compuss taxi",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true,
    allowNavigation: ["https://nominatim.openstreetmap.org/"],
  },
};

export default config;
