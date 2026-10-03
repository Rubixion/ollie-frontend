# Human-parsing labels for the stylist's dressed photos, so scripts/style-layers.mjs can drop skin and hair that
# Gemini's cut-out sometimes keeps (the white base model's neck showed as pale patches on darker looks).
# Writes .style-cache/<body>/<name>-labels.png (8-bit label ids, see LABELS) next to each <name>-dressed.jpg.
# Runs on CPU, a few seconds per photo, free. Usage (from ollie-frontend): python scripts/style-parse.py [dressed.jpg ...]
# Needs: pip install torch "transformers<5" pillow. Model: mattmdjaga/segformer_b2_clothes (ATR labels, MIT).
import glob, os, sys, torch, numpy as np
from PIL import Image
from transformers import SegformerImageProcessor, AutoModelForSemanticSegmentation

# 0 Background 1 Hat 2 Hair 3 Sunglasses 4 Upper-clothes 5 Skirt 6 Pants 7 Dress 8 Belt 9/10 Shoes
# 11 Face (includes the neck) 12/13 Legs 14/15 Arms 16 Bag 17 Scarf
def load(cls):  # cached copy first: a hub check on every start failed intermittently mid-batch
    try: return cls.from_pretrained("mattmdjaga/segformer_b2_clothes", local_files_only=True)
    except OSError: return cls.from_pretrained("mattmdjaga/segformer_b2_clothes")
proc, model = load(SegformerImageProcessor), load(AutoModelForSemanticSegmentation).eval()
for path in sys.argv[1:] or sorted(glob.glob(".style-cache/*/*-dressed.jpg")):
    out = path.replace("-dressed.jpg", "-labels.png")
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(path):
        continue
    img = Image.open(path).convert("RGB")
    with torch.no_grad():
        logits = model(**proc(images=img, return_tensors="pt")).logits
    lab = torch.nn.functional.interpolate(logits, size=img.size[::-1], mode="bilinear").argmax(1)[0]
    Image.fromarray(lab.numpy().astype(np.uint8)).save(out)
    print(out)
