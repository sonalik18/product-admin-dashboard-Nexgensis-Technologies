# Product Admin Dashboard

A responsive product administration dashboard built for the Frontend Assignment.

## Stack

- Next.js 14 + React 18 (App Router)
- Tailwind CSS
- Axios
- DummyJSON API
- No React Query, SWR, ready-made table, or pagination libraries

## Demo credentials

- Username: `emilys`
- Password: `emilyspass`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For a production build:

```bash
npm run build
npm start
```

## Assignment checklist

### Authentication

- Login uses `POST /auth/login` through the shared Axios instance.
- Wrong credentials show an error message.
- Product routes are protected; unauthenticated users are redirected to login.
- Logout clears the local session and returns to login.
- Login is guarded while a request is in progress, so repeated clicks do not create duplicate requests.

### Product list

- Desktop: responsive table with image, title, category, price, rating and stock.
- Mobile: responsive product cards with the same key information.

### Pagination

- Uses API `limit` + `skip`.
- Page numbers plus Previous/Next controls.
- Page size: 10, 20, 50.
- Range text such as `Showing 21–40 of 194`.
- Invalid `page`, `pageSize`, `sort`, and `order` URL values are sanitized.
- An out-of-range page such as `?page=999` is corrected to the last valid page after the API total is known.

### Search

- Uses `/products/search?q=`.
- Input is debounced by 500 ms.
- Search resets pagination to page 1.
- Each request receives an `AbortController` signal through Axios. When the search changes, the previous request is aborted, so a slow old response cannot overwrite a newer result.

### Category filter and sorting

- Categories are loaded from `/products/categories`.
- Category filtering uses `/products/category/{category}`.
- Sort options: price, rating, title.
- Ascending/descending order is supported.
- Sort/filter changes reset the page to 1.

### Product details

- Route: `/products/[id]`.
- Shows images, description, price, rating, stock and reviews.
- A wrong/non-existing ID shows a clear `Product not found` state.

### Add, edit and delete

- Add and edit use a shared validated form.
- Required fields and non-negative numeric values are validated before submission.
- Save is disabled while the mutation request is running.
- Delete requires a confirmation popup.
- Add, edit and delete call the real DummyJSON mutation endpoints.
- Because DummyJSON mutations are simulated and are not permanently persisted on the server, the application also stores the mutation result in `localStorage` and merges those changes into the UI. This makes the add/edit/delete behavior visible even after refreshing the page.

## Important API choices

### Search + category

DummyJSON exposes separate search and category endpoints and does not support combining them into one server-side request. The application gives search priority and disables the category selector while a search term is active. This is explicitly explained in the UI and avoids sending an unsupported combined request.

### Add/edit/delete persistence

DummyJSON's POST/PUT/DELETE product operations are simulated. The app still calls those endpoints, then records the resulting add/edit/delete change locally so the dashboard reflects the change. This is an application-side persistence layer for the assignment demo; it does not claim that DummyJSON permanently changed its server dataset.

## Race-condition testing

The normal app uses a 500 ms debounce and request cancellation. To test the slow-response case, temporarily add a `delay: 2000` parameter to the product request in `lib/api/products.js`, then type a new search before the previous response finishes. The older request is aborted and cannot replace the latest result.

Example temporary test line inside `getProducts`:

```js
params.delay = 2000;
```

Remove the test line after verification.

## One problem faced and how it was fixed

**Problem:** Fast search can create overlapping requests. If an older response arrives after the newest response, it can incorrectly replace the current results.

**Fix:** Debounce the search input and pass an `AbortController` signal to Axios. When the URL/search/filter/sort changes, the previous request is aborted and aborted responses are ignored.

A second DummyJSON limitation is that product mutations are not persistent. The app solves this by keeping a local mutation layer in `localStorage` while still calling the required POST/PUT/DELETE endpoints.

## Where AI helped

AI was used as a development assistant to scaffold the project structure, suggest component boundaries, review edge cases, and help debug URL validation, request cancellation, protected routes and DummyJSON mutation behavior. The code should be reviewed line-by-line and understood before the interview walkthrough, especially the Axios interceptor, debounced search, AbortController flow, URL-state logic and local mutation layer.

## Suggested regular Git commits

Do not submit one giant commit. A suitable history is:

1. `chore: initialize next tailwind axios project`
2. `feat: add login and protected routes`
3. `feat: add product listing and pagination`
4. `feat: add search filters sorting and url state`
5. `feat: add product details`
6. `feat: add product create edit delete`
7. `fix: handle stale search and invalid url values`
8. `docs: add assignment readme`

## Submission checklist

Before sending the client:

- [ ] Push the project to a **public GitHub repository**.
- [ ] Make sure the repository contains regular commits rather than one final commit.
- [ ] Deploy the same project to **Vercel or Netlify** and test the public URL.
- [ ] Test login with correct and incorrect credentials.
- [ ] Test logout and protected routes.
- [ ] Test pagination with 10, 20 and 50 page sizes.
- [ ] Test `?page=abc` and `?page=999`.
- [ ] Test search after typing quickly.
- [ ] Test category filter and sorting.
- [ ] Test Add → refresh → product still appears locally.
- [ ] Test Edit → refresh → edited values remain locally.
- [ ] Test Delete → refresh → deleted product remains removed locally.
- [ ] Test wrong product ID and confirm the not-found state.
- [ ] Test Save/Login repeated clicks and confirm duplicate requests are prevented.
- [ ] Test the production build before the walkthrough.

## Deployment

No API key is required because DummyJSON is public. Deploy the repository through Vercel or Netlify and put the resulting public URL in the final submission message.
