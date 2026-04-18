"""
Alien Invasion — Checkpoint at end of Lesson 11
Goal: A window opens. Closes when you click X. That's it.

If yours doesn't do this, copy this file into your game folder
and run it. Then compare line-by-line to understand what's different.
"""
import sys
import pygame


def run_game():
    pygame.init()
    # The game window size — try changing this!
    screen = pygame.display.set_mode((1200, 800))
    pygame.display.set_caption("Alien Invasion")

    # Background colour in RGB (0-255 for each of red, green, blue)
    bg_color = (25, 25, 50)  # dark navy — try (230, 230, 230) for grey

    # The game loop. This runs roughly 60 times per second.
    while True:
        # Check for events (keyboard, mouse, window close)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit()

        # Fill the whole screen with the background colour
        screen.fill(bg_color)

        # Show the latest-drawn screen
        pygame.display.flip()


if __name__ == "__main__":
    run_game()
