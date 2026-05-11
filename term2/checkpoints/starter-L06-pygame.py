# starter-L06-pygame.py
# =============================================================================
# Lesson 6 — Pygame Setup + First Window
# Y9 Game On (9GAMZA) · Term 2 2026 · Ms Gao
# Reference: Eric Matthes, "Python Crash Course" 3rd ed., Chapter 12, §1–3
# =============================================================================
#
# WHAT THIS IS
# ------------
# The minimal Pygame skeleton — every Pygame game starts here.
# Today (L06) you will TYPE this file yourself (do not copy-paste).
# Typing the boilerplate builds the muscle memory you'll need in L07–L21.
#
# WHAT TO DO
# ----------
#   1. Open VS Code (or IDLE). Create a new file called  alien_invasion.py
#   2. Type the code below — exactly. Do not copy-paste.
#   3. Save it in a folder called  alien_invasion_game/  somewhere sensible
#      (NOT in Downloads — somewhere you can find it again).
#   4. Open a terminal in that folder. Run:    python alien_invasion.py
#   5. A grey window with the title "Alien Invasion" should appear.
#   6. Click the X to close it.
#
# IF IT DOESN'T WORK
# ------------------
#   See the L05 Self-Check handout — Part A "Install verification" and
#   Part C "Common errors". 90% of issues are install-related.
# =============================================================================


import sys
import pygame


def run_game():
    """Initialise Pygame and run the main game loop."""

    # ---- 1. INITIALISE PYGAME ----
    # pygame.init() activates the Pygame subsystems we need (display, events, etc.)
    # Without this line, no other pygame call will work.
    pygame.init()

    # ---- 2. CREATE THE SCREEN ----
    # The argument is a tuple: (width, height) in pixels.
    # TODO 1 (Customise): try (800, 600) for a smaller window,
    #                     or (1920, 1080) for full screen.
    screen = pygame.display.set_mode((1200, 800))

    # The title that appears in the top bar of the window.
    # TODO 2 (Customise): rename this to your project's title.
    pygame.display.set_caption("Alien Invasion")

    # ---- 3. SET BACKGROUND COLOUR ----
    # Colours in Pygame are (R, G, B) tuples — each 0 to 255.
    # (230, 230, 230) is a light grey (Matthes' default).
    # TODO 3 (Customise): try your favourite colour.
    #   Black = (0, 0, 0)        White = (255, 255, 255)
    #   Red   = (255, 0, 0)      Green = (0, 255, 0)
    #   Blue  = (0, 0, 255)      Pink  = (255, 105, 180)
    bg_color = (230, 230, 230)

    # ---- 4. MAIN GAME LOOP ----
    # This loop runs forever (until the user closes the window).
    # Every frame of your game happens inside here.
    while True:

        # ---- 4a. EVENT HANDLING ----
        # Every keyboard press, mouse click, and window action is an "event".
        # pygame.event.get() returns the list of events since last check.
        for event in pygame.event.get():

            # The user clicked the X on the window — quit the program.
            if event.type == pygame.QUIT:
                sys.exit()

            # TODO 4 (Extension): print every event so you can see them.
            #                     Uncomment the line below.
            # print(event)

        # ---- 4b. DRAW THE SCREEN ----
        # Fill the entire screen with the background colour.
        # This wipes whatever was on screen from the previous frame.
        screen.fill(bg_color)

        # ---- 4c. PUSH TO DISPLAY ----
        # display.flip() makes the freshly drawn screen visible to the user.
        # Without this line, you'll see a blank/black window.
        pygame.display.flip()


# ---- 5. RUN THE GAME ----
# This block runs run_game() ONLY when you execute this file directly
# (i.e. python alien_invasion.py). It would not run if the file were imported.
if __name__ == "__main__":
    run_game()


# =============================================================================
# THINGS TO TRY (during You Do — 15 min independent practice)
# =============================================================================
#
#   ☐ Run the file. Does a grey window appear?
#   ☐ Close it with the X. Does it close cleanly (no error)?
#   ☐ Complete TODO 1 — change the window size. Re-run.
#   ☐ Complete TODO 2 — change the title to your name. Re-run.
#   ☐ Complete TODO 3 — change the background colour. Re-run.
#   ☐ Take a screenshot of YOUR customised window.
#   ☐ Upload the screenshot to today's Google Classroom L05 post.
#
# EXIT TICKET (Journal — 3 mins, paste into your Coding Journal):
#   In your own words, explain what each of these lines does:
#     (a) pygame.init()
#     (b) screen = pygame.display.set_mode((1200, 800))
#     (c) for event in pygame.event.get():
#     (d) screen.fill(bg_color)
#     (e) pygame.display.flip()
# =============================================================================
