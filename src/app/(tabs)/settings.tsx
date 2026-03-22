import React, { useState } from "react";
import { ScrollView } from "react-native";
import { YStack, Text, Button, H2, Separator, Avatar, Spinner } from "tamagui";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGoogleAuth } from "@/services/auth/googleAuth";
import { SyncEngine } from "@/features/sync/syncEngine";

export default function SettingsTab() {
  const { user, firebaseUser, logout } = useAuthStore();
  const { promptAsync, handleSignIn, request, response } = useGoogleAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    if (response?.type === "success") {
      handleSignIn();
    }
  }, [response]);

  const handleSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await SyncEngine.syncAll(user.id);
      alert("Sync completed successfully!");
    } catch (error) {
      console.error(error);
      alert("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack f={1} p="$4" bg="$background" gap="$4">
        <H2 mb="$2">Settings</H2>

        <YStack gap="$2">
          <Text fontWeight="bold" fontSize="$4">
            Account
          </Text>
          {user ? (
            <YStack
              gap="$3"
              alignItems="center"
              p="$3"
              bg="$gray3"
              borderRadius="$4"
            >
              <Avatar circular size="$6">
                <Avatar.Image src={user.photoUrl || undefined} />
                <Avatar.Fallback bc="$gray5" />
              </Avatar>
              <YStack alignItems="center">
                <Text fontWeight="bold">{user.displayName}</Text>
                <Text color="$gray10">{user.email}</Text>
              </YStack>
              <Button
                theme="active"
                onPress={handleSync}
                disabled={isSyncing}
                mt="$2"
                width="100%"
              >
                {isSyncing ? <Spinner /> : "Sync Data Now"}
              </Button>
              <Button theme="red" onPress={logout} mt="$2" width="100%">
                Sign Out
              </Button>
            </YStack>
          ) : (
            <>
              <Text color="$gray10" mb="$2">
                Sign in to sync your data across devices.
              </Text>
              <Button
                theme="active"
                disabled={!request}
                onPress={() => promptAsync()}
              >
                Sign in with Google
              </Button>
            </>
          )}
        </YStack>

        <Separator marginVertical="$4" />

        <YStack gap="$2">
          <Text fontWeight="bold" fontSize="$4">
            Data Management
          </Text>
          <Button variant="outlined" onPress={() => console.log("Export CSV")}>
            Export Data (CSV)
          </Button>
          <Button theme="red" onPress={() => console.log("Wipe DB")}>
            Clear All Data
          </Button>
        </YStack>

        <Separator marginVertical="$4" />

        <YStack gap="$2">
          <Text fontWeight="bold" fontSize="$4">
            About
          </Text>
          <Text color="$gray10">Finance Tracker v1.0.0</Text>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
