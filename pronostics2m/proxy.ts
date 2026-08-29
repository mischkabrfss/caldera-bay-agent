import { NextResponse, type NextRequest } from 'next/server';

/**
 * Les pages du site sont personnelles (session, accès VIP) et changent à chaque
 * publication de pronostic : aucune ne doit jamais être resservie depuis un
 * cache. Sans ça, un visiteur peut rester coincé sur une version périmée du
 * site — y compris une version d'avant un correctif — et croire que le site
 * est cassé.
 *
 * Les fichiers versionnés (/_next/static/...) gardent leur cache long : leur
 * nom change à chaque build, donc ils ne peuvent pas être périmés.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.nextUrl.pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
};
