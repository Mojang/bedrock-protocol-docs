# ClientboundUpdateSoundDataPacket
- Fixed the event payload binding. The sound event variant was bound once per alternative, which wrote the whole variant seven times per packet and produced eight top-level fields in the docs. It is now a single tagged variant field `Event`, discriminated by a new `SoundDataEventType` (`uint8`) `Type` tag, matching the pattern used by other variant packets.
