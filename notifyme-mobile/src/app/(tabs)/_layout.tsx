import { Tabs, Redirect } from "expo-router";
import { Home, QrCode, Scan, MessageCircle, User } from "lucide-react-native";
import { View, Platform, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import AiAssistant from "../../components/AiAssistant";

// Custom Center Button Component
const CustomScanButton = ({ onPress }: any) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={['#8b5cf6', '#3b82f6']}
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Scan color="white" size={28} />
    </LinearGradient>
  </TouchableOpacity>
);

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  
  if (!isLoading && !user) {
    return <Redirect href="/auth" />;
  }

  // Enforce onboarding flow
  if (!isLoading && user && !user.isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false, // We'll build custom headers in the screens
        tabBarActiveTintColor: "#8b5cf6",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarShowLabel: true,
        unmountOnBlur: false, // Intelligently cache tabs
        sceneStyle: { backgroundColor: '#f8fafc' }, // Prevents white flashes
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderTopColor: "rgba(241, 245, 249, 0.5)",
          borderTopWidth: 1,
          elevation: 10,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: -5,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          title: "My Tags",
          tabBarIcon: ({ color, size }) => (
            <QrCode color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "",
          tabBarButton: (props) => (
            <CustomScanButton onPress={props.onPress} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tabs>
    <AiAssistant />
    </>
  );
}
