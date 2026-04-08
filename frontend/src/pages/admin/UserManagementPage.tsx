import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';

const ROLE_OPTIONS = ['User', 'Admin', 'Donor'] as const;

interface ManagedUser {
  id: string;
  userName: string | null;
  email: string | null;
  displayName?: string | null;
  roles: string[];
  status: 'Active' | 'Locked';
}

/** Matches seed admin in AuthIdentityGenerator — deletion blocked in API. */
const PROTECTED_SEED_ADMIN_EMAIL = 'admin@havenlight.ph';

function isProtectedSeedAdmin(u: ManagedUser): boolean {
  return (u.email ?? '').trim().toLowerCase() === PROTECTED_SEED_ADMIN_EMAIL;
}

function displayNameForUser(user: ManagedUser): string {
  const source = (user.displayName?.trim() || user.userName || user.email || '').trim();
  if (!source) return 'Unknown User';
  const local = source.includes('@') ? source.split('@')[0] : source;
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeRoleList(roles: string[]): string[] {
  const set = new Set<string>();
  for (const r of roles) {
    const m = ROLE_OPTIONS.find((o) => o.toLowerCase() === r.toLowerCase());
    if (m) set.add(m);
  }
  return set.size > 0 ? Array.from(set).sort() : ['User'];
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [modal, setModal] = useState<'none' | 'create' | 'edit'>('none');
  const [editing, setEditing] = useState<ManagedUser | null>(null);

  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');
  const [createRoles, setCreateRoles] = useState<string[]>(['User']);

  const [editEmail, setEditEmail] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>(['User']);
  const [editNewPassword, setEditNewPassword] = useState('');

  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.get<ManagedUser[]>('/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setActionError('');
    setCreateEmail('');
    setCreatePassword('');
    setCreateDisplayName('');
    setCreateRoles(['User']);
    setModal('create');
  };

  const openEdit = (u: ManagedUser) => {
    setActionError('');
    setEditing(u);
    setEditEmail(u.email ?? '');
    setEditDisplayName(u.displayName?.trim() ?? '');
    setEditRoles(normalizeRoleList(u.roles));
    setEditNewPassword('');
    setModal('edit');
  };

  const closeModal = () => {
    setModal('none');
    setEditing(null);
  };

  const toggleRole = (list: string[], role: string, setter: (v: string[]) => void) => {
    const next = list.includes(role) ? list.filter((r) => r !== role) : [...list, role];
    setter(normalizeRoleList(next));
  };

  const onCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setSaving(true);
    try {
      await api.post<ManagedUser>('/admin/users', {
        email: createEmail.trim(),
        password: createPassword,
        displayName: createDisplayName.trim() || null,
        roles: normalizeRoleList(createRoles),
      });
      await fetchUsers();
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const onEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setActionError('');
    setSaving(true);
    try {
      await api.put<ManagedUser>(`/admin/users/${editing.id}`, {
        email: editEmail.trim(),
        displayName: editDisplayName.trim(),
        roles: normalizeRoleList(editRoles),
      });
      if (editNewPassword.trim()) {
        await api.post(`/admin/users/${editing.id}/password`, {
          newPassword: editNewPassword,
        });
      }
      await fetchUsers();
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const onToggleLock = async (u: ManagedUser) => {
    const locked = u.status === 'Locked';
    setActionError('');
    try {
      await api.put<ManagedUser>(`/admin/users/${u.id}/lockout`, { locked: !locked });
      await fetchUsers();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update lock status.');
    }
  };

  const onDelete = async (u: ManagedUser) => {
    if (!window.confirm(`Delete account ${u.email ?? u.id}? This cannot be undone.`)) return;
    setActionError('');
    try {
      await api.delete(`/admin/users/${u.id}`);
      await fetchUsers();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete user.');
    }
  };

  const isSelf = (u: ManagedUser) =>
    currentUser?.userId != null && currentUser.userId === u.id;

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">User Management</h1>
            <p className="font-body text-muted-foreground">
              Create accounts, assign roles (User, Admin, Donor), lock access, or remove users.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Add user
          </button>
        </div>

        {actionError && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {actionError}
          </div>
        )}

        <div className="rounded-xl border bg-card p-5 card-shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-card-foreground">Team Members</h2>
            <span className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {users.length} account{users.length === 1 ? '' : 's'}
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="overflow-x-auto overflow-hidden rounded-lg border">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Email</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Role</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr className="border-b">
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      Loading users…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr className="border-b">
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="px-4 py-3 text-foreground">{displayNameForUser(u)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground">
                        {u.roles.length ? u.roles.join(', ') : 'Unassigned'}
                      </td>
                      <td className={`px-4 py-3 ${u.status === 'Active' ? 'text-success' : 'text-warning'}`}>
                        {u.status}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(u)}
                            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isSelf(u)}
                            title={isSelf(u) ? 'You cannot change your own lock status here' : undefined}
                            onClick={() => void onToggleLock(u)}
                            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {u.status === 'Locked' ? 'Unlock' : 'Lock'}
                          </button>
                          <button
                            type="button"
                            disabled={isSelf(u) || isProtectedSeedAdmin(u)}
                            title={
                              isProtectedSeedAdmin(u)
                                ? 'This seed admin account cannot be deleted'
                                : isSelf(u)
                                  ? 'You cannot delete your own account'
                                  : undefined
                            }
                            onClick={() => void onDelete(u)}
                            className="rounded-md border border-destructive/40 bg-background px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Passwords must meet server policy (at least 14 characters). The sole administrator cannot be deleted,
            locked, or stripped of the Admin role.
          </p>
        </div>
      </div>

      {modal !== 'none' ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) closeModal();
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border bg-card p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
          >
            {modal === 'create' ? (
              <form onSubmit={onCreateSubmit} className="space-y-4">
                <h2 id="user-modal-title" className="font-heading text-xl font-semibold text-foreground">
                  Add user
                </h2>
                {actionError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {actionError}
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
                  <input
                    type="password"
                    required
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    autoComplete="new-password"
                    minLength={14}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Display name (optional)</label>
                  <input
                    type="text"
                    value={createDisplayName}
                    onChange={(e) => setCreateDisplayName(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <fieldset>
                  <legend className="mb-2 text-xs font-medium text-muted-foreground">Roles</legend>
                  <div className="flex flex-wrap gap-3">
                    {ROLE_OPTIONS.map((role) => (
                      <label key={role} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={createRoles.includes(role)}
                          onChange={() => toggleRole(createRoles, role, setCreateRoles)}
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Create'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={onEditSubmit} className="space-y-4">
                <h2 id="user-modal-title" className="font-heading text-xl font-semibold text-foreground">
                  Edit user
                </h2>
                {actionError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {actionError}
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Display name</label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <fieldset>
                  <legend className="mb-2 text-xs font-medium text-muted-foreground">Roles</legend>
                  <div className="flex flex-wrap gap-3">
                    {ROLE_OPTIONS.map((role) => (
                      <label key={role} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editRoles.includes(role)}
                          onChange={() => toggleRole(editRoles, role, setEditRoles)}
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    New password (optional)
                  </label>
                  <input
                    type="password"
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    autoComplete="new-password"
                    minLength={editNewPassword ? 14 : 0}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
