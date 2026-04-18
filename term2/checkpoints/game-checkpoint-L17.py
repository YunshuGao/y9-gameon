"""
Alien Invasion — Checkpoint at end of Lesson 17
Goal: Ship + bullets + alien fleet that moves + bullets destroy aliens
      + fleet respawns when empty. No lives/scoring yet.

Files needed in same folder: ship.bmp, alien.bmp
"""
import sys
import pygame


class Settings:
    def __init__(self):
        # Screen
        self.screen_width = 1200
        self.screen_height = 800
        self.bg_color = (25, 25, 50)
        # Ship
        self.ship_speed = 1.5
        # Bullets
        self.bullet_speed = 3
        self.bullet_width = 3
        self.bullet_height = 15
        self.bullet_color = (255, 212, 59)
        self.bullets_allowed = 5
        # Aliens
        self.alien_speed = 1.0
        self.fleet_drop_speed = 10
        self.fleet_direction = 1  # 1 = right, -1 = left


class Ship:
    def __init__(self, screen, settings):
        self.screen = screen
        self.settings = settings
        self.image = pygame.image.load("ship.bmp")
        self.rect = self.image.get_rect()
        self.screen_rect = screen.get_rect()
        self.rect.midbottom = self.screen_rect.midbottom
        self.moving_right = False
        self.moving_left = False
        self.x = float(self.rect.x)

    def update(self):
        if self.moving_right and self.rect.right < self.screen_rect.right:
            self.x += self.settings.ship_speed
        if self.moving_left and self.rect.left > 0:
            self.x -= self.settings.ship_speed
        self.rect.x = self.x

    def center_ship(self):
        self.rect.midbottom = self.screen_rect.midbottom
        self.x = float(self.rect.x)

    def blitme(self):
        self.screen.blit(self.image, self.rect)


class Bullet(pygame.sprite.Sprite):
    def __init__(self, screen, ship, settings):
        super().__init__()
        self.screen = screen
        self.settings = settings
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
    def __init__(self, screen, settings):
        super().__init__()
        self.screen = screen
        self.settings = settings
        self.image = pygame.image.load("alien.bmp")
        self.rect = self.image.get_rect()
        self.screen_rect = screen.get_rect()
        self.rect.x = self.rect.width
        self.rect.y = self.rect.height
        self.x = float(self.rect.x)

    def check_edges(self):
        """Return True if alien is at a screen edge."""
        if self.rect.right >= self.screen_rect.right:
            return True
        if self.rect.left <= 0:
            return True
        return False

    def update(self):
        self.x += self.settings.alien_speed * self.settings.fleet_direction
        self.rect.x = self.x

    def blitme(self):
        self.screen.blit(self.image, self.rect)


def _create_fleet(screen, settings, ship, aliens):
    """Create a grid of aliens sized to the screen."""
    alien = Alien(screen, settings)
    alien_w, alien_h = alien.rect.size
    ship_h = ship.rect.height

    # How many aliens fit in a row?
    available_x = settings.screen_width - 2 * alien_w
    num_cols = available_x // (2 * alien_w)
    # How many rows fit above the ship?
    available_y = settings.screen_height - 3 * alien_h - ship_h
    num_rows = available_y // (2 * alien_h)

    for row in range(num_rows):
        for col in range(num_cols):
            a = Alien(screen, settings)
            a.x = alien_w + 2 * alien_w * col
            a.rect.x = a.x
            a.rect.y = alien_h + 2 * alien_h * row
            aliens.add(a)


def _check_fleet_edges(settings, aliens):
    for alien in aliens.sprites():
        if alien.check_edges():
            # Flip direction and drop
            for a in aliens.sprites():
                a.rect.y += settings.fleet_drop_speed
            settings.fleet_direction *= -1
            break


def run_game():
    pygame.init()
    settings = Settings()
    screen = pygame.display.set_mode((settings.screen_width, settings.screen_height))
    pygame.display.set_caption("Alien Invasion")

    ship = Ship(screen, settings)
    bullets = pygame.sprite.Group()
    aliens = pygame.sprite.Group()
    _create_fleet(screen, settings, ship, aliens)

    while True:
        # Events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RIGHT: ship.moving_right = True
                elif event.key == pygame.K_LEFT: ship.moving_left = True
                elif event.key == pygame.K_SPACE:
                    if len(bullets) < settings.bullets_allowed:
                        bullets.add(Bullet(screen, ship, settings))
                elif event.key == pygame.K_q: sys.exit()
            elif event.type == pygame.KEYUP:
                if event.key == pygame.K_RIGHT: ship.moving_right = False
                elif event.key == pygame.K_LEFT: ship.moving_left = False

        # Update
        ship.update()
        bullets.update()
        for bullet in bullets.copy():
            if bullet.rect.bottom <= 0:
                bullets.remove(bullet)
        _check_fleet_edges(settings, aliens)
        aliens.update()

        # Collisions
        pygame.sprite.groupcollide(bullets, aliens, True, True)
        if not aliens:
            bullets.empty()
            _create_fleet(screen, settings, ship, aliens)

        # Draw
        screen.fill(settings.bg_color)
        ship.blitme()
        for bullet in bullets.sprites():
            bullet.draw_bullet()
        aliens.draw(screen)
        pygame.display.flip()


if __name__ == "__main__":
    run_game()
