# Grudgematch Checkers

## Authentication

We leverage Firebase's standard authentication to allow users to create accounts and start playing (with persistant states and progress)

![Auth](https://github.com/ethansq/grudgematch-checkers/blob/master/readme/auth.png?raw=true)

* Note, we don't actually validate the email. It just has to has a valid *@*.* format
* As per Firebase requirements, passwords have to be >6 characters
* Once an email is used for the first time, it will be stored, and future uses must require the valid password

## Lobby

We allow users to choose a name. This step is requested on first-authentication for all users. Once that step is completed, users can input a room ID or create a new room

![Lobby](https://github.com/ethansq/grudgematch-checkers/blob/master/readme/lobby.png)

* However, we don't actually use the name provided anywhere
* We only use accounts for the purpose of turns and state persistance
* Room IDs are obtained by friends after a room is created (it will be displayed in the room). We have no method of joining publicly advertised rooms yet.

## Room

Once users join or create a room, they are shown the board, the room ID, actions, and a status message

![Room](https://github.com/ethansq/grudgematch-checkers/blob/master/readme/board.png)

* The creator of the room moves first by default
* Once a move is made, it can be reverted/undone using the blue undo button.
* When a player is done their move, they can press the green done button to finalize it.
  * Once a move is finalized, Firebase is updated to reflect the new move
  * Non-finalized moves (local, undo-able moves) are not seen by the other player. They are only updated when Firebase's game state is updated.
* The status message indicates who's making the current move.
* The player must wait until his or her opponent is done their move before doing anything else.

## Mechanics

* We define an auxiliary set of cells as the cells that a piece can possibly move to
  * These cells include
    * Cells that can be reached by jumping over an enemy
    * Cells that can be reached by a simple one-cell diagonal move
* We use the notion of auxiliary cells to simplify our move-parsing. Instead of checking if a chosen cell is valid for a piece to move to, we simply provide all valid auxiliary cells, and clicks to cells that are not auxiliary are ignored (usually, they de-select the currently selected cell).
  * As such, we only need to consider valid-cell clicks.
* Note, our version uses the non-flying-kings ruleset, where kings can only move backwards, not fly like bishops.
