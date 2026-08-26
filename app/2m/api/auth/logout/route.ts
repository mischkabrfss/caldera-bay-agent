import { destroySession } from '@/lib/auth';
import { redirectTo } from '@/lib/http';

export async function POST(request: Request): Promise<Response> {
  await destroySession();
  return redirectTo(request, '/2m');
}
