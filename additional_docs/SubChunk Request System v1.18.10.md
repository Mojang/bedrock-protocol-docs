# SubChunk Request System for Minecraft v1.18.10

In v1.18.00 of Minecraft, we introduced a revised terrain system.  Key features of this new system are:
- World height changed from 0-255 to -64 to 319
- World is now built out from -64 to +64 or higher (especially for mountains)

Before v1.18.00, servers would send out the entire column of block data for each 16x16 chunk (LevelChunkPacket).  This would consist of a set of "SubChunks" (16x16x16) pieces in a stack.  While we still support this method of server-client communication, the terrain changes cause this approach to nearly double out network needs.

Important: An addendum was added to the bottom of the documentation. Implementation for the SubChunk Request System Packets has changed and does not support the previous packet versions.

## Changes to LevelChunkPacket to allow for SubChunk Request System

To that end, we have implemented the concept of a "SubChunk Request System".  What this does is the server now sends "skeleton" LevelChunks in the LevelChunkPacket.

To trigger "skeleton" LevelChunks, set the number of subchunks marked as std::numeric_limits<uint32_t>::max() (the largest value for an unsigned 32 bit integer, or 0xffffffff).  This tells the client to request SubChunks and to be receptive to SubChunkPackets sent to it for that LevelChunk. In essence, it turns on the SubChunk Request system for that LevelChunk.

Note that sending a "skeleton" LevelChunk affects BlockEntities.  Do not send BlockEntities via the LevelChunk if marked as a "skeleton" LevelChunk, that data goes into the SubChunks themselves.  Failure to do that will result in unexpected behavior as the client finds mismatches between the BlockActor data for a block and the fact the block is not (yet) the correct block type.

When the SubChunkRequest is enabled for a LevelChunk, any SubChunks the client needs for that LevelChunk is requested from the server. This consists of two scenarios:
- Client ticking area.  All subchunks within approximately four LevelChunks from the player's Client-side position are requested.
- Visibility determination.  All subchunks the player can see from their current location are (progressively) requested.

The net effect is that we do not request unseen SubChunks more than about four LevelChunks away, thus saving considerable bandwidth.

## SubChunkRequestPacket

These requests are sent from the client to the server as SubChunkRequestPackets.  This packet contains:
- Dimension ID
- Sub Chunk Position (X/Z of the LevelChunk, and absolute Y value of the SubChunk based on the dimension height. For example, a -64:319 block range would result in a -4:20 SubChunk Y range)

Note that servers can ignore these requests, they are non-binding.  The client does keep track of unfullfilled requests, so there is some overhead on that, but in general, if the server sends the subchunks the client can reasonably see, this list will be small or non-existant.  The main point is that requests don't have to be honored, if the Server wants to send the SubChunks in it's own order (i.e. for a racing level, or right after sending the "skeleton" LevelChunk).

For a LevelChunk marked as "request", the client will place invisible and obstructing placeholder blocks in the positions with no repsonse yet. To fill in those SubChunks, a SubChunkPacket is sent from the server to the client.

## SubChunkPacket

The SubChunkPacket is sent from the server to the client.  Note that the client will ignore this unless it's subchunk is marked as "NeedsRequest", which only occurs after a LevelChunkPacket is sent marked as "request" (i.e. a "skeleton" LevelChunk).  Once a successful SubChunkPacket is handled on the Client, it will ignore further SubChunkPackets for that SubChunk until the entire LevelChunk is re-marked for requests.

The SubChunk packet contains:
- The dimension ID
- The SubChunk Position (X/Z are the LevelChunk position, Y is the absolute SubChunk position)
- The serialized SubChunk (this part is similar to SubChunks sent via LevelChunks normally), will be an empty "string" if no data.  See below for more details, as this now contains BlockActors specific to the LevelChunk
- The result
- Heightmap data
- A flag indicating if Blob Caching is enabled
- The Blob Cache ID if Blob Caching is enabled

The result consists of a return type informing the Client as to how the request went:
- 0 - Undefined
- 1 - Success (packet contains valid data for the subchunk)
- 2 - LevelChunk Doesn't exist 
- 3 - Wrong dimension (player is in another dimension when request arrived)
- 4 - Player doesn't exist (i.e. the network ID for the packet corresponds to an unknown player, say, they logged off)
- 5 - Index is out of bounds (invalid subchunk index)

For 3rd party servers, "Success" is likely the only one likely to be needed.

Note that this SubChunk will replace any blocks in that SubChunk, and that any further changes to that SubChunk (with one exception noted later) should be done via regular block updates.

## SubChunk Serialized data

The SubChunkPacket contains the serialized SubChunk Data.  This consists of two parts:
- SubChunk serialized data
- BlockActor serialized data

Note that this is a single blob, and thus the cached ID for this blob will be this combined data.  Thus blob ID's will be different than with regular LevelChunk's SubChunk blob ID's, when there are BlockActors present.

The SubChunk Serialized data part is similar to the regular LevelChunk data for subchunk data with some differences. The SubChunk Serialized data contains the terrain information (the same as LevelChunk data for subchunk data) and the BlockEntity data for the subchunk is included in the serialized section to ensure the client always has a match between BlockEntities and Blocks.

BlockEntity serialization is identical to in the LevelChunk, except should only include BlockEntities relevant to the SubChunk.

## Heightmap

The heightmap section is important to maintain (incrementally) the client's concept of the heightmap. 

Heightmaps are used for a variety of things, in particular, lighting, and handling rain/snow correctly (e.g. so that interior spaces don't get rain on them)

Prior to SubChunk Request, an entire 16x16 column was sent, and the client computed the heightmap, and adjusted it as block changes occurred.  Since now we can have partial LevelChunks (with some populated SubChunks and some not), we need a different approach to getting the heightmap.

Each SubChunk response will indicate the nature of it's contribution to the heightmap.  Specifically, the serialized data will be:
- A byte indicating the status
- If the byte indicates "HasData" (value 1), then a 16x16 array of height values

Heightmap status can be:
- 0 - no data
- 1 - has data
- 2 - All Too High (entire heightmap is above this subchunk)
- 3 - All Too Low (entire heightmap is below this subchunk)

If the status is 1 (has data), each of the 16x16 entries is a signed 8-bit integer.  A value of -1 indicates that the x/z column is below the subchunk.  A value of 16 indicates that the x/z column is above the subchunk.  Otherwise it's the position in the subchunk that the heightmap is (e.g. a value of 5 means the heightmap is y=5 inside of the subchunk).  Note that the 16x16 array is stored in [z][x] order, i.e. rows of x's.

After the SubChunk packet "snapshot" arrives, future changes to that subchunk's blocks will alter the heightmap as per normal.

## Blob Caching

Full support for Blob Caching is supported with the SubChunk Request system.  The key difference is that the blobs include the BlockEntity data as well, thus any SubChunks with BlockEntities will have a different id than they would when being sent via the LevelChunk.

## Info on sending a replacement subchunk

By design, once the Client has received a valid SubChunkPacket and processed it, any further changes to the SubChunk should be via normal updates (e.g. block updates).  Thus future SubChunkPackets for that SubChunkPosition will be ignored.

If there is a desire to send full SubChunks as part of a world-change or other update design, we do support this.  The process is:
- Send another LevelChunkPacket for the LevelChunk, marked for SubChunk Request (e.g. the special subchunk count)
- Re-send the SubChunkPackets for the LevelChunk

This will replace the SubChunks correctly. Be aware that there may be visual artifacts while they switch.

# Addendum
## Latest Optimizations for SubChunk Request System for v1.18.10
After the 1.18.00 release, we decided to work on reducing network bandwidth usage through packet batching.

## Changes to SubChunkRequestPacket
SubChunkRequestPacket should contain the following information:
- Dimension ID: 4 bytes
- Center SubChunk Position: 12 bytes, 4 bytes (int32_t) for each axis: x, y, z
- Request Count: 4 bytes (int32_t)
- Every SubChunk Offset Position: 3 bytes per individual SubChunk Request, 1 byte (int8_t) for each axis: x, y, z

The Center SubChunk Position is an absolute world SubChunk position that all the SubChunk Requests use as a reference point. On Bedrock, we use the player's SubChunk position. Based on this Center SubChunk position, we calculate the relative distance of the other SubChunk Requests by subtracting the absolute world SubChunk position of the SubChunk that we wish to request minus the Center SubChunk Position. The result of this subtraction is the SubChunk Offset Position.

It is important to consider that a SubChunk Offset is sent as an int8_t (1 byte) per axis, therefore the value range of the offset goes from -127 to 127. This means that each offset can only be 127 SubChunks away from the center per axis. If a SubChunk outside this range needs to be requested, it will have to be sent through a new packet with a new center within 127 SubChunks from the required subchunk.

## Changes to SubChunkPacket
SubChunkPacket should contain the following information:
- A flag indicating if Blob Caching is enabled: 1 byte
- Dimension ID: 4 bytes
- Center SubChunk Position: 12 bytes, 4 bytes (int32_t) for each axis: x, y, z
- Response Count: 4 bytes (int32_t)
For every SubChunk Response:
- Every SubChunk Offset Position: 3 bytes per individual SubChunk Response, 1 byte (int8_t) for each axis: x, y, z
- The Request Result: 1 byte (uint8_t)
- The serialized SubChunk if required (Same as the past iteration of SubChunkPacket, though now we skip this on certain result types)
- The heightmap type: 1 byte
- Heightmap data if required: 256 bytes (if the type indicates we have data)
- The Blob Cache ID if Blob Caching is enabled: 8 bytes (uint64_t), otherwise we skip this 8-byte field

The Request Result list has an additional value: SuccessAllAir. The possible result list is as follows:
- 0 - Undefined
- 1 - Success (packet contains valid data for the subchunk, i.e. the serialized SubChunk portion exists)
- 2 - LevelChunk Doesn't exist 
- 3 - Wrong dimension (player is in another dimension when request arrived)
- 4 - Player doesn't exist (i.e. the network ID for the packet corresponds to an unknown player, say, they logged off)
- 5 - Index is out of bounds (invalid subchunk index)
- 6 - SuccessAllAir (requested SubChunk is all air so we don't send a serialized all-air SubChunk since the client only needs this result code to handle the response)

## SubChunk Request System Optimizations
In order to reduce the amount of requests that the server handles, we now let the client know which SubChunks are "known air" SubChunks based on the server LevelChunk's heightmap. This is handled in the LevelChunkPacket

## Changes to LevelChunkPacket
For the server to let the client know about "known air" SubChunks, the SubChunk count needs to be set to `std::numeric_limits<uint32_t>::max() - 1` and the index of the highest LevelChunk-relative SubChunks that **should** be requested. Meaning if a LevelChunk is 24 chunks high and the first 16 chunks are **not air** then the value that needs to be sent after the SubChunk count is 15 (first index is 0). SubChunk count uses 4 bytes and the index of the highest non-air SubChunk uses 2 bytes.