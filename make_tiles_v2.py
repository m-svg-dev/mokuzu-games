# -*- coding: utf-8 -*-
"""
ポケモンFRLG風タイルセット生成スクリプト（tiles_v2）
- 村タイル（tile_*）＋ 7エリアのテーマ別タイル（{area}_*）を生成
- 18x18の論理ピクセルで描いて2倍拡大 → 36x36（ゲームの TILE=36 に一致）
- mokumon.css のエリア別タイルCSSブロックも自動で書き換える
出力:
  data/mokumon/tiles_v2/*.png(+webp)
  tiles_v2_sheet.png（村タイル一覧） tiles_v2_village.png（村合成） tiles_v2_areas.png（7エリア合成）
"""
from PIL import Image, ImageDraw
import os

S = 18          # 論理ピクセル
SCALE = 2       # 出力倍率（36px）
TILESET_VER = '2'  # タイル画像のキャッシュバスター（絵柄を変えたら上げる）
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'data', 'mokumon', 'tiles_v2')
os.makedirs(OUT, exist_ok=True)

# ---- 村パレット（RSE風・HQ版） ----
GRASS      = (168, 216, 152)   # ミントグリーン
GRASS_ALT  = (136, 192, 124)   # ディザの点
GRASS_DOT  = (112, 168, 104)   # ディザの濃い点
TGRASS_D   = (56, 128, 56)
TGRASS_M   = (84, 160, 72)
SAND       = (232, 212, 156)
SAND_TEX   = (214, 192, 132)
SAND_EDGE  = (196, 168, 108)
SAND_LINE  = (140, 112, 68)
WATER      = (72, 132, 228)
WATER_LT   = (132, 180, 248)
WATER_HL   = (196, 224, 255)
WATER_DK   = (36, 72, 156)
TREE_OUT   = (24, 72, 40)
TREE_DK    = (48, 112, 56)
TREE_MD    = (80, 152, 80)
TREE_LT    = (120, 196, 104)
TREE_HL    = (160, 224, 136)
TRUNK      = (124, 84, 52)
TRUNK_DK   = (88, 56, 36)
ROOF_R     = (220, 96, 68)
ROOF_R_DK  = (168, 60, 48)
ROOF_R_LT  = (244, 140, 100)
ROOF_OUT   = (104, 36, 32)
ROOF_B     = (130, 144, 168)
ROOF_B_DK  = (94, 106, 130)
ROOF_B_LT  = (170, 184, 206)
ROOF_B_OUT = (56, 64, 84)
WALL_C     = (228, 222, 204)
WALL_SH    = (196, 188, 168)
WALL_OUT   = (120, 110, 96)
WIN_FRAME  = (250, 250, 246)
WIN_GLASS  = (104, 152, 208)
WIN_GLASS2 = (160, 196, 236)
WOOD       = (188, 140, 84)
WOOD_DK    = (140, 98, 56)
WOOD_OUT   = (92, 60, 36)

def new(base=GRASS):
    im = Image.new('RGB', (S, S), base)
    return im, ImageDraw.Draw(im)

def save(im, name):
    big = im.resize((im.width * SCALE, im.height * SCALE), Image.NEAREST)
    big.save(os.path.join(OUT, f'{name}.png'))
    big.save(os.path.join(OUT, f'{name}.webp'), lossless=True)
    return im

# ================= 共通描画部品 =================
def texture_dots(d, col, pts=((2,3),(9,2),(14,5),(5,8),(12,10),(3,13),(10,15),(16,13))):
    for (x, y) in pts:
        d.point([(x, y), (x + 1, y), (x, y + 1)], fill=col)

def ground_tile(base, tex, style='dots'):
    """エリアの床タイル"""
    im, d = new(base)
    if style == 'dots':
        texture_dots(d, tex)
    elif style == 'grasscheck':  # 草地（RSE風：3点クラスタのディザ）
        dk = tuple(int(c * 0.86) for c in tex)
        for (x, y) in [(2,2),(10,4),(5,8),(13,10),(3,14),(11,15),(15,2),(8,12)]:
            d.point([(x, y), (x+1, y), (x, y+1)], fill=tex)
            d.point([(x+1, y+1)], fill=dk)
    elif style == 'panel':       # コンクリパネル（継ぎ目）
        texture_dots(d, tex, ((4,4),(13,7),(7,12),(15,15)))
        d.line([(0,8),(S-1,8)], fill=tex)
        d.line([(8,0),(8,8)], fill=tex)
        d.line([(13,9),(13,S-1)], fill=tex)
    elif style == 'tile':        # 歩道タイル（グリッド）
        for v in (5, 11):
            d.line([(0,v),(S-1,v)], fill=tex)
            d.line([(v,0),(v,S-1)], fill=tex)
        d.line([(0,17),(17,17)], fill=tex); d.line([(17,0),(17,17)], fill=tex)
    elif style == 'cracks':      # 焦土のひび
        texture_dots(d, tex, ((3,3),(14,4),(8,9),(4,14)))
        d.line([(2,6),(6,8),(7,12)], fill=tex)
        d.line([(11,2),(13,6)], fill=tex)
        d.line([(10,13),(14,15),(16,12)], fill=tex)
    return im

def edged_tile(base_im, sides, line, soft, ground):
    """床/水の縁取り（草・壁と接する辺）"""
    im = base_im.copy()
    d = ImageDraw.Draw(im)
    E = S - 1
    if 'top' in sides:
        d.line([(0,0),(E,0)], fill=line); d.line([(0,1),(E,1)], fill=soft)
    if 'bottom' in sides:
        d.line([(0,E),(E,E)], fill=line); d.line([(0,E-1),(E,E-1)], fill=soft)
    if 'left' in sides:
        d.line([(0,0),(0,E)], fill=line); d.line([(1,0),(1,E)], fill=soft)
    if 'right' in sides:
        d.line([(E,0),(E,E)], fill=line); d.line([(E-1,0),(E-1,E)], fill=soft)
    if 'top' in sides and 'left' in sides:
        d.point([(0,0)], fill=ground); d.point([(1,1)], fill=line)
    if 'top' in sides and 'right' in sides:
        d.point([(E,0)], fill=ground); d.point([(E-1,1)], fill=line)
    if 'bottom' in sides and 'left' in sides:
        d.point([(0,E)], fill=ground); d.point([(1,E-1)], fill=line)
    if 'bottom' in sides and 'right' in sides:
        d.point([(E,E)], fill=ground); d.point([(E-1,E-1)], fill=line)
    return im

def tufts_tile(base_im, col_m, col_d, sparks=None):
    """エンカウント草むら（ギザギザの茂み）"""
    im = base_im.copy()
    d = ImageDraw.Draw(im)
    def tuft(cx, cy, col):
        d.polygon([(cx-3,cy),(cx-1,cy-5),(cx-1,cy)], fill=col)
        d.polygon([(cx-1,cy),(cx+1,cy-7),(cx+3,cy)], fill=col)
        d.polygon([(cx+2,cy),(cx+4,cy-5),(cx+5,cy)], fill=col)
    for cx, cy in [(4,9),(12,9)]: tuft(cx, cy, col_m)
    for cx, cy in [(4,16),(12,16),(8,13)]: tuft(cx, cy, col_d)
    if sparks:
        d.point([(3,4),(13,3),(8,7),(15,10)], fill=sparks)
    return im

def water_tile(pal, sides=()):
    base, lt, hl, dk = pal
    im, d = new(base)
    for (x, y, w) in [(2,4,5),(10,7,5),(4,11,4),(11,14,5)]:
        d.line([(x,y),(x+w,y)], fill=lt)
        d.point([(x+1,y+1)], fill=lt)
    d.point([(4,3),(12,8)], fill=hl)   # きらめき
    E = S - 1
    if 'top' in sides:
        d.line([(0,0),(E,0)], fill=dk); d.line([(0,1),(E,1)], fill=hl); d.line([(0,2),(E,2)], fill=lt)
    if 'bottom' in sides:
        d.line([(0,E),(E,E)], fill=dk); d.line([(0,E-1),(E,E-1)], fill=mix(base, dk))
    if 'left' in sides:
        d.line([(0,0),(0,E)], fill=dk); d.line([(1,0),(1,E)], fill=mix(base, lt))
    if 'right' in sides:
        d.line([(E,0),(E,E)], fill=dk); d.line([(E-1,0),(E-1,E)], fill=mix(base, dk))
    for a, b in [(('top','left'),(0,0)), (('top','right'),(E,0)), (('bottom','left'),(0,E)), (('bottom','right'),(E,E))]:
        if a[0] in sides and a[1] in sides:
            d.point([b], fill=dk)
    return im

def mix(c1, c2):
    return tuple((a + b) // 2 for a, b in zip(c1, c2))

# ================= 村タイル =================
def make_grass():
    return ground_tile(GRASS, GRASS_ALT, 'grasscheck')

def make_tallgrass():
    return tufts_tile(make_grass(), TGRASS_M, TGRASS_D)

def make_road(sides=()):
    base = ground_tile(SAND, SAND_TEX, 'dots')
    return edged_tile(base, sides, SAND_LINE, SAND_EDGE, GRASS)

def make_water_v(sides=()):
    return water_tile((WATER, WATER_LT, WATER_HL, WATER_DK), sides)

def tree_on(base_im, out=TREE_OUT, dk=TREE_DK, md=TREE_MD, lt=TREE_LT, hl=TREE_HL):
    """HQ版の木：輪郭＋4段陰影＋スカラップ（左右はタイル端まで広げて隣と馴染む）"""
    im = base_im.copy()
    d = ImageDraw.Draw(im)
    # 幹
    d.rectangle([7, 13, 10, 17], fill=TRUNK, outline=TRUNK_DK)
    d.line([(8, 14), (8, 16)], fill=(168, 124, 84))
    d.line([(5, 17), (12, 17)], fill=GRASS_DOT)        # 根元の影
    # 樹冠：縦長の楕円＋輪郭
    d.ellipse([0, 1, 17, 14], fill=dk, outline=out)
    d.ellipse([2, 0, 15, 9], fill=md, outline=out)
    # 左上からの光
    d.ellipse([4, 1, 11, 6], fill=lt)
    d.ellipse([5, 2, 8, 4], fill=hl)
    # スカラップ（もこもこの縁）
    for (x, y) in [(2, 10), (5, 12), (9, 13), (13, 11), (15, 8)]:
        d.ellipse([x-1, y-1, x+1, y+1], fill=md)
    for (x, y) in [(4, 7), (12, 4), (10, 7), (14, 6)]:
        d.point([(x, y)], fill=lt)
    # 葉の谷間（影）
    d.point([(3, 12), (7, 11), (11, 12), (14, 10), (8, 9)], fill=out)
    return im

def canopy_fill(out=TREE_OUT, dk=TREE_DK, md=TREE_MD, lt=TREE_LT):
    """密集した木の内側用：樹冠だけで埋めるタイル（幹なし）"""
    im, d = new(dk)
    # うろこ状の葉のかたまり
    for (cx, cy, r, col) in [(3,2,4,md),(12,1,5,md),(7,6,4,lt),(15,7,4,md),
                             (1,9,4,md),(9,11,5,md),(16,13,4,lt),(4,14,4,md),(12,16,4,md)]:
        d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=col)
    d.point([(5,3),(13,4),(8,8),(2,11),(11,13),(6,16)], fill=lt)
    d.point([(9,2),(4,7),(14,10),(8,14),(15,16),(1,5)], fill=out)
    return im

def make_flower():
    """HQ版：茎と葉のある花（ピンク＋白）"""
    im = make_grass().copy()
    d = ImageDraw.Draw(im)
    def bloom(cx, cy, petal, petal_d):
        d.line([(cx, cy+2), (cx, cy+5)], fill=(72, 136, 64))       # 茎
        d.point([(cx-1, cy+4), (cx-2, cy+4)], fill=(96, 176, 88))  # 葉
        d.point([(cx+1, cy+5)], fill=(96, 176, 88))
        d.ellipse([cx-2, cy-2, cx+2, cy+2], fill=petal, outline=petal_d)
        d.point([(cx, cy)], fill=(252, 228, 96))                   # 花芯
        d.point([(cx-1, cy-1)], fill=(255, 255, 255))              # ハイライト
    bloom(5, 4, (248, 160, 192), (200, 96, 140))
    bloom(12, 10, (250, 250, 250), (176, 176, 188))
    return im

def make_sign():
    im = make_grass().copy()
    d = ImageDraw.Draw(im)
    d.rectangle([8,10,9,15], fill=WOOD_DK, outline=WOOD_OUT)
    d.rectangle([3,3,14,9], fill=WOOD, outline=WOOD_OUT)
    d.line([(4,4),(13,4)], fill=(224,184,128))
    d.line([(5,6),(12,6)], fill=WOOD_OUT)
    d.line([(5,8),(10,8)], fill=WOOD_OUT)
    return im

def make_fence():
    """HQ版：白いピケットフェンス（RSE風）"""
    im = make_grass().copy()
    d = ImageDraw.Draw(im)
    F_W, F_S, F_O = (244, 244, 244), (192, 196, 204), (104, 108, 120)
    for x0 in (2, 11):
        d.rectangle([x0, 4, x0+3, 14], fill=F_W, outline=F_O)               # 支柱
        d.polygon([(x0, 4), (x0+1, 2), (x0+2, 2), (x0+3, 4)], fill=F_W, outline=F_O)  # とがり頭
        d.line([(x0+3, 5), (x0+3, 13)], fill=F_S)                           # 右面の影
    d.rectangle([0, 7, 17, 9], fill=F_W, outline=F_O)                       # 横板
    d.line([(1, 9), (16, 9)], fill=F_S)
    d.line([(0, 16), (17, 16)], fill=GRASS_DOT)                             # 接地影
    return im

def roof_colors(kind):
    if kind == 'blue':
        return ROOF_B, ROOF_B_DK, ROOF_B_LT, ROOF_B_OUT
    return ROOF_R, ROOF_R_DK, ROOF_R_LT, ROOF_OUT

def make_roof_top(pos, kind='red'):
    base, dk, lt, out = roof_colors(kind)
    im, d = new(base)
    d.rectangle([0,0,S-1,2], fill=lt)
    d.line([(0,3),(S-1,3)], fill=dk)
    d.line([(0,0),(S-1,0)], fill=out)
    d.line([(0,10),(S-1,10)], fill=dk)
    d.line([(0,11),(S-1,11)], fill=lt)
    if pos == 'l':
        d.line([(0,0),(0,S-1)], fill=out); d.line([(1,1),(1,S-1)], fill=lt)
    if pos == 'r':
        d.line([(S-1,0),(S-1,S-1)], fill=out); d.line([(S-2,1),(S-2,S-1)], fill=dk)
    return im

def make_roof_bottom(pos, kind='red'):
    base, dk, lt, out = roof_colors(kind)
    im, d = new(base)
    d.line([(0,4),(S-1,4)], fill=dk)
    d.line([(0,5),(S-1,5)], fill=lt)
    d.rectangle([0,13,S-1,15], fill=dk)
    d.line([(0,16),(S-1,16)], fill=out)
    d.line([(0,17),(S-1,17)], fill=(60,50,46))
    if pos == 'l':
        d.line([(0,0),(0,S-1)], fill=out); d.line([(1,0),(1,12)], fill=lt)
    if pos == 'r':
        d.line([(S-1,0),(S-1,S-1)], fill=out); d.line([(S-2,0),(S-2,12)], fill=dk)
    return im

def make_wall(pos='m'):
    im, d = new(WALL_C)
    d.line([(0,0),(S-1,0)], fill=WALL_SH)
    d.rectangle([0,14,S-1,15], fill=WALL_SH)
    d.line([(0,16),(S-1,16)], fill=WALL_OUT)
    d.line([(0,17),(S-1,17)], fill=GRASS_DOT)
    if pos == 'l':
        d.line([(0,0),(0,S-1)], fill=WALL_OUT)
    if pos == 'r':
        d.line([(S-1,0),(S-1,S-1)], fill=WALL_OUT)
    return im

def make_window():
    im = make_wall()
    d = ImageDraw.Draw(im)
    d.rectangle([3,3,14,11], fill=WIN_FRAME, outline=WALL_OUT)
    d.rectangle([5,5,12,9], fill=WIN_GLASS)
    d.line([(5,5),(8,5)], fill=WIN_GLASS2)
    d.point([(5,6),(6,6)], fill=WIN_GLASS2)
    d.line([(9,5),(9,9)], fill=WIN_FRAME)
    d.line([(5,7),(12,7)], fill=WIN_FRAME)
    return im

def make_door(open_=False):
    im = make_wall()
    d = ImageDraw.Draw(im)
    if open_:
        d.rectangle([5,3,12,16], fill=(40,32,28), outline=WOOD_OUT)
    else:
        d.rectangle([5,3,12,16], fill=WOOD, outline=WOOD_OUT)
        d.line([(6,4),(6,15)], fill=(224,184,128))
        d.line([(8,4),(8,16)], fill=WOOD_DK)
        d.line([(10,4),(10,16)], fill=WOOD_DK)
        d.point([(11,10)], fill=(252,220,120))
    return im

def chest_on(base_im, open_=False):
    im = base_im.copy()
    d = ImageDraw.Draw(im)
    d.rectangle([3,7,14,15], fill=WOOD, outline=WOOD_OUT)
    d.rectangle([3,4,14,8], fill=(208,156,96) if not open_ else (64,48,36), outline=WOOD_OUT)
    d.rectangle([7,9,10,12], fill=(252,220,120), outline=WOOD_OUT)
    if open_:
        d.line([(4,5),(13,5)], fill=(252,220,120))
    return im

def exit_on(base_im):
    im = base_im.copy()
    d = ImageDraw.Draw(im)
    d.ellipse([2,4,15,14], fill=(180,140,232), outline=(110,70,170))
    d.ellipse([5,6,12,11], fill=(228,208,252))
    d.ellipse([7,7,10,9], fill=(252,248,255))
    return im

def make_warp():
    """出口の大型ゲート（2タイル分の高さ・透過）"""
    im = Image.new('RGBA', (S, S*2), (0,0,0,0))
    d = ImageDraw.Draw(im)
    # 石柱
    for x0 in (1, 14):
        d.rectangle([x0, 6, x0+2, 33], fill=(150,150,170,255), outline=(70,70,90,255))
        d.line([(x0+1,7),(x0+1,32)], fill=(196,196,214,255))
        d.rectangle([x0-1, 4, x0+3, 6], fill=(170,170,190,255), outline=(70,70,90,255))
    # 上の梁
    d.rectangle([0, 1, 17, 4], fill=(170,170,190,255), outline=(70,70,90,255))
    d.line([(1,2),(16,2)], fill=(210,210,228,255))
    # 中の渦（ポータル）
    d.ellipse([3, 8, 14, 30], fill=(140,200,255,210), outline=(80,140,220,255))
    d.ellipse([5, 12, 12, 26], fill=(200,232,255,230))
    d.ellipse([7, 16, 10, 22], fill=(255,255,255,240))
    return im

# ================= 村タイルの出力 =================
TILES = {}
def reg(name, im):
    TILES[name] = im
    save(im, name)

reg('tile_grass2',      make_grass())
reg('tile_grass',       make_tallgrass())
reg('tile_tree',        tree_on(make_grass()))
reg('tile_tree-deep',   canopy_fill())
reg('tile_flower',      make_flower())
reg('tile_sign',        make_sign())
reg('tile_fence',       make_fence())
EDGE_SETS = [((), ''), (('top',), '-top'), (('bottom',), '-bottom'), (('left',), '-left'), (('right',), '-right'),
             (('top','left'), '-corner-tl'), (('top','right'), '-corner-tr'),
             (('bottom','left'), '-corner-bl'), (('bottom','right'), '-corner-br')]
for sides, suf in EDGE_SETS:
    reg(f'tile_road{suf}', make_road(sides))
    reg(f'tile_water{suf}', make_water_v(sides))
for kind in ('red', 'blue'):
    suf = '' if kind == 'red' else '-blue'
    for pos in ('l', 'm', 'r'):
        reg(f'tile_rooftop{suf}-{pos}', make_roof_top(pos, kind))
        reg(f'tile_roofbot{suf}-{pos}', make_roof_bottom(pos, kind))
reg('tile_roof',        make_roof_bottom('m', 'red'))
reg('tile_wall',        make_wall())
reg('tile_wall-l',      make_wall('l'))
reg('tile_wall-r',      make_wall('r'))
reg('tile_window',      make_window())
reg('tile_door-closed', make_door(False))
reg('tile_door-open',   make_door(True))
reg('tile_chest-closed', chest_on(make_grass(), False))
reg('tile_chest-open',  chest_on(make_grass(), True))
reg('tile_exit',        exit_on(make_grass()))
save(make_warp(), 'tile_warp')

# ================= エリア別の壁アート =================
def wall_rock(base_im, body, lt, dk, out, crack=None):
    im = base_im.copy()
    d = ImageDraw.Draw(im)
    d.rectangle([0,15,S-1,17], fill=dk)                       # 接地の影
    d.ellipse([0,2,17,16], fill=body, outline=out)
    d.ellipse([2,3,12,9], fill=lt)                            # 上面ハイライト
    d.line([(4,10),(8,12),(9,15)], fill=dk)                   # 岩の割れ目
    d.line([(12,6),(14,10)], fill=dk)
    d.point([(3,5),(7,4),(10,3)], fill=mix(lt, (255,255,255)))
    if crack:
        d.line([(5,8),(9,11),(8,14)], fill=crack)             # 赤熱のひび
        d.point([(10,12),(12,9)], fill=crack)
    return im

def wall_building(base_im, body, lt, out, win_on, win_off):
    im = base_im.copy()
    d = ImageDraw.Draw(im)
    d.rectangle([1,0,16,17], fill=body, outline=out)
    d.rectangle([2,1,15,3], fill=lt)                          # 屋上の縁
    d.line([(2,4),(15,4)], fill=out)
    wins = [(3,6),(8,6),(13,6),(3,11),(8,11),(13,11)]
    for i, (wx, wy) in enumerate(wins):
        col = win_on if i % 2 == 0 else win_off
        d.rectangle([wx,wy,wx+2,wy+3], fill=col, outline=out)
    d.rectangle([1,16,16,17], fill=out)                       # 接地
    return im

def wall_tombstone(base_im, stone, lt, dk, out):
    im = base_im.copy()
    d = ImageDraw.Draw(im)
    d.rectangle([3,14,14,16], fill=dk, outline=out)           # 台座
    d.rounded_rectangle([5,3,12,14], radius=3, fill=stone, outline=out)
    d.line([(6,4),(11,4)], fill=lt)                           # 上面ハイライト
    d.line([(8,6),(8,10)], fill=dk)                           # 十字
    d.line([(7,8),(10,8)], fill=dk)
    d.point([(6,12),(10,12)], fill=dk)
    return im

def wall_conifer(base_im, out, body, lt):
    im = base_im.copy()
    d = ImageDraw.Draw(im)
    d.rectangle([7,14,10,17], fill=TRUNK, outline=TRUNK_DK)
    d.polygon([(1,14),(8,8),(8,14)], fill=body, outline=out)  # 下段（左右に広い）
    d.polygon([(9,14),(9,8),(16,14)], fill=body, outline=out)
    d.polygon([(2,14),(8,6),(15,14)], fill=body, outline=out)
    d.polygon([(4,9),(8,3),(13,9)], fill=body, outline=out)   # 中段
    d.polygon([(6,5),(8,0),(11,5)], fill=lt, outline=out)     # 上段
    d.line([(5,12),(8,10)], fill=lt)
    d.line([(9,7),(11,8)], fill=lt)
    return im

# ================= エリア定義 =================
AREA_DEFS = {
    'wetland': dict(  # 大湿原：草原ベース
        ground=(GRASS, GRASS_ALT, 'grasscheck'),
        edge=((112,168,104), (136,192,124)),
        tuft=(TGRASS_M, TGRASS_D, None),
        water=(WATER, WATER_LT, WATER_HL, WATER_DK),
        wall=lambda b: tree_on(b),
    ),
    'deepsea': dict(  # 奈落海溝：海底の砂地・岩礁・藻場
        ground=((200,198,164), (174,172,138), 'dots'),
        edge=((118,116,90), (158,156,124)),
        tuft=((46,150,128), (24,110,96), None),
        water=((28,60,140), (52,92,180), (90,130,210), (14,32,84)),
        wall=lambda b: wall_rock(b, (122,126,146), (158,162,182), (86,90,108), (54,56,72)),
    ),
    'machine': dict(  # 機械都市：コンクリ・ビル・冷却液
        ground=((148,150,158), (118,120,128), 'panel'),
        edge=((88,90,98), (120,122,130)),
        tuft=((80,168,96), (52,128,72), (255,210,80)),
        water=((40,170,180), (90,210,216), (160,240,244), (16,100,110)),
        wall=lambda b: wall_building(b, (88,92,108), (130,136,154), (40,42,52), (255,214,100), (60,64,78)),
    ),
    'spirit': dict(   # 世界樹の神域：苔の森・泉
        ground=((96,144,72), (78,122,58), 'grasscheck'),
        edge=((56,94,44), (74,116,54)),
        tuft=((150,220,130), (110,190,110), (240,255,220)),
        water=((110,190,230), (160,220,245), (220,245,255), (60,130,180)),
        wall=lambda b: wall_conifer(b, (18,64,44), (38,104,66), (70,150,92)),
    ),
    'ghost': dict(    # 黄昏墓地：灰紫の土・墓石・濁り沼
        ground=((110,104,122), (90,84,102), 'dots'),
        edge=((62,56,74), (84,78,96)),
        tuft=((150,150,160), (112,112,128), None),
        water=((70,56,100), (98,80,134), (130,110,168), (38,28,60)),
        wall=lambda b: wall_tombstone(b, (168,170,182), (204,206,216), (120,122,136), (66,66,80)),
    ),
    'corporate': dict(  # 超巨大企業都市：歩道タイル・高層ビル・噴水
        ground=((170,172,178), (140,142,150), 'tile'),
        edge=((98,100,108), (134,136,144)),
        tuft=((64,150,80), (40,116,60), None),
        water=((80,150,235), (130,185,250), (200,228,255), (40,90,170)),
        wall=lambda b: wall_building(b, (96,110,140), (140,156,188), (44,52,72), (150,210,250), (90,140,190)),
    ),
    'disaster': dict(  # 終焉火山：焦土・溶岩・火山岩
        ground=((104,72,56), (70,46,36), 'cracks'),
        edge=((50,32,26), (78,52,40)),
        tuft=((150,82,50), (124,58,42), (255,200,90)),
        water=((235,110,40), (250,160,60), (255,230,140), (150,40,20)),
        wall=lambda b: wall_rock(b, (70,52,50), (100,76,70), (46,32,32), (26,18,18), crack=(220,80,40)),
    ),
}

AREA_TILES = {}
for area, cfg in AREA_DEFS.items():
    gbase, gtex, gstyle = cfg['ground']
    ground = ground_tile(gbase, gtex, gstyle)
    line, soft = cfg['edge']
    tm, td, spark = cfg['tuft']
    at = {}
    for sides, suf in EDGE_SETS:
        at[f'road{suf}'] = edged_tile(ground, sides, line, soft, gbase)
        at[f'water{suf}'] = water_tile(cfg['water'], sides)
    at['grass'] = tufts_tile(ground, tm, td, spark)
    at['tree'] = cfg['wall'](ground)
    # 木系の壁は密集時の内側用に樹冠タイルを持つ（岩・ビル等はそのまま繰り返しでOK）
    if area == 'wetland':
        at['tree-deep'] = canopy_fill()
    elif area == 'spirit':
        at['tree-deep'] = canopy_fill((14,52,36), (30,86,54), (52,122,76), (84,160,100))
    else:
        at['tree-deep'] = at['tree']
    at['chest-closed'] = chest_on(ground, False)
    at['chest-open'] = chest_on(ground, True)
    at['exit'] = exit_on(ground)
    for name, im in at.items():
        save(im, f'{area}_{name}')
    AREA_TILES[area] = at

# ================= CSS生成 → mokumon.css に差し込み =================
def build_css():
    L = []
    L.append('/* ---- エリア別タイル見た目 ---- */')
    L.append('/* ※このブロックは make_tiles_v2.py が自動生成（手で編集しても再生成で消えます） */')
    L.append('.mkm-map-layer[class*="mkm-area-"] [class*="mkm-t-"] { background-size: cover; background-position: center; background-repeat: no-repeat; box-shadow: none; }')
    L.append('.mkm-map-layer[class*="mkm-area-"] [class*="mkm-t-"]::after { content: \'\'; }')
    U = "data/mokumon/tiles_v2"
    V = TILESET_VER
    def rule(area, t, f):
        L.append(f".mkm-area-{area} .mkm-t-{t} {{ background-image: url('{U}/{f}.webp?v={V}'); }}")
    # 村
    L.append('')
    L.append('/* 村 */')
    rule('village', 'grass', 'tile_grass2')
    for _, suf in EDGE_SETS:
        rule('village', f'road{suf}', f'tile_road{suf}')
        rule('village', f'water{suf}', f'tile_water{suf}')
    rule('village', 'tree', 'tile_tree')
    rule('village', 'tree-deep', 'tile_tree-deep')
    for t, f in [('flower','tile_flower'), ('fence','tile_fence'), ('sign','tile_sign'),
                 ('wall','tile_wall'), ('wall-l','tile_wall-l'), ('wall-r','tile_wall-r'),
                 ('window','tile_window'), ('door-closed','tile_door-closed'), ('door-open','tile_door-open'),
                 ('chest','tile_chest-closed'), ('exit','tile_exit')]:
        rule('village', t, f)
    for kind in ('', '-blue'):
        for pos in ('l', 'm', 'r'):
            rule('village', f'rooftop{kind}-{pos}', f'tile_rooftop{kind}-{pos}')
            rule('village', f'roofbot{kind}-{pos}', f'tile_roofbot{kind}-{pos}')
    L.append(".mkm-area-village .mkm-t-chest-open { background-image: url('%s/tile_chest-open.webp?v=%s') !important; }" % (U, V))
    # 各エリア
    for area in AREA_DEFS:
        L.append('')
        L.append(f'/* {area} */')
        for _, suf in EDGE_SETS:
            rule(area, f'road{suf}', f'{area}_road{suf}')
            rule(area, f'water{suf}', f'{area}_water{suf}')
        for t, f in [('grass', f'{area}_grass'), ('tree', f'{area}_tree'), ('tree-deep', f'{area}_tree-deep'),
                     ('chest', f'{area}_chest-closed'), ('exit', f'{area}_exit')]:
            rule(area, t, f)
        L.append(f".mkm-area-{area} .mkm-t-chest-open {{ background-image: url('{U}/{area}_chest-open.webp?v={V}') !important; }}")
    L.append('')
    L.append('.mkm-t-door-closed { background: #6a4a2a; }')
    L.append('')
    return '\n'.join(L)

def splice_css():
    css_path = os.path.join(ROOT, 'mokumon.css')
    with open(css_path, encoding='utf-8') as f:
        css = f.read()
    start_marker = '/* ---- エリア別タイル見た目 ---- */'
    end_marker = '.mkm-t-chest { background: #4a7a3a; }'
    si = css.find(start_marker)
    ei = css.find(end_marker)
    if si == -1 or ei == -1 or ei < si:
        print('!! mokumon.css のマーカーが見つからないためCSSは未変更')
        return
    new_css = css[:si] + build_css() + css[ei:]
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(new_css)
    print('mokumon.css のタイルCSSブロックを更新')

splice_css()

# ================= 村プレビュー合成（新レイアウト＝ゲーム実装と同じ） =================
def build_village_grid():
    W, H = 24, 20
    g = [[','] * W for _ in range(H)]
    def fill(x1, y1, x2, y2, ch):
        for y in range(y1, y2 + 1):
            for x in range(x1, x2 + 1):
                if 0 <= x < W and 0 <= y < H:
                    g[y][x] = ch
    # 外周の木
    fill(0, 0, W-1, 0, '#'); fill(0, H-1, W-1, H-1, '#')
    fill(0, 0, 0, H-1, '#'); fill(W-1, 0, W-1, H-1, '#')
    fill(1, 1, 1, 6, '#'); fill(1, 12, 1, 18, '#')
    fill(22, 1, 22, 5, '#'); fill(22, 9, 22, 18, '#')
    for x, y in [(2,1),(3,1),(20,1),(21,1),(2,18),(21,18)]:
        g[y][x] = '#'
    # 道
    fill(11, 1, 12, 7, '.')
    fill(9, 7, 13, 7, '.'); fill(9, 11, 13, 11, '.')
    fill(9, 8, 9, 10, '.'); fill(13, 8, 13, 10, '.')
    fill(11, 11, 12, 18, '.')
    fill(3, 7, 20, 7, '.')
    fill(3, 15, 20, 16, '.')
    fill(5, 13, 5, 15, '.'); fill(18, 13, 18, 15, '.')
    # 泉と池
    fill(10, 8, 12, 10, '~')
    fill(3, 17, 6, 18, '~'); fill(17, 17, 20, 18, '~')
    # 家（1-6=赤屋根 x,y,z,u,o,v=青屋根 q/W/p=壁 V=窓 D=ドア）
    def house(hx, hy, blue=False):
        top = 'xyz' if blue else '123'
        bot = 'uov' if blue else '456'
        for i in range(5):
            g[hy][hx+i]   = top[1] if 0 < i < 4 else (top[0] if i == 0 else top[2])
            g[hy+1][hx+i] = bot[1] if 0 < i < 4 else (bot[0] if i == 0 else bot[2])
        g[hy+2][hx]   = 'q'
        g[hy+2][hx+1] = 'V'
        g[hy+2][hx+2] = 'D'
        g[hy+2][hx+3] = 'V'
        g[hy+2][hx+4] = 'p'
    house(3, 3)             # ショップ
    house(16, 3, blue=True) # 配合研究所
    house(3, 9)             # 牧場
    house(16, 9)            # 図鑑館
    # 柵・花
    fill(8, 1, 10, 1, 'F'); fill(13, 1, 15, 1, 'F')
    for x, y in [(8,2),(15,2),(2,8),(21,8),(8,13),(15,13),(3,14),(20,14),(8,17),(14,17)]:
        g[y][x] = 'f'
    # 北門
    g[0][11] = 'D'
    return g, W, H

VCHAR = {',':'tile_grass2', '#':'tile_tree', '#deep':'tile_tree-deep', 'f':'tile_flower', 'F':'tile_fence',
         'D':'tile_door-closed', 'q':'tile_wall-l', 'W':'tile_wall', 'p':'tile_wall-r', 'V':'tile_window',
         '1':'tile_rooftop-l', '2':'tile_rooftop-m', '3':'tile_rooftop-r',
         '4':'tile_roofbot-l', '5':'tile_roofbot-m', '6':'tile_roofbot-r',
         'x':'tile_rooftop-blue-l', 'y':'tile_rooftop-blue-m', 'z':'tile_rooftop-blue-r',
         'u':'tile_roofbot-blue-l', 'o':'tile_roofbot-blue-m', 'v':'tile_roofbot-blue-r'}

def compose(grid, W, H, road_fn, water_fn, char_map):
    GRASSY = {',', '#', 'f'}
    def edges_for(x, y, ch):
        sides = []
        if y == 0 or grid[y-1][x] in GRASSY: sides.append('top')
        if y == H-1 or grid[y+1][x] in GRASSY: sides.append('bottom')
        if x == 0 or grid[y][x-1] in GRASSY: sides.append('left')
        if x == W-1 or grid[y][x+1] in GRASSY: sides.append('right')
        return tuple(sides)
    im = Image.new('RGB', (W * S, H * S))
    for y in range(H):
        for x in range(W):
            ch = grid[y][x]
            if ch == '.':
                t = road_fn(edges_for(x, y, '.'))
            elif ch == '~':
                t = water_fn(edges_for(x, y, '~'))
            elif ch == '#' and y + 1 < H and grid[y+1][x] == '#' and '#deep' in char_map:
                m = char_map['#deep']
                t = TILES[m] if isinstance(m, str) else m
            else:
                m = char_map[ch]
                t = TILES[m] if isinstance(m, str) else m
            im.paste(t, (x * S, y * S))
    return im

vg, VW, VH = build_village_grid()
village = compose(vg, VW, VH, make_road, make_water_v, VCHAR)
village = village.resize((village.width * SCALE, village.height * SCALE), Image.NEAREST)
village.save(os.path.join(ROOT, 'tiles_v2_village.png'))

# ================= エリアプレビュー（7エリア × サンプルマップ） =================
SAMPLE = [
    '##############',
    '#....,,..~~~.#',
    '#.C..,,..~~~.#',
    '#....,,...~~.#',
    '#..##....,,..#',
    '#..##.E..,,..#',
    '##############',
]
sw, sh = len(SAMPLE[0]), len(SAMPLE)
gap = 4
areas_img = Image.new('RGB', (sw * S, (sh * S + gap) * len(AREA_DEFS)), (24, 24, 30))
for ai, (area, at) in enumerate(AREA_TILES.items()):
    grid = [list(r) for r in SAMPLE]
    def road_fn(sides, at=at): return at[f"road{'-corner-' + ('tl' if sides==('top','left') else 'tr' if sides==('top','right') else 'bl' if sides==('bottom','left') else 'br') if len(sides)==2 else ''}"] if len(sides) == 2 else (at[f"road-{sides[0]}"] if sides else at['road'])
    def water_fn(sides, at=at): return at[f"water{'-corner-' + ('tl' if sides==('top','left') else 'tr' if sides==('top','right') else 'bl' if sides==('bottom','left') else 'br') if len(sides)==2 else ''}"] if len(sides) == 2 else (at[f"water-{sides[0]}"] if sides else at['water'])
    cmap = {',' : at['grass'], '#': at['tree'], '#deep': at['tree-deep'], 'C': at['chest-closed'], 'E': at['exit']}
    sample = compose(grid, sw, sh, road_fn, water_fn, cmap)
    areas_img.paste(sample, (0, ai * (sh * S + gap)))
areas_img = areas_img.resize((areas_img.width * SCALE, areas_img.height * SCALE), Image.NEAREST)
areas_img.save(os.path.join(ROOT, 'tiles_v2_areas.png'))

# ---- タイル一覧シート（村のみ） ----
names = list(TILES.keys())
cols = 8
rows = (len(names) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (S + 2) + 2, rows * (S + 2) + 2), (40, 40, 48))
for i, n in enumerate(names):
    x = 2 + (i % cols) * (S + 2)
    y = 2 + (i // cols) * (S + 2)
    sheet.paste(TILES[n], (x, y))
sheet = sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST)
sheet.save(os.path.join(ROOT, 'tiles_v2_sheet.png'))

total = len(TILES) + sum(len(a) for a in AREA_TILES.values()) + 1
print(f'生成完了: {total}タイル → {OUT}')
print('プレビュー: tiles_v2_sheet.png / tiles_v2_village.png / tiles_v2_areas.png')
