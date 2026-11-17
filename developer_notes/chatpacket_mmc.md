# ChatPacket
- Added `ChatPacket` (id 361), carrying player chat along with a signature from a Mojang service ADO:1641907
- The `Signed Chat` block (`Key Id`, `Sender Id`, `Room Id`, `Message Id`, `Scan Text`, `Redacted Text`, `Signature`) is covered by that signature and must be relayed unmodified, or receiving clients cannot validate it ADO:1641907
- The optional `Formatting` block (`Name Prefix`, `Name Postfix`, `Message Prefix`, `Message Postfix`) is not covered by the signature and may be set freely by the server to decorate the name and the message ADO:1641907
