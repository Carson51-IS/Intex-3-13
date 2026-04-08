import { useEffect, useState, type FormEvent } from 'react';
import { getApiBase } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';

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

export default function GalleryManagementPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const base = getApiBase();
    const res = await fetch(`${base}/gallery`, { credentials: 'include' });
    const data = (await res.json()) as GalleryImage[];
    setImages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select an image.');
      return;
    }
    setSubmitting(true);
    try {
      const base = getApiBase();
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', file);
      form.append('caption', caption);
      const res = await fetch(`${base}/gallery`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Upload failed (${res.status})`);
      }
      setFile(null);
      setCaption('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    const ok = window.confirm('Delete this image from gallery?');
    if (!ok) return;
    const base = getApiBase();
    const token = localStorage.getItem('token');
    const res = await fetch(`${base}/gallery/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? `Delete failed (${res.status})`);
      return;
    }
    await load();
  };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Gallery Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add or remove images shown on the public gallery page.</p>

        <form onSubmit={onSubmit} className="mt-6 rounded-lg border border-border bg-card p-4 card-shadow">
          {error ? <div className="mb-3 text-sm text-destructive">{error}</div> : null}
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {submitting ? 'Uploading…' : 'Add image'}
            </button>
          </div>
        </form>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <figure key={img.galleryImageId} className="overflow-hidden rounded-lg border border-border bg-card card-shadow">
              <img src={resolveGallerySrc(img.imageUrl)} alt={img.caption || 'Gallery'} className="h-56 w-full object-cover" />
              <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate text-sm text-muted-foreground">{img.caption || 'No caption'}</span>
                <button onClick={() => void remove(img.galleryImageId)} className="text-xs font-semibold text-destructive hover:underline">
                  Delete
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
