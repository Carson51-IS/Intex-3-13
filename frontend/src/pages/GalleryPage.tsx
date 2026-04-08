import { useEffect, useState } from 'react';
import { getApiBase } from '../api/client';

interface GalleryImage {
  galleryImageId: number;
  imageUrl: string;
  caption?: string | null;
}

function resolveGallerySrc(path: string): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  if (!path.startsWith('/gallery-images/')) return path;
  const base = getApiBase();
  if (base.startsWith('/api')) return path;
  return `${base.replace(/\/api$/, '')}${path}`;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/gallery`, { credentials: 'include' });
        const data = (await res.json()) as GalleryImage[];
        setImages(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">Gallery</h1>
      <p className="mt-2 text-sm text-muted-foreground">Moments from Haven Light Philippines.</p>

      {loading ? (
        <div className="mt-8 text-muted-foreground">Loading gallery…</div>
      ) : images.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-6 text-muted-foreground">No images yet.</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <figure key={img.galleryImageId} className="overflow-hidden rounded-lg border border-border bg-card card-shadow">
              <img src={resolveGallerySrc(img.imageUrl)} alt={img.caption || 'Gallery image'} className="h-64 w-full object-cover" />
              {img.caption ? (
                <figcaption className="px-3 py-2 text-sm text-muted-foreground">{img.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
