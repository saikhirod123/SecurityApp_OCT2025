import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export const CrossPlatformDatePicker = ({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate = null,
  maximumDate = null,
  is24Hour = false,
  minuteInterval = 1,
  placeholder = 'Select',
  style = {},
  disabled = false,
  testID = 'crossPlatformDatePicker',
}) => {
  const [show, setShow] = useState(false);
  const [tempIOSValue, setTempIOSValue] = useState(value ?? new Date());

  useEffect(() => {
    if (value instanceof Date) setTempIOSValue(value);
  }, [value]);

  const pad = (n) => String(n).padStart(2, '0');
  const formatDateForInput = (d) => (!d ? '' : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  const formatTimeForInput = (d) => (!d ? '' : `${pad(d.getHours())}:${pad(d.getMinutes())}`);

  const formatForDisplay = (d) => {
    if (!(d instanceof Date)) return placeholder;
    if (mode === 'time') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !is24Hour });
    }
    return d.toDateString();
  };

  // ---- Web path ------------------------------------------------------------
  if (Platform.OS === 'web') {
    const inputType = mode === 'time' ? 'time' : 'date';
    const webValue = value instanceof Date
      ? (mode === 'date' ? formatDateForInput(value) : formatTimeForInput(value))
      : '';
    const webMin = minimumDate instanceof Date
      ? (mode === 'date' ? formatDateForInput(minimumDate) : formatTimeForInput(minimumDate))
      : undefined;
    const webMax = maximumDate instanceof Date
      ? (mode === 'date' ? formatDateForInput(maximumDate) : formatTimeForInput(maximumDate))
      : undefined;

    return (
      <View style={[styles.webContainer, style]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <input
          data-testid={testID}
          type={inputType}
          value={webValue}
          onChange={(e) => {
            if (mode === 'date') {
              const nd = new Date(e.target.value);
              if (value instanceof Date) nd.setHours(value.getHours(), value.getMinutes(), 0, 0);
              onChange?.(nd);
            } else {
              const [h, m] = e.target.value.split(':');
              const base = value instanceof Date ? new Date(value) : new Date();
              base.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
              onChange?.(base);
            }
          }}
          min={webMin}
          max={webMax}
          disabled={disabled}
          step={mode === 'time' ? Math.max(60, minuteInterval * 60) : undefined} // seconds
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: 500,
            color: disabled ? '#999' : '#2C3E50',
            backgroundColor: '#F8F9FB',
            border: '1.5px solid #E1E5EB',
            borderRadius: 12,
            outline: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
          placeholder={placeholder}
        />
      </View>
    );
  }

  // ---- Native (iOS/Android) ------------------------------------------------
  const openPicker = () => {
    if (!disabled) setShow(true);
  };

  const handleAndroidChange = (event, selectedDate) => {
    if (event?.type === 'dismissed') {
      setShow(false);
      return;
    }
    setShow(false);
    if (selectedDate) onChange?.(selectedDate);
  };

  return (
    <>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        testID={testID}
        onPress={openPicker}
        disabled={disabled}
        style={({ pressed }) => [
          styles.mobileContainer,
          style,
          disabled && { opacity: 0.55 },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
      >
        <View style={styles.inputContent}>
          <Ionicons
            name={mode === 'time' ? 'time' : 'calendar'}
            size={20}
            color={disabled ? '#999' : '#276CF0'}
            style={styles.icon}
          />
          <Text style={[styles.text, !value && styles.placeholderText, disabled && styles.textDisabled]}>
            {value ? formatForDisplay(value) : placeholder}
          </Text>
          {!disabled && <Ionicons name="chevron-down" size={18} color="#6B7A90" />}
        </View>
      </Pressable>

      {/* ANDROID dialog */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value instanceof Date ? value : new Date()}
          mode={mode}
          display="default"
          onChange={handleAndroidChange}
          minimumDate={minimumDate ?? undefined}
          maximumDate={maximumDate ?? undefined}
          is24Hour={is24Hour}
          minuteInterval={minuteInterval}
        />
      )}

      {/* iOS modal with wheels (reliable) */}
      <Modal
        visible={Platform.OS === 'ios' && show}
        transparent
        animationType="slide"
        onRequestClose={() => setShow(false)}
        presentationStyle="overFullScreen"
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => { setShow(false); setTempIOSValue(value ?? new Date()); }} hitSlop={10}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>{label || (mode === 'time' ? 'Select time' : 'Select date')}</Text>
              <Pressable onPress={() => { setShow(false); onChange?.(tempIOSValue); }} hitSlop={10}>
                <Text style={styles.doneBtn}>Done</Text>
              </Pressable>
            </View>

            <DateTimePicker
              value={tempIOSValue instanceof Date ? tempIOSValue : new Date()}
              mode={mode}
              display="spinner"                 // <- iOS wheels
              onChange={(_, d) => d && setTempIOSValue(d)}
              minimumDate={minimumDate ?? undefined}
              maximumDate={maximumDate ?? undefined}
              is24Hour={is24Hour}
              minuteInterval={minuteInterval}
              themeVariant="light"              // avoids invisible text in dark themes
              textColor="#000"                  // some iOS combos need explicit color
              style={{ alignSelf: 'stretch' }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  webContainer: { width: '100%' },
  label: { marginBottom: 8, color: '#2C3E50', fontSize: 14, fontWeight: '600' },
  mobileContainer: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E1E5EB',
    overflow: 'hidden',
  },
  pressed: { transform: [{ scale: 0.997 }] },
  inputContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14 },
  icon: { marginRight: 10 },
  text: { flex: 1, fontSize: 16, color: '#2C3E50', fontWeight: '500' },
  placeholderText: { color: '#6B7A90', fontWeight: '400' },
  textDisabled: { color: '#999' },

  // iOS modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 16, paddingTop: 8 },
  modalHeader: { paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cancelBtn: { color: '#6B7A90', fontSize: 16, fontWeight: '600' },
  doneBtn: { color: '#276CF0', fontSize: 16, fontWeight: '700' },
  modalTitle: { color: '#2C3E50', fontSize: 16, fontWeight: '600' },
});
