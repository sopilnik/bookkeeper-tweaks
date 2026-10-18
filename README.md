# Bookkeeper Tweaks

A free, open-source Chrome extension (Manifest V3) for bookkeepers who use Xero: four small fixes to Xero's own web
pages, all running in your browser.

Not affiliated with or endorsed by Xero Limited.

## Features

1. **Approve default** — the Approve button on an invoice does the action you pick ("Approve" after install) instead
   of "Approve & email".
2. **Direct print** — a Print button next to Xero's "Print PDF" on an approved invoice prints it without downloading
   its PDF first.
3. **Top pager** — page navigation above long lists, not only below them: the invoice list, the Find and recode
   results and the Bills list.
4. **Recode sort** — a button above the Find and recode results sorts the rows on the loaded page by description,
   A to Z, then Z to A.

Each feature has its own switch in the settings, which open from the extension's icon in Chrome's toolbar; all four
are on after install.

## Design rules

- **Talks only to Xero — never to us or anyone else.** No analytics, no telemetry, no remote code.
- **Uses your Xero sign-in only to print:** Direct print reads the session token Xero keeps in the page and sends it to
  Xero with the same request Xero's own "Print PDF" makes. The token is never stored and never goes anywhere else.
- **Never writes to Xero on its own:** the only Xero actions it triggers are the ones you click.
- **One permission, `storage`,** for its settings, which stay in your browser. Its scripts run only on go.xero.com.
  Recode sort runs one small script inside Xero's own page, because the table it sorts lives there; that script holds
  no settings and adds nothing to the page.
- **When Xero changes a page** so that a feature cannot find its place, the feature does nothing and the page works as
  it does without the extension. Please [open an issue](https://github.com/sopilnik/bookkeeper-tweaks/issues) when that
  happens.

## Build and test

Needs Node 26, pnpm 12 and the zip and unzip commands.

```sh
pnpm install
pnpm build        # the unpacked extension in dist/
pnpm lint
pnpm typecheck
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # the built extension in headless Chromium (Playwright)
pnpm zip          # the store package in release/, without the development key
```

To try it, open `chrome://extensions`, switch on Developer mode, choose "Load unpacked" and pick `dist/`.

The end-to-end tests never reach the network and need no port: every request to go.xero.com is answered from
`tests/fixtures/`, and every other request is aborted. They need Playwright's Chromium once:
`pnpm exec playwright install --no-shell chromium`.

## License

[MIT](LICENSE)
