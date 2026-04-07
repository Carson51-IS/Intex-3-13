/** Re-exports — implementation lives in `authClient.ts` (avoids stale TS diagnostics on this path). */
export {
  getAuthSession,
  registerUser,
  logoutUser,
  loginUser,
  getExternalAuthProviders,
  buildExternalLoginUrl,
} from './authClient';
