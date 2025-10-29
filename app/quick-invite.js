import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { app } from '../firebaseConfig';
import { styles } from '../StylingSheets/quickInviteStyles';

export default function QuickInvite() {
  const router = useRouter();
  const db = getFirestore(app);
  const auth = getAuth(app);

  const [userName, setUserName] = useState('User');
  const [flatNumber, setFlatNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [passcode, setPasscode] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [expiryTimestamp, setExpiryTimestamp] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    initializeInvite();
  }, []);

  const initializeInvite = async () => {
    try {
      const userData = await AsyncStorage.getItem('userDetails');
      const currentUser = auth.currentUser;

      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || 'User');
        setFlatNumber(user.flatNumber || '');
        setBuilding(user.building || '');
      }
      if (currentUser) setUserId(currentUser.uid);

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setPasscode(code);

      // 4 hours validity
      const now = new Date();
      const expiry = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      setExpiryTimestamp(expiry);
      setValidUntil(
        expiry.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      );

      if (currentUser) {
        await addDoc(collection(db, 'invites'), {
          userId: currentUser.uid,
          userName: userData ? JSON.parse(userData).name : 'User',
          flatNumber: userData ? JSON.parse(userData).flatNumber : '',
          building: userData ? JSON.parse(userData).building : '',
          passcode: code,
          type: 'quick',
          createdAt: serverTimestamp(),
          expiresAt: expiry, // Firestore stores as Timestamp
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Error initializing invite:', error);
      Alert.alert('Error', 'Failed to generate invite. Please try again.');
    }
  };

  const validateExpiry = () => {
    if (!expiryTimestamp) return false;
    const now = new Date();
    if (now > expiryTimestamp) {
      Alert.alert('Expired', 'This passcode has expired. Please generate a new invite.');
      return false;
    }
    return true;
  };

  const createInviteMessage = () =>
    `🏠 *Guest Invite from ${userName}*\n\n` +
    `📍 Location: ${building}, Flat ${flatNumber}\n` +
    `🔑 Passcode: *${passcode}*\n` +
    `⏰ Valid until: ${validUntil}\n\n` +
    `Please use this passcode to enter the premises.`;

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(passcode);
      Alert.alert('✅ Copied!', 'Passcode copied to clipboard', [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy passcode');
    }
  };

  // iOS-safe WhatsApp open: try scheme first, then https fallback
  const handleWhatsAppShare = async () => {
    if (!validateExpiry()) return;
    try {
      const encoded = encodeURIComponent(createInviteMessage());
      const schemeURL = `whatsapp://send?text=${encoded}`;
      const httpsURL  = `https://wa.me/?text=${encoded}`;

      const canOpenScheme = await Linking.canOpenURL(schemeURL);
      if (canOpenScheme) {
        await Linking.openURL(schemeURL);
        return;
      }
      const canOpenHttps = await Linking.canOpenURL(httpsURL);
      if (canOpenHttps) {
        await Linking.openURL(httpsURL);
        return;
      }
      Alert.alert('WhatsApp Not Found', 'Could not open WhatsApp.');
    } catch (error) {
      Alert.alert('Error', 'Failed to open WhatsApp. Please try again.');
    }
  };

  const handleSMSShare = async () => {
    if (!validateExpiry()) return;
    try {
      const encoded = encodeURIComponent(createInviteMessage());
      const smsUrl = Platform.OS === 'ios' ? `sms:&body=${encoded}` : `sms:?body=${encoded}`;
      const supported = await Linking.canOpenURL(smsUrl);
      if (supported) {
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert('Error', 'Unable to open SMS app');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open SMS. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#363636" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quick Invite</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Banner */}
          <View style={styles.bannerArea}>
            <MaterialCommunityIcons name="home-heart" size={48} color="#84601B" style={styles.bannerIcon} />
            <Text style={styles.inviteMsg}>
              <Text style={styles.userName}>{userName.toUpperCase()}</Text>
              {'\nhas invited you.'}
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.passcodeContainer}>
              <View style={styles.passcodeLabelRow}>
                <Ionicons name="key" size={22} color="#276CF0" />
                <Text style={styles.passcodeLabel}>Your Guest Passcode</Text>
              </View>

              <View style={styles.passcodeBox}>
                <Text style={styles.passcodeText}>{passcode}</Text>
              </View>

              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyToClipboard}
                activeOpacity={0.7}
              >
                <Ionicons name="copy-outline" size={18} color="#276CF0" />
                <Text style={styles.copyText}>Copy Passcode</Text>
              </TouchableOpacity>

              <View style={styles.validityCard}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <View style={styles.validityInfo}>
                  <Text style={styles.validityLabel}>Valid Until</Text>
                  <Text style={styles.validityText}>{validUntil}</Text>
                  <Text style={styles.validitySubtext}>4 hours from generation</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color="#276CF0" />
              <Text style={styles.infoText}>
                Share this passcode with your guest via WhatsApp or SMS. They can use it to enter within the next 4 hours.
              </Text>
            </View>

            <View style={styles.locationCard}>
              <MaterialCommunityIcons name="map-marker" size={22} color="#666" />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Guest Location</Text>
                <Text style={styles.locationText}>{building}</Text>
                <Text style={styles.locationText}>Flat {flatNumber}</Text>
              </View>
            </View>
          </View>

          {/* Share */}
          <View style={styles.shareSection}>
            <Text style={styles.shareSectionTitle}>Share Invite</Text>
            <View style={styles.shareButtonsContainer}>
              <TouchableOpacity
                style={[styles.shareButton, styles.whatsappButton]}
                onPress={handleWhatsAppShare}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={26} color="#fff" />
                <Text style={styles.shareButtonText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareButton, styles.smsButton]}
                onPress={handleSMSShare}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
                <Text style={styles.shareButtonText}>SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
