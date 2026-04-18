"""
Alien Invasion — Checkpoint at end of Lesson 14
Goal: Window + ship that moves + fires bullets + one alien in the corner.

NOTE: You need ship.bmp and alien.bmp in the same folder as this file.
Download them from the hub's /checkpoints/ folder if you don't have them.
"""
import sys
import pygame


class Settings:
    """All the tunable numbers for the game in one place."""
    def __init__(self):
        self.screen_width = 1200
        self.screen_height = 800
        self.bg_color = (25, 25, 50)
        # Ship
        self.ship_speed = 1.5
        # Bullets
        self.bullet_speed = 3
        self.bullet_width = 3
        self.bullet_height = 15
        self.bullet_color = (255, 212, 59)  # Python yellow
        self.bullets_allowed = 5


class Ship:
    """A player-controlled ship."""
    def __init__(self, screen, settings):
        self.screen = screen
        self.settings = settings
        self.image = pygame.image.load("ship.bmp")
        self.rect = self.image.get_rect()
        self.screen_rect = screen.get_rect()
        # Start at the bottom-centre
        self.rect.midbottom = self.screen_rect.midbottom
        # Movement flags
        self.moving_right = False
        self.moving_left = False
        # Use float for smooth movement
        self.x = float(self.rect.x)

    def update(self):
        if self.moving_right and self.rect.right < self.screen_rect.right:
            self.x += self.settings.ship_speed
        if self.moving_left and self.rect.left > 0:
            self.x -= self.settings.ship_speed
        self.rect.x = self.x

    def blitme(self):
        self.screen.blit(self.image, self.rect)


class Bullet(pygame.sprite.Sprite):
    """A bullet fired from the ship."""
    def __init__(self, screen, ship, settings):
        super().__init__()
        self.screen = screen
        self.settings = settings
        # Create the bullet rectangle at (0, 0) then move it
        self.rect = pygame.Rect(0, 0, settings.bullet_width, settings.bullet_height)
        self.rect.midtop = ship.rect.midtop
        self.y = float(self.rect.y)
        self.color = settings.bullet_color

    def update(self):
        self.y -= self.settings.bullet_speed
        self.rect.y = self.y

    def draw_bullet(self):
        pygame.draw.rect(self.screen, self.color, self.rect)


class Alien(pygame.sprite.Sprite):
    """A single alien."""
    def __init__(self, screen):
        super().__init__()
        self.screen = screen
        self.image = pygame.image.load("alien.bmp")
        self.rect = self.image.get_rect()
        # Start position — upper-left
        self.rect.x = self.rect.width
        self.rect.y = self.rect.height

    def blitme(self):
        self.screen.blit(self.image, self.rect)


def run_game():
    pygame.init()
    settings = Settings()
    screen = pygame.display.set_mode((settings.screen_width, settings.screen_height))
    pygame.display.set_caption("Alien Invasion")

    ship = Ship(screen, settings)
    bullets = pygame.sprite.Group()
    alien = Alien(screen)

    while True:
        # Event handling
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RIGHT:
                    ship.moving_right = True
                elif event.key == pygame.K_LEFT:
                    ship.moving_left = True
                elif event.key == pygame.K_SPACE:
                    if len(bullets) < settings.bullets_allowed:
                        bullets.add(Bullet(screen, ship, settings))
                elif event.key == pygame.K_q:
                    sys.exit()
            elif event.type == pygame.KEYUP:
                if event.key == pygame.K_RIGHT:
                    ship.moving_right = False
                elif event.key == pygame.K_LEFT:
                    ship.moving_left = False

        # Update
        ship.update()
        bullets.update()
        # Remove bullets that left the screen
        for bullet in bullets.copy():
            if bullet.rect.bottom <= 0:
                bullets.remove(bullet)

        # Draw
        screen.fill(settings.bg_color)
        ship.blitme()
        for bullet in bullets.sprites():
            bullet.draw_bullet()
        alien.blitme()
        pygame.display.flip()


if __name__ == "__main__":
    run_game()
