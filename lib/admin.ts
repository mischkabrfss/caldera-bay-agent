import { redirect } from 'next/navigation';
import { getCurrentUser, type User } from './auth';

/** Guards every /2m/admin page and admin API route. */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/2m/connexion');
  if (user.role !== 'admin') redirect('/2m/compte');
  return user;
}

export async function isAdminRequest(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}
