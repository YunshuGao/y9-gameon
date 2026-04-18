# ============================================
#  L09 Starter — Character class
#  Support tier — __init__ pre-written; add 3 methods
# ============================================

class Character:
    def __init__(self, name, hp, attack):
        self.name = name
        self.hp = hp
        self.attack = attack

    # TODO 1: Write take_damage(self, amount)
    #   It should: reduce self.hp by amount
    #              print "{name} takes {amount} damage! HP: {hp}"


    # TODO 2: Write heal(self, amount)
    #   It should: increase self.hp by amount (but never above 100)
    #              print "{name} heals to {hp} HP"


    # TODO 3: Write is_alive(self)
    #   It should: return True if hp > 0, else False


# Test your class below
hero = Character("Arrow", 100, 15)
enemy = Character("Goblin", 50, 8)

# TODO 4: Make the hero attack the enemy 3 times using a for-loop
# Then print whether each is still alive
