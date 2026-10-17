import { createHash } from 'node:crypto'

const KEY_ENCODING = 'base64'
const DIGEST_ALGORITHM = 'sha256'
const DIGEST_ENCODING = 'hex'
const ID_LENGTH = 32
const HEX_RADIX = 16
// Chrome writes each hex digit of the id as a letter: 0 is a, f is p
const FIRST_LETTER_CODE = 'a'.charCodeAt(0)

function letterOf(hexDigit: string): string {
  return String.fromCharCode(FIRST_LETTER_CODE + Number.parseInt(hexDigit, HEX_RADIX))
}

// The id Chrome gives an unpacked extension whose manifest carries this public key
export function extensionIdFromKey(base64Key: string): string {
  const digest = createHash(DIGEST_ALGORITHM).update(Buffer.from(base64Key, KEY_ENCODING)).digest(DIGEST_ENCODING)

  return [...digest.slice(0, ID_LENGTH)].map(letterOf).join('')
}
