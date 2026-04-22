import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, Pressable, TextInput, StyleSheet, FlatList, Keyboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface PickerItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

interface QuickPickerProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  items: PickerItem[];
  onSelect: (item: PickerItem) => void;
  onClose: () => void;
}

export const QuickPicker = ({ visible, title, placeholder = 'Search...', items, onSelect, onClose }: QuickPickerProps) => {
  const { colors, isDark, fontFamilyUI } = useTheme();
  const [search, setSearch] = useState('');
  const inputRef = useRef<TextInput>(null);

  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    if (visible) {
      setSearch('');
      // Autofocus input on web, mobile might need more care
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} testID="picker-overlay">
        <Pressable 
          style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          testID="picker-container"
          onPress={(e) => {
            if (Platform.OS === 'web') {
               // @ts-ignore
               e.stopPropagation();
            }
          }}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text, fontFamily: fontFamilyUI }]}>{title}</Text>
          </View>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, fontFamily: fontFamilyUI }]}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              testID="picker-input"
              autoFocus
              onSubmitEditing={() => {
                if (filteredItems.length > 0) {
                  onSelect(filteredItems[0]);
                }
              }}
            />
          </View>

          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <Pressable 
                style={({ hovered }) => [
                  styles.item,
                  hovered && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
                ]}
                onPress={() => onSelect(item)}
                testID={`picker-item-${item.id}`}
              >
                <View style={styles.itemIcon}>
                  <Ionicons name={(item.icon as any) || 'document-text-outline'} size={20} color={colors.primary} />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.itemLabel, { color: colors.text, fontFamily: fontFamilyUI }]}>{item.label}</Text>
                  {item.description && (
                    <Text style={[styles.itemDesc, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>{item.description}</Text>
                  )}
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.empty} testID="picker-empty">
                <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>No results found</Text>
              </View>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100, // Show it near top like VSCode
  },
  container: {
    width: '90%',
    maxWidth: 600,
    maxHeight: 400,
    borderRadius: 8,
    borderWidth: 1,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 36,
    borderRadius: 4,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  list: {
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 20,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
});
