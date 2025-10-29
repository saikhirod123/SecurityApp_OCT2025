import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F5F7FA' 
  },

  // Added consistent horizontal/top padding so content aligns nicely
  scrollContainer: { 
    flexGrow: 1, 
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0, // moved to scrollContainer
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 19, fontWeight: '700', color: '#24292f' },
  headerSpacer: { width: 24 },

  // Banner
  bannerArea: {
    backgroundColor: '#EFE6D9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: width * 0.08,
    paddingBottom: width * 0.06,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bannerIcon: { marginBottom: 12 },
  inviteMsg: {
    fontSize: width < 360 ? 20 : 22,
    fontWeight: '500',
    lineHeight: 30,
    color: '#6e5000',
    textAlign: 'center',
  },
  userName: {
    fontWeight: '700',
    color: '#84601B',
    fontSize: width < 360 ? 22 : 24,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 2,
    paddingVertical: 28,
    paddingHorizontal: 16, // align with scrollContainer
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  // Passcode area
  passcodeContainer: { marginBottom: 16 },
  passcodeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  passcodeLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginLeft: 6 },
  passcodeBox: {
    backgroundColor: '#F0F7FF',
    borderWidth: 2,
    borderColor: '#276CF0',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  passcodeText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#276CF0',
    letterSpacing: 10,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
    alignSelf: 'flex-start',
  },
  copyText: { color: '#276CF0', fontWeight: '700', fontSize: 14, marginLeft: 6 },

  // Validity card
  validityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    width: '100%',
  },
  validityInfo: { marginLeft: 10, flex: 1 },
  validityLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 2 },
  validityText: { fontSize: 15, color: '#333', fontWeight: '700', marginBottom: 2 },
  validitySubtext: { fontSize: 12, color: '#999' },

  // Info box
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E6EAF0',
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  infoText: { flex: 1, color: '#2C3E50' },

  // Location card
  locationCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EAF0',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  locationInfo: { flex: 1 },
  locationLabel: { fontSize: 12, color: '#6B7A90', marginBottom: 4 },
  locationText: { fontSize: 14, color: '#2C3E50', fontWeight: '600' },

  // Share section
  shareSection: { marginTop: 20, marginBottom: 8 },
  shareSectionTitle: { fontSize: 16, fontWeight: '700', color: '#2C3E50', marginBottom: 12, textAlign: 'center' },
  shareButtonsContainer: { flexDirection: 'row', gap: 12 },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  whatsappButton: { backgroundColor: '#25D366' },
  smsButton: { backgroundColor: '#276CF0' },
  shareButtonText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 10 },
});
