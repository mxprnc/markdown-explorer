import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { App } from '@/core/App';

interface TemplateListViewProps {
  app: App;
}

export function TemplateListView({ app }: TemplateListViewProps) {
  const { colors, fontFamilyUI } = useTheme();
  const [templates, setTemplates] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const templatesFolder = '_mark-explorer/templates';

  const loadTemplates = async () => {
    try {
      if (await app.vault.exists(templatesFolder)) {
        const files = await app.vault.listFiles(templatesFolder);
        setTemplates(files.filter(f => f.endsWith('.md')));
      }
    } catch (err) {
      console.error('[TemplateListView] Failed to load templates', err);
    }
  };

  useEffect(() => {
    loadTemplates();

    // Vault 변경 감지를 위한 간단한 폴링 또는 이벤트 구독 (여기서는 vault:changed 이벤트 가정)
    const handleVaultChange = () => loadTemplates();
    app.on('vault:changed', handleVaultChange);
    
    return () => {
      app.off('vault:changed', handleVaultChange);
    };
  }, []);

  const handleInsert = async (path: string) => {
    const plugin = app.plugins.getPlugin('templates');
    if (plugin && (plugin as any).insertTemplate) {
      await (plugin as any).insertTemplate(path);
    }
  };

  const handleEdit = (path: string) => {
    app.workspace.openFile(path);
  };

  const handleCreate = async () => {
    const now = new Date();
    const fileName = `Untitled-${now.getTime()}.md`;
    const fullPath = `${templatesFolder}/${fileName}`;
    
    await app.vault.write(fullPath, '# New Template\n\nContent here...');
    // Notify vault change
    app.emit('vault:changed');
    // Open for editing
    app.workspace.openFile(fullPath);
  };

  const handleDelete = async (path: string) => {
    // In a real app, we'd use a modal. For now, native Alert (or window.confirm in web)
    if (typeof window !== 'undefined' && window.confirm('Delete this template?')) {
      // Logic to delete file should be in Plugin or Vault
      // Since Vault doesn't have delete, we use the one injected in app/index.tsx if available 
      // but App interface only has read/write.
      // Let's assume we can use a command or the plugin has it.
      const plugin = app.plugins.getPlugin('templates');
      if (plugin && (plugin as any).deleteTemplate) {
        await (plugin as any).deleteTemplate(path);
        loadTemplates();
      }
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.split('/').pop()?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={14} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontFamily: fontFamilyUI }]}
            placeholder="Search templates..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable onPress={handleCreate} style={[styles.createBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={18} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView style={styles.list}>
        {filteredTemplates.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>
              {searchQuery ? 'No templates match search.' : 'No templates found.'}
            </Text>
          </View>
        ) : (
          filteredTemplates.map(path => {
            const name = path.split('/').pop()?.replace('.md', '') || path;
            const isActive = (app.workspace.getActiveFile() === path);

            return (
              <Pressable 
                key={path} 
                onPress={() => handleEdit(path)}
                style={({ pressed }) => [
                  styles.item, 
                  { borderBottomColor: colors.border },
                  pressed && { backgroundColor: colors.background },
                  isActive && { backgroundColor: colors.background, borderLeftColor: colors.primary, borderLeftWidth: 3 }
                ]}
              >
                <View style={styles.itemInfo}>
                  <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                  <Text style={[styles.itemName, { color: colors.text, fontFamily: fontFamilyUI }]} numberOfLines={1}>
                    {name}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <Pressable 
                    onPress={(e) => { e.stopPropagation(); handleInsert(path); }}
                    style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                  >
                    <Ionicons name="download-outline" size={14} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary, fontFamily: fontFamilyUI }]}>Insert</Text>
                  </Pressable>
                  <Pressable 
                    onPress={(e) => { e.stopPropagation(); handleEdit(path); }}
                    style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                  >
                    <Ionicons name="create-outline" size={14} color={colors.textMuted} />
                  </Pressable>
                  <Pressable 
                    onPress={(e) => { e.stopPropagation(); handleDelete(path); }}
                    style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.error || '#ff4d4f'} />
                  </Pressable>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    marginLeft: 6,
    padding: 0,
  },
  createBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'column',
    padding: 12,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
