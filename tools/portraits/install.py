#!/usr/bin/env python3
"""Install AI-generated commander portraits.

Usage: python3 tools/portraits/install.py <folder-with-images>

Looks for files named <civ>_<1-6>.(png|jpg|jpeg|webp), centre-crops them square,
resizes to 384x384 and writes assets/portraits/<civ>_<n>.jpg. Missing ones are left as they are,
so you can replace a few at a time. Needs: pip install pillow
"""
import os, sys
from PIL import Image

CIVS = ['sikaman', 'niani', 'fjordlands', 'aurelia', 'serene']
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'portraits')
src = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
done = 0
for civ in CIVS:
    for i in range(1, 7):
        name = f'{civ}_{i}'
        for ext in ('png', 'jpg', 'jpeg', 'webp'):
            f = os.path.join(src, f'{name}.{ext}')
            if os.path.exists(f):
                im = Image.open(f).convert('RGB'); s = min(im.size)
                im = im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width + s) // 2, (im.height + s) // 2)).resize((384, 384), Image.LANCZOS)
                im.save(os.path.join(root, f'{name}.jpg'), quality=88); done += 1; print('installed', name); break
print(f'{done} portrait(s) installed. Now run the app again (npx expo start -c).')
