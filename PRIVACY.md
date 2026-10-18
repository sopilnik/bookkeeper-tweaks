# Privacy policy

Bookkeeper Tweaks is a Chrome extension that adds four small fixes to Xero's web pages on go.xero.com. This policy
explains which data the extension handles and what it does with it.

Not affiliated with or endorsed by Xero Limited.

## In short

The extension sends nothing to its developer or to any third party, and it contains no analytics, telemetry,
advertising or remote code. Everything it handles stays in your browser. The one exception is the request it makes to
Xero for you when you click its Print button.

## What the extension handles

**Your settings.** The extension saves which of the four fixes are on and what the Approve button does. They are kept
in your browser with Chrome's storage (`chrome.storage.local`) and never leave your device. Removing the extension
deletes them.

**Your Xero sign-in token (authentication information).** When you click the extension's Print button on an approved
invoice, the extension reads the access token that Xero keeps in the page for your current session. It sends the
token to Xero in the same request that Xero's own "Print PDF" makes, to fetch the invoice's PDF. The token is read at
that moment only. It is not stored, logged or sent anywhere else.

**The invoice PDF (financial information).** The PDF that Xero returns opens in Chrome's print dialog. It stays in the
browser for at most a minute, so that you can open it again from the note under the button. After that it is
discarded. It is never stored or sent anywhere.

**Parts of Xero's pages (website content).** The fixes read the parts of Xero's pages they work with: the Approve
button, the state of a list's pager and the descriptions on the current Find and recode page. This is processed in the
browser and never stored or sent.

Apart from this, the extension handles no data. It keeps no record of your browsing, your location or what you do on
other sites. It does not sell data, and it passes nothing to anyone except the one request to Xero described above.
It uses data only for the four fixes.

## Where it runs

The extension runs only on go.xero.com, on the pages it changes. It asks for one browser permission, `storage`, to
keep your settings.

## Changes

If the extension starts to handle data differently, this policy will be updated in the same release.

## Contact

Questions about this policy: open an issue at https://github.com/sopilnik/bookkeeper-tweaks/issues.
