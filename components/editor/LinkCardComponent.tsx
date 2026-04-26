import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ThemeContext } from './ThemeContext';

// Global cache to persist metadata across component re-mounts
const metadataCache = new Map<string, any>();

// Helper to extract YouTube ID
const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Memoized Video Player with Thumbnail Fallback to prevent black screen during reload/flicker
const VideoPlayer = React.memo(({ youtubeId }: { youtubeId: string }) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  
  return (
    <div style={{ 
      margin: '20px 0', 
      width: '100%', 
      maxWidth: '700px',
      aspectRatio: '16 / 9',
      backgroundColor: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
      position: 'relative'
    }}>
      {/* Thumbnail shown behind iframe to prevent black flicker on reload */}
      <img 
        src={thumbnailUrl} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          opacity: 0.4,
          filter: 'blur(4px)'
        }} 
        alt=""
      />
      <iframe 
        key={youtubeId}
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
        width="100%" 
        height="100%" 
        style={{ border: 'none', position: 'relative', zIndex: 1 }}
        allowFullScreen
      />
    </div>
  );
});

const LinkCardComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, editor, getPos }) => {
  const { url, alt, type } = node.attrs;
  const theme = useContext(ThemeContext);
  const isDark = theme?.isDark ?? false;
  
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [editUrl, setEditUrl] = useState(url);
  const [editAlt, setEditAlt] = useState(alt);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const colors = useMemo(() => ({
    bg: isDark ? 'rgba(21, 23, 24, 0.85)' : 'rgba(255, 255, 255, 0.85)',
    border: isDark ? '#374151' : '#E5E7EB',
    text: isDark ? '#ECEDEE' : '#11181C',
    muted: isDark ? '#9BA1A6' : '#687076',
    primary: '#3B82F6',
    danger: '#EF4444',
    shadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  }), [isDark]);

  const isYoutube = useMemo(() => getYoutubeId(url), [url]);

  // Derived metadata to prevent flickering on first render
  const getDerivedMetadata = () => {
    const cacheKey = `${url}-${type}-${alt}`;
    if (metadataCache.has(cacheKey)) {
      return metadataCache.get(cacheKey);
    }

    let nextMetadata: any = {};
    if (type === 'thumb' || type === 'video') {
      if (isYoutube) {
        nextMetadata = {
          image: `https://img.youtube.com/vi/${isYoutube}/mqdefault.jpg`,
          siteName: 'YouTube',
          title: alt || ''
        };
      } else {
        nextMetadata = {
          title: alt || '',
          siteName: url.split('//')[1]?.split('/')[0] || ''
        };
      }
    }
    
    metadataCache.set(cacheKey, nextMetadata);
    return nextMetadata;
  };

  const [metadata, setMetadata] = useState(getDerivedMetadata());

  useEffect(() => {
    const nextMetadata = getDerivedMetadata();
    if (JSON.stringify(nextMetadata) !== JSON.stringify(metadata)) {
      setMetadata(nextMetadata);
    }
  }, [url, type, alt, isYoutube]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        await Clipboard.setStringAsync(url);
      }
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleEditSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateAttributes({
      url: editUrl,
      alt: editAlt
    });
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof getPos === 'function') {
      editor.commands.deleteRange({ from: getPos(), to: getPos() + node.nodeSize });
    }
  };

  const setType = (newType: 'plain' | 'link' | 'thumb' | 'video') => {
    updateAttributes({ type: newType });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setShowMenu(false);
      }
      if (editRef.current && !editRef.current.contains(target)) {
        setIsEditing(false);
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const renderPlain = () => (
    <span style={{ color: colors.primary, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', wordBreak: 'break-all' }}>
      {url}
    </span>
  );

  const renderLink = () => (
    <span style={{ color: colors.primary, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', wordBreak: 'break-all' }}>
      {alt || url}
    </span>
  );

  const renderThumb = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#fff',
      margin: '12px 0',
      width: '100%',
      maxWidth: '650px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
    }}
    >
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px', color: colors.text, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {metadata.title}
        </div>
        <div style={{ fontSize: '12px', color: colors.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace', opacity: 0.8 }}>
          {url}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
          <div style={{ width: '18px', height: '18px', backgroundColor: isDark ? '#374151' : '#f3f4f6', borderRadius: '4px', marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Ionicons name="globe-outline" size={12} color={colors.muted} />
          </div>
          <span style={{ fontSize: '12px', color: colors.muted, fontWeight: '500' }}>{metadata.siteName}</span>
        </div>
      </div>
      {metadata.image && (
        <div style={{ width: '200px', height: '130px', backgroundColor: isDark ? '#111827' : '#f3f4f6', flexShrink: 0 }}>
          <img src={metadata.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Thumbnail" />
        </div>
      )}
    </div>
  );

  return (
    <NodeViewWrapper
      className="link-card-node"
      style={{
        display: 'inline-block',
        position: 'relative',
        verticalAlign: 'middle',
        maxWidth: '100%',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98) translateY(5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .premium-popup {
          animation: fadeInScale 0.15s ease-out forwards;
        }
        .premium-toast {
          animation: toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .premium-input:focus {
          border-color: ${colors.primary} !important;
          box-shadow: 0 0 0 2px ${colors.primary}33 !important;
        }
        .toolbar-button:hover {
          background-color: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'} !important;
        }
        .active-type-button {
          background-color: ${isDark ? 'rgba(59, 130, 246, 0.25)' : '#eff6ff'} !important;
          color: ${colors.primary} !important;
        }
      `}</style>

      {/* Main Content Area */}
      <div 
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }} 
        style={{ 
          display: 'inline-block', 
          width: (type === 'thumb' || type === 'video') ? '100%' : 'auto',
          cursor: 'pointer',
          wordBreak: 'break-all',
          minHeight: type === 'video' ? '100px' : 'auto'
        }}
      >
        {type === 'video' && isYoutube ? (
          <VideoPlayer youtubeId={isYoutube} />
        ) : (
          type === 'thumb' ? renderThumb() : (type === 'link' ? renderLink() : renderPlain())
        )}
      </div>

      {/* Unified Hover Toolbar */}
      {(isHovered || showMenu) && !isEditing && (
        <>
          <div style={{
            position: 'absolute',
            top: (type === 'thumb' || type === 'video') ? '-12px' : '-44px',
            left: 0,
            right: 0,
            height: (type === 'thumb' || type === 'video') ? '60px' : '60px',
            zIndex: 140,
            background: 'transparent'
          }} />
          
          <div 
            ref={menuRef}
            className="premium-popup" 
            onMouseEnter={handleMouseEnter}
            style={{
              position: 'absolute',
              top: (type === 'thumb' || type === 'video') ? '12px' : '-44px',
              left: 0,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: colors.bg,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              boxShadow: colors.shadow,
              zIndex: 150,
              padding: '4px',
              minWidth: 'max-content'
            }}
          >
            <div style={{ display: 'flex', gap: '2px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '2px', marginBottom: '2px' }}>
              {[
                { id: 'plain', icon: 'text-outline', label: 'Text' },
                { id: 'link', icon: 'link-outline', label: 'Link' },
                { id: 'thumb', icon: 'image-outline', label: 'Card' },
                ...(isYoutube ? [{ id: 'video', icon: 'videocam-outline', label: 'Video' }] : [])
              ].map((item) => (
                <button 
                  key={item.id}
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setType(item.id as any); 
                  }} 
                  className={`toolbar-button ${type === item.id ? 'active-type-button' : ''}`}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', border: 'none', 
                    background: 'transparent', cursor: 'pointer', padding: '6px 10px',
                    color: colors.muted, borderRadius: '6px', transition: 'all 0.2s ease'
                  }}
                >
                  <Ionicons name={item.icon as any} size={14} color={type === item.id ? colors.primary : colors.muted} />
                  <span style={{ fontSize: '11px', fontWeight: type === item.id ? '700' : '500' }}>{item.label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px' }}>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="toolbar-button"
                onMouseDown={(e) => e.stopPropagation()}
                style={{ 
                  flex: 1, fontSize: '12px', color: colors.muted, overflow: 'hidden', textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap', textDecoration: 'none', padding: '6px 10px',
                  fontFamily: 'JetBrains Mono, monospace', borderRadius: '6px', maxWidth: '200px'
                }}
              >
                {url}
              </a>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button 
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleCopy(e); }} 
                  title="Copy link" 
                  className="toolbar-button"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                >
                  <Ionicons name="copy-outline" size={16} color={colors.muted} />
                </button>
                <button 
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setIsEditing(true); 
                    setShowMenu(false);
                  }} 
                  title="Edit link" 
                  className="toolbar-button"
                  style={{ 
                    border: 'none', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
                    cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', 
                    display: 'flex', alignItems: 'center', gap: '6px',
                    borderLeft: `1px solid ${colors.border}`
                  }}
                >
                  <Ionicons name="create-outline" size={16} color={colors.primary} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: colors.text }}>편집</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Popup */}
      {isEditing && (
        <div 
          ref={editRef}
          className="premium-popup"
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            backgroundColor: colors.bg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            padding: '20px',
            zIndex: 170,
            width: '360px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: colors.muted, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {type === 'video' ? 'Video URL' : '페이지 또는 URL'}
            </label>
            <input 
              className="premium-input"
              value={editUrl} 
              onChange={(e) => setEditUrl(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ 
                width: '100%', padding: '12px', fontSize: '14px', 
                backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#f9fafb',
                border: `1px solid ${colors.border}`, borderRadius: '10px', outline: 'none',
                color: colors.text, transition: 'all 0.2s ease',
                fontFamily: 'JetBrains Mono, monospace',
                boxSizing: 'border-box'
              }}
              placeholder="https://..."
            />
          </div>
          
          {(type === 'link' || type === 'thumb') && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: colors.muted, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>링크 제목 (Alt Text)</label>
              <input 
                className="premium-input"
                value={editAlt} 
                onChange={(e) => setEditAlt(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ 
                  width: '100%', padding: '12px', fontSize: '14px', 
                  backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#f9fafb',
                  border: `1px solid ${colors.border}`, borderRadius: '10px', outline: 'none',
                  color: colors.text, transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                placeholder="표시할 제목 입력"
              />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(e); }} style={{ border: 'none', background: 'none', color: colors.danger, fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', borderRadius: '8px' }} className="toolbar-button">
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              링크 제거
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(false); }} style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '700', border: `1px solid ${colors.border}`, background: 'transparent', color: colors.text, borderRadius: '10px', cursor: 'pointer' }} className="toolbar-button">취소</button>
              <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleEditSave(e); }} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '700', border: 'none', background: colors.primary, color: '#fff', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }} onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastVisible && (
        <div className="premium-toast" style={{
          position: 'absolute',
          bottom: (type === 'thumb' || type === 'video') ? '-60px' : '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.9)' : 'rgba(37, 99, 235, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>Link copied to clipboard</span>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default LinkCardComponent;
