import { supabase } from './supabaseClient';

/**
 * Bertie Foundation — shared form-submission helper
 * File: frontend/src/utils/backendApi.ts
 *
 * Every public form (Contact, Volunteer, Newsletter, Feedback) posts here.
 * This calls a Supabase Edge Function (see supabase/functions/ in the repo
 * root) instead of a separate backend server — Render has been retired.
 *
 * Kept the name `postToBackend` and the `(path, body)` signature so the 4
 * call sites (ContactUs.tsx, Feedback.tsx, Footer.tsx, formService.ts)
 * didn't need to change at all — only this file's internals did. `path` is
 * turned into an Edge Function name by stripping the leading slash, e.g.
 * postToBackend('/submit-contact', {...}) calls the `submit-contact`
 * function.
 */
export async function postToBackend<T = any>(path: string, body: unknown): Promise<T> {
  const functionName = path.replace(/^\//, '');
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    // FunctionsHttpError carries the actual Response on `.context` — try to
    // read the { status, message } body our functions always return before
    // falling back to the generic supabase-js error message.
    let detail = error.message || `Request to ${functionName} failed.`;
    const context = (error as any)?.context;
    if (context && typeof context.json === 'function') {
      try {
        const parsed = await context.json();
        detail = parsed?.message || detail;
      } catch {
        // context wasn't JSON — keep the generic message
      }
    }
    throw new Error(detail);
  }

  return data as T;
}
