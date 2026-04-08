import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAccountPreferences,
  saveAccountPreferences,
  type CurrencyPreference,
} from '../lib/accountPreferences';

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const defaultName = user ? user.userName?.trim() || user.email.split('@')[0] || user.email : '';
  const emailKey = user?.email ?? 'anonymous';

  const initial = useMemo(
    () => getAccountPreferences(emailKey, defaultName),
    [defaultName, emailKey],
  );

  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveAccountPreferences(emailKey, form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const onImageChange = (file: File | null) => {
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Please choose an image smaller than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setForm((f) => ({ ...f, profileImageDataUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="rounded-xl border bg-card p-6 card-shadow md:p-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Account settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your profile details and display preferences.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCn}>Name</label>
              <input
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className={inputCn}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className={labelCn}>Phone number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputCn}
                placeholder="+63..."
              />
            </div>
          </div>

          <div>
            <label className={labelCn}>Profile image</label>
            <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
              {form.profileImageDataUrl ? (
                <img
                  src={form.profileImageDataUrl}
                  alt="Profile preview"
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                    <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-3.71 0-6.75 2.44-6.75 5.44a.75.75 0 0 0 .75.75h12a.75.75 0 0 0 .75-.75C18.75 16.44 15.71 14 12 14Z" />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, profileImageDataUrl: '' }))}
                  className="mt-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Remove image
                </button>
              </div>
            </div>
            {imageError ? <p className="mt-1 text-xs text-destructive">{imageError}</p> : null}
          </div>

          <div>
            <label className={labelCn}>Preferred currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as CurrencyPreference }))}
              className={inputCn}
            >
              <option value="PHP">Philippine Peso (PHP)</option>
              <option value="USD">US Dollar (USD)</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Save settings
            </button>
            <Link
              to="/manage-mfa"
              className="rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
            >
              Manage MFA
            </Link>
            {saved ? <span className="text-sm font-medium text-success">Saved</span> : null}
          </div>
        </form>
      </div>
    </div>
  );
}

const labelCn = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const inputCn =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2';

