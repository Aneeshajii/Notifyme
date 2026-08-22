import { Platform } from 'react-native';

let RNCallKeep: any = null;
if (Platform.OS !== 'web') {
  try {
    RNCallKeep = require('react-native-callkeep').default;
  } catch (e) {
    console.log("CallKeep not available", e);
  }
}

const options = {
  ios: {
    appName: 'NotifyMe',
    imageName: 'sim_icon', // Image used for the native call UI
    supportsVideo: false,
    maximumCallGroups: '1',
    maximumCallsPerCallGroup: '1',
    includesCallsInRecents: true,
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'NotifyMe needs to access your phone accounts to display incoming calls.',
    cancelButton: 'Cancel',
    okButton: 'ok',
    imageName: 'sim_icon',
    additionalPermissions: [],
    foregroundService: {
      channelId: 'com.notifyme.mobile.call',
      channelName: 'Foreground service for my app',
      notificationTitle: 'My app is running on background',
      notificationIcon: 'Path to the resource icon of the notification',
    }, 
  }
};

export const initializeCallKeep = () => {
  if (!RNCallKeep) return;
  try {
    RNCallKeep.setup(options).then((accepted: any) => {
      console.log('CallKeep setup accepted:', accepted);
    });
    
    if (Platform.OS === 'android') {
      RNCallKeep.setAvailable(true);
    }
  } catch (err) {
    console.error('CallKeep Setup Error:', err);
  }
};

export const displayIncomingCall = (callUUID: string, callerName: string) => {
  if (!RNCallKeep) return;
  RNCallKeep.displayIncomingCall(callUUID, callerName, callerName, 'number', false);
};

export const endCall = (callUUID: string) => {
  if (!RNCallKeep) return;
  RNCallKeep.endCall(callUUID);
};

// Event Listeners for answering/rejecting calls from the native UI
if (RNCallKeep) {
  RNCallKeep.addEventListener('answerCall', ({ callUUID }: any) => {
    console.log('Call answered:', callUUID);
    // Route user to the WebRTC call screen
    RNCallKeep.setCurrentCallActive(callUUID);
  });

  RNCallKeep.addEventListener('endCall', ({ callUUID }: any) => {
    console.log('Call rejected or ended:', callUUID);
    // Notify backend that call was rejected
  });
}

