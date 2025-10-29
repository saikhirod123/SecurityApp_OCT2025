import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F5F7FA' 
  },
  
  // Align with other screens for consistent padding
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
    paddingHorizontal: 0, // handled by scrollContainer
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
  
  // Inputs
  inputContainer: { marginBottom: 20 },
  floatingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  
  // Duration
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  durationChip: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    borderWidth: 2,
    borderColor: '#D6E0EC',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  durationChipActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#276CF0',
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5A6B7D',
    textAlign: 'center',
  },
  durationChipTextActive: { color: '#276CF0' },
  
  // Create button
  createBtn: {
    marginTop: 32,
    backgroundColor: '#FFDB0A',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFDB0A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnText: { color: '#313131', fontWeight: '700', fontSize: 17 },
  
  // Passcode section
  passcodeSection: { marginTop: 32 },
  passcodeBox: {
    backgroundColor: '#F0F7FF',
    borderWidth: 2,
    borderColor: '#276CF0',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  passcodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  passcodeText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#276CF0',
    letterSpacing: 10,
    marginBottom: 16,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
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
  
  // Share
  shareTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
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
