// Deterministic content triage. Scores are metadata completeness, not aesthetic/model verification.
const rules=[
 ['ui-mockups',/ui\/ux|landing page|website mockup|app interface|interface mockup|social media (?:feed|post|interface)|livestream interface|live.stream screenshot|wechat moments|screenshot of|社交.{0,5}截图|直播.{0,8}截图|朋友圈|界面|网页|应用样机|直播间|微博|抖音.*截图|小红书.*截图|网站设计|ui设计/i],
 ['comics-storyboards',/storyboard|manga (?:page|spread)|comic (?:book|strip|page|panel)|(?:\d+|four|six|nine|twelve|sixteen)[ -]panel|漫画|分镜|故事板|连环画|动作分解/i],
 ['characters',/character (?:reference|design|sheet|bible|turnaround|model sheet)|pose sheet|角色(?:设计|设定|参考)|人设|三视图|角色表/i],
 ['infographics',/infographic|exploded (?:view|diagram)|technical (?:diagram|breakdown)|scientific diagram|educational (?:poster|chart)|knowledge card|流程图|信息图|科普|知识图谱|关系图谱|拆解图|解说图|百科|教学图|知识卡|分析报告|图解/i],
 ['logos',/\blogo\b|brand (?:identity|mark)|icon set|徽标|标志设计|品牌标识|图标/i],
 ['avatars',/\bavatar\b|profile (?:picture|photo)|sticker (?:set|pack)|line stickers|头像|表情包|贴纸/i],
 ['products',/product (?:photography|photo|shot|advertisement|campaign|packaging|detail|render|display)|commercial product|packaging (?:design|label)|e-commerce|ecommerce|amazon a\+|product label|商品|电商|产品(?:摄影|详情|包装|展示|广告)|包装设计|商业广告|香水瓶|商品摄影/i],
 ['posters',/poster|advertising banner|magazine cover|book cover|campaign poster|flyer|advertisement|海报|广告|封面|宣传画|宣传单|版式设计/i],
 ['travel',/travel (?:journal|map|scrapbook|poster)|city map|landscape photograph|旅游|旅行|游记|美食地图|城市地图|风景|山水/i],
 ['architecture',/architectural (?:design|render|visualization)|interior design|building design|floor plan|建筑设计|室内设计|空间设计|建筑效果|户型|建筑空间/i],
 ['illustrations',/illustration|watercolor|ink sketch|oil painting|anime.style|hand.drawn|colored pencil|cartoon|插画|水彩|手绘|涂鸦|动漫|二次元|油画|工笔画|素描|漫画风/i],
 ['portraits',/portrait|selfie|fashion (?:editorial|photograph|shoot)|(?:photo|photograph) of (?:a |an |the )?(?:young |adult )?(?:woman|man|girl|boy|person)|人像|写真|自拍|街拍|时尚大片|模特|肖像|摄影/i],
 ['creative-art',/surreal|concept art|3d render|diorama|miniature|sculpture|collage|创意|超现实|微缩|雕塑|拼贴|艺术|概念/i],
];
const tags=[
 ['cinematic',/cinematic|电影感|电影级|电影质感/],['ccd',/\bccd\b/],['film',/35mm|film grain|analog film|胶片/],['photorealistic',/photoreal|hyper.realistic|ultra.realistic|写实|超真实|超写实/],['anime',/anime|manga|动漫|二次元/],['watercolor',/watercolor|watercolour|水彩/],['3d',/\b3d\b|\bc4d\b|三维/],['minimalist',/minimalis|极简/],['editorial',/editorial|杂志|时尚大片/],['vintage',/vintage|retro|复古/],['product',/product|商品|电商/],['typography',/typography|lettering|排版|字体/],['identity-preserving',/preserv.{0,45}(?:identity|face|facial)|identity reference|same face|保持.{0,16}(?:身份|五官|面部)|保留.{0,16}(?:五官|身份|脸)/],['multi-panel',/collage|multi.panel|\bgrid\b|storyboard|宫格|拼贴|分镜/],['template',/\{argument name=|\{\{|\[subject\]|\[item\]|【主题|主体\/主题/],['animation',/\b(?:gif|animation|animated)\b|动图|动画/]
];
const explicitRef=/\b(?:uploaded|attached|provided|input|source|reference|original)\s+(?:(?:face|portrait|character|product|model|first|second|identity)\s+){0,3}(?:image|photo|portrait|picture|logo|sheet|reference)\b|\breference[_ ]?\d+\b|\bimage\s*[12]\b|\b(?:uploaded|attached|provided)\s+(?:reference|photo|image|logo)\b|参考图|参考照片|上传.{0,8}(?:图|照片)|附图|附带.{0,6}图|原图|输入图|添付画像|画像[12]/i;
const editObject=[
 ['object-removal',/^(?:.{0,45})?(?:remove|erase|delete)\s+(?:only\s+)?(?:the|a|an|all|any)\b|(?:移除|去除|删除).{0,15}(?:物体|物品|人物|花|背景|文字)|remove.{0,35}(?:from the (?:image|photo|hand)|without changing)/i],
 ['text-editing',/(?:replace|change|edit|correct|modify)\s+(?:only\s+)?(?:the\s+)?(?:text|headline|caption|word|letter|title|logo text)|(?:修改|替换|改成).{0,12}(?:文字|标题|字样)|文字.{0,10}(?:修改|替换)/i],
 ['background-change',/(?:change|replace|swap)\s+(?:only\s+)?(?:the\s+)?background|背景.{0,10}(?:替换|改成|更换)|(?:更换|替换|改变)背景/i],
 ['outfit-change',/(?:change|replace|swap)\s+(?:only\s+)?(?:the\s+)?(?:outfit|clothes|clothing|shirt|dress)|换装|更换服装|替换衣服/i],
 ['hair-makeup',/(?:change|replace)\s+(?:the\s+)?(?:hair colo[u]?r|hairstyle|makeup)|换发色|更换发型|修改妆容/i],
 ['restoration',/(?:restore|repair)\s+(?:the\s+)?(?:old|damaged|faded)\s+(?:photo|image)|老照片修复|修复老照片/i],
 ['enhancement',/(?:enhance|upscale|denoise|sharpen)\s+(?:the\s+)?(?:photo|image)|图片增强|提升清晰度|无损放大/i],
 ['expansion',/outpaint|expand\s+(?:the\s+)?(?:canvas|image)|扩图|画面扩展/i],
 ['object-replacement',/(?:replace|swap)\s+(?:only\s+)?(?:the\s+)?(?:object|person|people|flower)|替换人物|替换物体/i],
];
const transform=/\btransform\s+(?:only\s+)?(?:the|this|my|your|an|a)\b|\bconvert\s+(?:the|this|my)\b|\b(?:restyle|style transfer)\b|(?:转换|转成|变成|重绘|改绘|风格化)|(?:将|把).{0,20}(?:照片|原图|参考图|人物).{0,25}(?:变成|转化|转换|改成|绘制)/i;
const style=/illustration|sketch|watercolor|anime|cartoon|doodle|chibi|painting|graphite|hand.drawn|pixel art|crochet|clay|collectible figure|插画|手绘|动漫|水彩|素描|涂鸦|重绘|黏土|玩偶|风格/i;
const norm=s=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export function classifyContent(r){
 const title=r.title.en??r.title.zh??'',p=r.prompt?.original??'',head=p.replace(/^\s*\[(?:中文|English)\]\s*/i,'').slice(0,1100),path=r.provenance.collectedFrom[0].path;
 const missing=/^\s*(?:原文未公开|提示词未公开|未提供提示词|prompt (?:not|was not) (?:provided|published|available)|no prompt (?:provided|available))/i.test(p);
 const reference=explicitRef.test(p)||/\b(?:same person|same face|use this character|use the first image)\b|同一个人|使用这个角色/i.test(head)||r.inputMode==='reference-to-image';
 const isEditPath=/\/editing\.md$/.test(path),specific=editObject.find(([,re])=>re.test(head));
 const preserve=/keep.{0,80}(?:background|everything else|all other|original pixels|unchanged)|preserv.{0,60}(?:exact pose|original background|composition|original pixels)|do not change anything else|原画的画素|元画の画素|其他.{0,12}不变|背景.{0,8}不变|保持原始.{0,12}(?:构图|背景)|保持.{0,8}原图/i.test(p);
 let type='generation',category='other',mode='unknown',confidence='medium',reason='prompt-category';
 if(missing)return {type:'unclassified',category:'other',inputMode:'unknown',confidence:'low',reason:'prompt-unavailable'};
 const overrides={
  'evolink-editing-case-237':['generation','architecture','reference-to-image'],
  'evolink-editing-case-238':['editing','composition','image-editing'],
  'evolink-editing-case-239':['editing','portrait-editing','image-editing'],
  'evolink-editing-case-240':['editing','composition','image-editing'],
  'evolink-gpt-image-2-6-case-252':['editing','object-removal','image-editing'],
  'evolink-gpt-image-2-6-case-253':['editing','background-change','image-editing'],
  'evolink-gpt-image-2-6-case-258':['editing','object-replacement','image-editing'],
  'freestylefly-case-519':['generation','products','reference-to-image'],
  'freestylefly-case-530':['editing','restyle','image-editing'],
 };
 if(overrides[r.id]){[type,category,mode]=overrides[r.id];return {type,category,inputMode:mode,confidence:'high',reason:'reviewed-rule-override'};}
 if(specific&&(reference||preserve||isEditPath||/^(?:remove|erase|replace|edit|change|restore|enhance|upscale|outpaint)\b/i.test(head.trim()))){return {type:'editing',category:specific[0],inputMode:'image-editing',confidence:'medium',reason:'explicit-edit-operation'};}
 if(reference&&transform.test(head)&&style.test(head)&&!/(?:character reference sheet|pose sheet|storyboard|analysis sheet|character bible)/i.test(head)){return {type:'editing',category:'restyle',inputMode:'image-editing',confidence:'medium',reason:'reference-style-transformation'};}
 if(reference&&preserve&&/\b(?:edit|modify|transform|replace|change)\b|修改|调整|替换/i.test(head)){return {type:'editing',category:/collage|composite|拼贴|合成/i.test(head)?'composition':'portrait-editing',inputMode:'image-editing',confidence:'medium',reason:'preserve-original-and-edit'};}
 if(isEditPath){return {type:'editing',category:'other',inputMode:'image-editing',confidence:'low',reason:'source-editing-category'};}
 const explicitType=head.match(/["'](?:type|master_prompt_type|image_type)["']\s*:\s*["']([^"']+)["']/i)?.[1]??'';
 const ranked=rules.map(([cat,re],i)=>({cat,score:(re.test(explicitType)?7:0)+(re.test(head.slice(0,250))?4:0)+(re.test(head)?2:0)+(re.test(title)?1:0),i})).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.i-b.i);
 if(ranked.length){category=ranked[0].cat;confidence=ranked[0].score>=6&&(!ranked[1]||ranked[0].score>ranked[1].score)?'high':'medium';}
 else {const sourceCats={'portraits.md':'portraits','character-sheets.md':'characters','illustration.md':'illustrations','advertising.md':'products','travel-journals.md':'travel','sequential-art.md':'comics-storyboards'};category=sourceCats[path.split('/').at(-1)]??'other';confidence='low';reason='source-fallback';}
 if(reference)mode='reference-to-image';
 else if(r.inputMode==='text-to-image'||/^(?:create|generate|draw|design|a |an |the |hyper|ultra|realistic|cinematic|photoreal|生成|创建|画|设计|绘制|\{)/i.test(head.trim()))mode='text-to-image';
 else mode='unknown';
 return {type,category,inputMode:mode,confidence,reason};
}
// A connected component links records by the same original post OR exact normalized prompt.
export function selectCanonical(rows,duplicateGroups){
 const byId=new Map(rows.map(r=>[r.id,r])),parent=new Map(rows.map(r=>[r.id,r.id]));
 const root=id=>{while(parent.get(id)!==id){parent.set(id,parent.get(parent.get(id)));id=parent.get(id);}return id;};
 for(const group of duplicateGroups){if(!['exact-prompt','same-post'].includes(group.kind))continue;const first=root(group.ids[0]);for(const id of group.ids.slice(1))parent.set(root(id),first);}
 const components=new Map();
 for(const r of rows){const key=root(r.id),items=components.get(key)??[];items.push(r);components.set(key,items);}
 const compare=(a,b)=>{
  const score=r=>[Number(r.visible),Number(r.quality.rights!=='pending-review'),Number(Boolean(r.provenance.originalSource.url)),Number(Boolean(r.provenance.originalSource.author)&&!r.quality.flags.includes('generic-title-review')),Number(r.sourcePreview.images.some(m=>m.role==='output')),Number(r.sourcePreview.images.length>0),r.quality.score];
  const x=score(a),y=score(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];
  return a.id.localeCompare(b.id,'en',{numeric:true});
 };
 const removed=[],kept=[];
 for(const component of components.values()){
  component.sort(compare);const winner=component[0];kept.push(winner.id);
  if(component.length===1)continue;
  const ids=new Set(component.map(r=>r.id));
  const evidence=duplicateGroups.filter(g=>['exact-prompt','same-post'].includes(g.kind)&&g.ids.some(id=>ids.has(id))).map(g=>({kind:g.kind,ids:g.ids}));
  for(const r of component.slice(1))removed.push({id:r.id,keptId:winner.id,wasVisible:r.visible,source:r.provenance.collectedFrom[0].url,evidence:evidence.filter(g=>g.ids.includes(r.id)).map(g=>g.kind)});
 }
 removed.sort((a,b)=>a.id.localeCompare(b.id,'en',{numeric:true}));kept.sort((a,b)=>a.localeCompare(b,'en',{numeric:true}));
 return {removed,kept};
}

export function govern(records){
 const exact=new Map(),posts=new Map(),images=new Map(),prefixes=new Map();
 const add=(map,k,id)=>{if(!k)return;const a=map.get(k)??[];if(!a.includes(id))a.push(id);map.set(k,a);};
 for(const r of records){const p=norm(r.prompt.original);add(exact,p,r.id);add(posts,r.provenance.originalSource.postId,r.id);for(const m of r.sourcePreview.images)add(images,m.url,r.id);if(p.length>=160)add(prefixes,p.slice(0,160),r.id);}
 const duplicates=[];for(const [kind,map] of [['exact-prompt',exact],['same-post',posts],['same-image-url',images],['same-prompt-prefix',prefixes]])for(const ids of map.values())if(ids.length>1)duplicates.push({kind,ids:[...ids].sort()});
 const flagged=new Map();for(const g of duplicates)for(const id of g.ids){const a=flagged.get(id)??[];if(!a.includes(g.kind))a.push(g.kind);flagged.set(id,a);}
 const metadata={},rows=[];
 for(const r of records){const c=classifyContent(r),title=r.title.en??r.title.zh??'',p=r.prompt.original,flags=[];
 if(c.reason==='prompt-unavailable')flags.push('missing-original-prompt');
 if(!r.sourcePreview.images.length)flags.push('missing-image-url');
 if(!r.provenance.originalSource.url)flags.push('missing-original-post-url');
 if(c.confidence==='low'||c.category==='other')flags.push('classification-review');
 if(c.inputMode==='unknown')flags.push('input-mode-review');
 if(r.rights.prompt==='unknown'||r.rights.media==='unknown')flags.push('rights-review');
 if(/^(?:综合应用场景图|图像生成案例图|写实摄影风格图|信息图可视化设计|主题海报版式设计|建筑空间场景图|界面交互设计图|品牌视觉识别图|应用界面样机图)$/.test(title))flags.push('generic-title-review');
 for(const f of flagged.get(r.id)??[])flags.push('duplicate-candidate:'+f);
 const visible=!flags.includes('missing-original-prompt')&&!flags.includes('missing-image-url');
 const tagList=tags.filter(([,re])=>re.test((title+' '+p).toLowerCase())).map(([tag])=>tag);
 if(c.inputMode==='reference-to-image')tagList.push('reference-image');
 if(c.type==='editing')tagList.push('image-editing');
 const score=(visible?2:0)+(r.provenance.originalSource.url?1:0)+(c.confidence==='high'?1:0)+(c.inputMode!=='unknown'?1:0);
 const item={...c,tags:[...new Set(tagList)],quality:{status:visible?'metadata-complete':'needs-content-review',score,flags,imageAvailability:'unchecked',imagePromptMatch:'unchecked',reproduction:'untested',rights:'pending-review'},visible};
 metadata[r.id]=item;rows.push({...r,...c,tags:item.tags,quality:item.quality,visible});
 }
 const dedup=selectCanonical(rows,duplicates), removedById=new Map(dedup.removed.map(r=>[r.id,r]));
 for(const r of rows){const dropped=removedById.get(r.id);if(dropped){r.visible=false;r.quality={...r.quality,status:'duplicate-excluded',flags:[...r.quality.flags,'duplicate-excluded']};metadata[r.id]={...metadata[r.id],visible:false,quality:r.quality,duplicateOf:dropped.keptId};}}
 const counts={};for(const r of rows.filter(r=>r.visible)){const k=r.type+'/'+r.category;counts[k]=(counts[k]??0)+1;}
 return {rows,metadata,duplicates,counts,dedup};
}
// Presentation taxonomy: all image-conditioned prompts belong to one gallery.
export function galleryView(rows,taxonomy){
 const galleryType=r=>r.type==='editing'||r.inputMode==='image-editing'||r.inputMode==='reference-to-image'?'reference':'generation';
 return {rows:rows.filter(r=>r.visible).map(r=>({...r,operationType:r.type,type:galleryType(r)})),taxonomy:{generation:taxonomy.generation,reference:[...new Set([...taxonomy.generation,...taxonomy.editing])]}};
}

export function governanceFiles(result){
 const json=v=>JSON.stringify(v,null,2)+'\n',rows=result.rows,visible=rows.filter(r=>r.visible),count=(list,key)=>list.reduce((m,r)=>(m[key(r)]=(m[key(r)]??0)+1,m),{});
 const flags=count(rows.flatMap(r=>r.quality.flags),x=>x);
 const report={total:rows.length,visible:visible.length,hidden:rows.length-visible.length,duplicateExcluded:result.dedup.removed.length,duplicateExcludedFromGallery:result.dedup.removed.filter(r=>r.wasVisible).length,uniqueCases:result.dedup.kept.length,galleryGroups:count(visible,r=>r.type==='editing'||r.inputMode==='image-editing'||r.inputMode==='reference-to-image'?'reference':'generation'),types:count(visible,r=>r.type),inputModes:count(visible,r=>r.inputMode),categories:result.counts,confidence:count(rows,r=>r.confidence),flags,duplicateGroups:count(result.duplicates,x=>x.kind),rightsPending:rows.filter(r=>r.quality.flags.includes('rights-review')).length,checks:{imageHttp:'not-run',imagePromptMatch:'not-run',perceptualHash:'not-run',semanticEmbedding:'not-run',rights:'not-cleared'}};
 let md='# Content governance report\n\nGenerated from source JSON. Classification is heuristic and provisional; completeness is not aesthetic quality. No image network, visual matching, reproduction or rights clearance is claimed.\n\n';
 md+='- Source cases: '+report.total+'\n- Unique cases: '+report.uniqueCases+'\n- Gallery cases: '+report.visible+'\n- Duplicate records excluded: '+report.duplicateExcluded+' ('+report.duplicateExcludedFromGallery+' previously visible)\n- Unique cases withheld for missing content: '+(report.uniqueCases-report.visible)+'\n- Rights pending: '+report.rightsPending+'\n\n## Gallery groups\n\n'+Object.entries(report.galleryGroups).map(([k,v])=>'- '+k+': '+v).join('\n')+'\n\n## Internal operation classification\n\n| Category | Count |\n|---|---:|\n'+Object.entries(report.categories).sort().map(([k,v])=>'| '+k+' | '+v+' |').join('\n')+'\n\n## Input modes\n\n'+Object.entries(report.inputModes).map(([k,v])=>'- '+k+': '+v).join('\n')+'\n\n## Review flags\n\n'+Object.entries(flags).sort().map(([k,v])=>'- '+k+': '+v).join('\n')+'\n\n## Withheld cases\n\n'+rows.filter(r=>!r.visible&&!result.metadata[r.id].duplicateOf).map(r=>'- ['+r.id+']('+r.provenance.collectedFrom[0].url+'): '+r.quality.flags.filter(f=>f.startsWith('missing-')).join(', ')).join('\n')+'\n\n## Duplicate candidates\n\nKeep one representative for each connected group sharing an original post ID or exact normalized full prompt. Raw source records are retained for provenance only, not in the canonical catalog or galleries. Prefix-only and image-only similarities are not automatically excluded. See data/governance/deduplication.json for removed-to-kept mappings.\n\n## Remaining manual checks\n\nImage availability, visual prompt matching, perceptual hash, semantic similarity, original-source verification and per-asset rights clearance. Unknown rights do not establish permission; existing published material has not been cleared. Review before redistributing or commercial use.\n';
 return {'data/governance/cases.json':json(result.metadata),'data/governance/duplicates.json':json(result.duplicates),'data/governance/deduplication.json':json(result.dedup),'data/governance/canonical.json':json(visible.map(r=>r.id)),'data/governance/report.json':json(report),'docs/governance-report.md':md};
}
