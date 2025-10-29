import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrossPlatformDatePicker } from '../components/CrossPlatformDatePicker';
import { app } from '../firebaseConfig';
import { styles } from '../StylingSheets/frequentVisitorInviteStyles';

const DURATION_OPTIONS = ['1 Day', '1 Week', '1 Month', '>1 Month'];

export default function FrequentVisitorInvite() {
  const router = useRouter();
  const db = getFirestore(app);
  const auth = getAuth(app);

  const [userName, setUserName] = useState('User');
  const [flatNumber, setFlatNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [location, setLocation] = useState('');

  const [duration, setDuration] = useState('1 Week');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [passcode, setPasscode] = useState('');
  const [inviteCreated, setInviteCreated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('userDetails');
        if (userData) {
          const u = JSON.parse(userData);
          setUserName(u.name || 'User');
          setFlatNumber(u.flatNumber || '');
          setBuilding(u.building || '');
          setLocation(
            u.flatNumber && u.building ? `Block - ${u.flatNumber}, ${u.building}` : ''
          );
        }
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    })();
  }, []);

  // Compute desired end date from start + duration.
  const computedEnd = useMemo(() => {
    const d = new Date(startDate);
    switch (duration) {
      case '1 Day':
        d.setDate(d.getDate() + 1);
        return d;
      case '1 Week':
        d.setDate(d.getDate() + 7);
        return d;
      case '1 Month':
        d.setMonth(d.getMonth() + 1);
        return d;
      default:
        // '>1 Month' -> user editable, don't override
        return endDate;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, duration, endDate]);

  // Only sync state if timestamp actually changes, to avoid infinite loops.
  useEffect(() => {
    if (duration !== '>1 Month') {
      const nextTs = computedEnd instanceof Date ? computedEnd.getTime() : 0;
      const currTs = endDate instanceof Date ? endDate.getTime() : -1;
      if (nextTs !== currTs) {
        setEndDate(computedEnd);
      }
    }
  }, [computedEnd, duration, endDate]);

  const handleCreateInvite = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'Please login to create invites');
        return;
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setPasscode(code);

      await addDoc(collection(db, 'invites'), {
        userId: currentUser.uid,
        userName,
        flatNumber,
        building,
        location: location || `${building}, Flat ${flatNumber}`,
        passcode: code,
        type: 'frequent',
        duration,
        startDate: startDate.toISOString(),
        endDate: computedEnd.toISOString(),
        createdAt: serverTimestamp(),
        expiresAt: computedEnd,
        isActive: true,
      });

      setInviteCreated(true);
      Alert.alert('Success!', `Frequent visitor invite created with passcode: ${code}`);
    } catch (error) {
      console.error('Error creating invite:', error);
      Alert.alert('Error', 'Failed to create invite. Please try again.');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      if (!passcode) {
        Alert.alert('No Passcode', 'Create an invite first to copy the passcode.');
        return;
      }
      await Clipboard.setStringAsync(passcode);
      Alert.alert('✅ Copied!', 'Passcode copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy passcode');
    }
  };

  const createInviteMessage = () =>
    `🏠 *Frequent Visitor Invite from ${userName}*\n\n` +
    `📍 Location: ${location || `${building}, Flat ${flatNumber}`}\n` +
    `📅 Valid from: ${startDate.toDateString()}\n` +
    `📅 Valid until: ${computedEnd.toDateString()}\n` +
    `⏰ Duration: ${duration}\n` +
    `🔑 Passcode: *${passcode}*\n\n` +
    `This passcode allows entry during the specified period.`;

  const handleWhatsAppShare = async () => {
    if (!passcode) {
      Alert.alert('Create Invite First', 'Please create an invite before sharing');
      return;
    }
    try {
      const encoded = encodeURIComponent(createInviteMessage());
      const schemeURL = `whatsapp://send?text=${encoded}`;
      const httpsURL = `https://wa.me/?text=${encoded}`;

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
    } catch {
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  };

  const handleSMSShare = async () => {
    if (!passcode) {
      Alert.alert('Create Invite First', 'Please create an invite before sharing');
      return;
    }
    try {
      const encoded = encodeURIComponent(createInviteMessage());
      const smsUrl = Platform.OS === 'ios' ? `sms:&body=${encoded}` : `sms:?body=${encoded}`;
      const supported = await Linking.canOpenURL(smsUrl);
      if (supported) {
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert('Error', 'Unable to open SMS app');
      }
    } catch {
      Alert.alert('Error', 'Failed to open SMS');
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
            <Text style={styles.headerTitle}>Frequent Visitor Invite</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Banner */}
          <View style={styles.bannerArea}>
            <MaterialCommunityIcons name="account-clock" size={48} color="#84601B" style={styles.bannerIcon} />
            <Text style={styles.inviteMsg}>
              <Text style={styles.userName}>{userName.toUpperCase()}</Text>
              {'\nhas invited you.'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Duration */}
            <View style={styles.inputContainer}>
              <Text style={styles.floatingLabel}>Allow entry for</Text>
              <View style={styles.durationRow}>
                {DURATION_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.durationChip, duration === opt && styles.durationChipActive]}
                    onPress={() => setDuration(opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.durationChipText, duration === opt && styles.durationChipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Start Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.floatingLabel}>Start Date</Text>
              <CrossPlatformDatePicker
                value={startDate}
                onChange={setStartDate}
                mode="date"
                minimumDate={new Date()}
                placeholder="Pick start date"
              />
            </View>

            {/* End Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.floatingLabel}>End Date</Text>
              <CrossPlatformDatePicker
                value={computedEnd}
                onChange={setEndDate}
                mode="date"
                minimumDate={startDate}
                disabled={duration !== '>1 Month'}
                placeholder="Pick end date"
              />
              {duration !== '>1 Month' && (
                <Text style={styles.helperText}>Auto-calculated based on duration</Text>
              )}
            </View>

            {/* Create Invite */}
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateInvite} activeOpacity={0.8}>
              <Ionicons name="add-circle" size={22} color="#313131" style={{ marginRight: 8 }} />
              <Text style={styles.createBtnText}>Create Invite</Text>
            </TouchableOpacity>

            {/* Passcode + Share */}
            {inviteCreated && passcode && (
              <View style={styles.passcodeSection}>
                <View style={styles.passcodeBox}>
                  <Ionicons name="shield-checkmark" size={28} color="#276CF0" style={{ marginBottom: 8 }} />
                  <Text style={styles.passcodeLabel}>Your Frequent Visitor Passcode</Text>
                  <Text style={styles.passcodeText}>{passcode}</Text>
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopyToClipboard} activeOpacity={0.7}>
                    <Ionicons name="copy" size={18} color="#276CF0" />
                    <Text style={styles.copyText}>Copy Passcode</Text>
                  </TouchableOpacity>

                  {/* Validity */}
                  <View style={styles.validityCard}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <View style={styles.validityInfo}>
                      <Text style={styles.validityLabel}>Valid Period</Text>
                      <Text style={styles.validityText}>
                        {startDate.toLocaleDateString('en-IN')} - {computedEnd.toLocaleDateString('en-IN')}
                      </Text>
                      <Text style={styles.validitySubtext}>{duration} access</Text>
                    </View>
                  </View>
                </View>

                {/* Share */}
                <Text style={styles.shareTitle}>Share Invite</Text>
                <View style={styles.shareButtonsContainer}>
                  <TouchableOpacity style={[styles.shareButton, styles.whatsappButton]} onPress={handleWhatsAppShare} activeOpacity={0.85}>
                    <Ionicons name="logo-whatsapp" size={24} color="#fff" />
                    <Text style={styles.shareButtonText}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.shareButton, styles.smsButton]} onPress={handleSMSShare} activeOpacity={0.85}>
                    <Ionicons name="chatbubbles" size={22} color="#fff" />
                    <Text style={styles.shareButtonText}>SMS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
