import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, User as UserIcon } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socket';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Platform } from 'react-native';
import { endCall } from '../../services/callkeep';

let WebRTC: any = {};
if (Platform.OS !== 'web') {
  try {
    WebRTC = require('react-native-webrtc');
  } catch (e) {
    console.log("WebRTC not available", e);
  }
}

const { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = WebRTC;


export default function CallScreen() {
  const { id } = useLocalSearchParams(); // conversationId
  const router = useRouter();
  const { user } = useAuth();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callStatus, setCallStatus] = useState('Connecting...');
  const [callDuration, setCallDuration] = useState(0);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<any>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const avatarUrl = `https://api.dicebear.com/6.x/initials/png?seed=${id}`;

  useEffect(() => {
    // Initiate or answer call
    startCall();
    
    const socket = socketService.socket;
    if (socket) {
      socket.on('webrtc_offer', handleReceiveOffer);
      socket.on('webrtc_answer', handleReceiveAnswer);
      socket.on('webrtc_ice_candidate', handleReceiveIceCandidate);
      socket.on('call_ended', handleRemoteEndCall);
    }
    
    return () => {
      cleanupCall();
      if (socket) {
        socket.off('webrtc_offer', handleReceiveOffer);
        socket.off('webrtc_answer', handleReceiveAnswer);
        socket.off('webrtc_ice_candidate', handleReceiveIceCandidate);
        socket.off('call_ended', handleRemoteEndCall);
      }
    };
  }, []);

  const startCall = async () => {
    try {
      setCallStatus('Ringing...');
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      pcRef.current = pc;
      
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      
      pc.onicecandidate = (event) => {
        if (event.candidate && socketService.socket) {
          socketService.socket.emit('webrtc_ice_candidate', {
            to: id, // In reality, we'd look up the specific socket ID or use a room
            candidate: event.candidate,
            conversationId: id
          });
        }
      };
      
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setCallStatus('Connected');
          startTimer();
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          handleRemoteEndCall();
        }
      };
      
      // If we are initiating the call:
      // const offer = await pc.createOffer();
      // await pc.setLocalDescription(offer);
      // socket.emit('webrtc_offer', { offer, to: id });
      
    } catch (e) {
      console.log('Error starting call:', e);
      setCallStatus('Call Failed');
      setTimeout(() => router.back(), 2000);
    }
  };

  const startTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const handleReceiveOffer = async (data: any) => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      
      if (socketService.socket) {
        socketService.socket.emit('webrtc_answer', {
          to: data.from,
          answer,
          conversationId: id
        });
      }
    } catch (e) {
      console.log('Error handling offer', e);
    }
  };

  const handleReceiveAnswer = async (data: any) => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    } catch (e) {
      console.log('Error handling answer', e);
    }
  };

  const handleReceiveIceCandidate = async (data: any) => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (e) {
      console.log('Error adding ICE candidate', e);
    }
  };

  const handleRemoteEndCall = () => {
    setCallStatus('Call Ended');
    cleanupCall();
    setTimeout(() => router.back(), 1500);
  };

  const handleEndCall = () => {
    setCallStatus('Ending...');
    if (socketService.socket) {
      socketService.socket.emit('end_call', { conversationId: id });
    }
    // End native CallKeep call if it exists
    endCall(id as string);
    cleanupCall();
    router.back();
  };

  const cleanupCall = () => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: any) => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: avatarUrl }} style={styles.backgroundImage} blurRadius={20} />
      <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']} style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          
          <View style={styles.topSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            </View>
            <Text style={styles.name}>Scanner</Text>
            <Text style={styles.status}>
              {callStatus === 'Connected' ? formatDuration(callDuration) : callStatus}
            </Text>
          </View>

          <View style={styles.controlsSection}>
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, isMuted && styles.actionBtnActive]} onPress={toggleMute}>
                {isMuted ? <MicOff color="white" size={32} /> : <Mic color="white" size={32} />}
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionBtn, isSpeaker && styles.actionBtnActive]} onPress={() => setIsSpeaker(!isSpeaker)}>
                {isSpeaker ? <Volume2 color="white" size={32} /> : <VolumeX color="white" size={32} />}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
              <PhoneOff color="white" size={36} />
            </TouchableOpacity>
          </View>
          
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  backgroundImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.6 },
  overlay: { flex: 1, justifyContent: 'space-between' },
  safeArea: { flex: 1, justifyContent: 'space-between' },
  
  topSection: { alignItems: 'center', paddingTop: 80 },
  avatarContainer: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
  avatar: { width: 132, height: 132, borderRadius: 66 },
  name: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  status: { fontSize: 18, color: '#cbd5e1' },
  
  controlsSection: { paddingBottom: 60, alignItems: 'center' },
  actionRow: { flexDirection: 'row', gap: 40, marginBottom: 60 },
  actionBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  actionBtnActive: { backgroundColor: 'rgba(255,255,255,0.4)' },
  endCallBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }
});
