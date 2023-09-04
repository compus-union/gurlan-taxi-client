import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Gurlan taxi',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [ "https://nominatim.openstreetmap.org/" ]
  },
};

export default config;
