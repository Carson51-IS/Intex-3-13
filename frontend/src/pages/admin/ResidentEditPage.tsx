import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';

interface ResidentEditModel {
  residentId: number;
  caseControlNo: string;
  internalCode: string;
  caseStatus: string;
  caseCategory: string;
  assignedSocialWorker: string;
  referralSource: string;
  initialRiskLevel: string;
  currentRiskLevel: string;
  reintegrationStatus: string | null;
  initialCaseAssessment: string | null;
}

const STATUS_OPTIONS = ['Active', 'Closed', 'Transferred', 'Discharged'];
const RISK_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];

const labelCn = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const inputCn =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function ResidentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [model, setModel] = useState<ResidentEditModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<ResidentEditModel>(`/residents/${id}`)
      .then(setModel)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load resident.'))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!model) return;
    setError('');
    if (!model.caseControlNo.trim() || !model.internalCode.trim() || !model.assignedSocialWorker.trim()) {
      setError('Case number, internal code, and assigned social worker are required.');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/residents/${model.residentId}/core`, model);
      navigate(`/admin/residents/${model.residentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resident.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/admin/residents" className="font-medium text-primary hover:underline">Caseload</Link>
          <span className="mx-1.5 text-muted-foreground/80">/</span>
          <span className="text-foreground">Edit resident</span>
        </nav>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Edit resident</h1>
        <p className="mt-2 text-sm text-muted-foreground">Update core case details and assignment information.</p>

        {error && <div className="mt-4 rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        {loading ? (
          <div className="mt-6 text-sm text-muted-foreground">Loading resident...</div>
        ) : !model ? (
          <div className="mt-6 text-sm text-muted-foreground">Resident not found.</div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-[var(--card-shadow)]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCn}>Case control no. *</label>
                <input value={model.caseControlNo} onChange={(e) => setModel({ ...model, caseControlNo: e.target.value })} required className={inputCn} />
              </div>
              <div>
                <label className={labelCn}>Internal code *</label>
                <input value={model.internalCode} onChange={(e) => setModel({ ...model, internalCode: e.target.value })} required className={inputCn} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCn}>Case status</label>
                <select value={model.caseStatus} onChange={(e) => setModel({ ...model, caseStatus: e.target.value })} className={inputCn}>
                  {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCn}>Case category</label>
                <input value={model.caseCategory} onChange={(e) => setModel({ ...model, caseCategory: e.target.value })} className={inputCn} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCn}>Assigned social worker *</label>
                <input value={model.assignedSocialWorker} onChange={(e) => setModel({ ...model, assignedSocialWorker: e.target.value })} required className={inputCn} />
              </div>
              <div>
                <label className={labelCn}>Referral source</label>
                <input value={model.referralSource} onChange={(e) => setModel({ ...model, referralSource: e.target.value })} className={inputCn} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCn}>Initial risk</label>
                <select value={model.initialRiskLevel} onChange={(e) => setModel({ ...model, initialRiskLevel: e.target.value })} className={inputCn}>
                  {RISK_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCn}>Current risk</label>
                <select value={model.currentRiskLevel} onChange={(e) => setModel({ ...model, currentRiskLevel: e.target.value })} className={inputCn}>
                  {RISK_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCn}>Reintegration status</label>
              <input value={model.reintegrationStatus ?? ''} onChange={(e) => setModel({ ...model, reintegrationStatus: e.target.value || null })} className={inputCn} />
            </div>
            <div>
              <label className={labelCn}>Initial case assessment</label>
              <textarea value={model.initialCaseAssessment ?? ''} onChange={(e) => setModel({ ...model, initialCaseAssessment: e.target.value || null })} rows={4} className={inputCn} />
            </div>
            <div className="mt-2 flex gap-3">
              <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <Link to={`/admin/residents/${model.residentId}`} className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground no-underline hover:bg-muted">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

