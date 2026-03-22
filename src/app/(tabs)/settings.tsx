import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text, Button, H2, Separator } from 'tamagui';

export default function SettingsTab() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack f={1} p="$4" bg="$background" gap="$4">
        
        <H2 mb="$2">Settings</H2>

        <YStack gap="$2">
          <Text fontWeight="bold" fontSize="$4">Account</Text>
          <Text color="$gray10" mb="$2">Google Sync is disabled for Phase 3.</Text>
          <Button theme="active" disabled opacity={0.5}>Sign in with Google</Button>
        </YStack>

        <Separator marginVertical="$4" />

        <YStack gap="$2">
          <Text fontWeight="bold" fontSize="$4">Data Management</Text>
          <Button variant="outlined" onPress={() => console.log('Export CSV')}>Export Data (CSV)</Button>
          <Button theme="red" onPress={() => console.log('Wipe DB')}>Clear All Data</Button>
        </YStack>
        
        <Separator marginVertical="$4" />
        
        <YStack gap="$2">
          <Text fontWeight="bold" fontSize="$4">About</Text>
          <Text color="$gray10">Finance Tracker v1.0.0</Text>
        </YStack>

      </YStack>
    </ScrollView>
  );
}
