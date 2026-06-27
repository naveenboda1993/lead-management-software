import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leadcrm.app',
  appName: 'LeadCRM',
  webDir: '.next',
  server: {
    url: process.env.CAP_SERVER_URL || undefined,
    cleartext: true,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
    },
  },
};

export default config;
