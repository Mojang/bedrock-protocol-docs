# ChatPacket

- The signing fields on `SignedChat` (`Key Id`, `Sender Id`, `Room Id`, `Message Id` and `Signature`) no longer reject an empty value, so an unsigned message is a message a receiver drops on policy rather than a malformed packet that disconnects the connection it arrived on. ADO:1641907
- A client that cannot reach the Chat Service now sends the message unsigned, carrying only `Sender Id` and `Scan Text`, so a signing outage cannot silence chat. The receiver decides whether to show or discard it. ADO:1641907
