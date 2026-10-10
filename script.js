const d=document;
const body=d.body;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroVideo=d.querySelector('[data-hero-video]');
const skipIntro=d.querySelector('[data-skip-intro]');
let introFinished=false;
function finishIntro(){
  if(introFinished)return;
  introFinished=true;
  body.classList.remove('intro-active','intro-title-visible');
  body.classList.add('intro-done');
}
if(heroVideo&&!reduced){
  body.classList.add('intro-active');
  heroVideo.addEventListener('timeupdate',()=>{
    const showTitle=heroVideo.currentTime>.7&&heroVideo.currentTime<6.8;
    body.classList.toggle('intro-title-visible',showTitle);
  });
  heroVideo.addEventListener('ended',finishIntro,{once:true});
  heroVideo.addEventListener('error',finishIntro,{once:true});
  const attempt=heroVideo.play();
  if(attempt)attempt.catch(finishIntro);
  setTimeout(finishIntro,14000);
}else{
  finishIntro();
}
skipIntro?.addEventListener('click',()=>{
  heroVideo?.pause();
  if(heroVideo?.duration)heroVideo.currentTime=Math.max(0,heroVideo.duration-.05);
  finishIntro();
});

const nav=d.querySelector('[data-nav]');
const scrollFilm=d.querySelector('[data-film-scroll]');
const scrollFilmVideo=d.querySelector('[data-film-scroll-video]');
const scrollFilmLabel=d.querySelector('.film__scroll-label b');
let scrollFilmDuration=25.766667;
let scrollFilmTarget=0;
let lastFilmSeek=0;
if(scrollFilmVideo){
  scrollFilmVideo.addEventListener('loadedmetadata',()=>{
    if(Number.isFinite(scrollFilmVideo.duration))scrollFilmDuration=scrollFilmVideo.duration;
    scrollFilmVideo.pause();
    scrollFilmVideo.currentTime=.001;
  },{once:true});
  scrollFilmVideo.load();
}
function renderScrollFilm(now){
  if(scrollFilmVideo&&!reduced&&scrollFilmVideo.readyState>=1&&now-lastFilmSeek>42){
    const delta=scrollFilmTarget-scrollFilmVideo.currentTime;
    if(Math.abs(delta)>.018){
      const eased=Math.abs(delta)>.9?scrollFilmTarget:scrollFilmVideo.currentTime+delta*.48;
      try{scrollFilmVideo.currentTime=Math.max(0,Math.min(scrollFilmDuration-.02,eased))}catch{}
      lastFilmSeek=now;
    }
  }
  requestAnimationFrame(renderScrollFilm);
}
requestAnimationFrame(renderScrollFilm);

const waterline=d.querySelector('[data-waterline]');
const waterlineStage=waterline?.querySelector('.waterline__stage');
const waterlineDepth=d.querySelector('[data-waterline-depth]');
const closing=d.querySelector('[data-closing]');
const closingStage=closing?.querySelector('.closing__stage');
const soundToggle=d.querySelector('[data-sound-toggle]');
const soundLabel=d.querySelector('[data-sound-label]');
const soundtrack=d.querySelector('[data-soundtrack]');
let soundEnabled=false;
let soundFadeFrame=0;
function fadeSound(target,duration,onComplete){
  if(!soundtrack)return;
  cancelAnimationFrame(soundFadeFrame);
  const from=soundtrack.volume;
  const started=performance.now();
  const step=now=>{
    const p=Math.min(1,(now-started)/duration);
    const eased=1-Math.pow(1-p,3);
    soundtrack.volume=from+(target-from)*eased;
    if(p<1)soundFadeFrame=requestAnimationFrame(step);
    else onComplete?.();
  };
  soundFadeFrame=requestAnimationFrame(step);
}
soundToggle?.addEventListener('click',async()=>{
  if(!soundtrack)return;
  const next=!soundEnabled;
  if(next){
    soundtrack.volume=0;
    try{await soundtrack.play()}catch{return}
    fadeSound(.58,900);
  }else{
    fadeSound(0,650,()=>soundtrack.pause());
  }
  soundEnabled=next;
  soundToggle.setAttribute('aria-pressed',String(soundEnabled));
  soundToggle.setAttribute('aria-label',soundEnabled?'Turn ambient sound off':'Turn ambient sound on');
  if(soundLabel)soundLabel.textContent=soundEnabled?'Sound off':'Sound on';
});
const toggle=d.querySelector('.menu-toggle');
toggle?.addEventListener('click',()=>{
  const open=nav.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded',String(open));
  body.classList.toggle('is-locked',open);
});
nav?.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('menu-open');toggle?.setAttribute('aria-expanded','false');body.classList.remove('is-locked');
}));

const reveals=d.querySelectorAll('.reveal,.reveal-image,.type-reveal');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  const el=entry.target;
  el.classList.toggle('is-visible',entry.isIntersecting);
  el.dataset.motionDirection=body.dataset.scrollDirection||'down';
}),{threshold:.1,rootMargin:'-7% 0px -7%'});
reveals.forEach(el=>observer.observe(el));

d.querySelectorAll('.type-reveal').forEach(block=>{
  block.querySelectorAll('.type-line>span').forEach((line,index)=>line.style.setProperty('--line-index',index));
});
d.querySelectorAll('.principles__grid article').forEach((item,index)=>item.style.setProperty('--motion-index',index));

d.querySelectorAll('.reveal-words').forEach(el=>{
  el.innerHTML=el.textContent.trim().split(/\s+/).map(word=>`<span class="word">${word}</span>`).join(' ');
  const words=[...el.querySelectorAll('.word')];
  words.forEach((word,i)=>word.style.setProperty('--word-index',i));
  const wordObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    words.forEach(word=>word.classList.toggle('is-lit',entry.isIntersecting));
  }),{threshold:.35});
  wordObserver.observe(el);
});

let ticking=false;
let lastScrollY=scrollY;
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{
    const currentScrollY=scrollY;
    body.dataset.scrollDirection=currentScrollY>=lastScrollY?'down':'up';
    lastScrollY=currentScrollY;
    const max=d.documentElement.scrollHeight-innerHeight;
    const ratio=max>0?scrollY/max:0;
    const progress=d.querySelector('.scroll-progress span');
    if(progress)progress.style.transform=`scaleX(${ratio})`;
    nav?.classList.toggle('is-scrolled',scrollY>50);
    if(scrollFilm&&scrollFilmVideo&&!reduced&&scrollFilmDuration>0){
      const distance=Math.max(1,scrollFilm.offsetHeight-innerHeight);
      const filmProgress=Math.max(0,Math.min(1,-scrollFilm.getBoundingClientRect().top/distance));
      const targetTime=filmProgress*Math.max(0,scrollFilmDuration-.08);
      scrollFilmTarget=targetTime;
      scrollFilm.style.setProperty('--film-progress',filmProgress.toFixed(4));
      scrollFilm.style.setProperty('--film-progress-width',`${(filmProgress*100).toFixed(3)}%`);
      if(scrollFilmLabel){
        const seconds=Math.max(0,Math.floor(targetTime));
        scrollFilmLabel.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
      }
    }
    if(waterline&&waterlineStage&&!reduced){
      const rect=waterline.getBoundingClientRect();
      const distance=Math.max(1,rect.height-innerHeight);
      const p=Math.max(0,Math.min(1,-rect.top/distance));
      const tide=98-p*100;
      const wave=Math.sin(p*Math.PI*8);
      const shift=(p-.5)*90;
      waterlineStage.style.setProperty('--waterline-y',`${Math.max(0,tide).toFixed(2)}%`);
      waterlineStage.style.setProperty('--waterline-caustic-x',`${(shift*.28).toFixed(2)}px`);
      waterlineStage.style.setProperty('--waterline-caustic-y',`${(shift*-.16).toFixed(2)}px`);
      waterlineStage.style.setProperty('--waterline-copy-shift',`${((p-.5)*-18).toFixed(2)}px`);
      waterlineStage.style.setProperty('--waterline-refraction',`${(wave*5.5).toFixed(2)}px`);
      waterlineStage.style.setProperty('--waterline-lens',Math.abs(wave*.055).toFixed(4));
      waterlineStage.style.setProperty('--waterline-image-scale',(1.2-p*.18).toFixed(4));
      waterlineStage.style.setProperty('--waterline-image-y',`${(4-p*7).toFixed(2)}%`);
      waterlineStage.style.setProperty('--waterline-focus',`${((1-p)*10).toFixed(2)}px`);
      if(waterlineDepth)waterlineDepth.textContent=`${(p*3.8).toFixed(1)} m`;
    }
    if(closing&&closingStage&&!reduced){
      const rect=closing.getBoundingClientRect();
      const distance=Math.max(1,rect.height-innerHeight);
      const p=Math.max(0,Math.min(1,-rect.top/distance));
      const ramp=(start,span)=>Math.max(0,Math.min(1,(p-start)/span));
      closingStage.style.setProperty('--closing-progress',p.toFixed(4));
      closingStage.style.setProperty('--closing-intro',ramp(.06,.3).toFixed(4));
      closingStage.style.setProperty('--closing-logo',ramp(.16,.34).toFixed(4));
      closingStage.style.setProperty('--closing-line',ramp(.46,.28).toFixed(4));
      closingStage.style.setProperty('--closing-return',ramp(.68,.2).toFixed(4));
      closingStage.style.setProperty('--closing-reflection',(p*.14).toFixed(4));
      closingStage.style.setProperty('--closing-scale',(.82+p*.18).toFixed(4));
      closingStage.style.setProperty('--closing-blur',`${((1-p)*16).toFixed(2)}px`);
      closingStage.style.setProperty('--closing-clip',`${((1-p)*48).toFixed(2)}%`);
      closingStage.style.setProperty('--closing-drift',`${((p-.5)*64).toFixed(2)}px`);
      closingStage.style.setProperty('--closing-intro-lift',`${((1-p)*29).toFixed(2)}px`);
      closingStage.style.setProperty('--closing-reflection-shift',`${((1-p)*32).toFixed(2)}px`);
      closingStage.style.setProperty('--closing-line-shift',`${((1-p)*24).toFixed(2)}px`);
    }
    if(!reduced)d.querySelectorAll('[data-parallax]').forEach(el=>{
      const rect=el.getBoundingClientRect();
      const value=Math.max(-70,Math.min(70,(rect.top+rect.height/2-innerHeight/2)*-.06));
      el.style.setProperty('--parallax',value.toFixed(1));
    });
    ticking=false;
  });
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

const filmModal=d.querySelector('[data-film-modal]');
const filmFrame=d.querySelector('[data-film-frame]');
d.querySelector('[data-open-film]')?.addEventListener('click',()=>{
  if(filmFrame)filmFrame.src='https://player.vimeo.com/video/1234129528?autoplay=1&title=0&byline=0&portrait=0';
  filmModal?.showModal();body.classList.add('is-locked');
});
function closeFilm(){filmModal?.close();if(filmFrame)filmFrame.src='';body.classList.remove('is-locked')}
d.querySelector('[data-close-film]')?.addEventListener('click',closeFilm);
filmModal?.addEventListener('click',e=>{if(e.target===filmModal)closeFilm()});

const galleryIds=['1xi5PVGclxjtlXIiSwUf2-Ej26t8KjijK','1f8yqxjWJZ5r_M2_UrDe8adg0o8sKiMXt','1baSeOlBpk6YmSYN1aQWcI_Ss3EpKjfCI','1QzJM1XMP7MuiYACEJjRR6zARifFEG_lU','1aJTKizcioj_NWwINqHUIzaBGwK4hebgs','1QoD8jNN5EHCUtUbjN1qg3A539FnNOCTg','1jSz-mQ34xclgR5KrpHLHPJ3EneicTt-J','1aM2O0WvTL16LnWpMawUD-Jb-CIwkjS_Y','170CxGDI-wY8w_GTbvoZ3EBNOZyJcpJh7'];
const galleryTitles=['The Hidden Haven','The Homecoming','The Tidal Threshold','The Living Skin','The Living Waterline','The Living Heart','Dine-In','The Sanctuary','The Waterline'];
const lightbox=d.querySelector('[data-lightbox-modal]');
const lightboxImage=d.querySelector('[data-lightbox-image]');
const lightboxCaption=d.querySelector('[data-lightbox-caption]');
let activeImage=1;
function showImage(index){
  activeImage=(index+8)%9+1;
  if(lightboxImage){lightboxImage.src=`https://lh3.googleusercontent.com/d/${galleryIds[activeImage-1]}=w1800`;lightboxImage.alt=galleryTitles[activeImage-1]}
  if(lightboxCaption)lightboxCaption.textContent=`${String(activeImage).padStart(2,'0')} / ${galleryTitles[activeImage-1]}`;
}
d.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{
  showImage(Number(button.dataset.lightbox));lightbox?.showModal();body.classList.add('is-locked');
}));
function closeLightbox(){lightbox?.close();body.classList.remove('is-locked')}
d.querySelector('[data-lightbox-close]')?.addEventListener('click',closeLightbox);
d.querySelector('[data-lightbox-prev]')?.addEventListener('click',()=>showImage(activeImage-1));
d.querySelector('[data-lightbox-next]')?.addEventListener('click',()=>showImage(activeImage+1));
lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
addEventListener('keydown',e=>{
  if(!lightbox?.open)return;
  if(e.key==='ArrowLeft')showImage(activeImage-1);
  if(e.key==='ArrowRight')showImage(activeImage+1);
});
