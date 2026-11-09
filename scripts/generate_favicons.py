import math
from PIL import Image, ImageDraw

def render_icon(size):
    # Render at 4x resolution for supersampled anti-aliasing
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = canvas_size / 2.0, canvas_size / 2.0
    r_outer = canvas_size * 0.44
    
    # 1. Organic wax seal rim
    num_points = 180
    points = []
    for i in range(num_points):
        angle = 2 * math.pi * i / num_points
        w1 = math.sin(angle * 7) * (canvas_size * 0.018)
        w2 = math.cos(angle * 13) * (canvas_size * 0.012)
        w3 = math.sin(angle * 3) * (canvas_size * 0.015)
        r = r_outer + w1 + w2 + w3
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
        
    draw.polygon(points, fill=(184, 35, 28, 255), outline=(142, 23, 18, 255), width=max(1, int(canvas_size * 0.018)))
    
    # 2. Debossed Bezel Rings
    r_ring = canvas_size * 0.31
    draw.ellipse([cx - r_ring, cy - r_ring, cx + r_ring, cy + r_ring], 
                 outline=(142, 23, 18, 180), width=max(1, int(canvas_size * 0.024)))
    draw.arc([cx - r_ring, cy - r_ring + canvas_size * 0.01, cx + r_ring, cy + r_ring + canvas_size * 0.01], 
             start=30, end=150, fill=(239, 106, 82, 120), width=max(1, int(canvas_size * 0.012)))

    # 3. Roman Serif "I" Monogram
    ivory = (246, 231, 210, 255)
    
    # Proportions matching src/app/icon.svg (viewBox 0 0 64 64)
    factor = canvas_size / 64.0
    
    # Path coordinates from src/app/icon.svg:
    # M 22 19.5 H 42 V 22.5 C 38.5 22.5 35.5 24.5 35.5 27.5 V 36.5 C 35.5 39.5 38.5 41.5 42 41.5 V 44.5 H 22 V 41.5 C 25.5 41.5 28.5 39.5 28.5 36.5 V 27.5 C 28.5 24.5 25.5 22.5 22 22.5 Z
    top_y = 19.5 * factor
    bot_y = 44.5 * factor
    serif_h = 3.0 * factor
    serif_w = 20.0 * factor
    stem_w = 7.0 * factor
    
    # Top slab
    draw.rectangle([cx - serif_w / 2, top_y, cx + serif_w / 2, top_y + serif_h], fill=ivory)
    # Bottom slab
    draw.rectangle([cx - serif_w / 2, bot_y - serif_h, cx + serif_w / 2, bot_y], fill=ivory)
    # Stem
    draw.rectangle([cx - stem_w / 2, top_y + serif_h, cx + stem_w / 2, bot_y - serif_h], fill=ivory)
    
    # Curved brackets
    # Top-left bracket
    draw.polygon([(cx - stem_w / 2, top_y + serif_h + 4.5 * factor), 
                  (cx - stem_w / 2, top_y + serif_h), 
                  (cx - serif_w / 2 + 3.0 * factor, top_y + serif_h)], fill=ivory)
    # Top-right bracket
    draw.polygon([(cx + stem_w / 2, top_y + serif_h + 4.5 * factor), 
                  (cx + stem_w / 2, top_y + serif_h), 
                  (cx + serif_w / 2 - 3.0 * factor, top_y + serif_h)], fill=ivory)
    # Bottom-left bracket
    draw.polygon([(cx - stem_w / 2, bot_y - serif_h - 4.5 * factor), 
                  (cx - stem_w / 2, bot_y - serif_h), 
                  (cx - serif_w / 2 + 3.0 * factor, bot_y - serif_h)], fill=ivory)
    # Bottom-right bracket
    draw.polygon([(cx + stem_w / 2, bot_y - serif_h - 4.5 * factor), 
                  (cx + stem_w / 2, bot_y - serif_h), 
                  (cx + serif_w / 2 - 3.0 * factor, bot_y - serif_h)], fill=ivory)
    
    # Resize down to target size with Lanczos resampling
    return img.resize((size, size), Image.Resampling.LANCZOS)

def main():
    sizes = [16, 32, 48, 64, 128, 256]
    icon_images = [render_icon(s) for s in sizes]
    
    # Save multi-size favicon.ico into public/
    icon_images[0].save('public/favicon.ico', format='ICO', sizes=[(s, s) for s in sizes], append_images=icon_images[1:])
    
    # Save high-res PNG icons for mobile & modern browsers
    icon_images[4].save('public/icon-128.png')
    render_icon(192).save('public/icon-192.png')
    render_icon(512).save('public/icon-512.png')
    render_icon(180).save('public/apple-icon.png')
    
    print("Multi-resolution icons generated successfully!")

if __name__ == '__main__':
    main()
