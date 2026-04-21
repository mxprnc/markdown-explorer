import React, { memo, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TabBarProps {
  paneId: 1 | 2;
  files: string[];
  previewFile?: string | null;
  selectedFile: string;
  onSelect: (file: string) => void;
  onClose: (file: string) => void;
  onPin?: (file: string) => void;
  onContextMenu?: (e: any, file: string, paneId: 1 | 2) => void;
  onSetDraggingTab: (val: any) => void;
  onDropTab?: (file: string, sourcePane: 1 | 2, targetPane: 1 | 2, targetIndex: number) => void;
  isDraggingOver?: boolean;
}

export const TabBar = memo(({
  paneId, files, previewFile, selectedFile, onSelect, onClose, onPin, onContextMenu, onSetDraggingTab, onDropTab, isDraggingOver
}: TabBarProps) => {
  const { colors, fontFamilyUI } = useTheme();
  const lastClickRef = useRef<{ time: number, file: string } | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const showIndicatorAtEnd = dragOverIndex === files.length || (isDraggingOver && dragOverIndex === null);
  const showIndicatorAtStart = (files.length === 0 && (dragOverIndex === 0 || isDraggingOver));
  
  const handleTabPress = (file: string) => {
    const now = Date.now();
    const lastClick = lastClickRef.current;
    
    if (lastClick && lastClick.file === file && now - lastClick.time < 300) {
      // Double click detected
      onPin && onPin(file);
      lastClickRef.current = null;
    } else {
      lastClickRef.current = { time: now, file };
      onSelect(file);
    }
  };

  const handleDrop = (e: any, targetIndex: number) => {
    if (Platform.OS !== 'web') return;
    setDragOverIndex(null);
    e.preventDefault();
    e.stopPropagation(); // Avoid bubbling to Pane container
    
    const rawData = e.dataTransfer.getData("text/plain");
    let file = rawData;
    let sourcePane = 0;
    
    if (rawData.includes(':')) {
      const parts = rawData.split(':');
      sourcePane = parseInt(parts[0]);
      file = parts.slice(1).join(':'); // Handle files with colons in path
    } else {
      const sourcePaneStr = e.dataTransfer.getData("application/x-pane-id");
      sourcePane = sourcePaneStr ? parseInt(sourcePaneStr) : (draggingTab?.sourcePane || 0);
      file = rawData || draggingTab?.file;
    }
    
    if (onDropTab && file) {
      onDropTab(file, sourcePane as any, paneId, targetIndex); 
    }
  };
  
  if (files.length === 0) {
    return (
      <View 
        style={[styles.tabBar, { borderBottomColor: colors.border }]}
        {...({
          onDragOver: (e: any) => { 
            e.preventDefault(); 
            e.stopPropagation();
            setDragOverIndex(0); 
          },
          onDragEnter: (e: any) => {
            e.preventDefault();
            e.stopPropagation();
          },
          onDragLeave: (e: any) => {
            e.stopPropagation();
            setDragOverIndex(null);
          },
          onDrop: (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            handleDrop(e, 0);
          }
        } as any)}
      >
        <Text style={{ color: colors.textMuted, fontSize: 12, paddingHorizontal: 12 }}>No file opened</Text>
        {showIndicatorAtStart && <View style={[styles.insertionIndicator, { backgroundColor: colors.primary }]} />}
      </View>
    );
  }

  return (
    <View 
      accessibilityRole="tablist"
      style={[styles.tabBar, { borderBottomColor: colors.border }]}
      {...({
        onDragOver: (e: any) => { e.preventDefault(); e.stopPropagation(); setDragOverIndex(files.length); },
        onDragLeave: () => setDragOverIndex(null),
        onDrop: (e: any) => handleDrop(e, files.length)
      } as any)}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {files.map((file, index) => {
          const isActive = file === selectedFile;
          const isPreview = file === previewFile;
          const fileName = file.split('/').pop() || file;
          const isDraggedOver = dragOverIndex === index;

          const tabContent = (
            <Pressable 
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.tabItem, 
                { backgroundColor: colors.surface, borderRightColor: colors.border }, 
                isActive && [styles.tabItemActive, { borderTopColor: colors.primary, backgroundColor: colors.background }]
              ]}
              onPress={() => handleTabPress(file)} 
              onContextMenu={(e) => onContextMenu && onContextMenu(e, file, paneId)}
            >
              {isDraggedOver && <View style={[styles.insertionIndicator, { backgroundColor: colors.primary }]} />}
              <Text 
                selectable={false} 
                style={[
                  styles.tabText, 
                  { color: colors.textMuted, fontFamily: fontFamilyUI }, 
                  isActive && [styles.tabTextActive, { color: colors.text }],
                  isPreview && { fontStyle: 'italic' }
                ]}
              >
                {fileName}
              </Text>
              <Pressable 
                onPress={(e) => { 
                  if (Platform.OS === 'web') e.preventDefault();
                  e.stopPropagation(); 
                  onClose(file); 
                }} 
                style={styles.tabCloseBtn}
              >
                <Text selectable={false} style={[styles.tabCloseText, { color: colors.textMuted }]}>✕</Text>
              </Pressable>
            </Pressable>
          );

          if (Platform.OS === 'web') {
            return (
              <div 
                key={file} 
                draggable="true"
                onDragStart={(e: any) => {
                  if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = "move";
                    const dataStr = `${paneId}:${file}`;
                    e.dataTransfer.setData("text/plain", dataStr);
                    // Legacy support for other listeners
                    e.dataTransfer.setData("application/x-pane-id", paneId.toString());
                  }
                  onSetDraggingTab({ file, sourcePane: paneId });
                }}
                onDragEnd={() => {
                  setDragOverIndex(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverIndex(index);
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(e, index);
                }}
                className="tab-item"
                data-testid={`tab-item-${file}`}
                style={{ display: 'flex', flexDirection: 'row', userSelect: 'none', WebkitUserSelect: 'none', cursor: 'grab' } as any}
              >
                {tabContent}
              </div>
            );
          }

          return (
            <View key={file} style={{ flexDirection: 'row' }}>
              {tabContent}
            </View>
          );
        })}
        {showIndicatorAtEnd && files.length > 0 && <View style={[styles.insertionIndicator, { backgroundColor: colors.primary, left: undefined, right: 0 }]} />}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 38,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    borderRightWidth: 1,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
    cursor: 'pointer',
  } as any,
  tabItemActive: {
  },
  tabText: {
    fontSize: 12,
    marginRight: 6,
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  tabCloseBtn: {
    padding: 4,
    borderRadius: 4,
  },
  tabCloseText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  insertionIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 10,
  } as any,
});
