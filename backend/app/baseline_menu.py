from app.models import FlavorPoint, MenuItem

BASELINE_MENU: list[MenuItem] = [
    MenuItem(
        name="Classic Cappuccino",
        flavor=FlavorPoint(sweetness=2, acidity=4, body=7, bitterness=6, temperature="hot"),
        ingredients=["espresso", "whole milk"],
    ),
    MenuItem(
        name="Vanilla Oat Latte",
        flavor=FlavorPoint(sweetness=5, acidity=3, body=6, bitterness=4, temperature="hot"),
        ingredients=["espresso", "oat milk", "vanilla syrup"],
    ),
    MenuItem(
        name="Iced Caramel Macchiato",
        flavor=FlavorPoint(sweetness=7, acidity=3, body=5, bitterness=3, temperature="iced"),
        ingredients=["espresso", "whole milk", "caramel syrup"],
    ),
    MenuItem(
        name="Cold Brew",
        flavor=FlavorPoint(sweetness=1, acidity=5, body=6, bitterness=7, temperature="iced"),
        ingredients=["cold brew concentrate", "water"],
    ),
    MenuItem(
        name="Honey Lavender Latte",
        flavor=FlavorPoint(sweetness=6, acidity=2, body=5, bitterness=3, temperature="hot"),
        ingredients=["espresso", "whole milk", "honey", "lavender syrup"],
    ),
    MenuItem(
        name="Iced Matcha Lemonade",
        flavor=FlavorPoint(sweetness=4, acidity=7, body=3, bitterness=4, temperature="iced"),
        ingredients=["matcha", "lemonade", "water"],
    ),
]
