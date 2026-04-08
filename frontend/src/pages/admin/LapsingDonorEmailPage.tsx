import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { api, getApiBase } from '../../api/client';

interface LapsingDonor {
  supporterId: number;
  displayName: string;
  email: string;
  lastDonationDate?: string | null;
}

interface LapsingResponse {
  count: number;
  days: number;
  donors: LapsingDonor[];
}

interface GalleryImage {
  galleryImageId: number;
  imageUrl: string;
  caption?: string | null;
}

function resolveGallerySrc(path: string): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = getApiBase();
  if (base.startsWith('/api')) return path;
  return `${base.replace(/\/api$/, '')}${path}`;
}

export default function LapsingDonorEmailPage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [days, setDays] = useState(90);
  const [donors, setDonors] = useState<LapsingDonor[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [subject, setSubject] = useState('We miss you at Haven Light Philippines');
  const [body, setBody] = useState(
    `Hello,\n\nWe are grateful for your support of Haven Light Philippines. We noticed it has been a while since your last donation, and we would be honored to have you with us again.\n\nYour support helps provide shelter, care, and hope for girls in our safe homes.\n\nWith gratitude,\nHaven Light Philippines`,
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  const load = async (windowDays = 90) => {
    setLoading(true);
    setError('');
    try {
      const [lapsing, galleryItems] = await Promise.all([
        api.get<LapsingResponse>(`/supporters/lapsing-candidates?days=${windowDays}`),
        api.get<GalleryImage[]>('/gallery'),
      ]);
      setDays(lapsing.days);
      setDonors(lapsing.donors ?? []);
      setGallery(Array.isArray(galleryItems) ? galleryItems : []);
      if (!selectedImageUrl && galleryItems?.length) {
        setSelectedImageUrl(galleryItems[0].imageUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lapsing donors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(90);
  }, []);

  const donorIds = useMemo(() => donors.map((d) => d.supporterId), [donors]);

  const sendMock = async () => {
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const result = await api.post<{ message: string; sentCount: number }>('/supporters/lapsing-campaign/mock-send', {
        donorIds,
        subject,
        body,
        imageUrl: selectedImageUrl || null,
      });
      setSuccess(result.message ?? `Mock send completed for ${result.sentCount} donors.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send mock email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Lapsing Donor Campaign</h1>
            <p className="mt-1 text-sm text-muted-foreground">Auto-generated email for donors with no donation in {days} days.</p>
          </div>
          <Link to="/admin/donors" className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground no-underline hover:bg-muted">
            Back to Donors
          </Link>
        </div>

        {error ? <div className="mb-4 rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        {success ? <div className="mb-4 rounded-md border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">{success}</div> : null}

        <div className="mb-4 rounded-lg border border-border bg-card p-4 card-shadow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{donors.length}</span> donors about to lapse
            </div>
            <button
              type="button"
              onClick={() => void load(days)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4 card-shadow">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <label className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gallery image</label>
            <select
              value={selectedImageUrl}
              onChange={(e) => setSelectedImageUrl(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">No image</option>
              {gallery.map((g) => (
                <option key={g.galleryImageId} value={g.imageUrl}>
                  {g.caption || g.imageUrl}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={sending || loading || donors.length === 0}
              onClick={() => void sendMock()}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {sending ? 'Sending…' : `Send Mock Email to ${donors.length} Donors`}
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 card-shadow">
            <div className="mb-3 text-sm font-semibold text-foreground">Email preview</div>
            {selectedImageUrl ? (
              <img src={resolveGallerySrc(selectedImageUrl)} alt="Selected gallery visual" className="mb-3 h-44 w-full rounded-md object-cover" />
            ) : null}
            <div className="mb-2 text-base font-semibold text-foreground">{subject || '(No subject)'}</div>
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{body || '(No content)'}</pre>
            <div className="mt-4 border-t border-border pt-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recipients</div>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading recipients…</div>
              ) : donors.length === 0 ? (
                <div className="text-sm text-muted-foreground">No lapsing donors found.</div>
              ) : (
                <ul className="max-h-48 space-y-1 overflow-auto text-sm text-muted-foreground">
                  {donors.map((d) => (
                    <li key={d.supporterId}>
                      {d.displayName} - {d.email}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
