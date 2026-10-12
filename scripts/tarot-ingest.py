# usage: python3 scripts/tarot-ingest.py src.png name  -> resizes to 640x960, erases AI seal, stamps real seal
import sys
from PIL import Image, ImageFilter, ImageDraw
src,name=sys.argv[1],sys.argv[2]
seal=Image.open('public/tarot/seal.png').convert('RGBA').resize((70,70),Image.LANCZOS)
im=Image.open(src).convert('RGB'); im.thumbnail((640,960))
W,H=136,124; x0,y0=494,756
mask=Image.new('L',(W,H),0); ImageDraw.Draw(mask).rounded_rectangle((10,10,W-10,H-10),8,fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(7))
samp=im.crop((616,600,634,880)).resize((W,H),Image.BILINEAR).filter(ImageFilter.GaussianBlur(4))
im.paste(samp,(x0,y0),mask)
im=im.convert('RGBA'); im.alpha_composite(seal,(542,790))
im.convert('RGB').save(f'public/tarot/{name}.jpg',quality=90)
