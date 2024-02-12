# Summary

This page outlines how Clients can validate incoming ClientCacheMissResponsePackets, before inserting them into the Client's cache and writing them to storage. Currently no validation is performed on this packet,
and all responses are handled and inserted into the Client's cache. Which can be exploited by rouge servers to corrupt the Client's blob cache. For more information about ClientBlob caching see [this page](https://gist.github.com/Tomcc/4be79d3eafcd158c5059abd4ab2e8d35)

# Client Validation of ClientCacheMissResponsePackets

To ensure ClientCacheMissResponsePackets are valid we perform 2 validation steps:
- All missing BlobIDs the Client requests when sending ClientCacheBlobStatusPackets will be recorded. If any BlobIDs in the response packet are unexpected by the Client, then the Client will be disconnected. This also prevents the Client from requesting the same BlobID multiple times from the Server.
- For each expected BlobID we re-hash the associated data string. If that hash doesn't match the BlobID then the data is invalid and the Client is disconnected.

For the second validation step MinecraftBedrock uses [XXHash64](https://github.com/Cyan4973/xxHash) to hash up the blob data string into the BlobID. To make sure your BlobIDs match you must use this hasher,
and the return type should be an unsigned 8 byte integer with little endian byte order.

# Hashing Examples

The following examples are blobs of data you might see in a LevelChunk and the expected BlobID hash using XXHash64.

1. Serialized LevelChunk Biome data, BlobID = 5836407453717141263
```
\x5\0\0\0@\0\0\0P\0\0\0T\0\0\0V\0\0€U\0\0@U\0\0\0U\0\0\0U\0\0\0U\0\0\0U\0\0\0U\0\0\0P\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0@\0\0\0X\0\0¨Z\0€ªZ\0\0¨Z\0\0 U\0\0\0U\0\0\0U\0\0\0U\0\0\0U\0\0\0U\0\0\0@\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0 j\0 ªj\0ªªj\0¨ªj\0€ªj\0\0¨Z\0\0 V\0\0\0U\0\0\0U\0\0\0V\0\0\0T\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0¨ªª\0ªªª\0ªªªªªªª*¨ªj\0€ªj\0\0ªj\0\0 j\0\0 ª\0\0 ª\0\0 ª\0\0\b\0\0\0\0\0\0€\0\0\0\0\0\0\0\0\0\0\0¨ªª\0ªªªªªªªªªªªªªªªª¨ªªª€ªª\0\0ªª\0\0ªª\0€ªª\0 ªª\0¨ªª\0 *\0\0 \x2\0\0 \x2\0\0 \x2\0\0ªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªª¨ªªª\0ªªª\0ªªª\0¨ªª\0ªªª\0ªª\0\0ª\n\0\0ª\n\0ªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªª€ªªª\0ªªª\0ªªª€ªª\n€ªª\x2€ªª\0ªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªª€ªªª€ªªª ªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªªª\x6\xeö\x2À\x2\x5\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x1\0\0\0\x15\0\0\0U\0\0\0U\x1\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x5\0\0\0U\0\0\0U\0\0\0U\x1\0\0\0€ª\0\0€*\0\0\0\0\0\0\0\0\0\0\0\0\x2\0\0\0\0\0\0€\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x1\0\0\0\x15\0\0\0U\0\0\0U\0\0\0U\x1\0\0\0 ª*\0€ª*\0\0ª*\0\0€*\0\0 *\0\0 \n\0\0 \x2\0\0¨\0\0\0(\0\0\0\b\0\0\0\b\0\x5\0\x2\0\x15\0\0\0U\0\0\0U\x1\0\0U\x1\0\0ªªªª\x2 ªª\0 ª*\0\0¨ª\0\0ªª\0\0ª*\x2\0ª\n\n\0ª\x2*€ª\x2*€ª\0*€*\0* \n\0\x15 \x2\0U \0\0U¡\0\0U¥\0\0ªªªªªªªª\n ª*\0€ª*\x2€ªª\n ªª* ªªª ª*ª ª\nª¨ª\x2ª¨ª\0ª¨*\0ªª*\0Uª\n\0U©\x2\0U©\0\0ªªªªªªª*ªªª** ª**¨ªªª¨ªªªªªªªªªªªªª*ªªª*ªªª\nªªª\x2ªªª\0Uª*\0Uª\n\0©ª\n\0ªªª*ªªª*ªªª\nªªª\nªªª*ªªªªªªªªªªªªªªªªªªªªªªª*ªªª\nªªª\x2ªªª\x2ªªª\0ªªª\x2ªªª*ªªª\nªªª\nªªª\nªªª\nªªª*ªªªªªªªªªªªªªªªªªªªªªªª*ªªª*ªªª\nªªª\nªªª\nªªª*ªªª\nªªª\x2ªªª\x2ªªª\nªªª*ªªª*ªªªªªªªªªªªªªªªªªªª*ªªª*ªªª\nªªª\nªªª*ªªª\nªªª\x2ªªª\x2ªªª\x2ªªª\x2ªªª\nªªª*ªªª*ªªªªªªªªªªªªªªª*ªªª\nªªª\nªªª*ªªª*ªªª\nªªª\x2ªªª\0ªªª\0ªªª\x2ªªª\x2ªªª\nªªª*ªªª*ªªªªªªª*ªªª*ªªª\nªªª*ªªª*ªªª*ªªª\x2ªªª\x2ªªª\0ªªª\0ªªª\0ªªª\x2ªªª\x2ªªª\nªªª\nªªª*ªªª*ªªª*ªªª*ªªª*ªªªªªªªªªªª\x2ªªª\x2ªªª\x2ªªª\0ªªª\0ªªª\x2ªªª\x2ªªª\x2ªªª\nªªª\nªªª\nªªª*ªªª*ªªªªªªªªªªªªªªª\x2ªªª\x2ªªª\x2ªªª\x2ªªª\x2ªªª\x2ªªª\x2ªªª\0ªªª\0ªªª\0ªªª\0ªªª\x2ªªª\x2ªªª\nªªª*ªªª*ªªª\x2ªªª\x2ªªª\nªªª\x2ªªª\x2ªªª\x2ªªª\x2ªªª\x2ªªª\0ªªª\0ªªª\0ªª*\0ªª*\0ªªª\0ªªª\0ªªª\x2\x6ö\x2\xeÀ\x2\x1ö\x2\x1ö\x2\x1ö\x2\x5TUUUTUUUUUUUUUUUTUUU@UUU\0UUU\0PUU\0@UU\0@UU\0@UU\0PUU\0TUU\0TUU\0UUU\0UUUTUUUTU\x15UTUUUTUUUTUUU@UUU\0UUU\0PUU\0@UU\0@UU\0@UU\0@UU\0PUU\0TUU\0UUU\0UUUTU\x5TTU\x5TTU\x5UPUAUPUUU@UUU\0UUU\0PUU\0PUU\0@UU\0@UU\0@UU\0@UU\0PUU\0TUU\0UUUPU\x1PPU\x1PPU\0PPU\0UP\x15PU@\x15TU\0@UU\0@UU\0@UU\0\0UU\0\0UU\0\0UU\0\0UU\0PUU\0TUU\0UUUPU\0@P\x15\0\0@\x15\0@@\x15\0T@\x5\0U\0\0PU\0\0UU\0\0UU\0\0UU\0\0TU\0\0TU\0\0UU\0\0UU\0\0UU\0PUU\0TUU@\x15\0€@\x5\0\0@\x5\0\0@\x1\0P\0\0\0T\0\0@U\0\0TU\0\0TU\0\0T•\0\0PU\0\0PU\0\0TU\0\0TU\0\0PU\0\0@U\0\0\0U\0\x1\0 \0\x1\0 \0\0\0€\0\0\0€\0\0\0P\0\0\0•\0\0@•\0\0P•\0\0P•\0\0P•\0\0PU\0\0@U\0\0\0U\0\0\0T\0\0\0@\0\0\0€\0\0\0¨\0\0\0¨\0\0\0¨\0\0\0 \0\0\0 \0\0\0\0\0\0¥\0\0@¥\0\0@¥\0\0@¥\0\0\0”\0\0\0\0\0\0@\0\0\0\0\0\0\0\0\0\0\0\0\0\0€ª\0\0\0ª\0\0\0ª\0\0\0ª\0\0\0¨\0\0\0¨\0\0\0¨\0\0\0¨\0\0\0¨\0\0\0 \0\0\0 \0\0\0€\0\0\0€\0\0\0\0\0\0\0\0\0\0\0\0\0\0 ª\0\0 ª\0\0€ª\0\0€ª\0\0€ª\0\0\0ª\0\0\0ª\0\0\0ª\0\0\0¨\0\0\0 \0\0\0 \0\0\0€\0\0\0€\0\0\0€\0\0\0€\0\0\0€\0\0¨ª\0\0¨ª\0\0¨ª\0\0 ª\0\0 ª\0\0 ª\0\0€ª\0\0\0ª\0\0\0 \0\0\0€\0\0\0€\0\0\0 \0\0\0 \0\0\0 \0\0\0 \0\0\0€\0\0ªª\0\0¨ª\0\0¨ª\0\0¨ª\0\0 ª\0\0 ª\0\0€ª\0\0\0€\0\0\0\0\0\0\0\0\0\0\0€\0\0\0 \0\0\0¨\0\0\0 \0\0\0 \0\0\0 \0\0¨ª\0\0 ª\0\0 ª\0\0 ª\0\0€ª\0\0€ª\0\0€ª\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0€\0\0\0 \0\0\0¨\0\0\0¨\0\0\0¨\0\0 ª\0\0€ª\0\0€ª\0\0€ª\0\0\0ª\0\0\0ª\0\0\0ª\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0€\0\0\0 \0\0\0¨\0\0\0¨\0\0€ª\0\0\0ª\0\0\0ª\0\0\0ª\0\0\0¨\0\0\0¨\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0€\0\0\0 \0\0\0¨\0\0\0*\0\0\0(\0\0\0(\0\0\0(\0\0\0 \0\0\0 \0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0€\0\0\0 \x6ö\x2\xeÀ\x2\x5\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0@\x5\0\0@\x15\0\0\0U\0\0\0UA\0\0TU\0\0PU\0\0PU\0\0@U\0\0\0U\x4\0\0T\x15\0@A\x15\0P\x1T\0T\0T\0U\0PAU\0@Q\x15\0@UU\0\0UU\x1\0TUE\0PUU\x10PUUPUUUPUUU@\0PUU\0PUU\0TUU\x1UUUAUUUUUEUUU\x5TUU\x5PUU\x1PUU\x5@UU\x5\0UUU@UUUTUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUTUU\x15TUU\x15PUUU@UUUPUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUTUUUPUUUTUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUTUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU•UUU•VUU•VUU•VUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU¥VUU¥VUU¥VUU¥ZUU¥ZUUUUUUUUUUUUUUVUUUVUUUUUUUUUUUUUUUUUUUUUUUUUUU©VUU©ZUU©ZUU©ZUU©ZUU©jUUVUUUVUUUZUUUZUUUVUUUUUUUUUUUUUUUUUUUUUUUªZUUªZUUªZUUªjUUªjUUªjUUªjUUjUUUjUUUjUUUZUUUVUUUUUUUUUUUUUUUUUUUªZUUªjUUªjUUªjUUªjUUªªUUªjUUZUUUZUUUZUUUZUUUZUUUVUUUUUUUUUUUUUUU\x6\xeÀ\x2ö\x2\x3\0\0\0\0\0\0\x10\0\b\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\b\0\0\0\0\0\0À Àpàøàüã\x1cp\b\0\0\0\0\0\0\0\0\0\0\0\b\0\x1c\0\x1f\0\x1e\0àøàûøÿþÿÿÿþÿüÿ\x18\0\0\0\0\0\0\0\b\0\x1c\0>\0?\0?\0ÿÿÿÿÿÿÿÿÿÿÿÿÿÿþÿ\x1cà\bà\0€\x1c\0>\0\0\0\0ÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿð>ð\x1cð>À€ÿ€ÿ€ÿ€ÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿøÿø~øÿðÿñÿóÿñÿñÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿ\x4\xeÀ\x2\x3\0\x18\0\x1c\0\x1e\x1\xf\0\f\0\b\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x1c\0\x1e\x1\x1fƒ\x1f\x3\x1e\0\x18\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0???ƒ?\a?\a<\0\x10\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0?ƒ?Ç?\xf?\xf<\a8\a\0\a\0\a\0\0\0\0\0\f\0\x1c\0<\0<\0ÃÇÏŸ\xf~\xfx\xfp\xfp\xf0\a\x18\xf\0\x1f\0?\0€ÿ€ÃÿÇÿÇÿÿÿ¿\x1f~\x1f|\x1fø\x1fø\xfø\xfü\x1fü?üüÿþÿÿÇÿÇÿïÿÿÿÿÿ?ÿ?þ?ü\x1fü\x1fü\x1fþ?þÿþÿÿÿÿÿÿÇÿïÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿ\x4\xeÀ\x2ÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿ
```

2. A single serialized SubChunk, BlobID = 16116986726754372971
```
\t\x1ü\a\0€$\x19Û¶\x1\tI’m\x1b\x1b$\tÙ¶-\0H’$\x1b[\x2\0\bI’$\t\0€$\tI’\0\0H’$\t\t$\tI’$\0H’$\tI\x2 \tI’$\t\0€$\tI’\0\0I’$\t\t$\tI’$\0I’$\tI\x2 \tI’$\t@’$\tI’\x1\0H²m\x1b\x1b\0$\tÙ¶m\0H’d\x1bÛ\x2\0\bI’m\t\0’$\tI’\0\tI’$\t\t\0 \tI’$\0H’$\tI\x2\0\bI’$\t\0€$\tI’\0\x11J’$\t\t\0 \tI’$\0I’$\tI\x2 \tI’$\x19\0$\tI²\x1\0H’$\x19\x1b€$\tÛ¶m\0I’l\x1bÛ\x6\0\tI¶m\x1b@’$\tÛ¶\0\tI’$\t\t€$\tI’$\0\0’$\tI\x2 \tI’$\t\0$\tI’\0\x10R’$\t\t\0 \tI’d\0H’$\tÉ\x6$\tI’$\x1b\0$\tI²\x1\0I’$\x19\x1b$\tI’m\0\0’l\x1bÛ\x6\0\bÉ¶m\x1b@’$\x19Û¶\x1\tI’l\x1b\v€$\tI’$\0\0’$\tI\x2 \tI’$\t@’$\tI’\0\bI’$\t\t€$\tI’$\0\0’$\tÉ\x6 \tI’$\x1b\0$\tI²\x1\0H’$\x19\x1b€$\tI’m\0I’$\tÛ\b \tÉ¶m\x1b@’$\x19Û¶\x1\bI’M\x1a\v\0 \tI¦%\0I’$\tI\x2\0\bI’$\t@’$\t‰”\0\bI’$\t\t$\tI’$\0H’$\tI\x2\0\tI’$\x1b\0’$\tI²\x1\0I’$\t\x1b$\tI’m\0@’$\tÙ\x6 \tI’l\x1b@’$\x1bÛ¶\x1\0H’m\x1b\x1b\0$\tÉ¦-\0H’$\tR\x2\0\bI’$\t\0$\t‰”\0\0I’$\x12\t$\tI’$\0I’$\tI\x2\0\bI’$\t\0€$\tI’\x1\0I’$\t\x1b\0 \tI’l\0@’$\tÙ\x6$\tI’d\x1b@’$\tI¶\x1\0I’m\x1b\x1b€$\tÙ¶m\0\0’$\x1bÛ\x2\0\bI’$\t@’$\tI’\0\0I’$\t\t\0 \tI’$\0@’$\tI\x2\0\b”’$\t\0’\tI’\0\0I’$\t\t€$\tI’d\0@’$\tI\x6\0\bI’$\x1b\0€$\tI¶\x1\bI’$\x19\x1b€$\tÙ¶m\0\0’$\x1bÛ\x2$\tI’m\t\0$\tI’\0\0I’$\t\t€$\tI’$\0@’$\tI\x2\0\b‘’´\t\00\tI›\0\b\t“$-\t€$\tIÒ&\0@’$\tI\x2\0\tI’$\t@’$\tI’\0\bI’$\t\x19$\tI’d\0H’$\x1bÛ\x6 \tI’m\v\0\tI’\0\0H’$\t\t\0 \tIÒ$\0H’$)m\x2 \tI’¶\t\0$\tiÛ\0\0H’¤-\r\0$\tIÚ6\0\0’$)m\x3\0\bI’´\t\0$\tI’\0\0H’$\t\t$\tI’$\0\0’$\tI\x2\0\tI²m\v\0\tÉ–\0\tI’$\t\t\0$\tIÚ$\0I’$-m\x2\0\bIÒ¶\r@’$\tmÛ\0\bI’´-\r\0 \tIÛ6\0H’$)m\x3\0\bI’¶\r@’$\tI›\0\0H’$\t\t€$\tI’$\0H’$\tI\x2\0\bI’$\t\0$\tÙ–\0\bI’$\t\t€$\tIÚ$\0\0’$-m\x2$\tIÒ¶\t\0’$\tmÛ\0\0I’´-\r\0 \tIÛ6\0\0’$-m\x3$\tI’¶\r@’$\tI›\0\bI’$\t\t€$\tI’$\0@’$\tI\x2 \tI’$\t\0$\tI’\0\0I’$\t\t$\tI’$\0I’$)M\x2 \tIÒ¶\t\0$\tm›\0\bI’´-\t\0 \tIÛ6\0H’$)m\x2$\tI’¶\t\0€$\tI’\0\bI’$\t\t\0 \tI’$\0\0’$\tI\x2\0\tI’$\t\0’$\tI’\0\0I’$\t\t\0 \tI’$\0H’$\tI\x2 \tI’$\t\0€$\ti“\0\0H’¤\r\t$\tIÚ&\0H’$)M\x2 \tI’$\t\0€$\tI’\0\bI’$\t\t\0$\tI’$\0\0’$\tI\x2$\tI’$\t\0€$\tI’\0\bI’$\t\t\0 \tI’$\0I’$\tI\x2$\tI’$\t\0’$\tI’\0\0H’$\t\t$\tI’$\0\0’$\tI\x2 \tI’$\t\0€$\tI’\0\tI’$\t\t$\tI’$\0@’$\tI\x2$\tI’$\t\0€$\tI’\0\0H’$\t\t$\tI’$\0H’$\tI\x2\0\tI’$\t\0$\tI’\0\0I’$\t\t\0 \tI’$\0@’$\tI\x2$\x12I’$\t\0¢$\tI’\0\0I’$\t\t$\tI’$\0\0’$\tI\x2$\tI’$\t\0€$\tI’\0\bI’$\t\t$\tI’$\0@’$\tI\x2\0\tI’$\t\0€$\tI’\0\0I’$\t\t$\tI’$\0\0’$\tI\x2\0\bI’$\t\0¢$\tI’\0\0H’$\t\t$\tI’$\0H’$\tI\x2 \tI’$\t\0’$\tI’\0\bI’$\t\t€$\tI’$\0I’$\tI\x2\0\tI’$\t\0€$\tI’\0\0\f‰Œœ¥\x1Ä£“´\a¼•°\x2Ÿþµ¹\x1æé¿…\x6´üš²\v
```

3. A simple plain text message, BlobID = 13304731967790798388
```
Hello_World_This_Is_A_Data_Blob!
```