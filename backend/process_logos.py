from PIL import Image, ImageOps
import numpy as np
import os

img_icon_path = r"C:\Users\asus\.gemini\antigravity\brain\dcb2ed9c-ce01-4983-bf04-e2609b3e6540\.user_uploaded\media_1788893396219.png"
img_horiz_path = r"C:\Users\asus\.gemini\antigravity\brain\dcb2ed9c-ce01-4983-bf04-e2609b3e6540\.user_uploaded\media_1788893396220.png"
img_stacked_path = r"C:\Users\asus\.gemini\antigravity\brain\dcb2ed9c-ce01-4983-bf04-e2609b3e6540\.user_uploaded\media_1788893396217.png"

out_dir = r"c:\Users\asus\OneDrive\Documents\multi-agent-system\multi-agent-system\frontend\public"
os.makedirs(out_dir, exist_ok=True)

# 1. Process App Icon (media_1788893396219.png)
img1 = Image.open(img_icon_path).convert("RGBA")
# Find bounding box of non-white pixels
bg = Image.new("RGBA", img1.size, (255, 255, 255, 255))
diff = ImageOps.invert(ImageOps.grayscale(img1))
# Find bbox of the dark rounded icon
data = np.array(img1)
# Non-white pixels (where R, G, B are not all > 240)
mask = ~((data[:, :, 0] > 245) & (data[:, :, 1] > 245) & (data[:, :, 2] > 245))
coords = np.argwhere(mask)
y0, x0 = coords.min(axis=0)
y1, x1 = coords.max(axis=0) + 1

cropped_icon = img1.crop((x0, y0, x1, y1))
cropped_icon.save(os.path.join(out_dir, "logo-app-icon.png"))
cropped_icon.save(os.path.join(out_dir, "favicon.png"))
cropped_icon.save(os.path.join(out_dir, "favicon.ico"))
print("Saved logo-app-icon.png with size:", cropped_icon.size)

# 2. Extract Horizontal Logo with Transparent Background (media_1788893396220.png)
img2 = Image.open(img_horiz_path).convert("RGBA")
data2 = np.array(img2)
mask2 = ~((data2[:, :, 0] > 245) & (data2[:, :, 1] > 245) & (data2[:, :, 2] > 245))
coords2 = np.argwhere(mask2)
y0_2, x0_2 = coords2.min(axis=0)
y1_2, x1_2 = coords2.max(axis=0) + 1

cropped_horiz = img2.crop((x0_2, y0_2, x1_2, y1_2))
# Convert white background to transparent
data_h = np.array(cropped_horiz)
# Any pixel where R,G,B > 240 should be transparent alpha=0
white_mask = (data_h[:, :, 0] > 240) & (data_h[:, :, 1] > 240) & (data_h[:, :, 2] > 240)
data_h[white_mask, 3] = 0
transparent_horiz = Image.fromarray(data_h)
transparent_horiz.save(os.path.join(out_dir, "logo-horizontal-darktext.png"))

# Create version for dark mode (where black text is turned white)
data_dark = np.array(transparent_horiz)
# Where alpha > 0 and color is dark/black (R<50, G<50, B<50), turn into white/light gray (#FFFFFF)
black_text_mask = (data_dark[:, :, 3] > 0) & (data_dark[:, :, 0] < 50) & (data_dark[:, :, 1] < 50) & (data_dark[:, :, 2] < 50)
data_dark[black_text_mask, 0] = 255
data_dark[black_text_mask, 1] = 255
data_dark[black_text_mask, 2] = 255
dark_mode_horiz = Image.fromarray(data_dark)
dark_mode_horiz.save(os.path.join(out_dir, "logo-horizontal.png"))
dark_mode_horiz.save(os.path.join(out_dir, "logo-horizontal-white.png"))

# 3. Extract Just the Star-Eye 'A' Mark (Symbol Only)
# From the horizontal logo, the mark is on the left side
mark_width = int(cropped_horiz.height * 1.1)
mark_crop = dark_mode_horiz.crop((0, 0, mark_width, dark_mode_horiz.height))
# Crop to content
data_m = np.array(mark_crop)
mask_m = data_m[:, :, 3] > 10
coords_m = np.argwhere(mask_m)
if len(coords_m) > 0:
    my0, mx0 = coords_m.min(axis=0)
    my1, mx1 = coords_m.max(axis=0) + 1
    clean_mark = mark_crop.crop((mx0, my0, mx1, my1))
    clean_mark.save(os.path.join(out_dir, "logo-mark.png"))
    print("Saved logo-mark.png with size:", clean_mark.size)

print("All logo assets successfully extracted with clean transparency and saved to public directory!")
