import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme, Platform, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import Editor from '@/components/Editor';
import Terminal from '@/components/Terminal';
import Preview from '@/components/Preview';

export default function App() {
  const [editorContent, setEditorContent] = useState('# Markdown Explorer Project\n\n* 실제 작동하는 CodeMirror 기반 에디터입니다.\n* 여기서 타이핑하면 아래 Live Preview 에 반영됩니다.\n\n해봤는데 잘 동작하나요? 😊');
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  const [activeTab, setActiveTab] = useState<'files' | 'editor'>('files');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [localFiles, setLocalFiles] = useState<Record<string, string>>({});
  const [dirHandle, setDirHandle] = useState<any>(null);

  const handleOpenDirectory = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('알림', '로컬 폴더 열기는 데스크탑 웹 브라우저 (Chrome, Edge 등) 환경에서 지원됩니다.');
      return;
    }
    try {
      // @ts-ignore: File System Access API 타입
      const handle = await window.showDirectoryPicker();
      setDirHandle(handle);
      setSelectedFolder(handle.name);
      
      const newFiles: Record<string, string> = {};
      // @ts-ignore
      for await (const entry of handle.values()) {
        if (entry.kind === 'file' && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
          const file = await entry.getFile();
          const text = await file.text();
          newFiles[entry.name] = text;
        }
      }
      setLocalFiles(newFiles);

      if (Object.keys(newFiles).length > 0) {
        const firstFile = Object.keys(newFiles)[0];
        setSelectedFile(firstFile);
        setEditorContent(newFiles[firstFile]);
      } else {
        setSelectedFile('');
        setEditorContent('# 불러올 파일이 없습니다.');
      }
    } catch (e) {
      console.log('User cancelled or error', e);
    }
  };

  const handlePasteImage = async (file: File) => {
    if (!dirHandle || !selectedFile) return '';
    try {
      const extMatch = file.name.match(/\.(png|jpe?g|gif|webp)$/i);
      const ext = extMatch ? extMatch[1] : 'png';
      
      const fileNameWithoutExt = selectedFile.replace(/\.[^/.]+$/, '');
      const dateStr = format(new Date(), 'yyyy-MM-dd-HHmmssSSS');
      const imgTargetName = `${dateStr}.${ext}`;
      
      const imgDirHandle = await dirHandle.getDirectoryHandle('img', { create: true });
      const currentMdDirHandle = await imgDirHandle.getDirectoryHandle(fileNameWithoutExt, { create: true });
      
      const fileHandle = await currentMdDirHandle.getFileHandle(imgTargetName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();
      
      const relativePath = `img/${fileNameWithoutExt}/${imgTargetName}`;
      return relativePath;
    } catch (err) {
      console.error('Failed to save pasted image', err);
      // Fallback
      return `붙여넣기_실패_권한필요`;
    }
  };

  const resolveImage = async (relativePath: string) => {
    if (!dirHandle) return relativePath;
    try {
      if (relativePath.startsWith('http') || relativePath.startsWith('data:') || relativePath.startsWith('blob:')) {
        return relativePath;
      }
      let cleaned = relativePath;
      if (cleaned.startsWith('./')) {
         cleaned = cleaned.slice(2);
      }
      const parts = cleaned.split('/').filter(Boolean);
      if (parts.length === 0) return relativePath;
      let currentHandle = dirHandle;
      for (let i = 0; i < parts.length - 1; i++) {
        currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
      }
      const fileHandle = await currentHandle.getFileHandle(parts[parts.length - 1]);
      const file = await fileHandle.getFile();
      return URL.createObjectURL(file);
    } catch (err) {
      console.warn('Failed to resolve image', relativePath, err);
      return relativePath;
    }
  };

  const getAbsolutePath = () => `/Users/alpha300uk/Documents/toy-projects/${selectedFolder}/${selectedFile}`;
  const getRelativePath = () => `./${selectedFolder}/${selectedFile}`;

  const handleSaveToDisk = async (content: string) => {
    if (!dirHandle || !selectedFile) return false;
    try {
      if (Platform.OS === 'web') {
        const fileHandle = await dirHandle.getFileHandle(selectedFile, { create: false });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Save to disk failed', e);
      return false;
    }
  };

  const copyAbsolutePath = async () => {
    const p = getAbsolutePath();
    await Clipboard.setStringAsync(p);
    if (Platform.OS === 'web') window.alert(`절대 경로가 복사되었습니다:\n${p}`);
    else Alert.alert('복사됨', `절대 경로가 복사되었습니다:\n${p}`);
  };

  const copyRelativePath = async () => {
    const p = getRelativePath();
    await Clipboard.setStringAsync(p);
    if (Platform.OS === 'web') window.alert(`상대 경로가 복사되었습니다:\n${p}`);
    else Alert.alert('복사됨', `상대 경로가 복사되었습니다:\n${p}`);
  };

  // Determine current active scheme
  const currentScheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = currentScheme === 'dark';

  // Toggle Theme Function
  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Colors mapping matching plan-markdown-project.md
  const colors = {
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#F3F4F6' : '#121212',
    border: isDark ? '#374151' : '#E5E7EB',
    surface: isDark ? '#1E1E1E' : '#F9FAFB',
    primary: '#3B82F6',
    textMuted: isDark ? '#9CA3AF' : '#6B7280',
  };

  const fontFamilyUI = Platform.select({ web: 'Inter, sans-serif', default: 'System' });
  const fontFamilyCode = Platform.select({ web: 'JetBrains Mono, Fira Code, monospace', default: 'System' });

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, flexDirection: 'column' },
    
    // Header
    header: {
      height: 48,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    logoText: { color: colors.text, fontWeight: 'bold', fontSize: 16, marginRight: 24, fontFamily: fontFamilyUI },
    headerTitle: { color: colors.textMuted, fontSize: 14, marginRight: 8, fontFamily: fontFamilyUI },
    actionIcon: { color: colors.primary, fontSize: 16, marginHorizontal: 4, padding: 4, fontFamily: fontFamilyUI },
    themeBtnText: { color: colors.text, fontSize: 13, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginLeft: 16, overflow: 'hidden' },

    // Main Body
    body: { flex: 1, flexDirection: 'row' },
    
    // Sidebars
    paneLeft: {
      width: 250,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      backgroundColor: colors.surface,
    },
    paneMiddle: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      minWidth: 300,
    },
    paneRight: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    paneTOC: {
      width: 220,
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
      backgroundColor: colors.surface,
    },

    paneHeader: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    paneTitle: { fontSize: 12, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', fontFamily: fontFamilyUI },

    listItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    listItemText: { color: colors.text, fontSize: 14, fontFamily: fontFamilyUI },
    listItemSelected: { backgroundColor: isDark ? '#2D3748' : '#EFF6FF', borderLeftWidth: 3, borderLeftColor: colors.primary },

    // Footer
    footer: {
      height: 120, // Terminal height
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: isDark ? '#000000' : '#1E1E1E', // Terminal look
      padding: 12,
    },
    terminalText: {
      color: '#A7F3D0',
      fontFamily: fontFamilyCode,
      fontSize: 12,
    },
    footerPath: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: 24,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    footerPathText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', fontFamily: fontFamilyCode },
  });

  const handleTOCClick = (text: string, index: number) => {
    if (Platform.OS === 'web') {
      const headers = document.querySelectorAll('.tiptap-wrapper h1, .tiptap-wrapper h2, .tiptap-wrapper h3, .tiptap-wrapper h4, .tiptap-wrapper h5, .tiptap-wrapper h6');
      
      // Fast path: try to index match exactly
      if (headers[index] && headers[index].textContent?.trim() === text) {
        headers[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      
      // Fallback: search by text content across all headers
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].textContent?.trim() === text) {
           headers[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
           break;
        }
      }
    }
  };

  const tocList = React.useMemo(() => {
    const lines = editorContent.split('\n');
    const toc: { id: string, text: string, level: number }[] = [];
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        toc.push({
          id: `toc-${i}`,
          level: match[1].length,
          text: match[2].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_~`]/g, '')
        });
      }
    }
    return toc;
  }, [editorContent]);

  return (
    <View style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.logoText}>Mark Explorer</Text>
          <Text style={s.headerTitle}>~/Documents/toy-projects/markdown-explorer</Text>
          <Pressable onPress={copyAbsolutePath} style={{ padding: 4, marginHorizontal: 4 }}><Text style={s.actionIcon}>@</Text></Pressable>
          <Pressable onPress={copyRelativePath} style={{ padding: 4, marginHorizontal: 4 }}>
            <Ionicons name="copy-outline" size={18} color={colors.primary} />
          </Pressable>
          <Pressable onPress={toggleTheme}>
            <Text style={s.themeBtnText}>
              {currentScheme === 'dark' ? '모드: Dark' : '모드: Light'}
            </Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row' }}>
            <Pressable onPress={() => setActiveTab('files')}><Text style={[s.actionIcon, activeTab === 'files' && {color: colors.text, fontWeight: 'bold'}]}>Files</Text></Pressable>
            <Pressable onPress={() => setActiveTab('editor')}><Text style={[s.actionIcon, activeTab === 'editor' && {color: colors.text, fontWeight: 'bold'}]}>Editor</Text></Pressable>
        </View>
      </View>

      {/* BODY */}
      <View style={s.body}>
        {/* PANE 1: Directory List (Explorer 1) */}
        <View style={s.paneLeft}>
          <View style={s.paneHeader}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={s.paneTitle}>Explorer</Text>
              {Platform.OS === 'web' && (
                <Pressable onPress={handleOpenDirectory}>
                  <Text style={{color: colors.primary, fontSize: 12, fontWeight: 'bold'}}>폴더 열기</Text>
                </Pressable>
              )}
            </View>
          </View>
          <ScrollView>
            {selectedFolder ? (
              <Pressable onPress={() => {}}>
                <View style={[s.listItem, s.listItemSelected]}>
                  <Text style={[s.listItemText, {fontWeight: 'bold' }]}>📁 {selectedFolder}</Text>
                </View>
              </Pressable>
            ) : (
              <View style={{ padding: 24 }}>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 12 }}>작업하실 로컬 폴더를 열어주세요.</Text>
                <Pressable onPress={handleOpenDirectory} style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 6, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>로컬 폴더 열기</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>

        {activeTab === 'files' ? (
          <>
            {/* PANE 2: File List (Explorer 2) */}
            <View style={s.paneMiddle}>
              <View style={s.paneHeader}><Text style={s.paneTitle}>{selectedFolder || 'No Folder Selected'}</Text></View>
              <ScrollView>
                {selectedFolder ? Object.keys(localFiles).map(file => (
                  <Pressable key={file} onPress={() => { setSelectedFile(file); setEditorContent(localFiles[file] || ''); }}>
                    <View style={[s.listItem, selectedFile === file && s.listItemSelected]}>
                      <Text style={[s.listItemText, selectedFile === file && {fontWeight: 'bold' }]}>
                        📄 {file}
                      </Text>
                    </View>
                  </Pressable>
                )) : (
                  <View style={{ padding: 24 }}><Text style={{ color: colors.textMuted }}>폴더를 열어야 보입니다.</Text></View>
                )}
              </ScrollView>
            </View>

            {/* PANE 3: Preview */}
            <View style={s.paneRight}>
              <View style={s.paneHeader}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={s.paneTitle}>Preview (Read-Only)</Text>
                  <Pressable 
                    onPress={() => setActiveTab('editor')}
                    style={{
                      backgroundColor: colors.primary,
                      paddingVertical: 6,
                      paddingHorizontal: 16,
                      borderRadius: 6,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <Ionicons name="create-outline" size={14} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={{color: '#FFF', fontSize: 13, fontWeight: 'bold'}}>에디터 모드로 열기 (Split View)</Text>
                  </Pressable>
                </View>
              </View>
              <ScrollView style={{ flex: 1 }}>
                <Preview content={localFiles[selectedFile] || ''} isDark={isDark} />
              </ScrollView>
            </View>
          </>
        ) : (
          /* PANE 2: WYSIWYG Editor Mode */
          <View style={{ flex: 1 }}>
             <View style={[{borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: isDark ? '#1E1E1E' : '#F9FAFB', height: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12}]}>
                <Text style={s.paneTitle}>WYSIWYG 에디터 - {selectedFile}</Text>
                <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable 
                    onPress={async () => {
                      setLocalFiles(prev => ({ ...prev, [selectedFile]: editorContent }));
                      const saved = await handleSaveToDisk(editorContent);
                      if (saved) {
                        if (Platform.OS === 'web') window.alert('파일이 로컬 디스크에 완전히 저장되었습니다.');
                      } else {
                        if (Platform.OS === 'web') window.alert('에디터 내용이 임시 저장되었습니다 (디스크 쓰기 실패).');
                        else Alert.alert('저장됨', '에디터 내용이 임시 저장되었습니다.');
                      }
                    }} 
                    style={{ marginRight: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="save-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={{color: colors.primary, fontSize: 13, fontWeight: 'bold'}}>저장 (Cmd+S)</Text>
                  </Pressable>
                  <Pressable onPress={() => setActiveTab('files')}>
                    <Text style={{color: colors.textMuted, fontSize: 13, fontWeight: 'bold'}}>닫기 (탐색기로 돌아가기)</Text>
                  </Pressable>
                </View>
             </View>
             <View style={{ flex: 1, flexDirection: 'row' }}>
               {/* WYSIWYG Editor replaces the split view */}
               <View style={{ flex: 1 }}>
                 <Editor
                   key={selectedFile}
                   value={editorContent} 
                   onChange={setEditorContent} 
                   onSave={async (val: string) => {
                     setEditorContent(val);
                     setLocalFiles(prev => ({ ...prev, [selectedFile]: val }));
                     const saved = await handleSaveToDisk(val);
                     if (saved) {
                       if (Platform.OS === 'web') window.alert('파일이 로컬 디스크에 완전히 저장되었습니다.');
                     } else {
                       if (Platform.OS === 'web') window.alert('에디터 내용이 임시 저장되었습니다 (디스크 쓰기 실패).');
                       else Alert.alert('저장됨', '에디터 내용이 임시 저장되었습니다.');
                     }
                   }} 
                   onPasteImage={handlePasteImage}
                   resolveImage={resolveImage}
                   isDark={isDark} 
                 />
               </View>
               <View style={s.paneTOC}>
                 <View style={[s.paneHeader, { borderBottomWidth: 1, borderBottomColor: colors.border }]}><Text style={s.paneTitle}>목차 (TOC)</Text></View>
                 <ScrollView style={{ flex: 1 }}>
                   {tocList.length === 0 ? (
                     <View style={{ padding: 16 }}>
                       <Text style={{ color: colors.textMuted, fontSize: 12 }}>작성된 헤딩(제목)이 없습니다.</Text>
                     </View>
                   ) : (
                     tocList.map((item, index) => (
                       <Pressable key={item.id} onPress={() => handleTOCClick(item.text, index)}>
                         <View style={{ 
                           paddingVertical: 8, 
                           paddingRight: 12,
                           paddingLeft: 12 + (item.level - 1) * 12,
                           borderBottomWidth: 1, 
                           borderBottomColor: isDark ? '#374151' : '#F3F4F6',
                           cursor: 'pointer'
                         } as any}>
                           <Text 
                             numberOfLines={1} 
                             style={{ 
                               color: item.level === 1 ? colors.text : colors.textMuted, 
                               fontSize: item.level <= 2 ? 13 : 12,
                               fontWeight: item.level <= 2 ? 'bold' : 'normal',
                               fontFamily: 'Inter, sans-serif'
                             }}>
                             {item.text}
                           </Text>
                         </View>
                       </Pressable>
                     ))
                   )}
                 </ScrollView>
               </View>
             </View>
          </View>
        )}
      </View>

      {/* FOOTER */}
      <View style={s.footer}>
        <Terminal isDark={isDark} />
        
        <View style={s.footerPath}>
          <Text style={s.footerPathText}>/Users/alpha300uk/Documents/.../{selectedFolder}/{selectedFile}</Text>
        </View>
      </View>
    </View>
  );
}
