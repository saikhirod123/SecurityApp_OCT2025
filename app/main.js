import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { app } from '../firebaseConfig';
import { styles } from '../StylingSheets/mainPageStyles';

const { height } = Dimensions.get('window');

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function MainPage() {
  const router = useRouter();
  const db = getFirestore(app);
  const auth = getAuth(app);

  const [user, setUser] = useState({
    name: '',
    flatNumber: '',
    building: '',
    profileUrl: '',
    mobile: '',
  });

  const [doorStatus, setDoorStatus] = useState('Closed');
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const holdTimerRef = useRef(null);
  const autoCloseTimerRef = useRef(null);
  const progressAnimRef = useRef(new Animated.Value(0)).current;
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        const storedUserStr = await AsyncStorage.getItem('userDetails');
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          setUser(storedUser);
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log("No logged-in user");
          return;
        }
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const freshUser = userDocSnap.data();
          setUser(freshUser);
          await AsyncStorage.setItem('userDetails', JSON.stringify(freshUser));
        } else {
          console.log("User document not found for UID:", currentUser.uid);
          await AsyncStorage.removeItem('userDetails');
        }
      } catch (error) {
        console.error("Error loading user/building data: ", error);
        await AsyncStorage.removeItem('userDetails');
      }
    }
    loadUserData();

    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handlePressIn = () => {
    if (doorStatus !== 'Closed') return;
    
    setIsHolding(true);
    setProgress(0);
    
    Animated.timing(progressAnimRef, {
      toValue: 100,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    let progressValue = 0;
    progressIntervalRef.current = setInterval(() => {
      progressValue += 5;
      setProgress(progressValue);
      if (progressValue >= 100) {
        clearInterval(progressIntervalRef.current);
      }
    }, 100);

    holdTimerRef.current = setTimeout(() => {
      handleDoorOpen();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }, 2000);
  };

  const handlePressOut = () => {
    if (!isHolding) return;
    
    setIsHolding(false);
    setProgress(0);
    
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    progressAnimRef.setValue(0);
    
    if (doorStatus === 'Closed' && progress < 100) {
      Alert.alert('Hold Longer', 'Press and hold for 2 seconds to open door');
    }
  };

  const handleDoorOpen = () => {
    setIsHolding(false);
    setDoorStatus('Opening');
    
    setTimeout(() => {
      setDoorStatus('Open');
      
      autoCloseTimerRef.current = setTimeout(() => {
        handleDoorClose();
      }, 120000);
      
    }, 1000);
  };

  const handleDoorClose = () => {
    setDoorStatus('Closing');
    
    setTimeout(() => {
      setDoorStatus('Closed');
      setProgress(0);
      progressAnimRef.setValue(0);
    }, 1000);
  };

  const getStatusColor = () => {
    switch (doorStatus) {
      case 'Open': return '#4CAF50';
      case 'Opening': return '#FFA726';
      case 'Closing': return '#FFA726';
      case 'Closed': return '#757575';
      default: return '#757575';
    }
  };

  const getStatusIcon = () => {
    switch (doorStatus) {
      case 'Open': return 'lock-open';
      case 'Opening': return 'hourglass-outline';
      case 'Closing': return 'hourglass-outline';
      case 'Closed': return 'lock-closed';
      default: return 'lock-closed';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          {user.profileUrl ? (
            <Image source={{ uri: user.profileUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{getInitials(user.name || 'U')}</Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerFlatNo}>{user.flatNumber || 'Your Flat'}</Text>
            <Text style={styles.headerAddress}>{user.building || 'Building Name'}</Text>
          </View>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color="#222" />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: height * 0.14, paddingTop: height * 0.04 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome card */}
          <View style={styles.welcomeCard}>
            <ImageBackground
              source={require('../assets/images/Welcome_Image_updated.png')}
              style={styles.backgroundImage}
              imageStyle={{ borderRadius: 16, resizeMode: 'cover' }}
            >
              <View style={styles.textOverlay}>
                <Text style={styles.welcomeText}>Welcome, {user.name || 'User'}!</Text>
                <Text style={styles.unitText}>
                  {user.flatNumber ? `Unit ${user.flatNumber}` : ''}
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* Guest Invite Card */}
          <View style={styles.modalCard}>
            <Text style={styles.title}>Guest Invite</Text>
            <Text style={styles.subtitle}>
              Create pre-approval of expected visitors to ensure hassle-free entry for them
            </Text>
            <TouchableOpacity
              style={styles.inviteOption}
              onPress={() => router.push('/quick-invite')}
              activeOpacity={0.8}
            >
              <View style={styles.inviteTextWrap}>
                <Text style={styles.inviteTitle}>Quick Invite &gt;</Text>
                <Text style={styles.inviteDesc}>
                  Ensure smooth entry by manually pre-approving guests. Best for small, personal gatherings.
                </Text>
              </View>
              <Ionicons name="person-add-outline" size={30} color="#22343C" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inviteOption}
              onPress={() => router.push('/party-group-invite')}
              activeOpacity={0.8}
            >
              <View style={styles.inviteTextWrap}>
                <Text style={styles.inviteTitle}>Party/Group Invite &gt;</Text>
                <Text style={styles.inviteDesc}>
                  Create a common guest invite link with a limit for large gatherings and easy tracking.
                </Text>
              </View>
              <Ionicons name="people-outline" size={30} color="#22343C" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inviteOption}
              onPress={() => router.push('/frequent-visitor-invite')}
              activeOpacity={0.8}
            >
              <View style={styles.inviteTextWrap}>
                <Text style={styles.inviteTitle}>Frequent Invite &gt;</Text>
                <Text style={styles.inviteDesc}>
                  Invite long-term guests with a single passcode, without repeated approvals.
                </Text>
              </View>
              <Ionicons name="repeat-outline" size={30} color="#22343C" />
            </TouchableOpacity>
          </View>

          {/* Intercom Card */}
          <View style={styles.cardContainer}>
            <View style={styles.deviceCard}>
              <View style={styles.intercomHeader}>
                <Ionicons name="home-outline" size={24} color="#276CF0" />
                <Text style={styles.deviceTitle}>{user.name}'s Intercom</Text>
              </View>

              <View style={[styles.statusCard, { backgroundColor: `${getStatusColor()}15` }]}>
                <Ionicons name={getStatusIcon()} size={32} color={getStatusColor()} />
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusLabel}>Door Status</Text>
                  <Text style={[styles.statusText, { color: getStatusColor() }]}>
                    {doorStatus}
                  </Text>
                  {doorStatus === 'Open' && (
                    <Text style={styles.autoCloseText}>Auto-closes in 2 minutes</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.holdButton,
                  doorStatus !== 'Closed' && styles.holdButtonDisabled,
                  isHolding && styles.holdButtonActive,
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                disabled={doorStatus !== 'Closed'}
              >
                <View style={styles.buttonContent}>
                  <Ionicons 
                    name={doorStatus === 'Closed' ? 'lock-open-outline' : 'lock-closed-outline'} 
                    size={24} 
                    color="#fff" 
                  />
                  <Text style={styles.holdButtonText}>
                    {doorStatus === 'Closed' ? 'Hold to Open Door' : 'Door ' + doorStatus}
                  </Text>
                  {isHolding && (
                    <Text style={styles.holdProgress}>{Math.round(progress)}%</Text>
                  )}
                </View>
                
                {isHolding && (
                  <View style={styles.progressBarContainer}>
                    <Animated.View 
                      style={[
                        styles.progressBar,
                        {
                          width: progressAnimRef.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]} 
                    />
                  </View>
                )}
              </TouchableOpacity>

              {doorStatus === 'Closed' && (
                <Text style={styles.instructionText}>
                  Press and hold for 2 seconds to unlock door
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom tab bar */}
        <View style={styles.tabBar}>
          <TabIcon
            icon="home-outline"
            label="Home"
            onPress={() => {
              if (router.pathname !== '/main') {
                router.push('/main');
              }
            }}
            active={router.pathname === '/main'}
          />
          <TabIcon icon="person-outline" label="Visitors" onPress={() => router.push('/visitors')} />
          <TabIcon
            icon="settings-outline"
            label="Account"
            onPress={() => router.push('/profile')}
            active={router.pathname === '/profile'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function TabIcon({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.tabIconWrap} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={25} color={active ? '#276CF0' : '#A3A8B3'} />
      <Text style={[styles.tabLabel, { color: active ? '#276CF0' : '#A3A8B3' }]}>{label}</Text>
    </TouchableOpacity>
  );
}
