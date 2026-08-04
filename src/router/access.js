function loginRedirect(to) {
  return {
    name: 'login',
    query: { redirect: to.fullPath }
  }
}

/**
 * Resolve an administrator route without trusting the cached local profile.
 * The caller supplies the auth store so the decision stays independently testable.
 */
export async function resolveAdminAccess(to, auth) {
  if (!to.meta.requiresAdmin) return true
  if (!auth.isLoggedIn) return loginRedirect(to)

  const refreshed = await auth.refreshProfile()
  if (!refreshed?.success) {
    return auth.isLoggedIn
      ? { name: 'home', query: { denied: 'admin' } }
      : loginRedirect(to)
  }

  return auth.isAdmin
    ? true
    : { name: 'home', query: { denied: 'admin' } }
}
