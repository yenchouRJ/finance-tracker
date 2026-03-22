import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "../theme/tamagui.config";
import { initDB } from "@/services/db/schema";

import { useColorScheme } from "@/components/useColorScheme";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLedgerStore } from "@/stores/useLedgerStore";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const initializeAuthListener = useAuthStore(
    (state) => state.initializeAuthListener,
  );

  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const setupDB = async () => {
      try {
        await initDB();
        setDbInitialized(true);
      } catch (err) {
        console.error("Failed to initialize database", err);
      }
    };
    setupDB();
  }, []);

  useEffect(() => {
    if (dbInitialized) {
      const unsubscribe = initializeAuthListener();
      return () => unsubscribe();
    }
  }, [dbInitialized]);

  // Once the DB is ready, ensure a default ledger exists for the current
  // user (or the offline "local-user" fallback). This runs early in the
  // boot sequence so every tab has an activeLedgerId available.
  const user = useAuthStore((state) => state.user);
  const fetchLedgers = useLedgerStore((state) => state.fetchLedgers);

  useEffect(() => {
    if (dbInitialized) {
      const userId = user?.id || "local-user";
      fetchLedgers(userId).catch((err: unknown) => {
        console.error("Failed to initialise ledgers", err);
      });
    }
  }, [dbInitialized, user?.id, fetchLedgers]);

  useEffect(() => {
    if (loaded && dbInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbInitialized]);

  if (!loaded || !dbInitialized) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme as string}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
