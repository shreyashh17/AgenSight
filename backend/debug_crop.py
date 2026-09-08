from PIL import Image
import numpy as np

img = Image.open(r"C:\Users\asus\.gemini\antigravity\brain\dcb2ed9c-ce01-4983-bf04-e2609b3e6540\.user_uploaded\media_1788893396219.png").convert("RGBA")
arr = np.array(img)
print("Image dimensions:", img.size)

# Let's inspect where pixels are dark (e.g. R<100, G<100, B<100)
dark_pixels = (arr[:, :, 0] < 100) & (arr[:, :, 1] < 100) & (arr[:, :, 2] < 100)
coords = np.argwhere(dark_pixels)
if len(coords) > 0:
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0) + 1
    print("Dark tile box:", x0, y0, x1, y1, "width:", x1-x0, "height:", y1-y0)
    
    tile = img.crop((x0-5, y0-5, x1+5, y1+5))
    tile.save(r"c:\Users\asus\OneDrive\Documents\multi-agent-system\multi-agent-system\frontend\public\logo-tile-exact.png")
    
    # Also extract the white star-eye mark inside the black tile
    # Inside the black tile, find pixels that are bright (R>180, G>180, B>180 or purple R~100, G~50, B~200)
    tile_arr = np.array(tile)
    mark_mask = (tile_arr[:, :, 0] > 140) | (tile_arr[:, :, 2] > 140)
    mark_coords = np.argwhere(mark_mask)
    if len(mark_coords) > 0:
        my0, mx0 = mark_coords.min(axis=0)
        my1, mx1 = mark_coords.max(axis=0) + 1
        print("Mark inside tile:", mx0, my0, mx1, my1)
        mark = tile.crop((mx0-4, my0-4, mx1+4, my1+4))
        mark.save(r"c:\Users\asus\OneDrive\Documents\multi-agent-system\multi-agent-system\frontend\public\logo-mark-white.png")
