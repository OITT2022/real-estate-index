type Props = {
  url: string;
};

function getEmbedUrl(url: string): { type: "iframe" | "video"; src: string } | null {
  // YouTube: youtube.com/watch, youtu.be, youtube.com/embed
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Vimeo: vimeo.com/123456
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Direct video file
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { type: "video", src: url };
  }

  return null;
}

export function VideoEmbed({ url }: Props) {
  const embed = getEmbedUrl(url);

  if (!embed) {
    return (
      <div className="video-placeholder">
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "underline" }}>
          Watch video
        </a>
      </div>
    );
  }

  if (embed.type === "video") {
    return (
      <video
        src={embed.src}
        controls
        className="video-player"
      />
    );
  }

  return (
    <iframe
      src={embed.src}
      className="video-player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Property video"
    />
  );
}
