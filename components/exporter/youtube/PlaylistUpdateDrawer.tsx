import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlaylistItem } from '../../../utils/PlaylistParserUtils';

interface PlaylistUpdateDrawerProps {
  visible: boolean;
  onClose: () => void;
  items: PlaylistItem[];
  onApply: (items: PlaylistItem[]) => void;
}

export const PlaylistUpdateDrawer: React.FC<PlaylistUpdateDrawerProps> = ({ visible, onClose, items, onApply }) => {
  const [localItems, setLocalItems] = useState<PlaylistItem[]>([]);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  useEffect(() => {
    if (visible) {
      setLocalItems([...items]);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, items]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localItems.length - 1) return;

    const newItems = [...localItems];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    setLocalItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...localItems];
    newItems.splice(index, 1);
    setLocalItems(newItems);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Update Playlist</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.listContainer}>
            {localItems.map((item, index) => (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title || 'Unknown Video'}</Text>
                  <Text style={styles.itemUrl} numberOfLines={1}>{item.url}</Text>
                  {item.note ? (
                    <Text style={styles.itemNote} numberOfLines={1}>📝 Note attached</Text>
                  ) : null}
                </View>
                
                <View style={styles.itemActions}>
                  <TouchableOpacity testID="move-up-button" onPress={() => moveItem(index, 'up')} disabled={index === 0}>
                    <Ionicons name="chevron-up" size={24} color={index === 0 ? '#3f3f46' : '#a1a1aa'} />
                  </TouchableOpacity>
                  <TouchableOpacity testID="move-down-button" onPress={() => moveItem(index, 'down')} disabled={index === localItems.length - 1}>
                    <Ionicons name="chevron-down" size={24} color={index === localItems.length - 1 ? '#3f3f46' : '#a1a1aa'} />
                  </TouchableOpacity>
                  <TouchableOpacity testID="delete-button" onPress={() => removeItem(index)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {localItems.length === 0 && (
              <Text style={styles.emptyText}>No videos in playlist.</Text>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={() => {
              onApply(localItems);
              handleClose();
            }}>
              <Text style={styles.applyButtonText}>Apply Updates</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#18181b',
    borderLeftWidth: 1,
    borderLeftColor: '#27272a',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemUrl: {
    color: '#a1a1aa',
    fontSize: 13,
    marginBottom: 4,
  },
  itemNote: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  emptyText: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    backgroundColor: '#18181b',
  },
  applyButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
