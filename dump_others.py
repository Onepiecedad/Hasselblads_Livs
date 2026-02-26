from PIL import Image

def analyze_bottom(path):
    print(f"--- {path} ---")
    img = Image.open(path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    last_color = None
    last_y = height - 100
    for y in range(height - 100, height):
        c = pixels[width//2, y]
        rc = (c[0]//10, c[1]//10, c[2]//10)
        if rc != last_color:
            if last_color is not None:
                print(f"Y={last_y} to {y-1}: {pixels[width//2, y-1]}")
            last_color = rc
            last_y = y
    print(f"Y={last_y} to {height-1}: {pixels[width//2, height-1]}")

analyze_bottom("src/assets/category-cards/alt1-final/category-notter.webp")
analyze_bottom("src/assets/category-cards/alt1-final/category-frukt-gront.webp")
