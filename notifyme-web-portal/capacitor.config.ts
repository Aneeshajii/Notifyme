import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.getnotifye.app',
  appName: 'GetNotifye',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "908105327441-30fotv2b3e8omgono9r41gjqrq4dvo0u.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
