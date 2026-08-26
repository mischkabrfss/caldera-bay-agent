import { redirect } from 'next/navigation';
import { getCurrentUser, type User } from './auth';

/** Guards every /admin page and admin API route. */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/compte');
  return user;
}

export async function isAdminRequest(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}
