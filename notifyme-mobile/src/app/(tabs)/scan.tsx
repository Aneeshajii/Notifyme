import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (isScanning) return;
    setIsScanning(true);
    setErrorMsg("");

    try {
      // Assuming QR codes encode URLs like https://notifyme.app/tag/12345
      // Extract tag ID from URL or assume it's just the tag ID
      const tagId = data.split('/').pop();
      
      if (!tagId) throw new Error("Invalid QR Code");

      const res = await api.get(`/tags/scan/${tagId}`);
      if (res.data.success || res.data.tag) {
        // Route to a messaging/chat screen for this tag
        router.push(`/chat/${tagId}`);
        setErrorMsg("Tag found! Opening chat...");
        setTimeout(() => setIsScanning(false), 2000);
      } else {
        setErrorMsg("Tag not recognized.");
        setTimeout(() => setIsScanning(false), 2000);
      }
    } catch (e) {
      console.log("Scan error:", e);
      setErrorMsg("Failed to scan tag. It may be invalid or inactive.");
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="back"
        onBarcodeScanned={isScanning ? undefined : handleBarcodeScanned}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Scan QR Code</Text>
          <Text style={styles.subtitle}>Align the QR code within the frame</Text>
          
          <View style={styles.scanFrame}>
            {isScanning && <ActivityIndicator size="large" color="#8b5cf6" style={styles.loader} />}
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', paddingTop: 100 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#cbd5e1', fontSize: 14, marginBottom: 60 },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#8b5cf6', borderRadius: 16, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  loader: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 20, borderRadius: 100 },
  text: { color: 'white', textAlign: 'center', marginTop: 200 },
  errorBox: { marginTop: 40, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
  errorText: { color: 'white', fontSize: 14, fontWeight: '500' }
});
