/** Redirects need an absolute URL in the Workers runtime. */
export function redirectTo(request: Request, path: string, status = 303): Response {
  return new Response(null, {
    status,
    headers: { Location: new URL(path, request.url).toString() },
  });
}
