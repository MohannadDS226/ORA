"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const chapters = [
  { id: "hidden-haven", no: "01", title: "The Hidden Haven", image: "/assets/01-hidden-haven.webp", copy: "A private world held between cultivated landscape and open water." },
  { id: "homecoming", no: "02", title: "The Homecoming", image: "/assets/02-homecoming.webp", copy: "Arrival slows into ritual. The threshold is not crossed, but discovered." },
  { id: "tidal-threshold", no: "03", title: "The Tidal Threshold", image: "/assets/03-tidal-threshold.webp", copy: "Architecture meets the lagoon without drawing a hard edge between them." },
  { id: "living-skin", no: "04", title: "The Living Skin", image: "/assets/04-living-skin.webp", copy: "Layered planting, filtered light and shelter form a facade that feels alive." },
  { id: "living-waterline", no: "05", title: "The Living Waterline", image: "/assets/05-living-waterline.webp", copy: "The water is not a view from the home. It is part of the home." },
  { id: "living-heart", no: "06", title: "The Living Heart", image: "/assets/06-living-heart.webp", copy: "At the centre, daily life gathers beneath light, air and a living canopy." },
  { id: "dine-in", no: "07", title: "Dine-In", image: "/assets/07-dine-in.webp", copy: "A place where growing, gathering and dining become one continuous act." },
  { id: "sanctuary", no: "08", title: "The Sanctuary", image: "/assets/08-sanctuary.webp", copy: "Privacy is shaped through softness: filtered shadow, quiet material and water." },
  { id: "waterline", no: "09", title: "The Waterline", image: "/assets/09-waterline.webp", copy: "At the final edge, home and horizon become almost indistinguishable." },
];

const systems = [
  { index: "I", title: "Harvest", text: "Edible landscape is woven into the architecture, turning cultivation into a visible part of everyday life." },
  { index: "II", title: "Water", text: "The lagoon is treated as context, climate and experience—a living boundary rather than a backdrop." },
  { index: "III", title: "Energy", text: "Passive shade, natural airflow and considered orientation reduce the home’s dependence on mechanical comfort." },
  { index: "IV", title: "Ecology", text: "Planting creates privacy, habitat and seasonal change, allowing the haven to mature with time." },
];

export default function Home() {
  const [introOpen, setIntroOpen] = useState(true);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [muted, setMuted] = useState(true);
  const filmRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = introOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [introOpen]);

  useEffect(() => {
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      }),
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((target) => revealObserver.observe(target));

    let ticking = false;
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (selectedChapter === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") setSelectedChapter((selectedChapter + chapters.length - 1) % chapters.length);
      if (event.key === "ArrowRight") setSelectedChapter((selectedChapter + 1) % chapters.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedChapter]);

  useEffect(() => {
    const elements = chapters.map((chapter) => document.getElementById(chapter.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = elements.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActiveChapter(index);
        }
      }),
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [introOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleSound = () => {
    if (!filmRef.current) return;
    filmRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <main>
      <div className="page-progress" ref={progressRef} aria-hidden="true" />
      <div className={`intro ${introOpen ? "intro--open" : "intro--closed"}`} aria-hidden={!introOpen}>
        <video className="intro__film" autoPlay muted loop playsInline poster="/assets/reel-thumbnail.webp">
          <source src="/assets/ora-intro.mp4" type="video/mp4" />
        </video>
        <div className="intro__veil" />
        <div className={`intro__content ${ready ? "is-ready" : ""}`}>
          <span className="intro__chapter">An original experience by Mohannad Haikal</span>
          <p className="eyebrow">A self-sustaining floating haven</p>
          <img src="/assets/logo.png" alt="ORA" className="intro__logo" />
          <p className="intro__line">A home that belongs to the water.</p>
          <button className="enter-button" onClick={() => setIntroOpen(false)} type="button"><span>Enter ORA</span></button>
        </div>
        <button className="intro__skip" onClick={() => setIntroOpen(false)} type="button">Skip intro</button>
      </div>

      <header className="site-header">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
          <img src="/assets/logo.png" alt="ORA" />
        </button>
        <p className="header-caption">The Self-Sustaining Floating Haven</p>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} type="button">
          <span>{menuOpen ? "Close" : "Explore"}</span><i aria-hidden="true" />
        </button>
      </header>

      <nav className={`menu ${menuOpen ? "menu--open" : ""}`} aria-hidden={!menuOpen}>
        <div className="menu__inner">
          {["Manifesto", "Journey", "Living systems", "Film", "Creator"].map((label, index) => {
            const ids = ["manifesto", "journey", "systems", "film", "creator"];
            return <button key={label} onClick={() => scrollTo(ids[index])}><small>0{index + 1}</small>{label}</button>;
          })}
        </div>
      </nav>

      <section className="hero" aria-label="ORA introduction">
        <div className="hero__ambient" aria-hidden="true" />
        <img className="hero__image" src="/assets/01-hidden-haven.webp" alt="ORA floating haven surrounded by water and dense planting" />
        <div className="hero__grain" aria-hidden="true" />
        <div className="hero__title">
          <p>Between earth</p>
          <h1 aria-label="ORA"><span>O</span><span>R</span><span>A</span></h1>
          <p>and open water</p>
        </div>
        <button className="scroll-cue" onClick={() => scrollTo("manifesto")} aria-label="Begin the story"><span>Begin the story</span><i /></button>
        <p className="hero__credit">A conceptual world by Mohannad Haikal</p>
      </section>

      <section id="manifesto" className="manifesto section-pad">
        <p className="section-index">00 — Prologue</p>
        <div className="manifesto__copy" data-reveal>
          <p className="drop">What if a home did not resist its environment, but learned to live with it?</p>
          <h2 className="kinetic"><span className="line"><span>Not an escape from nature.</span></span><span className="line"><span><em>A return to it.</em></span></span></h2>
          <div className="manifesto__body">
            <p>ORA imagines a floating home where architecture, water and cultivation form a single living system. It is a retreat shaped by natural rhythms rather than fixed boundaries.</p>
            <p>Every threshold opens to the lagoon. Every planted layer offers food, shade or privacy. The architecture does less so that life can do more.</p>
          </div>
        </div>
      </section>

      <section id="journey" className="journey-head section-pad">
        <p className="section-index">01 — The journey</p>
        <h2 className="kinetic" data-reveal><span className="line"><span>Nine moments.</span></span><span className="line"><span>One living horizon.</span></span></h2>
        <p>Move slowly. ORA reveals itself the way a place does—not all at once, but through arrival, passage, gathering and rest.</p>
      </section>

      <div className="chapters">
        <aside className="chapter-rail" aria-label="Chapter progress">
          <span>{String(activeChapter + 1).padStart(2, "0")}</span>
          <div><i style={{ transform: `scaleY(${(activeChapter + 1) / chapters.length})` }} /></div>
          <span>09</span>
        </aside>
        {chapters.map((chapter, index) => (
          <section id={chapter.id} className={`chapter chapter--${index % 2 ? "right" : "left"}`} key={chapter.id}>
            <span className="chapter__ghost" aria-hidden="true">{chapter.no}</span>
            <div className="chapter__ambient" style={{ backgroundImage: `url(${chapter.image})` }} aria-hidden="true" />
            <button className="chapter__frame chapter__open" onClick={() => setSelectedChapter(index)} aria-label={`Enlarge ${chapter.title}`} type="button">
              <img src={chapter.image} alt={`${chapter.title}, an architectural visualization from ORA`} loading={index < 2 ? "eager" : "lazy"} />
              <span className="chapter__view"><i />View frame</span>
            </button>
            <div className="chapter__copy" data-reveal>
              <p>{chapter.no} — ORA</p>
              <h3>{chapter.title}</h3>
              <span>{chapter.copy}</span>
            </div>
          </section>
        ))}
      </div>

      <section id="systems" className="systems section-pad">
        <div className="systems__intro" data-reveal>
          <p className="section-index">02 — Living systems</p>
          <h2 className="kinetic"><span className="line"><span>A haven that</span></span><span className="line"><span><em>gives back.</em></span></span></h2>
          <p>Self-sufficiency is not hidden behind the architecture. It becomes part of the atmosphere, the daily ritual and the beauty of the place.</p>
        </div>
        <div className="systems__list">
          {systems.map((system) => <article key={system.index} data-reveal><span>{system.index}</span><h3>{system.title}</h3><p>{system.text}</p></article>)}
        </div>
      </section>

      <section id="film" className="film-section">
        <div className="film-section__head section-pad">
          <div data-reveal><p className="section-index">03 — The film</p><h2 className="kinetic"><span className="line"><span>Enter the</span></span><span className="line"><span><em>living island.</em></span></span></h2></div>
          <p>A cinematic passage from first light to the last horizon. Best experienced with sound.</p>
        </div>
        <div className="film-shell">
          <video ref={filmRef} className="film" controls playsInline muted={muted} poster="/assets/reel-thumbnail.webp" preload="metadata">
            <source src="/assets/ora-film-web.mp4" type="video/mp4" />
          </video>
          <button className="sound-button" onClick={toggleSound} type="button">{muted ? "Enable sound" : "Mute"}</button>
        </div>
      </section>

      <section id="creator" className="creator section-pad">
        <div className="creator__mark"><img src="/assets/logo.png" alt="ORA" /></div>
        <div className="creator__copy" data-reveal>
          <p className="section-index">04 — Creator</p>
          <h2 className="kinetic"><span className="line"><span>Imagined and visualized</span></span><span className="line"><span>by <em>Mohannad Haikal.</em></span></span></h2>
          <p>ORA is an original architectural visualization project exploring a quieter relationship between home, ecology and water.</p>
          <div className="creator__roles"><span>Concept</span><span>Art direction</span><span>Architectural visualization</span><span>Film</span></div>
        </div>
      </section>

      <Dialog open={selectedChapter !== null} onOpenChange={(open) => !open && setSelectedChapter(null)}>
        {selectedChapter !== null && (
          <DialogContent className="cinema-dialog" showCloseButton={false}>
            <DialogTitle className="sr-only">{chapters[selectedChapter].title}</DialogTitle>
            <DialogDescription className="sr-only">{chapters[selectedChapter].copy}</DialogDescription>
            <div className="cinema-dialog__ambient" style={{ backgroundImage: `url(${chapters[selectedChapter].image})` }} aria-hidden="true" />
            <div className="cinema-dialog__top">
              <span>{chapters[selectedChapter].no} / 09</span>
              <span>ORA — The Floating Haven</span>
              <DialogClose className="cinema-dialog__close">Close</DialogClose>
            </div>
            <div className="cinema-dialog__stage">
              <img src={chapters[selectedChapter].image} alt={chapters[selectedChapter].title} />
              <div className="cinema-dialog__caption">
                <p>{chapters[selectedChapter].no} — Chapter</p>
                <h3>{chapters[selectedChapter].title}</h3>
                <span>{chapters[selectedChapter].copy}</span>
              </div>
            </div>
            <div className="cinema-dialog__nav">
              <button onClick={() => setSelectedChapter((selectedChapter + chapters.length - 1) % chapters.length)} type="button"><span>Previous</span><b>{chapters[(selectedChapter + chapters.length - 1) % chapters.length].title}</b></button>
              <span className="cinema-dialog__hint">Use arrow keys to move through ORA</span>
              <button onClick={() => setSelectedChapter((selectedChapter + 1) % chapters.length)} type="button"><span>Next</span><b>{chapters[(selectedChapter + 1) % chapters.length].title}</b></button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <footer>
        <img src="/assets/logo.png" alt="ORA" />
        <p>The Self-Sustaining Floating Haven</p>
        <div><span>© 2026 Mohannad Haikal</span><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Return to the surface</button></div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: "ORA — The Self-Sustaining Floating Haven",
        description: "An immersive cinematic architectural visualization project exploring a self-sustaining floating home shaped by water, ecology and natural living systems.",
        creator: { "@type": "Person", name: "Mohannad Haikal", jobTitle: "Architectural Visualization Artist" },
        genre: ["Architectural Visualization", "Sustainable Architecture", "Concept Design", "Cinematic Film"],
        dateCreated: "2026"
      }) }} />
    </main>
  );
}
