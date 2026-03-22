import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebase/config';

WebBrowser.maybeCompleteAuthSession();

// Client IDs from Google Cloud Console
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || 'dummy-web-client-id.apps.googleusercontent.com',
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID || 'dummy-ios-client-id.apps.googleusercontent.com',
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID || 'dummy-android-client-id.apps.googleusercontent.com',
  });

  const handleSignIn = async () => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      try {
        const result = await signInWithCredential(auth, credential);
        return result.user;
      } catch (error) {
        console.error("Firebase Sign-In Error:", error);
        throw error;
      }
    }
  };

  return { request, response, promptAsync, handleSignIn };
};
