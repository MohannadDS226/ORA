const d=document;
const body=d.body;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

addEventListener('load',()=>setTimeout(()=>d.querySelector('.loader')?.classList.add('is-gone'),300));

const nav=d.querySelector('[data-nav]');
const toggle=d.querySelector('.menu-toggle');
toggle?.addEventListener('click',()=>{
  const open=nav.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded',String(open));
  body.classList.toggle('is-locked',open);
});
nav?.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('menu-open');toggle?.setAttribute('aria-expanded','false');body.classList.remove('is-locked');
}));

const reveals=d.querySelectorAll('.reveal,.reveal-image');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
}),{threshold:.12,rootMargin:'0px 0px -6%'});
reveals.forEach(el=>observer.observe(el));

d.querySelectorAll('.reveal-words').forEach(el=>{
  el.innerHTML=el.textContent.trim().split(/\s+/).map(word=>`<span class="word">${word}</span>`).join(' ');
  const words=[...el.querySelectorAll('.word')];
  const wordObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    words.forEach((word,i)=>setTimeout(()=>word.classList.add('is-lit'),i*65));
    wordObserver.disconnect();
  }),{threshold:.35});
  wordObserver.observe(el);
});

let ticking=false;
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{
    const max=d.documentElement.scrollHeight-innerHeight;
    const ratio=max>0?scrollY/max:0;
    const progress=d.querySelector('.scroll-progress span');
    if(progress)progress.style.transform=`scaleX(${ratio})`;
    nav?.classList.toggle('is-scrolled',scrollY>50);
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
