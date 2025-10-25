import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrossPlatformDatePicker } from '../components/CrossPlatformDatePicker';
import { app } from '../firebaseConfig';
import { styles } from '../StylingSheets/partyGroupInviteStyles';

export default function PartyGroupInvite() {
  const router = useRouter();
  const db = getFirestore(app);
  const auth = getAuth(app);

  const [userName, setUserName] = useState('User');
  const [flatNumber, setFlatNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [location, setLocation] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());

  const [validFor, setValidFor] = useState('8 Hours');
  const [guestCount, setGuestCount] = useState('5');
  const [customGuests, setCustomGuests] = useState('');
  const GUEST_OPTIONS = ['5', '20', '50'];

  const [passcode, setPasscode] = useState('');
  const [inviteCreated, setInviteCreated] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userDetails');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || 'User');
        setFlatNumber(user.flatNumber || '');
        setBuilding(user.building || '');
        setLocation(
          user.flatNumber && user.building
            ? `Block - ${user.flatNumber}, ${user.building}`
            : ''
        );
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleCreateInvite = async () => {
    if (!guestCount && !customGuests) {
      Alert.alert('Required', 'Please select number of guests');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'Please login to create invites');
        return;
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setPasscode(code);

      const hours = parseInt(validFor.replace(/\D/g, '')) || 8;
      const expiryDate = new Date(date);
      expiryDate.setHours(startTime.getHours() + hours);
      expiryDate.setMinutes(startTime.getMinutes());

      await addDoc(collection(db, 'invites'), {
        userId: currentUser.uid,
        userName: userName,
        flatNumber: flatNumber,
        building: building,
        location: location,
        passcode: code,
        type: 'party',
        date: date.toISOString(),
        startTime: startTime.toISOString(),
        validFor: validFor,
        guestCount: customGuests || guestCount,
        createdAt: serverTimestamp(),
        expiresAt: expiryDate,
        isActive: true,
      });

      setInviteCreated(true);
      Alert.alert('Success!', `Invite created with passcode: ${code}`);
    } catch (error) {
      console.error('Error creating invite:', error);
      Alert.alert('Error', 'Failed to create invite. Please try again.');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(passcode);
      Alert.alert('✅ Copied!', 'Passcode copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy passcode');
    }
  };

  const createInviteMessage = () => {
    const finalGuestCount = customGuests || guestCount;
    const hours = parseInt(validFor.replace(/\D/g, '')) || 8;
    const expiryDate = new Date(date);
    expiryDate.setHours(startTime.getHours() + hours);
    expiryDate.setMinutes(startTime.getMinutes());
    
    return `🎉 *Party/Group Invite from ${userName}*\n\n` +
      `📍 Location: ${location}\n` +
      `📅 Date: ${date.toDateString()}\n` +
      `⏰ Time: ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n` +
      `⌛ Valid for: ${validFor}\n` +
      `👥 Expected Guests: ${finalGuestCount}\n` +
      `🔑 Passcode: *${passcode}*\n` +
      `⏰ Valid until: ${expiryDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}\n\n` +
      `Please use this passcode to enter the premises.`;
  };

  const handleWhatsAppShare = async () => {
    if (!passcode) {
      Alert.alert('Create Invite First', 'Please create an invite before sharing');
      return;
    }

    try {
      const message = createInviteMessage();
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;

      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('WhatsApp Not Found', 'WhatsApp is not installed on your device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  };

  const handleSMSShare = async () => {
    if (!passcode) {
      Alert.alert('Create Invite First', 'Please create an invite before sharing');
      return;
    }

    try {
      const message = createInviteMessage();
      const encodedMessage = encodeURIComponent(message);
      
      let smsUrl = Platform.OS === 'ios' ? `sms:&body=${encodedMessage}` : `sms:?body=${encodedMessage}`;

      const supported = await Linking.canOpenURL(smsUrl);
      if (supported) {
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert('Error', 'Unable to open SMS app');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open SMS');
    }
  };

  const getExpiryTime = () => {
    const hours = parseInt(validFor.replace(/\D/g, '')) || 8;
    const expiryDate = new Date(date);
    expiryDate.setHours(startTime.getHours() + hours);
    expiryDate.setMinutes(startTime.getMinutes());
    return expiryDate.toLocaleString('en-IN', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#363636" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Party/Group Invite</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.bannerArea}>
            <MaterialCommunityIcons name="party-popper" size={48} color="#84601B" style={styles.bannerIcon} />
            <Text style={styles.inviteMsg}>
              <Text style={styles.userName}>{userName.toUpperCase()}</Text>
              {'\nhas invited you.'}
            </Text>
          </View>

          <View style={styles.card}>
            
            {/* Date Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.floatingLabel}>Select Date</Text>
              <CrossPlatformDatePicker
                value={date}
                onChange={setDate}
                mode="date"
              />
            </View>

            {/* Time and Duration Row */}
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <View style={styles.inputContainer}>
                  <Text style={styles.floatingLabel}>Starting From</Text>
                  <CrossPlatformDatePicker
                    value={startTime}
                    onChange={setStartTime}
                    mode="time"
                  />
                </View>
              </View>

              <View style={styles.halfWidth}>
                <View style={styles.inputContainer}>
                  <Text style={styles.floatingLabel}>Valid For</Text>
                  <View style={styles.modernInput}>
                    <View style={styles.inputContent}>
                      <Ionicons name="hourglass" size={20} color="#276CF0" style={styles.inputIcon} />
                      <TextInput
                        style={styles.inputTextEditable}
                        value={validFor}
                        placeholder="8 Hours"
                        placeholderTextColor="#999"
                        onChangeText={setValidFor}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.floatingLabel}>Location/Venue</Text>
              <View style={styles.modernInput}>
                <View style={styles.inputContent}>
                  <Ionicons name="location" size={20} color="#276CF0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputTextEditable}
                    value={location}
                    placeholder="Enter location"
                    placeholderTextColor="#999"
                    onChangeText={setLocation}
                  />
                </View>
              </View>
            </View>

            {/* Guest Count */}
            <View style={styles.inputContainer}>
              <Text style={styles.floatingLabel}>
                How many guests? <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.guestRow}>
                {GUEST_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.guestChip, guestCount === opt && !customGuests && styles.guestChipActive]}
                    onPress={() => {
                      setGuestCount(opt);
                      setCustomGuests('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.guestChipText, guestCount === opt && !customGuests && styles.guestChipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={[styles.guestChip, customGuests && styles.guestChipActive]}
                  activeOpacity={1}
                >
                  <TextInput
                    style={[styles.guestChipText, customGuests && styles.guestChipTextActive]}
                    placeholder="Custom"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    value={customGuests}
                    onChangeText={(v) => {
                      setCustomGuests(v.replace(/\D/g, ''));
                      setGuestCount('');
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleCreateInvite}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={22} color="#313131" style={{ marginRight: 8 }} />
              <Text style={styles.createBtnText}>Create Invite</Text>
            </TouchableOpacity>

            {inviteCreated && passcode && (
              <View style={styles.passcodeSection}>
                <View style={styles.passcodeBox}>
                  <Ionicons name="shield-checkmark" size={28} color="#276CF0" style={{ marginBottom: 8 }} />
                  <Text style={styles.passcodeLabel}>Your Invite Passcode</Text>
                  <Text style={styles.passcodeText}>{passcode}</Text>
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopyToClipboard} activeOpacity={0.7}>
                    <Ionicons name="copy" size={18} color="#276CF0" />
                    <Text style={styles.copyText}>Copy Passcode</Text>
                  </TouchableOpacity>

                  <View style={styles.validityCard}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <View style={styles.validityInfo}>
                      <Text style={styles.validityLabel}>Valid Until</Text>
                      <Text style={styles.validityText}>{getExpiryTime()}</Text>
                      <Text style={styles.validitySubtext}>{validFor} from start time</Text>
                    </View>
                  </View>
                </View>

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
