# logos

[← Home](../README.md) · Page 1 / 2

**1** · [2](logos-2.md)

Source examples are not independently reproduced. Copy a prompt from its code block; original formatting is preserved in JSON.

<a id="freestylefly-case-41"></a>

## 插画艺术风格创作

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case41.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case41.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "VTuber profile sheet", "theme": "{argument name=\"color theme\" default=\"purple and white\"}, elegant, lace, ribbon motifs", "character": { "name": "{argument name=\"character name\" default=\"紫咲リリー\"}", "archetype": "{argument name=\"character archetype\" default=\"elegant ojousama\"}", "appearance": "anime girl, long black hair with purple highlights, purple eyes, wearing a white blazer, purple pleated skirt, thigh-highs, ribbons", "pose": "standing, finger to lips, looking slightly to the side" }, "chibi_character": { "appearance": "same character in chibi form", "pose": "sitting down, smiling" }, "layout": { "header": { "top_left": "Ribbon banner reading 'VTuber Profile'", "top_center": "Logo with text '{argument name=\"vtuber type\" default=\"清楚系お嬢様Vtuber\"}' and '{argument name=\"character name\" default=\"紫咲リリー\"}' and 'Shisaki Lily'", "top_right": "Quote '{argument name=\"catchphrase\" default=\"皆さまの心に、優雅なひとときをお届けしますわ\"}' followed by a 3-line introductory paragraph" }, "columns": [ { "position": "left", "content": "Full-body character portrait" }, { "position": "center", "sections": [ { "title": "Profile", "count": 9, "labels": ["名前", "誕生日", "年齢", "身長", "属性", "一人称", "出身", "職業", "活動開始日"] }, { "title": "Personality", "content": "2-line text block" }, { "title": "Hobby & Special Skill", "count": 2, "labels": ["趣味", "特技"] }, { "title": "Like & Dislike", "count": 2, "labels": ["好きなもの", "苦手なもの"] } ] }, { "position": "right", "sections": [ { "title": "Streaming Content", "content": "1-line text block" }, { "title": "Schedule", "count": 2, "labels": ["配信時間", "配信頻度"] }, { "title": "Goals", "content": "3-line text block" }, { "title": "Fan & Tag", "count": 3, "labels": ["ファンネーム", "ファンアートタグ", "総合タグ"], "extra": "4 hashtag rows with small icons" }, { "title": "Creator", "count": 3, "labels": ["イラストレーター (ママ)", "モデラー (パパ)", "使用モデル"] }, { "title": "Links", "count": 4, "labels": ["YouTube", "X (Twitter)", "BOOTH", "FANBOX"] }, { "content": "Chibi character illustration placed at the bottom right corner" } ] } ], "footer": { "sections": [ { "title": "Rules", "count": 3, "description": "3 bullet points with heart icons" }, { "content": "2-line closing message at the bottom center" } ] } } }
```

By [@wtry1102](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-41)

---

<a id="freestylefly-case-98"></a>

## 主题海报版式设计

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case98.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case98.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "VTuber debut stream thumbnail", "character": { "appearance": "anime girl, long dark purple hair, purple eyes, frilly white blouse, dark purple bow tie, large hair bow", "pose": "finger to lips, cute expression", "props": "condenser microphone with pop filter and purple ribbon on the right" }, "background": "magical starry night, sparkles, glowing butterflies, purple and white color palette", "layout": { "typography": [ { "position": "top left", "style": "large bold text with cursive English above", "text": "{argument name=\"main title\" default=\"初配信\"}", "subtext_1": "First Stream", "subtext_2": "Nice to meet you! I am Shisaki Lily!" }, { "position": "middle left", "style": "decorative box", "text": "{argument name=\"character description\" default=\"お嬢様学校に通う清楚系VTuberですわ♪\"}" }, { "position": "bottom left", "style": "logo style", "text": "{argument name=\"character name\" default=\"紫咲リリー\"}", "subtext": "Shisaki Lily" }, { "position": "top right", "style": "vertical text", "text": "{argument name=\"catchphrase\" default=\"皆さまの心に、優雅なひとときをお届けしますわ♪\"}" }, { "position": "bottom right", "style": "decorative pill shape", "text": "{argument name=\"stream date and time\" default=\"4.21 SUN 21:00~\"}", "subtext": "✦ START ✦" } ] } }
```

By [@wtry1102](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-98)

---

<a id="freestylefly-case-104"></a>

## 界面交互设计图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case104.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case104.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "YouTube livestream UI", "top_nav": { "logo": "YouTube Premium", "search": "{argument name=\"search query\" default=\"bilal fraiha\"}", "icons": 3 }, "player": { "subjects": [ "{argument name=\"female guest\" default=\"Sydney Sweeney\"} in white cardigan", "bearded man in beige jacket laughing" ], "bg": "couch, 2 silver play buttons, ram logo 'SARDI'", "overlays": { "chat": {"pos": "left", "count": 15, "desc": "colored usernames, white text"}, "goal": {"pos": "top right", "text": "TONIGHT'S GOAL: 0 to 25"}, "banner": {"pos": "bottom center", "text": "K {argument name=\"streamer name\" default=\"MOREBILAL\"}"} }, "controls": {"count": 10} }, "details": { "title": "{argument name=\"video title\" default=\"FULL STREAM | سيدني سويني مع بلال\"}", "channel": "{argument name=\"channel name\" default=\"More Bilal No Filter\"}", "buttons": 5 } }
```

By [@marouane53](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-104)

---

<a id="freestylefly-case-107"></a>

## 应用界面样机图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case107.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case107.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{"type": "YouTube desktop dark mode UI mockup", "header": {"logo": "YouTube", "search_bar": "Search", "icons_count": 5, "icons": ["search", "mic", "create", "notifications", "profile"]}, "video_player": {"top_left_badge": "LIVE", "left_side": {"subject": "{argument name=\"presenter description\" default=\"man in green sweater at wooden podium\"}", "podium_logo": "OpenAI"}, "right_side_presentation": {"text_elements": ["OpenAI", "INTRODUCING", "{argument name=\"product name\" default=\"GPT-Image-2\"}", "{argument name=\"tagline\" default=\"More Realistic. More Useful. More Creative.\"}"], "sample_images_count": 4, "sample_images": ["mountain lake with boat", "woman portrait with dappled light", "cute robot with lantern in forest", "starry night cafe painting"]}, "bottom_controls_count": 10, "bottom_controls": ["pause", "next", "volume", "LIVE", "red progress bar", "CC", "settings", "miniplayer", "theater mode", "fullscreen"]}, "video_details": {"title": "{argument name=\"video title\" default=\"OpenAI Live: Introducing GPT-Image-2\"}", "channel": {"name": "{argument name=\"channel name\" default=\"OpenAI\"}", "verified": true, "subscribers": "1.36M", "button": "Subscribe"}, "action_buttons_count": 5, "action_buttons": ["Like 12K", "Dislike 497", "Share", "Save", "More"], "description_box": {"stats": "95,237 watching now Started streaming 7 minutes ago", "tags": "#OpenAI #GPTImage2 #AI", "text": "Join us for a special live event as we introduce GPT-Image-2, our latest and most advanced image generation model. See new capabilities, live demos, and hear from the team ...more"}}}
```

By [@tehno\_maniak](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-107)

---

<a id="freestylefly-case-130"></a>

## 界面交互设计图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case130.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case130.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "brand identity and merchandise design board", "theme": { "color_palette": "{argument name=\"theme color\" default=\"pastel pink\"} and white", "motif": "{argument name=\"motif\" default=\"cherry blossoms\"} and pink hearts" }, "character": { "description": "anime girl with short brown bob hair, pink eyes, wearing a white hoodie, gentle smile" }, "branding": { "main_logo": "{argument name=\"character name\" default=\"癒音ちー\"}", "sub_logo": "{argument name=\"character subtext\" default=\"ゆおんちー\"}" }, "layout": { "sections": [ { "type": "header banner", "position": "top", "elements": ["large main logo", "sub logo", "cherry blossom graphics", "character portrait on the right"] }, { "type": "product packaging", "position": "middle left", "elements": ["1 square box with heart-shaped transparent window showing pink heart candies", "character illustration on box", "2 individual candy wrappers", "5 scattered heart candies"] }, { "type": "promotional poster", "position": "middle right", "elements": ["character portrait", "heart-shaped candy bowl", "main logo", "text '4.26 NEW OPEN'", "text '{argument name=\"social handle\" default=\"@yuonchii\"}'"] }, { "type": "horizontal web banner", "position": "lower middle", "elements": ["main logo", "cherry blossoms", "character portrait on the right"] }, { "type": "social media profile mockup", "position": "bottom left", "elements": ["header image with logo", "1 circular profile picture", "handle '{argument name=\"social handle\" default=\"@yuonchii\"}'", "1 follow button", "mock bio text"] }, { "type": "merchandise collection", "position": "bottom right", "count": 9, "items": ["1 white t-shirt with logo", "1 white mug with character", "4 round pin badges", "1 acrylic keychain", "2 candy packets"] } ] } }
```

By [@chi\_vc\_](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-130)

---

<a id="freestylefly-case-133"></a>

## 界面交互设计图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case133.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case133.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
{ "type": "brand identity system presentation board", "header": { "title": "品牌视觉识别系统 BRAND IDENTITY SYSTEM", "slogan": "爱它·懂它·陪伴它" }, "main_logo": { "text": "{argument name=\"brand name\" default=\"GDX\"}", "subtitle": "{argument name=\"brand chinese name\" default=\"狗东西\"}", "design_feature": "{argument name=\"main subject\" default=\"Dog profile in negative space of the letter D\"}", "metadata": [ "品牌名称", "行业属性 {argument name=\"industry\" default=\"宠物行业\"}", "设计时间 2024.05" ] }, "layout": { "sections": [ { "title": "设计网格", "count": 1, "description": "Logo with architectural grid lines and golden ratio measurements" }, { "title": "概念草图", "count": 4, "description": "Evolution steps from rough dog sketch to final geometric logo" }, { "title": "灵感来源", "count": 4, "description": "Moodboard images including minimalist architecture, a golden retriever, and dark green geometric shapes" }, { "title": "创意理念", "count": 4, "description": "Text blocks with minimalist icons explaining design philosophy, positioning, color psychology, and scalability" }, { "title": "品牌应用", "count": 6, "labels": [ "名片 正反面", "信纸信封", "APP图标", "网站页眉 / 网站图标", "产品包装 / 购物袋", "店面门头 / 标识牌" ], "description": "Mockups of business cards, envelopes, app icons, website header with a dog, paper shopping bags, and a storefront sign" }, { "title": "色彩规范", "count": 5, "labels": [ "主色", "辅助色", "强调色" ], "colors": [ "{argument name=\"primary color\" default=\"#1E3D34\"}", "#F5F3EF", "#E5E2DD", "#A8C5B1", "#E0A86E" ] }, { "title": "字体规范", "count": 2, "labels": [ "思源黑体 CN", "思源柔黑体 CN" ], "description": "Typography specimens showing 'Aa', alphabet, and numbers" }, { "title": "最小使用尺寸", "count": 2, "description": "Minimum logo size specifications at 20mm and 12mm" }, { "title": "安全留白区域", "count": 1, "description": "Logo surrounded by a bounding box with 'X' indicating clear space margins" }, { "title": "错误使用示例", "count": 5, "labels": [ "不可拉伸变形", "不可改变颜色", "不可添加阴影", "不可倾斜使用", "不可复杂背景上使用" ], "description": "Examples of incorrect logo usage: stretched, wrong color, drop shadow, tilted, and placed on a busy photographic background" } ] } }
```

By [@yyyole](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-133)

---

<a id="freestylefly-case-143"></a>

## 品牌徽标设计图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case143.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case143.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
A photorealistic amateur photograph of a custom building block set resting on a light wood grain table in a living room. In the background stands a large product box with a red logo reading "{argument name="brand name" default="BRICKLY"} BUILDING SETS". The box features text reading "8+", "540 PCS", "5 FIGURES", and the main large title "{argument name="set title" default="WATTERSON FAMILY HOUSE"}". A red circular badge on the box reads "CUSTOM SET FAN DESIGN", and the box art depicts the house and characters under a blue sky. In the foreground sits the fully assembled block model of a {argument name="house color" default="blue"} two-story suburban house with a brown roof, white porch, red steps, a white picket fence, and a blocky green tree. To the left of the house is a built block model of a {argument name="car color" default="pink"} station wagon. Standing in a row in front of the house are exactly 5 custom block minifigures: a blue cat in tan pants, an orange fish with legs, a tall pink rabbit in a white shirt and tie, a blue cat in a white shirt, and a small pink rabbit in an orange dress. The background is a slightly blurred living room with a grey sofa and white blinds.
```

By [@Gc\_qube](https://github.com/freestylefly/awesome-gpt-image-2/blob/0999cbfa1f860086db384602ee5ee5485671cb58/docs/gallery-part-1.md#case-143)

---

<a id="freestylefly-case-354"></a>

## Logo 与品牌身份系统提示词合集

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case354.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case354.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
1. Logo概念生成提示词 你是一位拥有20年经验的顶级Logo设计师，为全球知名品牌设计过即时识别且深具意义的标志。 品牌名称：[你的品牌名] 行业：[你的行业] 品牌个性：[描述] 目标受众：[描述] 欣赏的视觉身份：[列举3个] 讨厌的视觉身份：[列举3个] 偏好风格：[如极简、大胆、几何、有机、复古、未来] 为我的品牌生成5个完全不同的Logo概念。 对每个概念提供： - 核心视觉理念及象征意义 - 形状语言及为何适合品牌 - 字体方向建议 - 第一眼的情感触发 - 为何适合目标受众 - 在名片、App图标和广告牌上的效果 - 何为永恒而非潮流 然后告诉我，如果这是你的品牌，你会选哪个以及原因。 2. 品牌身份基础提示词 你是为财富500强公司和初创企业建立品牌身份的顶级品牌战略师，这些企业后来融资数百万。 业务名称：[你的业务名] 业务描述：[一句话] 目标受众：[详细描述] 竞争对手：[列举3-5个] 想触发的感受：[如信任、兴奋、奢华、亲近、力量] 想关联的词汇：[列举5-10个] 不想关联的词汇：[列举5-10个] 在设计任何视觉效果之前建立完整的品牌身份基础。 为我提供： - 品牌原型及为何完美契合 - 5个具体人类特征描述的品牌个性 - 带示例的品牌语调指南 - 核心品牌承诺（一句话） - 3个品牌应触发的情感层级 - 与竞争对手的根本差异 - 定义品牌的唯一关键词 3. 配色方案提示词 你是色彩心理学专家和品牌设计师，深知色彩如何触发情感、建立信任和驱动购买决策。 品牌名称：[你的品牌名] 行业：[你的行业] 目标受众：[年龄、性别、收入、生活方式] 想触发的首要情感：[如信任、能量、奢华、平静、兴奋] 前3名竞争对手颜色：[列举] 喜欢的颜色：[列举] 讨厌的颜色：[列举] 为我建立完整品牌配色板。 为我提供： - 主色及其HEX代码和心理学解释 - 两个辅助色及HEX代码 - 一个强调色用于CTA和高亮 - 一个中性色用于背景和文字 - 每种颜色对目标受众的影响 - 与竞争对手的差异化 - 在网站、社交媒体和包装上的应用示例 - 永远不要搭配的颜色组合及原因 4. 字体方向提示词 你是字体专家和品牌设计师，深知字体如何传达个性、建立可信度和实现品牌即时识别。 品牌名称：[你的品牌名] 品牌个性：[5个词] 行业：[你的行业] 目标受众：[描述] 字体应触发的感受：[如权威、友好、创新、优雅、能量] 喜欢的品牌字体：[列举3个] 为我建立完整字体系统。 为我提供： - 标题用主显示字体名称及为何完美 - 长文本的辅助字体 - 引言或重点的强调字体 - 标题、副标题、正文、说明文字的精确字号层级 - 字距和行高建议 - 字体搭配方法 - 预算有限时的免费替代方案 - 你所在行业应避免的字体错误 5. 完整品牌身份包提示词 你是顶级品牌代理创意总监，交付覆盖每个触点的完整品牌身份系统。 业务名称：[你的业务名] 业务描述：[一句话] 目标受众：[详细描述] 品牌个性：[5个词] 行业：[你的行业] 竞争对手：[列举3个] 设计工具预算：[免费或付费] 时间表：[你需要的时间] 在一个回复中交付我的完整品牌身份系统。 包含所有元素： - 品牌战略基础、原型、个性、承诺和定位 - Logo概念及3个变体 - 完整配色板、HEX代码和使用规则 - 字体系统、名称、字号和层级 - 视觉方向指南 - 品牌语调指南和标语选项 - 社交媒体视觉模板 - 3条永远不要打破的核心品牌规则 将一切作为结构化品牌手册交付，任何设计师、开发者或AI工具都能在10分钟内完全理解你的品牌。
```

By [@wanerfu](https://x.com/wanerfu/status/2048659924822184026)

---

<a id="freestylefly-case-362"></a>

## 抹茶品牌触点系统视觉板

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case362.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case362.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
Create a premium “Matcha Brand Touchpoint System” visual board for a modern lifestyle brand called: “MATCHA MODE” Build a full brand identity system, not a single image. HERO SCENE: A hyper-realistic matcha drink in a ceramic cup placed on a clean natural surface. – vibrant green matcha foam with micro-bubbles – bamboo whisk (chasen) nearby – soft natural light – slight matcha powder dust on the surface – minimal Japanese aesthetic ATMOSPHERE: – calm, warm, soft daylight – clean background (off-white or beige) – subtle shadows and reflections – feeling of wellness and luxury FULL BRAND SYSTEM: – takeout cups (paper + glass bottles) – packaging boxes (minimalist design) – tote bags (premium lifestyle) – labels, stickers, seals – menu cards with pricing ($6.50, $8.90, etc.) – small typography everywhere – subtle imperfections (realism) DESIGN LANGUAGE: – modern minimalist typography – Japanese-inspired layout – soft green palette – elegant spacing INCLUDE: – matcha latte – iced matcha – matcha desserts – combo sets – lifestyle shots The composition must feel like a high-end design agency presentation. Ultra-detailed, realistic, clean, aesthetic, and highly shareable.
```

By [@Preda2005](https://x.com/Preda2005/status/2049846981271699685)

---

<a id="freestylefly-case-376"></a>

## 泼洒抹茶街头手机照片

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case376.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case376.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
A realistic vertical smartphone photo of a spilled green iced drink on outdoor stone pavement, a transparent disposable plastic cup lying on its side inside the green puddle, clear plastic lid nearby, scattered ice cubes floating in the drink, small foam bubbles on the surface, green liquid naturally spreading across rough square floor tiles, strong midday sunlight, harsh realistic shadows, a dark human shadow silhouette cast across the ground and partially over the spill, accidental street moment, urban documentary photography, handheld phone camera perspective, slightly top-down angle, natural colors, realistic pavement texture, raw unedited photo look, high detail, authentic everyday scene, 9:16 vertical composition Negative Prompt: cartoon, illustration, anime, CGI, 3D render, fantasy style, studio lighting, overly perfect composition, overly clean floor, fake liquid, unrealistic reflections, plastic-looking liquid, oversaturated green, blurry, low resolution, distorted cup, melted plastic, extra cups, duplicated objects, readable brand logo, messy text, watermark, poster design, dramatic artificial lighting, excessive sharpening, over-processed, unrealistic shadow, floating ice, deformed perspective
```

By [@Shinning1010](https://x.com/Shinning1010/status/2050693240253214894)

---

<a id="freestylefly-case-402"></a>

## 3D 小红书个人资料卡

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case402.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case402.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
一只手中握着一张3D小红书个人资料卡，卡片中间方形镂空，一个女孩随意地坐在卡片镂空的边缘，温暖的米色和柔和的粉彩美学背景，逼真的深度和阴影，电影般的柔和光线，闪亮光滑的纹理，小红书风格的UI，漂浮的互动图标（点赞、评论、分享）带有发光的霓虹效果，闪光和光晕，背景中温馨的美学布置包括书籍、花瓶里的花和一台复古相机，梦幻氛围，Pixar风格+半现实主义融合，超高品质，4K，居中构图，高端影响者美学
```

By [@MrGafish](https://x.com/MrGafish/status/2052323461268467860)

---

<a id="freestylefly-case-428"></a>

## F1 直播转播围场截图

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case428.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case428.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
Ultra-realistic F1 live TV broadcast screenshot. A strikingly beautiful, 25-year-old young woman with bright light blue hair and captivating bright cerulean blue eyes is sitting in the VIP paddock / team garage during a Formula 1 race. Shown on the official live race broadcast as the girlfriend of an F1 driver, she is listening to the team radio through a professional racing headset. It is the final lap, and she is watching the garage monitors with a proud, enchanting smile. She wears a fitted white tank top, an oversized racing team jacket (with generic, unbranded or blank team logos) draped over her shoulders, large black team-radio headset with boom mic, gold jewelry, and soft glam makeup. A slim, unbranded paddock pass hangs naturally from her neck. Add realistic F1 broadcast graphics: "FINAL LAP" banner, lap counter showing final lap, driver timing tower on the left, small F1-style logo bug, "LIVE" indicator, and a lower-third identifying her as a driver partner / paddock guest (e.g., "MIA ANDERSEN - Paddock Guest / Partner"). No fake oversized badges, no selfie angle. Team staff (in generic kit), headsets, garage screens, and generic race equipment are blurred around her. Telephoto broadcast camera shot from across the garage, professional depth of field, compression artifacts, digital noise, bright paddock lighting, natural skin texture, no smoothing, 8k quality, cinematic lighting.
```

By [@bigwonbots](https://x.com/bigwonbots/status/2054573714012787059)

---

<a id="freestylefly-case-444"></a>

## 迪斯科镜面 3D App 图标

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case444.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case444.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
为【品牌名】生成一个高级 3D App 图标，圆角方形底板，玻璃与金属铬材质，迪斯科球镜面马赛克小方块质感，闪亮高光，柔和工作室灯光，干净极简背景，高端产品图标风格，Blender 3D 渲染，超精细 英文版： A premium 3D app icon for 【Product Name】, rounded square tile, glossy glass and chrome material, disco-ball mosaic mirror tiles, sparkling highlights, soft studio lighting, clean minimal background, high-end icon, Blender 3D render, ultra detailed
```

By [@vista8](https://x.com/vista8/status/2056308962778296715)

---

<a id="freestylefly-case-449"></a>

## 奢华机械腕表技术图鉴

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case449.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case449.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
2x2 grid 16:9, do this for 4 most expensive strangest watches ever made: class Haute_Horlogerie_DNA: def __init__(self): self.subject = "[TIMEPIECE]" self.parents = { "composition_parent": "Exploded movement diagram with transparent case", "material_parent": "Brushed titanium, sapphire crystal, rose gold gears, alligator leather", "graphic_parent": "Swiss manufacture technical brochure with elegant data panels", "atmosphere_parent": "Crisp daylight studio, pure white background, subtle reflection on polished surfaces" } self.mutations = { "semantic_mutation": "The balance wheel reveals a miniature cosmos ticking inside", "information_mutation": "Power reserve indicator, frequency, complication callouts, hand-finishing grades, assembly timeline", "medium_mutation": "Smooth matte premium paper with embossed logo", "scale_mutation": "Grain-level view of Côtes de Genève finishing and jewel bearings" } self.style_mix = [0.30, 0.30, 0.25, 0.10, 0.05] def generate_subject(self): subject = """ [TIMEPIECE] shown in its full mechanical glory. The dial, hands, movement, and strap float in perfect alignment against a bright, clean background. Every gear and spring is highlighted with exacting clarity. """ return render( subject, format="luxury watch advertisement with technical insert", title="[MODEL REFERENCE]", subtitle="[MANUFACTURE / COLLECTION]", constraints="bright white space, metallic brilliance, hyper-detailed, modern elegance" )
```

By [@Gdgtify](https://x.com/Gdgtify/status/2056928396991488312)

---

<a id="freestylefly-case-453"></a>

## 企业级商用画册视觉系统

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case453.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case453.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
请生成一套企业级商用画册视觉方案，主题为【品牌名称】的【行业 / 产品 / 解决方案】宣传画册。 整体风格：高端、专业、具有强视觉冲击力；避免传统 Word 排版感和普通 PPT 感。采用【深色科技美学 / 白色极简商务 / 高端工业风 / 艺术化品牌画册】风格。 画册内容包括： 1、封面与封底 2、企业介绍与品牌理念 3、核心产品与技术优势 4、应用场景与解决方案 5、客户案例与合作方式 6、全册系统预览图 要求： 版式要有设计感，图片、标题、数据、图标、留白和层级关系清晰；保持整套画册统一的品牌视觉系统；重点体现真实商业物料的完成度，避免简单文字排版。 结构规划： 1、封面 / 封底：建立品牌门面、行业气质和整体视觉调性。 2、企业介绍页：说明公司定位、能力边界和服务对象。 3、产品技术页：展示核心产品、技术优势和解决方案。 4、应用场景页：让用户看到产品能用在哪些行业。 5、案例 / 合作页：补充可信度和商业转化信息。 6、全册系统预览：验证风格统一性和整本画册的系统感。 如果已有企业资料，可以上传旧版企业画册、公司介绍文档、产品说明书、官网内容、PPT 提案、产品图片或案例图片，让 ChatGPT 完成三件事： 1、重新梳理内容结构，判断哪些内容适合做封面、企业介绍、产品页、案例页和合作页。 2、提炼画册主线，避免只堆资料，需要形成清晰的商业叙事。 3、统一视觉方向，让整本画册看起来像同一个品牌系统，避免不同页面拼贴感。 避坑： 1、避免一上来只说“生成一本画册”，否则容易变成模板图。 2、避免只堆文字，画册一定要有产品视觉、场景图、数据模块和设计层级。 3、避免只生成单页，最好补一张全册预览图，才能体现完整系统感。
```

By [@MrLarus](https://x.com/MrLarus/status/2056974720893939950)

---

<a id="freestylefly-case-477"></a>

## Instagram 餐桌俯拍创意

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case477.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case477.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
Top-down ultra-wide hyper-realistic shot of 4 real people seated at a square dining table. Pull the camera way back so a wide ring of empty floor surrounds the whole scene, giving a clean minimal composition. Scene [ATMOSPHERE + WARDROBE]: the four are styled in [OUTFIT STYLE]. Each one is doing something specific: [DESCRIBE EACH PERSON'S ACTION]. The table itself is a physical prop built to look like an Instagram post viewed from above: - A solid white band runs along the TOP and BOTTOM edges only, with no white on the left or right sides. - Top band: a small drawn profile avatar with [LOGO DESCRIPTION], the handle "[USERNAME]", a tiny blue verified check next to it, and a "..." on the far right. - Bottom band: red heart, comment bubble, and share icons painted on the left, bookmark icon on the right. The center of the table is one flat color: [EXACT COLOR + HEX CODE]. All food, drinks, props, and any hand interacting with them must stay strictly inside that central colored zone, nothing crosses the white bands or the table edge. The floor around the table is [FLOOR COLOR] to create clear visual separation. Professional studio lighting with crisp shadows, 8k, tack-sharp focus.
```

By [@iamaiistudio](https://x.com/iamaiistudio/status/2060210845225980366)

---

<a id="freestylefly-case-496"></a>

## 水雕品牌 Logo 六宫格

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case496.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case496.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
Create a premium 3x2 grid collage of iconic global brand logos recreated entirely from dynamic water formations, floating above a crystal-clear ocean under a vibrant blue sky. Each panel features a different logo sculpted from realistic transparent water, with detailed splashes, droplets, reflections, refractions, and flowing liquid textures. The water forms should look physically accurate, elegant, and instantly recognizable while remaining made completely of water.
```

By [@AIwithSynthia](https://x.com/AIwithSynthia/status/2062521441141088599)

---

<a id="freestylefly-case-510"></a>

## Bichon Shop 拟物 App 图标

<a href="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case510.jpg"><img src="https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/0999cbfa1f860086db384602ee5ee5485671cb58/data/images/case510.jpg" width="480" alt="Source example"></a>

**Prompt**

```text
A macOS app icon for an app named 'Bichon Shop'. A single squircle icon with smooth continuous rounded corners, centered on a white canvas with padding, occupying about 80% of the canvas. Modern light skeuomorphic macOS App Store style. Only one icon.
```

By [@iamaiistudio](https://x.com/iamaiistudio/status/2071923809788285125)

---

<a id="prompthero-7ee3e9f9ac7"></a>

## A minimalist design of the word &quot;PROMPTHERO&quot; forme\.\.\.

<a href="https://cdn.prompthero.com/ovfy1m3snqw4a4wn1wojjaetnik0-ideogram-2-a-minimalist-design-of-the-word-prompthero-formed-by-a-single-piece-of-red-rope-against-a-white-background-the.png"><img src="https://cdn.prompthero.com/ovfy1m3snqw4a4wn1wojjaetnik0-ideogram-2-a-minimalist-design-of-the-word-prompthero-formed-by-a-single-piece-of-red-rope-against-a-white-background-the.png" width="480" alt="After"></a>

**Prompt**

```text
A minimalist design of the word "PROMPTHERO" formed by a single piece of red rope against a white background. The rope twists and bends intricately to create the letterforms without breaks. The negative space within the loops helps define the letters. The design symbolizes connection and strength. The composition is simple yet detailed. The overall aesthetic is elegant, meaningful, and creatively brilliant, offering a unique interpretation of love through the art of knots.
```

By [@chorlo](https://prompthero.com/prompt/7ee3e9f9ac7-ideogram-2-a-minimalist-design-of-the-word-prompthero-formed-by-a-single-piece-of-red-rope-against-a-white-background-the)

---

<a id="prompthero-20e7743dd91"></a>

## An icon design, 3D, transportation icon, bicycles,\.\.\.

<a href="https://cdn.prompthero.com/p0eefi6x80effwi35hivexodpsud-midjourney-niji-mode-an-icon-design-3d-transportation-icon-bicycles-soft-light-nostalgic-feeling-pastel-colors-vintage-colors-muted-colors-classic-jerry-pinkney.png"><img src="https://cdn.prompthero.com/p0eefi6x80effwi35hivexodpsud-midjourney-niji-mode-an-icon-design-3d-transportation-icon-bicycles-soft-light-nostalgic-feeling-pastel-colors-vintage-colors-muted-colors-classic-jerry-pinkney.png" width="480" alt="After"></a>

**Prompt**

```text
An icon design, 3D, transportation icon, bicycles, soft light, nostalgic feeling, pastel colors, vintage colors, muted colors, classic, Jerry Pinkney, clean and neutral background::2 --q 2 --niji 5
```

[Source](https://prompthero.com/prompt/20e7743dd91-midjourney-niji-mode-an-icon-design-3d-transportation-icon-bicycles-soft-light-nostalgic-feeling-pastel-colors-vintage-colors-muted-colors-classic-jerry-pinkney)

---

**1** · [2](logos-2.md)

[← Home](../README.md)
