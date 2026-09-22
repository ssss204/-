import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.sparse import eye as speye
from scipy.sparse.linalg import spsolve
import scipy.sparse as sp

SRC = r'E:\博客\jack-3d-portfolio\public\images\portrait\portrait.png'
OUT = r'E:\博客\jack-3d-portfolio\public\images\portrait'

base = Image.open(SRC).convert('RGBA')
arr = np.array(base).astype(np.float64)
H, W = arr.shape[:2]

R = 58
MAX_X = 16
eyes = [
    {'iris': (466, 777), 'slit': (425, 794, 100, 32), 'topCut': -15, 'name': 'right'},
    {'iris': (801, 773), 'slit': (800, 792, 100, 32), 'topCut': -13, 'name': 'left'},
]

# ---------- 1. 构建修复 mask（圆盘 ∩ 眼裂 ∩ 上沿裁切） ----------
mask = np.zeros((H, W), dtype=bool)
yy, xx = np.mgrid[0:H, 0:W]
for e in eyes:
    ix, iy = e['iris']
    cx, cy, rx, ry = e['slit']
    in_disc = (xx - ix) ** 2 + (yy - iy) ** 2 <= (R - 1) ** 2
    in_slit = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1
    above_cut = (yy - iy) > e['topCut']
    mask |= in_disc & in_slit & above_cut

# ---------- 2. 调和扩散 inpaint（逐通道解 Laplace 方程） ----------
def harmonic_inpaint(img, m):
    out = img.copy()
    ys, xs = np.nonzero(m)
    idx = -np.ones(m.shape, dtype=np.int64)
    idx[ys, xs] = np.arange(len(ys))
    N = len(ys)
    rows = np.arange(N)
    A = speye(N, format='lil') * 4.0
    b = np.zeros((N, 3))
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = ys + dy, xs + dx
        valid = (ny >= 0) & (ny < H) & (nx >= 0) & (nx < W)
        nm = np.where(valid, idx[ny.clip(0, H - 1), nx.clip(0, W - 1)], -1)
        is_unknown = nm >= 0
        A[rows[is_unknown], nm[is_unknown]] = -1.0
        known_color = np.zeros((N, 3))
        ok = valid & ~is_unknown
        ky, kx = ny[ok], nx[ok]
        known_color[ok] = img[ky, kx, :3] / 255.0
        b += known_color
    A = A.tocsr()
    for c in range(3):
        sol = spsolve(A, b[:, c])
        out[ys, xs, c] = np.clip(sol, 0, 1) * 255
    return out

inpainted = harmonic_inpaint(arr, mask)

# 羽化合成，避免修复边界接缝
feather = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
fa = np.array(feather).astype(np.float64) / 255
fa = fa[..., None]
final_rgb = inpainted[..., :3] * fa + arr[..., :3] * (1 - fa)
eyeball = arr.copy()
eyeball[..., :3] = final_rgb
Image.fromarray(eyeball.astype(np.uint8), 'RGBA').save(OUT + r'\eyeball-base.png')

# ---------- 3. 虹膜精灵 ----------
PAD = 4
SIZE = 2 * R + 8
for e in eyes:
    ix, iy = e['iris']
    spr = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    spr.paste(base.crop((ix - R, iy - R, ix + R, iy + R)), (PAD, PAD))
    m = np.zeros((SIZE, SIZE), dtype=np.float64)
    sy, sx = np.mgrid[0:SIZE, 0:SIZE]
    dx = sx - (PAD + R); dy = sy - (PAD + R)
    rho = np.sqrt(dx * dx + dy * dy)
    circ = np.clip((R - 0.5 - rho) / 1.2, 0, 1)
    top = np.clip((dy - e['topCut']) / 5, 0, 1)
    m = circ * top
    spr.putalpha(Image.fromarray((m * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(0.5)))
    spr.save(OUT + rf"\iris-{e['name']}.png")

# ---------- 4. 眼镜顶层（眼裂之外的原始像素 + 眼裂内镜片星光） ----------
outside = Image.new('L', (W, H), 255)
d = ImageDraw.Draw(outside)
for e in eyes:
    cx, cy, rx, ry = e['slit']
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=0)
top_alpha = np.array(outside.filter(ImageFilter.GaussianBlur(1.2))).astype(np.float64)

mxv = arr[..., :3].max(axis=2)
mnv = arr[..., :3].min(axis=2)
sat = np.where(mxv > 0, (mxv - mnv) / np.maximum(mxv, 1), 0)
spark = (mxv > 222) & (sat < 0.17)
for e in eyes:
    ix, iy = e['iris']
    cx, cy, rx, ry = e['slit']
    in_slit = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1
    beyond = (xx - ix) ** 2 + (yy - iy) ** 2 >= (R + MAX_X + 4) ** 2
    top_alpha[np.where(in_slit & beyond & spark)] = 255

top_layer = arr.copy()
# 眼裂外原始像素盖顶，但必须保留原头像 alpha（头轮廓外原本透明区域不能变成白块）
top_layer[..., 3] = np.minimum(top_alpha, arr[..., 3])
Image.fromarray(top_layer.astype(np.uint8), 'RGBA').save(OUT + r'\glasses-top.png')

# ---------- 5. 预览（模拟运行时合成） ----------
eyeball_img = Image.fromarray(eyeball.astype(np.uint8), 'RGBA')
top_img = Image.fromarray(top_layer.astype(np.uint8), 'RGBA')
sprites = {e['name']: Image.open(OUT + rf"\iris-{e['name']}.png") for e in eyes}

def render(ox, oy, tag):
    frame = eyeball_img.copy()
    for e in eyes:
        ix, iy = e['iris']
        cx, cy, rx, ry = e['slit']
        nix, niy = ix + ox, iy + oy
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        layer.paste(sprites[e['name']], (int(nix) - R - PAD, int(niy) - R - PAD), sprites[e['name']])
        clip = Image.new('L', (W, H), 0)
        ImageDraw.Draw(clip).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
        masked = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        masked.paste(layer, (0, 0), clip)
        frame = Image.alpha_composite(frame, masked)
    frame = Image.alpha_composite(frame, top_img)
    bg = Image.new('RGBA', (W, H), (12, 12, 12, 255))
    bg.alpha_composite(frame)
    bg.crop((240, 700, 1040, 940)).resize((1000, 300)).save(
        rf'E:\博客\jack-3d-portfolio\gaze-{tag}.png')

render(0, 0, 'center')
render(16, 2, 'right')
render(-16, -2, 'left')
render(2, 7, 'down')
render(-2, -7, 'up')
print('done')
