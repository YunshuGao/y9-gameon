"""
Alien Invasion — Checkpoint at end of Lesson 19
Goal: Everything from L17 + lives system + scoring + Play button
      + difficulty that increases when fleet clears.

This is the "complete" reference game before Your Twist.
Files needed: ship.bmp, alien.bmp
"""
import sys
from time import sleep
import pygame


class Settings:
    def __init__(self):
        # Screen
        self.screen_width = 1200
        self.screen_height = 800
        self.bg_color = (25, 25, 50)
        # Ship
        self.ship_limit = 3
        # Bullets
        self.bullet_width = 3
        self.bullet_height = 15
        self.bullet_color = (255, 212, 59)
        self.bullets_allowed = 5
        # Aliens
        self.fleet_drop_speed = 10
        # Difficulty scaling
        self.speedup_scale = 1.1
        self.score_scale = 1.5
        self.initialize_dynamic_settings()

    def initialize_dynamic_settings(self):
        """These reset when starting a new game."""
        self.ship_speed = 1.5
        self.bullet_speed = 3
        self.alien_speed = 1.0
        self.fleet_direction = 1
        self.alien_points = 50

    def increase_speed(self):
        self.ship_speed *= self.speedup_scale
        self.bullet_speed *= self.speedup_scale
        self.alien_speed *= self.speedup_scale
        self.alien_points = int(self.alien_points * self.score_scale)


class GameStats:
    def __init__(self, settings):
        self.settings = settings
        self.reset_stats()
        self.game_active = False
        self.high_score = 0

    def reset_stats(self):
        self.ships_left = self.settings.ship_limit
        self.score = 0
        self.level = 1


class Ship:
    def __init__(self, screen, settings):
        self.screen = screen; self.settings = settings
        self.image = pygame.image.load("ship.bmp")
        self.rect = self.image.get_rect()
        self.screen_rect = screen.get_rect()
        self.rect.midbottom = self.screen_rect.midbottom
        self.moving_right = False; self.moving_left = False
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
        self.screen = screen; self.settings = settings
        self.rect = pygame.Rect(0, 0, settings.bullet_width, settings.bullet_height)
        self.rect.midtop = ship.rect.midtop
        self.y = float(self.rect.y); self.color = settings.bullet_color

    def update(self):
        self.y -= self.settings.bullet_speed; self.rect.y = self.y

    def draw_bullet(self):
        pygame.draw.rect(self.screen, self.color, self.rect)


class Alien(pygame.sprite.Sprite):
    def __init__(self, screen, settings):
        super().__init__()
        self.screen = screen; self.settings = settings
        self.image = pygame.image.load("alien.bmp")
        self.rect = self.image.get_rect()
        self.screen_rect = screen.get_rect()
        self.rect.x = self.rect.width; self.rect.y = self.rect.height
        self.x = float(self.rect.x)

    def check_edges(self):
        return self.rect.right >= self.screen_rect.right or self.rect.left <= 0

    def update(self):
        self.x += self.settings.alien_speed * self.settings.fleet_direction
        self.rect.x = self.x

    def blitme(self):
        self.screen.blit(self.image, self.rect)


class Button:
    def __init__(self, screen, msg):
        self.screen = screen
        self.screen_rect = screen.get_rect()
        self.width, self.height = 200, 50
        self.button_color = (55, 118, 171)  # Python blue
        self.text_color = (255, 255, 255)
        self.font = pygame.font.SysFont(None, 48)
        self.rect = pygame.Rect(0, 0, self.width, self.height)
        self.rect.center = self.screen_rect.center
        self._prep_msg(msg)

    def _prep_msg(self, msg):
        self.msg_image = self.font.render(msg, True, self.text_color, self.button_color)
        self.msg_image_rect = self.msg_image.get_rect()
        self.msg_image_rect.center = self.rect.center

    def draw_button(self):
        self.screen.fill(self.button_color, self.rect)
        self.screen.blit(self.msg_image, self.msg_image_rect)


class Scoreboard:
    def __init__(self, screen, stats, settings):
        self.screen = screen; self.stats = stats; self.settings = settings
        self.screen_rect = screen.get_rect()
        self.text_color = (255, 212, 59)  # Python gold
        self.font = pygame.font.SysFont(None, 36)
        self.prep_score()
        self.prep_high_score()
        self.prep_level()
        self.prep_ships()

    def prep_score(self):
        rounded_score = round(self.stats.score, -1)
        score_str = f"Score: {rounded_score:,}"
        self.score_image = self.font.render(score_str, True, self.text_color, self.settings.bg_color)
        self.score_rect = self.score_image.get_rect()
        self.score_rect.right = self.screen_rect.right - 20
        self.score_rect.top = 20

    def prep_high_score(self):
        high_score = round(self.stats.high_score, -1)
        hs_str = f"High: {high_score:,}"
        self.hs_image = self.font.render(hs_str, True, self.text_color, self.settings.bg_color)
        self.hs_rect = self.hs_image.get_rect()
        self.hs_rect.centerx = self.screen_rect.centerx
        self.hs_rect.top = 20

    def prep_level(self):
        level_str = f"Level: {self.stats.level}"
        self.level_image = self.font.render(level_str, True, self.text_color, self.settings.bg_color)
        self.level_rect = self.level_image.get_rect()
        self.level_rect.right = self.score_rect.right
        self.level_rect.top = self.score_rect.bottom + 10

    def prep_ships(self):
        ships_str = f"Ships: {self.stats.ships_left}"
        self.ships_image = self.font.render(ships_str, True, self.text_color, self.settings.bg_color)
        self.ships_rect = self.ships_image.get_rect()
        self.ships_rect.left = 20; self.ships_rect.top = 20

    def show_score(self):
        self.screen.blit(self.score_image, self.score_rect)
        self.screen.blit(self.hs_image, self.hs_rect)
        self.screen.blit(self.level_image, self.level_rect)
        self.screen.blit(self.ships_image, self.ships_rect)

    def check_high_score(self):
        if self.stats.score > self.stats.high_score:
            self.stats.high_score = self.stats.score
            self.prep_high_score()


def _create_fleet(screen, settings, ship, aliens):
    alien = Alien(screen, settings)
    alien_w, alien_h = alien.rect.size
    ship_h = ship.rect.height
    available_x = settings.screen_width - 2 * alien_w
    num_cols = available_x // (2 * alien_w)
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
            for a in aliens.sprites():
                a.rect.y += settings.fleet_drop_speed
            settings.fleet_direction *= -1
            break


def _ship_hit(screen, settings, stats, sb, ship, aliens, bullets):
    if stats.ships_left > 0:
        stats.ships_left -= 1
        sb.prep_ships()
        aliens.empty(); bullets.empty()
        _create_fleet(screen, settings, ship, aliens)
        ship.center_ship()
        sleep(0.5)
    else:
        stats.game_active = False
        pygame.mouse.set_visible(True)


def _check_aliens_bottom(screen, settings, stats, sb, ship, aliens, bullets):
    screen_rect = screen.get_rect()
    for alien in aliens.sprites():
        if alien.rect.bottom >= screen_rect.bottom:
            _ship_hit(screen, settings, stats, sb, ship, aliens, bullets)
            break


def _check_play_button(screen, settings, stats, sb, play_button, ship, aliens, bullets, mouse_pos):
    if play_button.rect.collidepoint(mouse_pos) and not stats.game_active:
        settings.initialize_dynamic_settings()
        stats.reset_stats(); stats.game_active = True
        sb.prep_score(); sb.prep_level(); sb.prep_ships()
        aliens.empty(); bullets.empty()
        _create_fleet(screen, settings, ship, aliens)
        ship.center_ship()
        pygame.mouse.set_visible(False)


def run_game():
    pygame.init()
    settings = Settings()
    screen = pygame.display.set_mode((settings.screen_width, settings.screen_height))
    pygame.display.set_caption("Alien Invasion")
    stats = GameStats(settings)
    sb = Scoreboard(screen, stats, settings)
    play_button = Button(screen, "Play")
    ship = Ship(screen, settings)
    bullets = pygame.sprite.Group()
    aliens = pygame.sprite.Group()
    _create_fleet(screen, settings, ship, aliens)

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT: sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RIGHT: ship.moving_right = True
                elif event.key == pygame.K_LEFT: ship.moving_left = True
                elif event.key == pygame.K_SPACE and stats.game_active:
                    if len(bullets) < settings.bullets_allowed:
                        bullets.add(Bullet(screen, ship, settings))
                elif event.key == pygame.K_q: sys.exit()
            elif event.type == pygame.KEYUP:
                if event.key == pygame.K_RIGHT: ship.moving_right = False
                elif event.key == pygame.K_LEFT: ship.moving_left = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                _check_play_button(screen, settings, stats, sb, play_button, ship, aliens, bullets, pygame.mouse.get_pos())

        if stats.game_active:
            ship.update()
            bullets.update()
            for bullet in bullets.copy():
                if bullet.rect.bottom <= 0: bullets.remove(bullet)
            collisions = pygame.sprite.groupcollide(bullets, aliens, True, True)
            if collisions:
                for aliens_hit in collisions.values():
                    stats.score += settings.alien_points * len(aliens_hit)
                sb.prep_score()
                sb.check_high_score()
            if not aliens:
                bullets.empty()
                settings.increase_speed()
                stats.level += 1
                sb.prep_level()
                _create_fleet(screen, settings, ship, aliens)
            _check_fleet_edges(settings, aliens)
            aliens.update()
            if pygame.sprite.spritecollideany(ship, aliens):
                _ship_hit(screen, settings, stats, sb, ship, aliens, bullets)
            _check_aliens_bottom(screen, settings, stats, sb, ship, aliens, bullets)

        screen.fill(settings.bg_color)
        ship.blitme()
        for bullet in bullets.sprites():
            bullet.draw_bullet()
        aliens.draw(screen)
        sb.show_score()
        if not stats.game_active:
            play_button.draw_button()
        pygame.display.flip()


if __name__ == "__main__":
    run_game()
