# Bookkeeper Tweaks

A free, open-source Chrome extension (Manifest V3) for bookkeepers who use Xero: four small fixes to Xero's own web
pages, all running in your browser.

Not affiliated with or endorsed by Xero Limited.

> Work in progress: Approve default works; the other three features arrive one at a time.

## Features

1. **Approve default** — the Approve button on an invoice does the action you pick ("Approve" after install) instead
   of "Approve & email".
2. **Direct print** — print an approved invoice without downloading its PDF first.
3. **Top pager** — page navigation above long lists, not only below them.
4. **Recode sort** — sort the loaded page of Find and recode results by description.

Each feature has its own switch in the settings, which open from the extension's icon in Chrome's toolbar; all four
are on after install.

## Design rules

- **Talks only to Xero — never to us or anyone else.** No analytics, no telemetry, no remote code.
- **Never writes to Xero on its own:** the only Xero actions it triggers are the ones you click.
- **One permission, `storage`,** for its settings, which stay in your browser. Its scripts run only on go.xero.com.
- **When Xero changes a page** so that a feature cannot find its place, the feature does nothing and the page works as
  it does without the extension. Please [open an issue](https://github.com/sopilnik/bookkeeper-tweaks/issues) when that
  happens.

## Build and test

Needs Node 26 and pnpm 12.

```sh
pnpm install
pnpm build        # the unpacked extension in dist/
pnpm lint
pnpm typecheck
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # the built extension in headless Chromium (Playwright)
```

To try it, open `chrome://extensions`, switch on Developer mode, choose "Load unpacked" and pick `dist/`.

The end-to-end tests never reach the network and need no port: every request to go.xero.com is answered from
`tests/fixtures/`, and every other request is aborted. They need Playwright's Chromium once:
`pnpm exec playwright install --no-shell chromium`.

## License

[MIT](LICENSE)
