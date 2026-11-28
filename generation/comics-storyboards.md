# comics storyboards

[← Home](../README.md) · Page 1 / 1

**1**

Source examples are not independently reproduced. Copy a prompt from its code block; original formatting is preserved in JSON.

<a id="evolink-sequential-art-case-243"></a>

## Four-Panel Photo Mistake Template

<a href="https://pub-62cf7640cd0f4066b60933bd2e9b85ef.r2.dev/github-repo-media/awesome-gpt-image-2-5-prompts/assets/media/2100184553931653120.jpg"><img src="https://pub-62cf7640cd0f4066b60933bd2e9b85ef.r2.dev/github-repo-media/awesome-gpt-image-2-5-prompts/assets/media/2100184553931653120.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
通用模版 【任意场景】 × 【任意穿搭/主体】 × 竖版2×2错误照片
```

By [@DeepBlueX0](https://x.com/DeepBlueX0/status/2100184573376381181)

---

<a id="freestylefly-case-54"></a>

## 人物角色设定图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case54.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case54.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "4-panel satirical product advertisement grid", "layout": { "grid": "2x2", "panels": [ { "position": "top-left", "product_name": "{argument name=\"top left product name\" default=\"座る石\"}", "visual": "man in white shirt and dark pants sitting on a large round stone in a park", "catchphrase": "いつでも、どこでも、落ち着ける。", "sales_badge": "累計販売数 12,000個 突破!", "vertical_text": "公園のベンチが埋まっていた日に。", "features_count": 3, "features_labels": [ "重さ約8kgで安定感抜群", "底面フェルト加工で傷つけにくい", "付属の専用ベルトで持ち運び簡単" ], "extra_visual": "small inset image of the stone with a leather carrying strap", "specs": [ "耐荷重 150kg", "安心の日本製" ] }, { "position": "top-right", "product_name": "{argument name=\"top right product name\" default=\"磨きたくない人の歯ブラシ\"}", "visual": "sleek light blue toothbrush angled diagonally on a dark blue background", "toothbrush_text": "I don't want to brush my yeeth.", "catchphrase": "持っているだけで安心感", "vertical_text": "歯を磨く代わりに、これを持つ。", "sales_badge": "シリーズ累計販売数 85,000本 突破!", "features_count": 3, "features_labels": [ "気持ちを落ち着けるお守り代わりに", "会議や商談前のエチケットに", "磨かない選択を、もっと自由に。" ], "bottom_banner": "歯磨きストレスから、あなたを解放する。" }, { "position": "bottom-left", "product_name": "{argument name=\"bottom left product name\" default=\"雲の貯金箱\"}", "visual": "hand inserting a coin into a fluffy white cloud-shaped piggy bank", "catchphrase": "空気より軽い、安心感。", "sales_badge": "累計販売数 23,567個 突破!", "features_count": 3, "features_labels": [ "ふわふわの触り心地", "割れないから安心", "インテリアに馴染むデザイン" ], "color_variants_count": 3, "color_variants_labels": [ "blue", "pink", "white" ], "price": "¥2,980 (税込)", "bottom_text": "今日から、空に向かってコツコツ貯めよう。" }, { "position": "bottom-right", "product_name": "{argument name=\"bottom right product name\" default=\"叱ってくれる石\"}", "visual": "round stone on a wooden desk with a pen, text written on the stone", "stone_text": "{argument name=\"scolding phrase\" default=\"いいかげんやれ\"}", "catchphrase": "やる気が出ないあなたへ。", "sales_badge": "累計販売数 18,000個 突破!", "features_count": 3, "features_labels": [ "見るたびに心を奮い立たせる", "厳選された言葉をランダム表示", "電池不要、半永久的に叱ってくれる" ], "phrase_variants_count": 10, "phrase_variants_labels": [ "甘えるな", "考えるな", "動け", "現実を見ろ", "逃げるな", "寝るな", "やればできる", "お前ならできる", "寝るな", "もう言い訳するな" ], "price": "¥3,500 (税込)" } ] } }
```

By [@fukumy\_ai](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-54)

---

<a id="freestylefly-case-60"></a>

## 漫画分镜叙事设计

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case60.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case60.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "5-panel collage", "layout": "grid with 3 top panels and 2 bottom panels", "panels": [ { "position": "top-left", "subject": "analog clock", "details": "teal background, time showing {argument name=\"clock time\" default=\"7:42\"}", "style": "flat vector illustration" }, { "position": "top-middle", "subject": "woman holding playing cards", "details": "holding 5 cards: {argument name=\"card hand\" default=\"Ace of Spades, King of Hearts, Queen of Clubs, Jack of Diamonds, 10 of Spades\"}", "style": "classic oil painting portrait" }, { "position": "top-right", "subject": "glass of red liquid", "details": "{argument name=\"glass type\" default=\"wine glass\"} filled to the brim with dark red liquid, marble surface", "style": "photorealistic studio photography" }, { "position": "bottom-left", "subject": "chessboard", "details": "wooden board with 32 pieces in standard starting position", "style": "photorealistic high-angle shot" }, { "position": "bottom-right", "subject": "two dice", "details": "left die shows {argument name=\"left die top\" default=\"5\"} on top, right die shows {argument name=\"right die top\" default=\"2\"} on top", "style": "pop art comic book halftone with red and blue burst" } ] }
```

By [@Gc\_qube](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-60)

---

<a id="freestylefly-case-114"></a>

## 插画艺术创作图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case114.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case114.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "4-panel vertical comic strip", "style": "{argument name=\"art style\" default=\"black and white pencil sketch, crosshatch shading, satirical caricature comic\"}", "characters": { "subject_1": "{argument name=\"main character\" default=\"Sam Altman\"}, curly hair, casual sweater", "subject_2": "{argument name=\"interviewer\" default=\"Ronan Farrow\"}, suit, tie, holding notepad" }, "layout": { "panels": [ { "panel_number": 1, "top_caption": "SAM ALTMAN THINKS THIS WILL BE A NICE LITTLE PROFILE...", "scene": "subject_1 looking smug with hands steepled; subject_2 looking serious taking notes.", "thought_bubble": "I'LL BE CHARMING. IT'LL BE A GREAT CHARACTER PIECE. PEOPLE WILL LOVE IT.", "center_text": "THE RONAN FARROW INTERVIEW", "inset_portraits": { "count": 2, "labels": ["HARVEY WEINSTEIN EXPOSED", "LESLIE MOONVES EXPOSED"] }, "info_boxes": { "count": 3, "text": [ "RONAN FARROW: PULITZER PRIZE-WINNING REPORTER WHO EXPOSED HARVEY WEINSTEIN AT THE NEW YORKER", "AND LESLIE MOONVES AT CBS.", "POWER. ABUSE. ACCOUNTABILITY." ] } }, { "panel_number": 2, "top_caption": "CUT TO...", "scene": "Close-up of subject_1 looking shocked and horrified.", "article_header": "{argument name=\"publication\" default=\"THE NEW YORKER\"}\nTHE SAM ALTMAN PROFILE\nTHE OPENAI CEO'S COMPLICATED QUEST\nBy Ronan Farrow" }, { "panel_number": 3, "top_caption": "SOON AFTER THE ARTICLE IS PUBLISHED...", "scene": "subject_1 looking extremely stressed, sweating, holding a phone to his ear. Surrounded by 6 hands holding smartphones.", "phone_labels": ["VC", "REPORTER", "EX-STAFFEE", "INVESTOR", "TECH CEO", "FORMER COLLEAGUE"], "shouts": { "count": 8, "text": [ "{argument name=\"main accusation\" default=\"LIAR\"}!", "COMPULSIVE LIAR!", "PATHOLOGICAL LIAR!", "YOU CAN'T STOP LYING!", "LIAR!!!", "SOCIOPATH! (ALLEGEDLY)", "EVERYTHING HE SAYS IS A LIE!", "MANIPULATIVE LIAR!" ] }, "sound_effects": "RING! RING! RING!" }, { "panel_number": 4, "top_caption": "AND THE REPORT CONCLUDES...", "scene": "subject_1 looking utterly defeated and depressed.", "quote_box": "\"ALTMAN FREQUENTLY AND CONSISTENTLY LIES TO INVESTORS, EMPLOYEES, THE BOARD, AND EVEN CLOSE FRIENDS.\"\n\"HE APPEARS TO HAVE NO COMFORT TELLING FALSEHOODS.\"\n\"HE IS, BY MANY ACCOUNTS, A COMPULSIVE LIAR AND A SOCIOPATH.\"\n(ALLEGEDLY)", "thought_bubble": { "scene": "Happy subject_1 holding a 'WORLD'S BEST CEO' mug.", "text": "I THOUGHT IT WOULD BE A NICE LITTLE PROFILE...", "sparkle_words": { "count": 4, "text": ["GENIUS!", "VISIONARY!", "INSPIRING!", "BRILLIANT LEADER!"] } }, "bottom_caption": "INSTEAD, IT'S THE PROFILE THAT EXPOSES HIM." } ] } }
```

By [@kaikaitheaiguy](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-114)

---

<a id="freestylefly-case-115"></a>

## 品牌视觉识别图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case115.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case115.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "two-page manga spread", "style": "highly detailed realistic manga, monochrome, screentones, dramatic lighting, psychological thriller", "global_elements": { "protagonist": "{argument name=\"main character description\" default=\"young Japanese salaryman in a suit\"}", "theme": "{argument name=\"core concept\" default=\"surrounded by a massive crowd of identical clones of himself\"}" }, "layout": { "left_page": { "type": "full page splash panel", "setting": "{argument name=\"setting\" default=\"Shibuya scramble crossing at night\"}", "visuals": "Protagonist standing alone in the center of the crossing, looking around in shock at a massive crowd where every single person is an exact clone of him.", "text_elements": [ {"type": "manga title logo", "text": "{argument name=\"manga title\" default=\"俺だらけの街\"}"}, {"type": "subtitle", "text": "第1話 交代"}, {"type": "narration box", "text": "その夜、世界は静かに俺をやめた。"}, {"type": "sound effect", "text": "ザワ…"} ] }, "right_page": { "type": "5-panel vertical layout", "panels": [ { "panel_number": 1, "visuals": "Extreme close-up of protagonist's eyes, wide with shock, sweating.", "text_elements": [ {"type": "speech bubble", "text": "……は？ なんで……みんな、俺なんだ？"}, {"type": "sound effect", "text": "ドクン"} ] }, { "panel_number": 2, "visuals": "A horizontal row of 8 identical clones in suits staring blankly forward.", "text_elements": [ {"type": "sound effect", "text": "ザワ…"} ] }, { "panel_number": 3, "visuals": "A clone leaning in to whisper into the shocked protagonist's ear.", "text_elements": [ {"type": "speech bubble", "text": "お前の代わりは、もう足りてる。"}, {"type": "sound effect", "text": "スッ"} ] }, { "panel_number": 4, "visuals": "Close-up of a smartphone screen held in a hand, showing a push notification.", "text_elements": [ {"type": "screen text", "text": "交代を開始します。"}, {"type": "sound effect", "text": "ピロン"} ] }, { "panel_number": 5, "visuals": "Wide shot of the endless crowd of clones in the city street.", "text_elements": [ {"type": "narration box", "text": "最初に消えるのは、名前でも命でもない。居場所だ。"}, {"type": "bottom left text", "text": "俺は、ここにいていいのか——？"}, {"type": "bottom right text", "text": "{argument name=\"cliffhanger text\" default=\"次号へつづく！\"}"}, {"type": "sound effect", "text": "ザワ… ザワ… ザワ…"} ] } ] } } }
```

By [@onofumi\_AI](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-115)

---

<a id="freestylefly-case-116"></a>

## 主题海报版式设计

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case116.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case116.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "2-page manga spread", "style": "monochrome anime manga, screentones", "theme": "{argument name=\"main action\" default=\"fantasy mage developing a video game\"}", "character": "{argument name=\"character appearance\" default=\"anime girl with blonde hair, tiara, cape, white dress, thigh-highs\"}", "layout": { "left_page": { "panel_count": 11, "rows": [ {"panels": 1, "action": "Determined at dual-monitor desk, speech bubble: '新作ゲーム、絶対完成させる！'"}, {"panels": 3, "action": "Typing, drawing on tablet, testing with controller"}, {"panels": 3, "action": "Shocked at ERROR screen, depressed, determined again"}, {"panels": 4, "action": "Exhausted, sudden realization, furious typing, monitor showing 'Build succeeded!'"} ] }, "right_page": { "panel_count": 2, "panels": [ {"type": "large splash", "action": "Casting magic from a glowing circle at a code-error monster labeled '{argument name=\"error text\" default=\"NullReferenceException\"}'. Speech bubble: '{argument name=\"spell text\" default=\"デバッグ魔法!!\"}'"}, {"type": "bottom banner", "action": "Cheering in front of RPG title screen. Speech bubble: '{argument name=\"success text\" default=\"やったー！\"}'"} ] } } }
```

By [@gamemangaanime](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-116)

---

<a id="freestylefly-case-121"></a>

## 建筑空间场景图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case121.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case121.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "3-panel manga page", "style": "anime, highly detailed, cinematic lighting, futuristic corporate", "layout": { "structure": "1 wide top panel, 2 square bottom panels" }, "panels": [ { "position": "top", "shot": "wide landscape", "scene": "Futuristic corporate lobby with floor-to-ceiling windows", "lighting": "{argument name=\"time of day\" default=\"sunrise\"}", "background": "City skyline featuring {argument name=\"landmark\" default=\"Tokyo Tower\"}", "details": "Holographic displays, polished reflective floor, reception desk, lounge chairs" }, { "position": "bottom left", "shot": "close-up profile", "character": "Young woman, dark hair, black business suit", "accessories": "Futuristic black earpiece with glowing blue light", "speech_bubble": { "style": "standard rounded", "text": "{argument name=\"character dialogue\" default=\"数字はいいわ\"}" } }, { "position": "bottom right", "shot": "full body, walking away, touching earpiece", "character": "Same woman, black suit, black heels, carrying a black tote bag", "environment": "Approaching security gates", "holographic_sign": "{argument name=\"floor sign\" default=\"ECHO 42F\"}", "speech_bubble": { "style": "futuristic angular", "text": "{argument name=\"AI dialogue\" default=\"おはようございます、ユキさん。本日は記念すべき ──\"}" } } ] }
```

By [@loilokoji](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-121)

---

<a id="freestylefly-case-132"></a>

## 界面交互设计图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case132.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case132.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "18-panel brand identity and character design document", "brand": { "name": "{argument name=\"brand name\" default=\"沐阳 MUYANG TEA\"}", "industry": "{argument name=\"industry\" default=\"tea shop\"}", "colors": ["{argument name=\"primary color\" default=\"yellow\"}", "{argument name=\"secondary color\" default=\"green\"}", "white", "brown", "dark green"] }, "subject": "{argument name=\"character description\" default=\"3D rendered cute Shiba Inu mascot wearing a green apron\"}", "layout": { "grid": "3 columns by 6 rows", "sections": [ { "title": "01 品牌DNA分析 / BRAND DNA ANALYSIS", "elements": ["logo", "5 color swatches", "6 icons", "target audience charts"] }, { "title": "02 概念构思 / CONCEPT MOODBOARD", "elements": ["5 photo references", "4 mood icons", "design equation"] }, { "title": "03 形态研究 / FORM STUDY", "elements": ["4 logo anatomy icons", "4 evolution steps", "4 silhouettes"] }, { "title": "04 概念探索 / CONCEPT EXPLORATION", "elements": ["12 line-art character sketches"] }, { "title": "05 精细线稿 / REFINED LINE ART", "elements": ["3 rows of front and side line art with proportion guides"] }, { "title": "06 细节精修 / DETAIL REFINEMENT", "elements": ["2 full-body renders with labels", "4 circular close-ups"] }, { "title": "07 表情设定 / EXPRESSION SHEET", "elements": ["11 3D rendered head expressions"] }, { "title": "08 姿势库 / POSE LIBRARY", "elements": ["9 full-body 3D rendered poses"] }, { "title": "09 转身视图 / TURNAROUND VIEW", "elements": ["5 full-body 3D renders", "5 matching line-art views"] }, { "title": "10 色彩开发 / COLOR DEVELOPMENT", "elements": ["5 rows of 5-color palettes", "color psychology text"] }, { "title": "11 材质规格 / MATERIAL SPECIFICATION", "elements": ["5 texture swatches", "property sliders", "4 manufacturing icons"] }, { "title": "12 色彩应用 / COLOR APPLICATION", "elements": ["4 color variant renders", "2 light/dark renders", "4 contrast rating circles"] }, { "title": "13 构造指南 / CONSTRUCTION GUIDE", "elements": ["2 line-art diagrams for geometry and grid"] }, { "title": "14 设计系统规则 / DESIGN SYSTEM RULES", "elements": ["minimum size icons", "clear space diagram", "4 usage examples"] }, { "title": "15 资产变体 / ASSET VARIANTS", "elements": ["3 size variants", "3 line-art variants", "3 simplified flat heads"] }, { "title": "16 数字应用 / DIGITAL APPLICATIONS", "elements": ["1 app icon", "2 social avatars", "UI elements", "3-step animation cycle"] }, { "title": "17 实物应用 / PHYSICAL APPLICATIONS", "elements": ["plush toy mockup", "packaging mockup", "merchandise mockup", "storefront mockup"] }, { "title": "18 最终主视觉 / FINAL RENDERING", "elements": ["large high-res 3D render of mascot holding tea", "logo", "file format list"] } ] } }
```

By [@Colin\_Leeee](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-132)

---

<a id="freestylefly-case-316"></a>

## 冲破次元壁的写实漫画跑者

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case316.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case316.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
[中文] { "prompt": "超写实，一位留着深色短卷发、修剪整齐的胡须和黑色方形眼镜的年轻男子的鲜艳逼真渲染，身穿深色纹理高领毛衣和牛仔裤。他奔跑到一半被捕捉下来，姿态充满动感，向前突破，充满戏剧性地从一个破碎的漫画分镜框中显现——一条腿和一只手臂冲入现实世界，而身体的其余部分仍留在漫画框内。他的表情充满活力和喜悦，拥有锐利的面部细节，自然的皮肤纹理，以及具有高对比度和深度的戏剧性电影灯光。\n\n背景：一个非常详细的黑白漫画布局，充满了幽默、夸张的且与他直接互动的反应场景。周围的漫画人物表现出震惊和喜剧的表情，配有粗体的对话气泡和速度线。漫画分镜采用经典的高对比度水墨风格绘制，线条清晰，网点阴影。撕裂的纸张边缘和碎片增强了他冲破漫画世界的幻觉。全彩色的写实人物与单色的漫画环境形成强烈对比，创造出写实与漫画艺术之间的动态混合体。超精细，8k分辨率，清晰聚焦，戏剧性的阴影，电影级景深。" } [English] { "prompt": "Ultra-realistic, vibrant photorealistic rendering of a young man with short curly dark hair, neatly trimmed beard, and black rectangular glasses, wearing a dark textured turtleneck sweater and jeans. He is captured mid-run in a dynamic, forward-breaking pose, dramatically emerging from a torn manga panel — one leg and one arm bursting into the real world while the rest of his body remains inside the comic frame. His expression is energetic and joyful, with sharp facial details, natural skin texture, and dramatic cinematic lighting with high contrast and depth. \n\nBackground: a highly detailed black-and-white manga layout filled with humorous, exaggerated reaction scenes that directly interact with him. The surrounding manga characters display shocked and comedic expressions, with bold speech bubbles and motion lines. The manga panels are illustrated in a classic high-contrast ink style with crisp linework and halftone shading. Torn paper edges and debris enhance the illusion of him breaking through the comic world. The fully colored, photorealistic figure contrasts strongly against the monochrome manga environment, creating a dynamic hybrid between reality and comic art. Ultra-detailed, 8k resolution, sharp focus, dramatic shadows, cinematic depth of field." }
```

By [@Fujimoto\_hina](https://x.com/Fujimoto_hina/status/2027748030825500722)

---

<a id="freestylefly-case-349"></a>

## 运动时尚三联 Campaign

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case349.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case349.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
Cinematic sports fashion collage, 3-panel layout, top panel large hero shot of a female tennis athlete sitting confidently on an oversized tilted tennis racket, deep green luxury court backdrop, reflective glossy floor, bold oversized typography “PRECISION” in background, dramatic editorial lighting, ultra-clean composition, high-fashion athletic aesthetic. Bottom left panel: close-up portrait of the athlete with glowing skin, minimal makeup, soft light, text “FOCUS” and “FUEL” placed subtly. Bottom right panel: full-body crouched pose holding racket, strong posture, text “DISCIPLINE DRIVES DOMINANCE”, grid-based layout lines, premium sports branding feel. Consistent color grading, dark green and white palette, sharp details, cinematic shadows, luxury campaign style, 1:1 aspect ratio.
```

By [@AIwithkhan](https://x.com/AIwithkhan/status/2048606301039820821)

---

<a id="freestylefly-case-419"></a>

## 可颂烘焙流程 Storyboard

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case419.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case419.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
Create a crisp, clean infographic storyboard poster for THE CROISSANT BAKER. Wide 16:9 layout, white background, black borders, bold black typography, premium Pixar 3D stylized rendering, bright vivid colors — warm golden yellows, rich buttery creams, flaky browns, soft pastry whites, warm French bakery morning light. Top header: THE CROISSANT BAKER TOTAL VIDEO TIME: 12 SECONDS 8 SHOTS · WARM · FLAKY · IRRESISTIBLE Legend icons: ACTION, HEAT, TIME HINT, INGREDIENT Thin warm golden accent line running full width beneath header Same Pixar-style young French male baker throughout: white baker's jacket, flour-dusted hands, warm authentic French boulangerie setting, marble countertop, warm morning light streaming through windows, bread racks in background. Bright, warm, delicious. Every panel a completely different composition and color. 8 panels: THE OPENER — Wide shot of baker arriving at the boulangerie before dawn, tying apron, switching on the warm kitchen lights, marble counter visible, bread racks behind, flour dusting the air, full world established, bright and cinematic THE BUTTER BLOCK — Baker slams a massive cold block of European butter onto the marble counter with both hands, dramatic impact, flour cloud puffing up, close-up on hands, this is the bones moment — the start of everything THE LAMINATION — Baker folding the dough over the butter block precisely, rolling pin pressing down hard, layers building, side angle shot showing the beautiful layering beginning, confident and skilled THE ROLL — Dough rolled out into a large thin sheet, baker leaning into the rolling pin with full body weight, marble counter, flour dusting everywhere, wide shot showing the scale of the dough THE SHAPE — Triangles cut from the dough, baker rolling each one from the wide end into a tight crescent, hands moving fast and confident, close-up on the shaping, beautiful and precise THE EGG WASH — Baker brushing golden egg wash over each shaped croissant with a pastry brush, each one glistening beautifully, close-up overhead angle, warm golden color, stunning composition THE OVEN — Croissants slid into the blazing hot oven on a tray, oven door closed, through the oven glass croissants visibly puffing and turning deep golden, layers separating dramatically, warm orange glow THE TEAR — Baker pulls a perfect golden croissant from the rack, holds it up, tears it open slowly revealing hundreds of impossibly flaky buttery layers inside, steam escaping, butter glistening — this is the cheese pull moment, the hero shot of the entire video Footer: VIDEO FLOW: 8 shots × 1.5s = 12 seconds. Butter block to the tear. CAMERA TIPS: wide on opener, close-up on butter slam and shaping, side angle on lamination, overhead on egg wash, oven glass for panel 7, extreme close-up on the tear reveal LIGHT & STYLE: warm golden French bakery morning light, buttery cream tones, flour dust in the air, bright vivid Pixar colors, shallow depth of field on close-ups BAKER NOTES: one baker, one perfect croissant, one irresistible tear. The lamination layers and the final tear are everything — make them stunning.
```

By [@TechieBySA](https://x.com/TechieBySA/status/2053523784481554759)

---

<a id="freestylefly-case-422"></a>

## 冬季生存惊悚 Storyboard

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case422.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case422.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
Cinematic Survival Thriller Storyboard Prompt Create a premium cinematic storyboard presentation sheet for a prestige winter survival thriller. Ultra-detailed professional film pre-production layout, clean editorial design, grayscale blueprint background with labeled sections and technical annotations. Aspect ratio 16:9 horizontal master board. SHARED CHOICES HEADER * Cut Count: 10 * Color Palette: icy blue + steel gray + pine green + ember amber * Environment Fingerprint: snow-covered pine clearing, overturned horse carcass, torn campsite debris, looming conifer forest, drifting winter fog --- 1. CHARACTER REFERENCE A realistic South Asian man in his early 30s wearing a dark charcoal business suit, white dress shirt, black tie, polished black shoes. Snow dusted across shoulders and hair. Calm but haunted expression. Show: * front view * side profile * back view * facial close-up * side close-up * costume fabric detail * damaged sleeve detail * shoes in snow Character notes: “An intelligent city professional trapped in a brutal wilderness. Outer composure slowly cracks under primal fear. Suit = identity, burden, and last thread of control.” Palette swatches: * icy blue * steel gray * pine green * ember amber --- 2. ENVIRONMENT / SET DESIGN Top-down aerial map of a snowy forest clearing at dusk. Dead horses partially buried in snow. Destroyed campsite tents. Blood trails across frozen ground. Dense dark pine trees forming a claustrophobic wall around the clearing. Heavy winter fog drifting through the forest. Add cinematic camera movement markers: 1. Crane-down 2. Track 3. Push-in 4. Handheld 5. Steadicam 6. Pan-right 7. Dolly-in 8. Rack-focus 9. Arc shot 10. Pull-out Include arrows and overhead cinematic blocking diagram. Side elevation panel: * descending crane shot * fog layers * silhouette scale reference * conifer enclosure composition Location elements legend: * tree line * torn campsite * horse carcass debris * blood-stained snow * main character * wolf approach zones --- 3. STORYBOARD (10 CUTS) CUT 1 Wide aerial crane-down shot over frozen clearing. Tiny suited man surrounded by devastation. Moody blue dusk lighting. CUT 2 Tracking medium shot beside the man walking cautiously through snow and ripped tents. Wind moving fabric debris. CUT 3 75mm close-up push-in on face. Cold breath visible. Fear slowly emerging in his eyes. CUT 4 Extreme close-up handheld shot of trembling hand gripping torn frozen fabric near blood-covered snow. CUT 5 Steadicam medium shot revealing wolves emerging between trees behind him. CUT 6 Pan-right wide shot sweeping across forest edge. Multiple wolf silhouettes visible in fog. CUT 7 Over-the-shoulder dolly-in toward alpha wolf approaching slowly through snow. CUT 8 Rack-focus insert shot shifting focus from frozen hand to wolf tracks in snow. CUT 9 Arc shot circling around the man as wolves tighten formation. Snow and pine branches moving in icy wind. CUT 10 Close-up pull-out shot from his exhausted face revealing the full massacre behind him in fading ember dusk light. --- 4. LIGHTING / MOOD / STYLE NOTES * icy dusk ambience * cold blue backlight * ember sunset glow fading through fog * wet fabric specular highlights * cinematic volumetric fog * snow particles drifting through frame * high-contrast prestige thriller realism Mood keywords: * isolation * winter dread * survival instinct * prestige thriller realism * primal tension * psychological fear Cinematography notes: * anamorphic lenses (40mm / 50mm / 75mm / 100mm) * shallow depth of field * compressed forest layers * natural handheld movement * realistic snow atmosphere * cinematic Hollywood survival thriller aesthetic * ultra detailed * photorealistic * film grain * 8k production design board * premium movie pitch deck style
```

By [@zulkarnaimx](https://x.com/zulkarnaimx/status/2053723774680535538)

---

<a id="freestylefly-case-436"></a>

## 数码相机屏幕怀旧人像

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case436.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case436.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
A realistic close-up shot of a small digital camera screen glowing brightly in a dark indoor environment. Displayed on the LCD is a candid early-2010s style photograph of a young East Asian woman with long dark wavy hair standing beside a wooden shelf packed tightly with colorful comic books and magazines. She wears a black spaghetti-strap top with a loose white cardigan hanging casually from both shoulders and faded blue jeans. Captured mid-laugh while turning her face slightly sideways, her expression feels spontaneous and natural, with hair falling softly across part of her cheek. The harsh direct flash from the compact camera creates strong highlights on her face and cardigan while flattening shadows in the background, producing an authentic nostalgic digicam aesthetic. Slight motion blur and digital grain enhance the candid realism. Camera UI overlays are visible across the LCD screen, including the timestamp “8. 1. 2012 3:15 AM,” exposure data “1/30 F3.4 ISO 100,” focus indicators, and a small green battery symbol in the corner. The image preserves visible screen pixel structure, slight glare reflections, chromatic softness, and compressed digital texture. Outside the LCD, the surrounding darkness fades smoothly into blur, emphasizing the glowing nostalgic screen. Shot to resemble an authentic Sony Cyber-shot point-and-shoot camera from the early 2010s using a CCD sensor with vintage digital rendering and imperfect flash exposure.
```

By [@Ciri\_ai](https://x.com/Ciri_ai/status/2055876982630686956)

---

<a id="freestylefly-case-550"></a>

## 动漫动作短片设定分镜板

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case550.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case550.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
Create a single vertical anime animation development board for an original high-energy action short film titled "Underground Train Yard Clash." The final output must be ONE combined image only, clearly divided into 2 sections: TOP SECTION: Character design sheet BOTTOM SECTION: 12-frame storyboard page Create fully original anime characters. Do not imitate any existing anime, manga, game, or copyrighted character designs. Keep everything original, cinematic, dynamic, and easy to understand. STYLE: Premium anime pre-production board, loose pencil sketches mixed with semi-rendered anime keyframes, dramatic lighting, strong contrast, speed lines, impact frames, red panel borders, blue motion arrows, handwritten notes, timing notes, and lens notes. TOP SECTION — CHARACTER DESIGN SHEET Use a light neutral paper-like background. Fighter A: Young anime street fighter, around 19, messy spiky dark brown hair, sharp hazel eyes, lean muscular build, cocky expression. Outfit: sleeveless zip jacket worn open, fitted tank top underneath, cargo pants, taped ankles, sneakers. Personality: fast, reckless, unpredictable, improvises mid-fight. Show front view, side view, back view, 3/4 view, low crouched dash stance, flying knee pose, wall-rebound kick pose, and a few expressions. Fighter B: Disciplined rival fighter, around 23, short clean-cut dark hair, calm brown eyes, broad powerful build, focused expression. Outfit: fitted compression long-sleeve, military trousers, heavy boots, forearm wraps. Personality: structured, powerful, shuts down opponents with efficiency. Show front view, side view, back view, 3/4 view, upright guard stance, shoulder block pose, single heavy straight punch pose, and a few expressions. Add small handwritten design notes and compact anime color swatches. BOTTOM SECTION — STORYBOARD PAGE Use a dark black background for the entire storyboard section. Do not use beige, yellow, or paper-colored background here. Create 12 cinematic anime storyboard panels in a clean grid. Use red panel borders, blue motion arrows, handwritten camera notes, timing notes, and action notes. Keep both fighters visually consistent. 12 STORYBOARD FRAMES: ➤ Split-screen with thick black divider: Fighter A balancing on top of a stationary train car, arms loose, grinning (upper frame); Fighter B standing on the concrete platform below, arms at his sides, waiting (lower frame). ➤ Split-screen close-ups: Fighter A's sneaker taps the train roof impatiently; Fighter B's forearm wraps tighten as he clenches his fists. ➤ Wide shot of the underground train yard — dim overhead lights, parked train cars, Fighter A drops down from the roof to face Fighter B on the platform. ➤ Fighter A dashes forward and launches a flying knee strike. ➤ Tracking shot of the flying knee closing in fast. ➤ Slow-motion: Fighter B raises his forearm and blocks the knee hard, shockwave of force visible in slow motion. ➤ Fighter B grabs Fighter A mid-air and slams him down onto the concrete platform. ➤ Fighter A bounces up immediately and sprints toward a train car wall. ➤ Fighter A rebounds off the wall and launches a spinning heel kick. ➤ Fighter B side-steps and the kick misses, Fighter A stumbles forward. ➤ Fighter B delivers one single devastating straight punch directly into Fighter A's chest. ➤ Aftermath: Train yard goes quiet. Fighter B stands on the platform, composed. Fighter A is down against the base of the train car, dim lights flickering above, train cars stretching into darkness behind them. ENVIRONMENT: Underground train yard, dim overhead industrial lights, concrete platform, parked train cars, dark tunnels stretching beyond, dust, scattered gravel, flickering lights. FINAL GOAL: Make the board clean, readable, cinematic, and production-ready. The top section should clearly show the character designs. The bottom section should clearly show the 12-frame action choreography on a black storyboard background.
```

By [@Strength04\_X](https://x.com/Strength04_X/status/2093726038400585925)

---

<a id="prompthero-9ef005f0727"></a>

## The Joker, a male adult with Caucasian features, i\.\.\.

<a href="https://cdn.prompthero.com/8caqs6gbldozo1o5t50spcvg90v5-midjourney-61-the-joker-a-male-adult-with-caucasian-features-is-depicted-in-a-dimly-lit-stylized-office-setting-he-sports-a.png"><img src="https://cdn.prompthero.com/8caqs6gbldozo1o5t50spcvg90v5-midjourney-61-the-joker-a-male-adult-with-caucasian-features-is-depicted-in-a-dimly-lit-stylized-office-setting-he-sports-a.png" width="480" alt="After"></a>

**Prompt**

```text
The Joker, a male adult with Caucasian features, is depicted in a dimly lit, stylized office setting. He sports a purple and yellow striped suit, a green hair, and a mischievous grin. His expression is playful and slightly menacing. He's seated in a black office chair, one leg propped up. He's positioned slightly off-center to the left side of the image, facing the viewer. The composition is dynamic and slightly diagonal, highlighting the character's pose and the neon signs surrounding him. The overall color palette is vibrant, contrasting shades of purple and pink neon lights illuminating the scene. The backdrop features large, bright neon letters spelling "HAHAHA!" in a stylized font. The office is cluttered and somewhat chaotic, suggesting a character-driven environment. The lighting is dramatic and theatrical, casting strong shadows and emphasizing the subject. The style is artistic and evocative of a stylized comic book or graphic novel. The scene evokes a sense of energy and theatricality.
```

[Source](https://prompthero.com/prompt/9ef005f0727-midjourney-61-the-joker-a-male-adult-with-caucasian-features-is-depicted-in-a-dimly-lit-stylized-office-setting-he-sports-a)

---

<a id="prompthero-25639a01694"></a>

## A retro icon of a rotary telephone, 1930s Era Comi\.\.\.

<a href="https://cdn.prompthero.com/pceozcp6fpp6t7yp91iog2mjs4a3-midjourney-5-a-retro-icon-of-a-rotary-telephone-1930s-era-comic-strip-style-bold-and-contrasting-palette-art-by-paul-gauguin.png"><img src="https://cdn.prompthero.com/pceozcp6fpp6t7yp91iog2mjs4a3-midjourney-5-a-retro-icon-of-a-rotary-telephone-1930s-era-comic-strip-style-bold-and-contrasting-palette-art-by-paul-gauguin.png" width="480" alt="After"></a>

**Prompt**

```text
A retro icon of a rotary telephone, 1930s Era Comic Strip style, bold and contrasting palette, art by Paul Gauguin, white background:: --q 2 --v 5
```

[Source](https://prompthero.com/prompt/25639a01694-midjourney-5-a-retro-icon-of-a-rotary-telephone-1930s-era-comic-strip-style-bold-and-contrasting-palette-art-by-paul-gauguin)

---

<a id="sipteaandcoffee-2053466282419446015"></a>

## Twelve-panel cinematic horse adventure storyboard

<a href="https://pbs.twimg.com/media/HH9gsyvbkAAQiKE.jpg"><img src="https://pbs.twimg.com/media/HH9gsyvbkAAQiKE.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
make a character sheet and Create a wide cinematic 12-panel storyboard infographic in a realistic photography style with warm golden cinematic colors, arranged in a clean 4x3 grid layout. Each panel must have clear numbering, bold cinematic titles, short bullet-point scene descriptions, and smooth visual storytelling like a professional Hollywood film-production storyboard. Maintain visual continuity of the same female protagonist and horse throughout all panels. Style should feel like a mix of an epic action movie trailer, luxury fashion commercial, and fantasy adventure film. Highly detailed, dynamic compositions, dramatic motion blur, cinematic lighting, shallow depth of field, realistic textures, and emotional storytelling. Main character: a stunning confident woman with flowing dark hair wearing a sleek tight black latex catsuit with subtle armored details, riding a majestic powerful white horse. The atmosphere is energetic, empowering, viral, cinematic, and action-heavy. Set during golden daylight with dramatic sunlight rays, dust, splashes, wind movement, and epic landscapes. PANEL 1 — “THE ARRIVAL” Wide aerial shot Woman appears on white horse emerging from morning mist Golden sunlight breaking through clouds Massive valley landscape Epic cinematic scale PANEL 2 — “FULL SPEED” Dynamic side tracking shot White horse galloping at extreme speed through shallow reflective water Huge water splashes frozen in motion Hair and latex suit flowing dramatically Intense action energy PANEL 3 — “THE CHASE BEGINS” Enemy riders appear far behind Dust clouds rising Woman glances back confidently Fast cinematic tension Hollywood action framing PANEL 4 — “RIVER LEAP” Horse jumps across a broken river gap Mid-air cinematic freeze-frame feeling Explosive water spray below Strong sunlight rim lighting Viral blockbuster moment PANEL 5 — “THE STANDOFF” Woman stops on a cliff edge White horse rearing powerfully Wind blowing dramatically Intense eye contact with enemies Heroic empowering pose PANEL 6 — “AMBUSH” Arrows fly through the air Horse drifting sideways in mud and water Dynamic low-angle camera Action chaos Cinematic motion blur PANEL 7 — “THE ESCAPE” Fast forest chase sequence Sun rays cutting through trees Branches and leaves flying everywhere Tight handheld-style action shot High adrenaline energy PANEL 8 — “THE STORM” Dark clouds roll in suddenly Heavy rain begins Wet reflective latex suit and horse Dramatic emotional atmosphere Epic fantasy visuals PANEL 9 — “THE FALL” Horse slides down rocky terrain Woman nearly falls but regains balance Extreme cinematic tension Flying debris and mud Survival moment PANEL 10 — “THE RISE” Slow-motion heroic shot Woman stands beside white horse Sunlight breaking through storm clouds Determined expression Powerful emotional comeback PANEL 11 — “FINAL CHARGE” Massive battlefield sprint White horse charging directly toward camera Explosions, dust, flying debris Epic Hollywood trailer composition Maximum cinematic intensity PANEL 12 — “THE LEGEND” Final victorious silhouette shot Woman and white horse standing on mountain peak Golden sunset sky Huge cinematic scale Emotional ending frame with legendary hero aura Overall style: Realistic cinematic photography Warm golden color grading Hollywood action trailer aesthetic Viral social-media-ready compositions Dynamic camera angles Strong environmental storytelling High-detail textures Cinematic motion blur Epic fantasy-action atmosphere Smooth visual continuity across all 12 panels Ultra-detailed, photorealistic yet stylized Premium movie storyboard infographic design
```

By [@sipteaandcoffee](https://x.com/sipteaandcoffee/status/2053466282419446015)

---

**1**

[← Home](../README.md)
