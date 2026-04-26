import React from 'react';

interface VideoPlayerProps {
  youtubeId: string;
}

/**
 * Memoized Video Player with Thumbnail Fallback to prevent black screen during reload/flicker
 */
export const VideoPlayer = React.memo(({ youtubeId }: VideoPlayerProps) => {
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
