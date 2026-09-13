---
title: Pack encryption
section: Protocol Systems
order: 3
---

# Summary

This page describes the per-file encryption format used by encrypted resource packs, and how a server supplies the key needed to load one. A pack contains an encrypted `contents.json` file. Decrypting that file produces a list of asset paths and their individual keys. The client uses those keys when reading the assets.

In 26.50, assets can also use AES-256-CTR by specifying `"type": "stream"` in their contents entry. The default asset mode and the encryption of `contents.json` remain AES-256-CFB8. See [Stream Assets in 26.50](#stream-assets-in-2650).

This format can be read from a directory or from entries in a ZIP archive. ZIP compression, pack-file encryption, and encryption of the network connection are separate operations. The client also has a separate whole-archive encryption reader; the per-file layout described below must not be applied to every encrypted archive indiscriminately.

---

# Relevant Packets

> ResourcePacksInfoPacket

Each advertised pack has its own encryption metadata:

| Field | Purpose |
| --- | --- |
| Pack UUID and version | Identify the pack being negotiated and downloaded. |
| Content Key | Supplies the key used to decrypt this pack's `contents.json`. |
| Content Identity | Identifies the content key. It must agree with the content identity in the encrypted file's header. This is a separate identity from the pack UUID. |
| Subpack Name | Selects a subpack; it is not an encryption key or an initialization vector. |

The client collects **nonempty** advertised content keys into a map indexed by `ContentIdentity`, then registers that map before looking up cached packs. The pack reader requests a key using the identity read from the pack. Caching the encrypted archive does not, by itself, make that key available; a server supplying the key should include it even when the client already has the archive.

The key string's bytes are used directly. Do not Base64-decode, hexadecimal-decode, hash, or derive a key from the UUID. The key supplied here is the pack-level key; individual asset keys are read from the decrypted `contents.json`.

An empty `Content Key` supplies no temporary key for that entry. It does not, by itself, prove that the pack is unencrypted: the client can have another key source, such as an entitlement. Receiving a key and checking content ownership are separate parts of the client implementation.

> ResourcePackDataInfoPacket and ResourcePackChunkDataPacket

These packets describe and transfer the pack data. They do not carry the content key. Reassemble the archive and read its entries before applying the per-file transformations below. A network chunk boundary does not restart a file's cipher.

> ResourcePackStackPacket

This selects the pack instances to apply. It does not replace the encryption metadata from the pack-info exchange or `contents.json`.

---

# Encrypted contents.json

Despite its name, the stored encrypted `contents.json` is a binary file. Its first 256 bytes are an unencrypted header; the remaining bytes are encrypted JSON.

```text
contents.json
┌─────────────────────────────────┬──────────────────────────────────┐
│ Unencrypted header: 256 bytes    │ AES-256-CFB8 encrypted JSON       │
│ Contains the content identity   │ Uses the pack's Content Key      │
└─────────────────────────────────┴──────────────────────────────────┘
0                               256                              EOF
```

## Header Layout

Offsets are relative to the start of `contents.json`. The two 32-bit values are stored in little-endian byte order.

| Offset | Size | Meaning |
| --- | --- | --- |
| `0x00` | 4 bytes | Format marker, checked to be zero. |
| `0x04` | 4 bytes | Magic value `0x9BCFB9FC`, stored as `FC B9 CF 9B`. |
| `0x08` | 8 bytes | Not interpreted by the header reader. |
| `0x10` | 1 byte | Length of the content-identity text. A UUID in the usual hyphenated form has length 36 (`0x24`). |
| `0x11` | 239 bytes | Content-identity text followed by unused space. The reader takes the text up to the first zero byte and requires its length to match the preceding length byte. |
| `0x100` | Remaining bytes | Encrypted JSON body. |

For a usual UUID header, place the 36 ASCII characters at `0x11`, followed by a zero byte. Zero-fill unused header bytes. The identity is text here, not the UUID's 16-byte binary representation. Do not treat the eight uninterpreted bytes as an IV or an authentication tag.

The header reader checks the marker, magic, and identity-text length, then parses the text as a UUID. Header recognition is not proof that the body decrypts successfully or that the pack is trusted.

## Decrypting the Body

1. Read the header and obtain its content identity.
2. Look up the pack-level key for that identity.
3. Initialize AES-256-CFB8 as described in [Cipher Parameters](#cipher-parameters).
4. Decrypt **only the bytes starting at offset `0x100`**. The header is skipped without advancing the cipher state.
5. Parse the resulting bytes as JSON. The decrypted JSON starts at byte zero of the plaintext; it does not include the binary header.

The 26.50 `"type": "stream"` option applies to assets listed inside this JSON. It does not change how `contents.json` itself is decrypted.

---

# Decrypted Contents and Asset Keys

The root JSON object contains a `content` collection. Each entry associates a pack-relative asset `path` with a `key`:

```json
{
  "content": [
    {
      "path": "manifest.json"
    },
    {
      "path": "pack_icon.png",
      "key": ""
    },
    {
      "path": "textures/blocks/example.png",
      "key": "0123456789abcdef0123456789abcdef"
    }
  ]
}
```

The example key is synthetic. It is included only to illustrate a 32-byte key string.

| Entry | How its bytes are read |
| --- | --- |
| Nonempty `key`, no `type` | Decrypt using that entry's key and AES-256-CFB8. |
| Missing or empty `key` | There is no per-file decryption key for the entry; its bytes are read without this transformation. |
| Nonempty `key` and `"type": "stream"` | In 26.50, decrypt using AES-256-CTR. |

The example leaves the manifest and icon unencrypted to demonstrate mixed content. These filenames do not define the encryption rule: the rule comes from the key associated with each path. Preserve the pack-relative paths when writing or extracting archive entries.

## Stream Assets in 26.50

In 26.50, an entry can select AES-256-CTR using `"type": "stream"`:

```json
{
  "path": "sounds/example.ogg",
  "key": "0123456789abcdef0123456789abcdef",
  "type": "stream"
}
```

Omitting `type` selects the default CFB8 mode. When `type` is present, the parser requires the exact string `"stream"`; a different string, including an empty string, causes asset-set generation to fail. Do not write `"type": "cfb8"` to request the default.

In 26.50, the full-file reader accepts either mode, but the streaming interface requires `"type": "stream"` and an exactly 32-byte key for an encrypted asset. It rejects encrypted CFB8 entries. An asset with no decryption key can still use the underlying unencrypted streaming source.

For compatibility with clients that only support CFB8, omit `type` and encrypt assets using CFB8, provided the asset is read through a compatible full-file path. This does not make that asset usable through the 26.50 streaming interface. Adding `"type": "stream"` does not enable CTR in a reader that only supports CFB8.

---

# Cipher Parameters

Use these parameters separately for the JSON body and for each encrypted asset:

| Parameter | Value |
| --- | --- |
| AES key | First 32 bytes of the applicable key string. Supply a 32-byte key for this format. |
| Initialization vector | First 16 bytes of the **same** key string. |
| Default mode | CFB with an **8-bit feedback segment**, commonly named `AES-256-CFB8`. |
| Stream-asset mode | AES-256-CTR, selected by `"type": "stream"` in 26.50. |
| Padding | None for these modes. Plaintext and ciphertext have the same length. |
| Cipher state | Initialize a fresh cipher for each file. Preserve state across successive pieces of that file. |

Use bytes, not a count of Unicode characters. Do not append a string terminator to the key material. A library's generic `CFB` option may default to 128-bit feedback and produce different bytes; select CFB8 explicitly.

For CTR, the 16-byte IV is the initial counter block. Use the standard AES-CTR counter progression: increment the 128-bit counter in big-endian order. Do not add a separate nonce or prepend an IV to the asset.

An ordinary encrypted asset has no 256-byte header. Its cipher starts at the first byte of the asset's ciphertext. The only header skipped in this per-file format is the header of `contents.json`.

These transformations have no built-in authentication tag. Successful AES decryption alone does not establish that the key is correct or that content is authentic. JSON parsing, pack validation, transfer hashes, and signature or entitlement checks are separate operations.

## Synthetic Example

The following example can be used to check a cipher implementation. It uses an ordinary asset payload, with no binary header. The plaintext ends in a single LF byte (`0A`).

```text
Key (ASCII):       0123456789abcdef0123456789abcdef
IV (hex):          30313233343536373839616263646566
Plaintext (UTF-8):  Pack encryption example. followed by LF
Plaintext (hex):    5061636b20656e6372797074696f6e206578616d706c652e0a
CFB8 ciphertext:   a82f55a0097cd37bd99b936f516c9674b2007dde0dfca7db2c
CTR ciphertext:    a85df90bfc69b5fb53e609a2bcb47815d0e709103f0e474976
```

Both ciphertexts contain 25 bytes. The CTR result applies only when the asset's mode selects CTR. These are synthetic interoperability examples, not captured game content.

---

# Following the Pack Load

1. Receive the pack-info entry and make its nonempty content key available under the advertised content identity.
2. Acquire the pack archive, or use an existing cached copy.
3. Read `contents.json` from the pack. For a ZIP entry, the ZIP reader first removes the entry's ZIP compression, yielding the header and encrypted JSON body.
4. Read the content identity from the 256-byte header and use it to select the pack key.
5. Decrypt the JSON body using CFB8, then build the path-to-key table. In 26.50, also record each entry's selected asset mode.
6. When an encrypted asset is requested, obtain its bytes and decrypt them using its own key, starting a fresh cipher at byte zero. When no decryption key applies, use the untransformed bytes.
7. Continue normal pack parsing and validation before using the content.

The client can decrypt assets as they are read; the format does not require rewriting the entire pack into plaintext first.

# Relevant Classes

> EncryptedFileAccessStrategy

Reads the encrypted contents file, builds the asset-key table, and transforms asset bytes. `_decryptContentsFile` decrypts the JSON body using the pack-level key.

> ZippedEncryptedFilesAccessStrategy

Provides the same per-file format through a ZIP-backed pack reader. The archive entries still have the contents-file and asset roles described above.

> PackDownloadManager and ResourcePackRepository

Collect advertised content keys and install them before resolving cached packs.

> IContentKeyProvider and ClientContentKeyProvider

Resolve a key from a content identity. Temporary server-supplied keys take priority over other key-provider sources.

> Crypto::Symmetric

Provides the AES transformations: AES-256-CFB8 for the contents file and default asset mode, and AES-256-CTR for stream assets.

---

# Troubleshooting

| Symptom | Check |
| --- | --- |
| Encrypted contents file is found, but no key is available | Match the header content identity to the advertised identity and key. An empty advertised key does not install a temporary key. |
| Decrypted contents do not parse as JSON | Use CFB8, the pack-level key's raw bytes, its first 16 bytes as IV, and start decryption at `0x100`. |
| Contents parse, but an asset is unreadable | Use the asset entry's key, its own fresh IV/state, and the correct asset mode. Do not skip 256 bytes from the asset. |
| A pack works in 26.50 but fails in a client without stream-asset support | Check for CTR assets marked `"type": "stream"`; CFB8 with `type` omitted requires a compatible full-file read path. |
| An encrypted asset fails when requested for streaming in 26.50 | Use CTR with `"type": "stream"`; the streaming interface rejects encrypted CFB8 entries. |
| Default-mode content fails only with one crypto library | Check the CFB feedback size; CFB128 and CFB8 are different modes. |
| Contents load fails after adding `type` | Omit `type` for CFB8 or use exactly `"stream"` for CTR. |
