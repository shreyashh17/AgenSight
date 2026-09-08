from PIL import Image, ImageOps
import numpy as np
import os

out_dir = r"c:\Users\asus\OneDrive\Documents\multi-agent-system\multi-agent-system\frontend\public"

# 1. Open the app icon image media_1788893396219.png
img_icon = Image.open(r"C:\Users\asus\.gemini\antigravity\brain\dcb2ed9c-ce01-4983-bf04-e2609b3e6540\.user_uploaded\media_1788893396219.png").convert("RGBA")
arr_icon = np.array(img_icon)

# The squircle icon is the dark rounded rectangle around x: 190 to 410, y: 50 to 280
# Find exact bounds of the black squircle
# Check each pixel in bounding region where color is dark (<100) or non-white (<245)
squircle_region = arr_icon[40:290, 180:420]
mask_squircle = ~((squircle_region[:, :, 0] > 240) & (squircle_region[:, :, 1] > 240) & (squircle_region[:, :, 2] > 240))
coords_s = np.argwhere(mask_squircle)
sy0, sx0 = coords_s.min(axis=0)
sy1, sx1 = coords_s.max(axis=0) + 1

exact_squircle = img_icon.crop((180 + sx0, 40 + sy0, 180 + sx1, 40 + sy1))
# Make white corners around rounded edges transparent
s_data = np.array(exact_squircle)
white_corners = (s_data[:, :, 0] > 240) & (s_data[:, :, 1] > 240) & (s_data[:, :, 2] > 240)
s_data[white_corners, 3] = 0
clean_app_icon = Image.fromarray(s_data)
clean_app_icon.save(os.path.join(out_dir, "logo-app-icon.png"))
clean_app_icon.save(os.path.join(out_dir, "favicon.png"))
clean_app_icon.save(os.path.join(out_dir, "favicon.ico"))
print("Saved clean_app_icon.png with size:", clean_app_icon.size)

# 2. Extract the Star-Eye 'A' Mark (Symbol) alone with transparent background
# It is located in the upper part of the squircle (above the 'AgentSight' text)
# Inside the clean squircle:
mark_region = s_data[15:150, 20:200]
mark_mask = (mark_region[:, :, 3] > 0) & ((mark_region[:, :, 0] > 100) | (mark_region[:, :, 2] > 100))
coords_m = np.argwhere(mark_mask)
my0, mx0 = coords_m.min(axis=0)
my1, mx1 = coords_m.max(axis=0) + 1

exact_mark = Image.fromarray(mark_region).crop((mx0, my0, mx1, my1))
# Make black background pixels in mark transparent
m_data = np.array(exact_mark)
black_bg = (m_data[:, :, 0] < 45) & (m_data[:, :, 1] < 45) & (m_data[:, :, 2] < 45)
m_data[black_bg, 3] = 0
clean_mark_white = Image.fromarray(m_data)
clean_mark_white.save(os.path.join(out_dir, "logo-mark-white.png"))
clean_mark_white.save(os.path.join(out_dir, "logo-mark.png"))
print("Saved logo-mark-white.png with size:", clean_mark_white.size)

# 3. Extract the Horizontal Logo from media_1788893396220.png
img_horiz = Image.open(r"C:\Users\asus\.gemini\antigravity\brain\dcb2ed9c-ce01-4983-bf04-e2609b3e6540\.user_uploaded\media_1788893396220.png").convert("RGBA")
arr_h = np.array(img_horiz)
# Find bounding box of logo
non_white_h = ~((arr_h[:, :, 0] > 240) & (arr_h[:, :, 1] > 240) & (arr_h[:, :, 2] > 240))
coords_h = np.argwhere(non_white_h)
hy0, hx0 = coords_h.min(axis=0)
hy1, hx1 = coords_h.max(axis=0) + 1

cropped_h = img_horiz.crop((hx0, hy0, hx1, hy1))
# Convert white background to transparent
h_data = np.array(cropped_h)
white_bg = (h_data[:, :, 0] > 235) & (h_data[:, :, 1] > 235) & (h_data[:, :, 2] > 235)
h_data[white_bg, 3] = 0
trans_h = Image.fromarray(h_data)
trans_h.save(os.path.join(out_dir, "logo-horizontal-blacktext.png"))

# Create dark mode version (black letters converted to crisp white #FFFFFF while preserving the purple eye)
h_dark = np.array(trans_h)
# Where alpha > 0 and color is black/near black (R<60, G<60, B<60), turn into white
black_letters = (h_dark[:, :, 3] > 0) & (h_dark[:, :, 0] < 60) & (h_dark[:, :, 1] < 60) & (h_dark[:, :, 2] < 60)
h_dark[black_letters, 0] = 255
h_dark[black_letters, 1] = 255
h_dark[black_letters, 2] = 255
clean_horiz_white = Image.fromarray(h_dark)
clean_horiz_white.save(os.path.join(out_dir, "logo-horizontal-white.png"))
clean_horiz_white.save(os.path.join(out_dir, "logo-horizontal.png"))
print("Saved logo-horizontal-white.png with size:", clean_horiz_white.size)

# 4. Extract Stacked Logo from media_1788893396217.png
img_stacked = Image.open(r"C:\Users\asus\.gemini\antigravity\brain\dcb2ed9c-ce01-4983-bf04-e2609b3e6540\.user_uploaded\media_1788893396217.png").convert("RGBA")
arr_st = np.array(img_stacked)
non_white_st = ~((arr_st[:, :, 0] > 240) & (arr_st[:, :, 1] > 240) & (arr_st[:, :, 2] > 240))
coords_st = np.argwhere(non_white_st)
sty0, stx0 = coords_st.min(axis=0)
sty1, stx1 = coords_st.max(axis=0) + 1

cropped_st = img_stacked.crop((stx0, sty0, stx1, sty1))
st_data = np.array(cropped_st)
white_bg_st = (st_data[:, :, 0] > 235) & (st_data[:, :, 1] > 235) & (st_data[:, :, 2] > 235)
st_data[white_bg_st, 3] = 0
clean_stacked = Image.fromarray(st_data)

# Dark version
st_dark = np.array(clean_stacked)
black_st = (st_dark[:, :, 3] > 0) & (st_dark[:, :, 0] < 60) & (st_dark[:, :, 1] < 60) & (st_dark[:, :, 2] < 60)
st_dark[black_st, 0] = 255
st_dark[black_st, 1] = 255
st_dark[black_st, 2] = 255
clean_stacked_white = Image.fromarray(st_dark)
clean_stacked_white.save(os.path.join(out_dir, "logo-stacked.png"))
clean_stacked_white.save(os.path.join(out_dir, "logo-stacked-white.png"))
print("Saved logo-stacked-white.png with size:", clean_stacked_white.size)

print("All AgentSight official logos extracted with perfect bounds and transparency!")
