# VirtualContainerOpenPacket
- Added `VirtualContainerOpenPacket`, which the server sends to open a container screen onto a virtual container, a container that only exists in memory ADO:1714462
  - It carries a nonzero session ID, the inventory window ID, a title of up to 256 bytes and every initial slot with its server item stack net ID
  - The number of slots (1-54) sets the container size, so no initial `InventoryContentPacket` is sent
  - Further container manipulations use the existing inventory packets, and a successful opening is not acknowledged

# VirtualContainerClosePacket
- Added `VirtualContainerClosePacket`, which closes a virtual container screen and refers to its opening by session ID ADO:1714462
  - The server sends `Request` to close a screen, and `Confirmed` once the player's queued inventory requests have finished
  - The client sends `Closed` when its screen closes, when it can't show an opened container, or in answer to a `Request`
  - Each packet carries a cause that says why the screen closed, and `ContainerClosePacket` is unchanged

# VirtualContainerCloseKind enum
- Added `Request` (0), `Closed` (1) and `Confirmed` (2) ADO:1714462

# VirtualContainerCloseCause enum
- Added `Unknown` (0), `UserClosed` (1), `ServerRequested` (2), `UserBusy` (3), `ClientNotReady` (4), `InvalidContents` (5), `UiCreationFailed` (6) and `UiCancelled` (7) ADO:1714462
