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
const scrollFilmFrame=d.querySelector('[data-film-scroll-frame]');
const scrollFilmLabel=d.querySelector('.film__scroll-label b');
let scrollFilmDuration=0;
let scrollFilmTarget=-1;
function postToScrollFilm(method,value){
  if(!scrollFilmFrame?.contentWindow)return;
  scrollFilmFrame.contentWindow.postMessage({method,...(value===undefined?{}:{value})},'https://player.vimeo.com');
}
addEventListener('message',event=>{
  if(event.origin!=='https://player.vimeo.com'||event.source!==scrollFilmFrame?.contentWindow)return;
  let data=event.data;
  if(typeof data==='string'){try{data=JSON.parse(data)}catch{return}}
  if(data?.event==='ready'){
    postToScrollFilm('pause');
    postToScrollFilm('getDuration');
  }
  if(data?.method==='getDuration'&&Number.isFinite(data.value))scrollFilmDuration=data.value;
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
    if(scrollFilm&&scrollFilmFrame&&!reduced&&scrollFilmDuration>0){
      const distance=Math.max(1,scrollFilm.offsetHeight-innerHeight);
      const filmProgress=Math.max(0,Math.min(1,-scrollFilm.getBoundingClientRect().top/distance));
      const targetTime=filmProgress*Math.max(0,scrollFilmDuration-.08);
      if(Math.abs(scrollFilmTarget-targetTime)>.055){
        scrollFilmTarget=targetTime;
        postToScrollFilm('setCurrentTime',targetTime);
      }
      scrollFilm.style.setProperty('--film-progress',filmProgress.toFixed(4));
      if(scrollFilmLabel){
        const seconds=Math.max(0,Math.floor(targetTime));
        scrollFilmLabel.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
      }
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
