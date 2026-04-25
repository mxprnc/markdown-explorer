import React, { useState, useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const LinkCardComponent = ({ node, updateAttributes, editor, getPos }: any) => {
  const { url, alt, type } = node.attrs;
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(url);
  const [editAlt, setEditAlt] = useState(alt);
  const [metadata, setMetadata] = useState<{ title?: string; image?: string; siteName?: string }>({});
  
  const menuRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);

  // Extract YouTube ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isYoutube = getYoutubeId(url);

  useEffect(() => {
    if (type === 'thumb') {
      if (isYoutube) {
        setMetadata({
          image: `https://img.youtube.com/vi/${isYoutube}/mqdefault.jpg`,
          siteName: 'YouTube',
          title: alt || 'YouTube Video'
        });
      } else {
        // Fallback for general links in thumbnail mode
        // In a real app, you'd fetch OG tags here (requires proxy or backend)
        setMetadata({
          title: alt || url.split('//')[1]?.split('/')[0] || url,
          siteName: url.split('//')[1]?.split('/')[0] || 'Website'
        });
      }
    }
  }, [url, type, alt, isYoutube]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(url);
    // Could add a "Copied!" toast here
  };

  const handleEditSave = () => {
    updateAttributes({
      url: editUrl,
      alt: editAlt
    });
    setIsEditing(false);
  };

  const handleRemove = () => {
    if (typeof getPos === 'function') {
      editor.commands.deleteRange({ from: getPos(), to: getPos() + node.nodeSize });
    }
  };

  const setType = (newType: 'plain' | 'link' | 'thumb') => {
    updateAttributes({ type: newType });
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (editRef.current && !editRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderPlain = () => (
    <span style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}>
      {url}
    </span>
  );

  const renderLink = () => (
    <span style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}>
      {alt || url}
    </span>
  );

  const renderThumb = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#fff',
      margin: '8px 0',
      width: '100%',
      maxWidth: '600px',
      cursor: 'pointer'
    }}>
      <div style={{ flex: 1, padding: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px', color: '#111827' }}>
          {metadata.title}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {url}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#eee', borderRadius: '2px', marginRight: '6px' }} />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{metadata.siteName}</span>
        </div>
      </div>
      {metadata.image && (
        <div style={{ width: '160px', height: '100px', backgroundColor: '#f3f4f6' }}>
          <img src={metadata.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Thumbnail" />
        </div>
      )}
    </div>
  );

  const renderVideo = () => (
    <div style={{ 
      margin: '16px 0', 
      width: '100%', 
      maxWidth: '600px',
      aspectRatio: '16 / 9',
      backgroundColor: '#000',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <iframe 
        src={`https://www.youtube.com/embed/${isYoutube}`}
        width="100%" 
        height="100%" 
        style={{ border: 'none' }}
        allowFullScreen
      />
    </div>
  );

  return (
    <NodeViewWrapper
      className="link-card-node"
      style={{
        display: 'inline-block',
        position: 'relative',
        verticalAlign: 'middle',
        maxWidth: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isEditing) setShowMenu(false);
      }}
    >
      <div onClick={() => setShowMenu(!showMenu)}>
        {type === 'video' && isYoutube ? renderVideo() : (type === 'thumb' ? renderThumb() : (type === 'link' ? renderLink() : renderPlain()))}
      </div>

      {/* Type Selector Menu (Visible on Hover) */}
      {isHovered && !isEditing && (
        <>
          {/* Transparent bridge to prevent menu from disappearing when moving mouse between link and menu */}
          {type !== 'thumb' && type !== 'video' && (
            <div style={{
              position: 'absolute',
              top: '-32px',
              left: 0,
              right: 0,
              height: '32px',
              zIndex: 140,
              background: 'transparent'
            }} />
          )}
          <div style={{
            position: 'absolute',
            top: (type === 'thumb' || type === 'video') ? '12px' : '-32px',
            right: (type === 'thumb' || type === 'video') ? '12px' : '0',
            display: 'flex',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 150,
            overflow: 'hidden'
          }}>
          <button 
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setType('plain'); }} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '4px', border: 'none', borderRight: '1px solid #f3f4f6', 
              background: type === 'plain' ? '#eff6ff' : '#fff', cursor: 'pointer', padding: '4px 8px',
              color: type === 'plain' ? '#2563eb' : '#4b5563'
            }}
          >
            <Ionicons name="text-outline" size={14} color={type === 'plain' ? '#2563eb' : '#4b5563'} />
            <span style={{ fontSize: '11px', fontWeight: type === 'plain' ? '600' : '400' }}>Text</span>
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setType('link'); }} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '4px', border: 'none', borderRight: '1px solid #f3f4f6', 
              background: type === 'link' ? '#eff6ff' : '#fff', cursor: 'pointer', padding: '4px 8px',
              color: type === 'link' ? '#2563eb' : '#4b5563'
            }}
          >
            <Ionicons name="link-outline" size={14} color={type === 'link' ? '#2563eb' : '#4b5563'} />
            <span style={{ fontSize: '11px', fontWeight: type === 'link' ? '600' : '400' }}>Link</span>
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setType('thumb'); }} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '4px', border: 'none', borderRight: isYoutube ? '1px solid #f3f4f6' : 'none', 
              background: type === 'thumb' ? '#eff6ff' : '#fff', cursor: 'pointer', padding: '4px 8px',
              color: type === 'thumb' ? '#2563eb' : '#4b5563'
            }}
          >
            <Ionicons name="image-outline" size={14} color={type === 'thumb' ? '#2563eb' : '#4b5563'} />
            <span style={{ fontSize: '11px', fontWeight: type === 'thumb' ? '600' : '400' }}>Card</span>
          </button>
          {isYoutube && (
            <button 
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setType('video'); }} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '4px', border: 'none', 
                background: type === 'video' ? '#eff6ff' : '#fff', cursor: 'pointer', padding: '4px 8px',
                color: type === 'video' ? '#2563eb' : '#4b5563'
              }}
            >
              <Ionicons name="videocam-outline" size={14} color={type === 'video' ? '#2563eb' : '#4b5563'} />
              <span style={{ fontSize: '11px', fontWeight: type === 'video' ? '600' : '400' }}>Video</span>
            </button>
          )}
        </div>
      </>
    )}

      {/* Notion-style Link Menu */}
      {showMenu && !isEditing && (
        <div 
          ref={menuRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '4px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '200px'
          }}
        >
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: '13px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none', padding: '4px 8px' }}>
            {url}
          </a>
          <div style={{ display: 'flex', gap: '4px', paddingRight: '4px' }}>
            <button onClick={handleCopy} title="Copy link" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
              <Ionicons name="copy-outline" size={16} color="#4b5563" />
            </button>
            <button onClick={() => setIsEditing(true)} title="Edit link" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Ionicons name="create-outline" size={16} color="#4b5563" />
              <span style={{ fontSize: '12px', color: '#4b5563' }}>편집</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Popup */}
      {isEditing && (
        <div 
          ref={editRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '12px',
            zIndex: 110,
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>페이지 또는 URL</label>
            <input 
              value={editUrl} 
              onChange={(e) => setEditUrl(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px', outline: 'none' }}
              placeholder="https://..."
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>링크 제목</label>
            <input 
              value={editAlt} 
              onChange={(e) => setEditAlt(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px', outline: 'none' }}
              placeholder="제목 입력"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <button onClick={handleRemove} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
              링크 제거
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsEditing(false)} style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #d1d5db', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>취소</button>
              <button onClick={handleEditSave} style={{ padding: '6px 12px', fontSize: '12px', border: 'none', background: '#3b82f6', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>저장</button>
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default LinkCardComponent;
