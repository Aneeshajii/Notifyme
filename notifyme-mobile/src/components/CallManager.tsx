import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Phone, PhoneOff } from "lucide-react-native";
import { io } from "socket.io-client";
// import { RTCPeerConnection, mediaDevices } from "react-native-webrtc"; // Mocked for foundation

const SOCKET_URL = 'https://notifyme-api-px9n.onrender.com';

export default function CallManager({ userId }: { userId: string }) {
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit("join-owner-room", userId);

    newSocket.on("incoming-call", (data) => {
      setIncomingCall({
        signal: data.signal,
        callerId: data.callerId,
        tagId: data.tagId,
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const acceptCall = () => {
    setCallAccepted(true);
    // In a full implementation, we'd request mic permissions using react-native-permissions
    // and initialize RTCPeerConnection here.
  };

  const endCall = () => {
    setCallAccepted(false);
    setIncomingCall(null);
    // Cleanup WebRTC tracks and connection
  };

  if (!incomingCall && !callAccepted) return null;

  return (
    <Modal visible={!!incomingCall || callAccepted} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.callCard}>
          {!callAccepted ? (
            <>
              <Phone size={48} color="#10b981" style={styles.iconPulse} />
              <Text style={styles.title}>Incoming Anonymous Call</Text>
              <Text style={styles.subtitle}>Someone is calling regarding your tag.</Text>
              
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={acceptCall}>
                  <Phone color="#fff" size={24} />
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.declineBtn]} onPress={endCall}>
                  <PhoneOff color="#fff" size={24} />
                  <Text style={styles.btnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Phone size={48} color="#4f46e5" />
              <Text style={styles.title}>Call Connected</Text>
              <Text style={styles.subtitle}>Secure channel established.</Text>
              
              <TouchableOpacity style={[styles.btn, styles.declineBtn, { width: "100%", marginTop: 24 }]} onPress={endCall}>
                <PhoneOff color="#fff" size={24} />
                <Text style={styles.btnText}>End Call</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  callCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconPulse: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 32,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: "#10b981",
  },
  declineBtn: {
    backgroundColor: "#ef4444",
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
