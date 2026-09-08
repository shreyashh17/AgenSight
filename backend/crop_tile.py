from PIL import Image
import numpy as np
import os

img_icon_path = r"C:\Users\asus\.gemini\antigravity\brain\dcb2ed9c-ce01-4983-bf04-e2609b3e6540\.user_uploaded\media_1788893396219.png"
out_dir = r"c:\Users\asus\OneDrive\Documents\multi-agent-system\multi-agent-system\frontend\public"

img = Image.open(img_icon_path).convert("RGBA")
arr = np.array(img)

# The background is white (R,G,B > 240). Find the bounding box of the rounded black icon in the center.
is_not_white = ~((arr[:, :, 0] > 240) & (arr[:, :, 1] > 240) & (arr[:, :, 2] > 240))
coords = np.argwhere(is_not_white)
y0, x0 = coords.min(axis=0)
y1, x1 = coords.max(axis=0) + 1

# Crop the exact rounded icon tile
app_tile = img.crop((x0, y0, x1, y1))
app_tile.save(os.path.join(out_dir, "logo-app-tile.png"))

# Also make the outer white corners transparent around the tile if any
tile_arr = np.array(app_tile)
white_corners = (tile_arr[:, :, 0] > 240) & (tile_arr[:, :, 1] > 240) & (tile_arr[:, :, 2] > 240)
tile_arr[white_corners, 3] = 0
tile_transparent = Image.fromarray(tile_arr)
tile_transparent.save(os.path.join(out_dir, "logo-icon.png"))
tile_transparent.save(os.path.join(out_dir, "favicon.png"))
tile_transparent.save(os.path.join(out_dir, "favicon.ico"))

print(f"Cropped app icon tile from {img.size} to {tile_transparent.size}")
