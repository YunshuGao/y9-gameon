# ============================================
#  L06 Starter — Text Adventure v1
#  Support tier — one room pre-written; add 2 more
# ============================================

player_name = input("What is your name, adventurer? ")
print(f"Welcome, {player_name}!")

# ====== ROOM 1 (already built for you) ======
print("\nYou stand at a crossroads.")
choice = input("Go LEFT or RIGHT? ").lower()

if choice == "left":
    print("You find a treasure chest! 🏆")
elif choice == "right":
    print("You fall into a pit 💀")
else:
    print("You stand still. Nothing happens.")

# TODO 1: Add another room with 3 choices
# Example: the treasure room has a chest — open it or leave it?


# TODO 2: Add a third room with a monster — fight or flee?


print(f"\nThanks for playing, {player_name}!")
