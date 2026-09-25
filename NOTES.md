# Assignment walkthrough notes

## Main flow

Login -> store access token -> Axios interceptor adds Bearer token -> protected `/products` pages.

The product list reads its state from URLSearchParams:
- page
- pageSize
- search
- category
- sort
- order

The UI changes the URL, and the URL drives the API request.

## Why Axios is shared

`lib/axios.js` is the only Axios setup. It owns:
1. base URL
2. JSON headers
3. token attachment
4. common 401 cleanup
5. common user-facing error extraction

API functions live under `lib/api`, keeping HTTP details out of components.

## Interview talking points

- `AbortController` prevents stale search responses from winning.
- The 500 ms debounce reduces unnecessary API calls.
- `page` is sanitized before calculating `skip`.
- Search and category are not sent together because DummyJSON does not provide a combined endpoint.
- Mutations are acknowledged as simulated by DummyJSON; the UI provides immediate behavior and local persistence for created/edited records.
- `window.confirm` is used for delete confirmation.
- Login and Save handlers have an early `if (loading/submitting) return` guard.
