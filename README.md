# Bookkeeper Tweaks

A free, open-source Chrome extension (Manifest V3) that adds four small fixes to the Xero pages bookkeepers use every
day. Everything runs in your browser.

Not affiliated with or endorsed by Xero Limited.

## Features

1. **Approve default.** The Approve button on an invoice does the action you choose instead of Xero's default,
   "Approve & email". After installation the button does "Approve"; the settings offer all six actions.
2. **Direct print.** On an approved invoice, a Print button next to "Print PDF" opens Chrome's print dialog with the
   invoice. There is no PDF to download first.
3. **Top pager.** Long lists get page navigation at the top as well as at the bottom: the invoice list, the Bills list
   and the Find and recode results.
4. **Recode sort.** A button above the Find and recode results sorts the rows on the current page by description, A to
   Z or Z to A.

Each feature can be switched on or off in the settings, which open from the extension's icon in the Chrome toolbar.
All four are on after installation.

## Your data

- Nothing is sent to us or to any third party. The extension contains no analytics, telemetry or remote code.
- Your Xero sign-in is used only for printing. Direct print reads the session token that Xero keeps in the page and
  sends it to Xero in the same request that Xero's own "Print PDF" makes. The token is never stored and is sent nowhere
  else.
- Changes in Xero come only from your own clicks. The extension never acts in Xero by itself.
- One permission, `storage`, keeps your settings in your browser. The scripts run only on go.xero.com. Recode sort
  runs one small script inside Xero's own page, because the table it sorts exists only there. That script holds no
  settings and adds nothing to the page.
- When Xero changes a page and a feature can no longer find what it needs, that feature stays inactive and the page
  works as it does without the extension. Please
  [open an issue](https://github.com/sopilnik/bookkeeper-tweaks/issues) when that happens.

The [privacy policy](PRIVACY.md) explains what the extension handles and why.

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
