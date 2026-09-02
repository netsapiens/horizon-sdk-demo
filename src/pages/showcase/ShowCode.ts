/**
 * Whether the Component Showcase is currently showing its code snippets.
 *
 * The showcase is two documents interleaved: a gallery of what the components
 * look like, and a reference for how to call them. A designer scanning for the
 * right control wants the first; a developer copying a snippet wants both. The
 * header toggle picks, and this carries the answer down.
 *
 * A context rather than a prop because ~28 sections would otherwise each grow a
 * prop they only forward. Note this is the app's OWN state — the rule against
 * prop-drilling in CLAUDE.md is about `ui` / `theme` / `styles`, where drilling
 * spreads a stale snapshot of the host's context. Nothing here comes from the
 * host, and a boolean cannot go stale.
 *
 * The default is `true`, so a `SectionCode` rendered outside a provider — the
 * panels on the Demo page — behaves exactly as it did before this existed.
 */
import { createContext, useContext } from 'react';

export const ShowCodeContext = createContext(true);

/** True when snippets should render. */
export function useShowCode() {
  return useContext(ShowCodeContext);
}
