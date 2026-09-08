from PIL import Image
import numpy as np
import os

out_dir = r"c:\Users\asus\OneDrive\Documents\multi-agent-system\multi-agent-system\frontend\public"

def tight_crop(img_path, save_path):
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img)
    # Find bounding box where alpha > 15
    alpha_mask = arr[:, :, 3] > 15
    coords = np.argwhere(alpha_mask)
    if len(coords) > 0:
        y0, x0 = coords.min(axis=0)
        y1, x1 = coords.max(axis=0) + 1
        cropped = img.crop((x0, y0, x1, y1))
        cropped.save(save_path)
        print(f"Tight cropped {os.path.basename(img_path)} from {img.size} to {cropped.size}")

tight_crop(os.path.join(out_dir, "logo-horizontal.png"), os.path.join(out_dir, "logo-horizontal.png"))
tight_crop(os.path.join(out_dir, "logo-horizontal-white.png"), os.path.join(out_dir, "logo-horizontal-white.png"))
tight_crop(os.path.join(out_dir, "logo-horizontal-blacktext.png"), os.path.join(out_dir, "logo-horizontal-blacktext.png"))
tight_crop(os.path.join(out_dir, "logo-stacked.png"), os.path.join(out_dir, "logo-stacked.png"))
tight_crop(os.path.join(out_dir, "logo-mark.png"), os.path.join(out_dir, "logo-mark.png"))
tight_crop(os.path.join(out_dir, "logo-app-icon.png"), os.path.join(out_dir, "logo-app-icon.png"))
tight_crop(os.path.join(out_dir, "favicon.png"), os.path.join(out_dir, "favicon.png"))
