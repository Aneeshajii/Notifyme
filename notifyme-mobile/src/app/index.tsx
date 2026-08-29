import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import MobileLoadingScreen from "../components/MobileLoadingScreen";

export default function Index() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <MobileLoadingScreen />;
  return <Redirect href={user ? "/(tabs)" : "/auth"} />;
}
