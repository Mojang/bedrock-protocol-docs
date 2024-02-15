# Anti Cheat Documentation

This directory contains documentation about various implementation details of anti-cheat that aren't obvious from looking at the various classes. It is committed in the repository so that it can reflect the current state of the code, as opposed to getting out of sync as it would on a wiki page. GitHub file view is a good way to view these files as it'll render the markdown, unlike using the diff view or a plain text editor.

## Configuration

- [Overview](./ConfiguringAntiCheat.md)
- [Example props file](./AntiCheatServer.properties)

## Player Movement

- [Overview](./PlayerMovementOverview.md)
- [Implementing rewindable movement behavior](./PlayerMovementECS.md)

## Block Breaking

- [Overview](./BlockBreakingOverview.md)
- [Build Action Simulation Rate](./BuildActionSimulationRate.md)

## Server Auth Inventory

- [PlayerUIContainer slots for various player-specific UI screens](./ServerAuthInventory/PlayerUIContainer.md)
- [ItemStackPackets Disabled - Protocol Documentation Supplement](./ServerAuthInventory/ItemStackPackets_Disabled.md)

## Network Protocol Details

- [Anti cheat related protocol modifications](./AntiCheatProtocolModifications.md)
