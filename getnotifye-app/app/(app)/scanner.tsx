import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Check if it's a GetNotifye QR
    if (data.includes('getnotifye') || data.includes('notifyme') || data.includes('/scan/')) {
      Alert.alert(
        'GetNotifye QR Detected',
        'Open this QR code link to contact the owner?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setScanned(false) },
          {
            text: 'Open',
            onPress: () => {
              Linking.openURL(data);
              setScanned(false);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'QR Code Scanned',
        `Content: ${data}`,
        [
          { text: 'OK', onPress: () => setScanned(false) },
          {
            text: 'Open URL',
            onPress: () => {
              Linking.openURL(data).catch(() => Alert.alert('Error', 'Cannot open this URL'));
              setScanned(false);
            }
          }
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permText}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Ionicons name="camera-outline" size={56} color="#94a3b8" />
        <Text style={styles.permTitle}>Camera Access Denied</Text>
        <Text style={styles.permText}>GetNotifye needs camera access to scan QR codes.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={() => Linking.openSettings()}>
          <Text style={styles.permBtnText}>Open Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchOn}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <SafeAreaView style={styles.topBar}>
          <Text style={styles.scanTitle}>Scan QR Code</Text>
          <TouchableOpacity onPress={() => setTorchOn(!torchOn)} style={styles.torchBtn}>
            <Ionicons name={torchOn ? 'flash' : 'flash-off'} size={22} color="white" />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <View style={styles.bottomHint}>
          <Text style={styles.hintText}>Point your camera at a GetNotifye QR code</Text>
          {scanned && (
            <TouchableOpacity style={styles.scanAgainBtn} onPress={() => setScanned(false)}>
              <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const FRAME_SIZE = 240;

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: 'black' },
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 32 },
  permTitle: { fontSize: 20, fontWeight: '700', color: 'white', marginTop: 16, marginBottom: 8 },
  permText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20 },
  permBtn: { marginTop: 20, backgroundColor: '#4f46e5', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  permBtnText: { color: 'white', fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  topBar: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, paddingTop: 60 },
  scanTitle: { fontSize: 18, fontWeight: '700', color: 'white', flex: 1, textAlign: 'center' },
  torchBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, position: 'absolute', right: 20, top: 58 },
  scanFrame: { width: FRAME_SIZE, height: FRAME_SIZE, position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#6366f1', borderWidth: 3.5 },
  cornerTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 6 },
  bottomHint: { paddingBottom: 80, alignItems: 'center', gap: 16 },
  hintText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  scanAgainBtn: { backgroundColor: '#4f46e5', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  scanAgainText: { color: 'white', fontWeight: '700' },
});
