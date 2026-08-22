import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

const MESSAGES = [
  "Please wait, NotifyMe is getting things ready for you…",
  "Missing something? NotifyMe lets you create a custom message so people know what to do when they scan your QR.",
  "Your car, wallet, keys and more can stay connected with NotifyMe."
];

export default function MobileLoadingScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const [msgIndex, setMsgIndex] = useState(0);
  
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0.9)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle breathing animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleValue, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacityValue, { toValue: 1, duration: 1500, useNativeDriver: true })
        ]),
        Animated.parallel([
          Animated.timing(scaleValue, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacityValue, { toValue: 0.9, duration: 1500, useNativeDriver: true })
        ])
      ])
    ).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      }).start(() => {
        setMsgIndex(prev => (prev + 1) % MESSAGES.length);
        // Fade in
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }).start();
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: opacityValue, marginBottom: 24 }}>
        <ShieldCheck size={isTablet ? 90 : 80} color="#4f46e5" />
      </Animated.View>
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.loadingText, { opacity: textOpacity, fontSize: isTablet ? 16 : 13 }]}>
          {MESSAGES[msgIndex]}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  loadingText: {
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  }
});
