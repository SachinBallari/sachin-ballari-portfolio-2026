import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SiAdobepremierepro, SiAmd, SiArm, SiBehance, SiC, SiClaude, SiDribbble, SiFigma, SiGit, SiGithub, SiInstagram, SiLinkedin, SiOpenai, SiOpencv, SiProteus, SiPytorch, SiPython, SiRaspberrypi, SiYoutube } from 'react-icons/si';
import { MdDesignServices, MdEmail, MdFavorite, MdLocationPin, MdMemory, MdSensors } from 'react-icons/md';
import { TbBinaryTree, TbBrandVscode, TbCircuitResistor, TbCircuitSwitchOpen, TbCpu, TbMath, TbRadar, TbScanEye } from 'react-icons/tb';
import { profile, projects, experience, toolGroups } from './data/portfolio';
import { usePortfolioMotion } from './motion';
import './styles.css';
import './editorial.css';
import './cinema.css';

const Arrow = () => <span aria-hidden="true">↗</span>;

const toolIcons = {
  'Figma': [SiFigma, '#F24E1E'],
  'UI/UX Design': [MdDesignServices, '#7557ff'],
  'Premiere Pro': [SiAdobepremierepro, '#9999FF'],
  'VS Code': [TbBrandVscode, '#007ACC'],
  'Git': [SiGit, '#F05032'],
  'GitHub': [SiGithub, '#181717'],
  'Python': [SiPython, '#3776AB'],
  'C': [SiC, '#A8B9CC'],
  'Embedded C': [TbCpu, '#7557ff'],
  'Verilog HDL': [TbBinaryTree, '#E01F27'],
  'Raspberry Pi': [SiRaspberrypi, '#A22846'],
  '8051 Microcontroller': [MdMemory, '#0F9D58'],
  'Sensors': [MdSensors, '#ED8B00'],
  'IoT': [TbRadar, '#29A9DF'],
  'Circuit Design': [TbCircuitSwitchOpen, '#7557ff'],
  'Codex': [SiOpenai, '#111111'],
  'Claude': [SiClaude, '#D97757'],
  'YOLOv8': [TbScanEye, '#00FFFF'],
  'OpenCV': [SiOpencv, '#5C3EE8'],
  'PyTorch Basics': [SiPytorch, '#EE4C2C'],
  'Proteus': [SiProteus, '#1C79B3'],
  'MATLAB': [TbMath, '#E16737'],
  'Xilinx': [SiAmd, '#ED1C24'],
  'Cadence': [TbCircuitResistor, '#C61D23'],
  'Keil µVision': [SiArm, '#0091BD']
};

const skillGroups = [
  { label: 'PRODUCT DESIGN', tools: ['UX Research', 'User Flows', 'Wireframing', 'UI Design', 'Interaction Design', 'Design Systems'] },
  { label: 'VISUAL CREATION', tools: ['Visual Storytelling', 'Photography', 'Videography', 'Graphic Design', 'Social Content'] },
  { label: 'ENGINEERING THINKING', tools: ['Embedded Systems', 'IoT Prototyping', 'Computer Vision', 'Circuit Design', 'Problem Solving'] }
];

const testimonialSlots = [
  { id: '01', src: '', className: 'review-one', tone: 'violet' },
  { id: '02', src: '', className: 'review-two', tone: 'blue' },
  { id: '03', src: '', className: 'review-three', tone: 'coral' },
  { id: '04', src: '', className: 'review-four', tone: 'orange' },
  { id: '05', src: '', className: 'review-five', tone: 'lime' }
];

const socialIcons = {
  linkedin: SiLinkedin,
  instagram: SiInstagram,
  youtube: SiYoutube,
  github: SiGithub,
  dribbble: SiDribbble,
  behance: SiBehance
};

function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('is-loading');
    const timer = window.setTimeout(() => setVisible(false), reduced ? 450 : 3000);
    return () => { window.clearTimeout(timer); document.documentElement.classList.remove('is-loading'); };
  }, []);
  useEffect(() => {
    if (visible) return undefined;
    document.documentElement.classList.remove('is-loading');
    document.documentElement.classList.add('just-loaded');
    const flashTimer = window.setTimeout(() => document.documentElement.classList.remove('just-loaded'), 900);
    return () => window.clearTimeout(flashTimer);
  }, [visible]);
  if (!visible) return null;
  const cells = [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]];
  return <div className="loading-screen" role="status" aria-label="Loading Sachin Ballari portfolio"><div className="loader-stage" aria-hidden="true"><div className="loader-stickers">{cells.map(([column, row], index) => <i key={index} style={{'--sticker-index': index, '--sticker-x': `${column * 50}%`, '--sticker-y': `${row * 50}%`}} />)}</div><div className="loader-line"><span /></div></div></div>;
}

function ToolsSection() {
  const [selectedTool, setSelectedTool] = useState('');
  const selectedGroup = toolGroups.find(group => group.tools.includes(selectedTool));
  useEffect(() => {
    if (!selectedTool) return undefined;
    const close = (event) => { if (event.key === 'Escape') setSelectedTool(''); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [selectedTool]);
  const renderSkills = (duplicate = false) => <div className="skills-loop-set" aria-hidden={duplicate || undefined}>{skillGroups.map(group => <span key={group.label}>{group.label}<i aria-hidden="true">✦</i></span>)}</div>;
  const renderTools = (duplicate = false) => <div className="tools-loop-set" aria-hidden={duplicate || undefined}>{toolGroups.flatMap(group => group.tools).map(tool => { const [Icon, color] = toolIcons[tool]; return <button type="button" tabIndex={duplicate ? -1 : 0} key={tool} aria-label={`View ${tool} category`} title={tool} style={{'--icon-color': color}} onClick={() => setSelectedTool(tool)}><Icon aria-hidden="true"/><span className="tool-name">{tool}</span></button>; })}</div>;
  return <section id="tools" className="tools section"><div className="tools-shell">
    <div className="loop-row skills-loop"><div className="loop-viewport"><div className="loop-track">{renderSkills()}{renderSkills(true)}</div></div></div>
    <div className="loop-row tools-loop"><div className="loop-viewport"><div className="loop-track">{renderTools()}{renderTools(true)}</div></div></div>
    {selectedTool && <div className="tool-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTool(''); }}><section className="tool-modal" role="dialog" aria-modal="true" aria-labelledby="tool-modal-title"><button className="tool-modal-close" type="button" aria-label="Close tool categories" onClick={() => setSelectedTool('')}>×</button><p className="eyebrow">TOOL CATEGORIES</p><h2 id="tool-modal-title">{selectedTool}</h2><p className="tool-modal-focus">USED FOR <strong>{selectedGroup?.label}</strong></p><div className="tool-category-list">{toolGroups.map(group => <article className={group.label === selectedGroup?.label ? 'is-active' : ''} key={group.label}><h3>{group.label}</h3><div>{group.tools.map(tool => { const [Icon, color] = toolIcons[tool]; return <span key={tool} style={{'--icon-color': color}}><Icon aria-hidden="true"/>{tool}</span>; })}</div></article>)}</div></section></div>}
  </div></section>;
}

function RoleSelector() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  return <div ref={rootRef} className={`role-selector ${open ? 'is-open' : ''}`} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}><button type="button" aria-expanded={open} aria-controls="role-options" onClick={() => setOpen(current => !current)}><span>PRODUCT DESIGNER</span><i aria-hidden="true">↓</i></button><div className="role-options" id="role-options" aria-hidden={!open}><span>UI/UX DESIGNER</span><span>CREATIVE TECHNOLOGIST</span><span>VISUAL STORYTELLER</span></div></div>;
}

function TestimonialsTemplate() {
  return <section id="testimonials" className="testimonials section" aria-labelledby="testimonials-title"><div className="testimonials-shell">
    <header className="testimonials-heading"><h2 id="testimonials-title">WHAT’S IT LIKE WORKING WITH ME?</h2></header>
    <div className="testimonial-board">
      {testimonialSlots.map(slot => <article className={`testimonial-slot ${slot.className} tone-${slot.tone}`} key={slot.id}>{slot.src ? <img src={slot.src} alt={`Testimonial ${slot.id}`}/> : <><span className="upload-plus" aria-hidden="true">+</span><strong>REVIEW IMAGE {slot.id}</strong><small>PNG · JPG · WEBP</small></>}</article>)}
      <div className="testimonial-portrait"><img src="/images/sachin-testimonial-transparent-v2.png" alt="Sachin Ballari standing beside his creative work table"/></div>
    </div>
  </div></section>;
}

function ContactSection() {
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  return <section id="contact" className="contact section"><div className="contact-card">
    <div className="contact-card-copy"><h2>LET’S MAKE<br/><em>SOMETHING REAL.</em></h2><p>Tell me what you’re building, where the experience is stuck, or how I can help.</p></div>
    <div className="contact-actions"><a className="contact-email" href={`mailto:${profile.email}`}><MdEmail aria-hidden="true"/><span><small>EMAIL ME</small><strong>{profile.email}</strong></span></a><button className="contact-copy" type="button" onClick={copyEmail} aria-live="polite">{copied ? 'COPIED ✓' : 'COPY EMAIL'}</button><a className="contact-resume" href={profile.resume} target="_blank" rel="noreferrer">VIEW RESUME <Arrow /></a></div>
  </div><div className="contact-chips">{Object.entries(profile.socials).map(([name, url]) => { const Icon = socialIcons[name]; return <a href={url} key={name} target="_blank" rel="noreferrer"><Icon aria-hidden="true"/><span>{name.toUpperCase()}</span></a>; })}</div><div className="contact-ending"><div className="contact-meta"><span><MdFavorite aria-hidden="true"/> BUILT WITH CARE · 2026</span><span><MdLocationPin aria-hidden="true"/> DHARWAD, KARNATAKA</span><span>AVAILABLE FOR PRODUCT DESIGN &amp; CREATIVE PROJECTS</span></div><footer><span>© 2026 SACHIN BALLARI</span><span>UI/UX DESIGNER · CREATIVE · INDIA</span></footer></div></section>;
}

function Nav() {
  const [open, setOpen] = useState(false);
  const items = [['WORK', '#work'], ['ABOUT', '#about'], ['EXPERIENCE', '#experience'], ['CV / CONTACT', '#contact']];
  return <header className="nav"><a className="wordmark" href="#top">SACHIN<span>.</span></a><button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? '×' : 'MENU'}</button><nav className={open ? 'open' : ''}>{items.map(([label, link]) => <a onClick={() => setOpen(false)} href={link} key={label}>{label}</a>)}</nav></header>;
}

function Artwork({ kind, label }) {
  const cover = kind === 'art-1'
    ? { src: '/images/tagx-cover-wide.png', alt: 'TAGX app concept cover' }
    : kind === 'art-2'
      ? { src: '/images/boathelper-cover.png', alt: 'Boathelper mobile app case study cover' }
      : kind === 'art-4'
        ? { src: '/images/rbi-case-study-thumbnail.png', alt: 'RBI website redesign case study cover' }
      : kind === 'art-3'
        ? { src: '/images/pop-upi-cover.jpg', alt: 'POP UPI website design cover' }
      : kind === 'art-5'
        ? { src: '/images/interactive-portfolio-cover.jpg', alt: 'Interactive portfolio studio room cover' }
      : null;
  return <div className={`artwork ${kind || ''}`} aria-label={`${label} visual`} role="img">{cover ? <img className="project-cover-image" src={cover.src} alt={cover.alt}/> : <><div className="art-orbit"/><div className="art-sheet"/><div className="art-panel"><i/><i/><i/><b>{label}</b></div><div className="art-caption">REPLACE WITH<br/>YOUR PROJECT IMAGE</div></>}</div>;
}

function TagxCaseStudy() {
  const sections = [
    ['THE PROBLEM', 'Hiring a creative professional is often fragmented and uncertain.', 'Clients rely on Instagram, personal contacts and word of mouth to find photographers, videographers, editors, makeup artists and designers. It is difficult to compare portfolios, prices, availability and credibility in one place.'],
    ['THE OPPORTUNITY', 'Build a clearer way for people to discover and hire creative talent.', 'TAGX brings verified creative profiles, portfolios, availability, pricing, messaging and project requests into one mobile experience. It is designed for individuals, businesses and event organisers - while helping creators show their work and reach genuine clients.'],
    ['WHO IT SERVES', 'Two sides of one creative economy.', 'Clients can search, compare and book talent. Creative professionals can build a profile, publish work, receive requests and manage opportunities.'],
    ['KEY INSIGHT', 'Trust needs to be visible before a conversation starts.', 'The concept prioritises portfolio quality, verification, reviews, ratings, transparent starting prices, availability and location so users can decide with more confidence.']
  ];
  return <main className="case-study"><header className="nav case-nav"><a className="wordmark" href="/">SACHIN<span>.</span></a><a className="text-link" href="/">← BACK TO PORTFOLIO</a></header>
    <section className="case-hero section"><div className="eyebrow">CASE STUDY · 2026</div><h1>TAGX<span className="dot">.</span></h1><p className="case-lede">A creative-professional marketplace that makes discovery, comparison and booking feel more trustworthy.</p><div className="case-meta"><div><small>ROLE</small><b>UX/UI Designer</b></div><div><small>PLATFORM</small><b>Mobile App Concept</b></div><div><small>FOCUS</small><b>Discovery · Trust · Booking</b></div></div><div className="tagx-cover"><div className="cover-bubble">TAGX<br/><small>FIND YOUR<br/>CREATIVE MATCH</small></div><div className="phone phone-left"><i/><i/><i/><b>Explore<br/>creators</b></div><div className="phone phone-right"><i/><i/><i/><b>Creative<br/>match</b></div></div></section>
    <section className="case-intro section"><div><h2>FROM SCROLLING<br/>TO <em>SHORTLISTING.</em></h2><p>TAGX is a marketplace concept for people who need creative professionals and for creatives who need fairer visibility. The product responds to an everyday problem: finding the right person should not take hours of searching across disconnected social profiles.</p></div></section>
    {sections.map(([label, heading, body], index) => <section className={`case-block section block-${index}`} key={label}><div><h2>{heading}</h2><p>{body}</p>{index === 2 && <div className="audience"><span>INDIVIDUALS<br/><small>Birthdays · Weddings · Personal branding</small></span><span>BUSINESSES<br/><small>Restaurants · Cafes · Startups</small></span><span>EVENT ORGANISERS<br/><small>Corporate · College · Cultural events</small></span></div>}</div></section>)}
    <section className="case-flow section"><h2>A SIMPLE PATH<br/>TO THE RIGHT <em>CREATOR.</em></h2><div className="flow"><span>01<br/><b>Choose service</b></span><span>02<br/><b>Share requirements</b></span><span>03<br/><b>Browse & compare</b></span><span>04<br/><b>Book & discuss</b></span><span>05<br/><b>Pay, complete & review</b></span></div></section>
    <section className="case-screens section"><h2>DESIGNED FOR<br/><em>DECISIONS.</em></h2><p>The core experience gives users two ways to find talent: manual filtering for direct control, or Creative Match for a guided recommendation based on category, requirements, style, location, budget and date.</p><div className="screen-grid"><div className="screen"><small>DISCOVER</small><b>Search by category,<br/>location and budget.</b></div><div className="screen lime"><small>CREATIVE MATCH</small><b>Tell TAGX what<br/>you need.</b></div><div className="screen blue"><small>PROFILE</small><b>Review work, ratings,<br/>availability and price.</b></div></div></section>
    <section className="case-outcome section"><h2>DESIGNING FOR<br/><em>A MORE VISIBLE</em><br/>CREATIVE ECONOMY.</h2><p>TAGX explores how a structured product experience can reduce dependence on referrals, support local creative talent and help clients make hiring decisions with more confidence.</p><a className="button dark" href="/">BACK TO PORTFOLIO <span>←</span></a></section>
  </main>;
}

function App() {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  usePortfolioMotion();
  const activeProject = projects[activeProjectIndex];
  const projectHref = (project) => project.slug === 'tagx' ? '/tagx-case-study-reference.html' : project.slug === 'boathelper' ? '/boathelper-case-study.html' : project.slug === 'rbi-website-redesign' ? '/rbi-case-study.html' : `#${project.slug}`;
  if (window.location.pathname === '/work/tagx') return <TagxCaseStudy />;
  return <main id="top"><LoadingScreen /><Nav /><div className="portfolio-shapes" aria-hidden="true"><i className="shape shape-orb"/><i className="shape shape-square"/><i className="shape shape-ring"/><i className="shape shape-spark">✦</i></div>
    <section className="hero section"><div className="hero-grid"><div><p className="hello">HEY, I’M</p><div className="hero-name" aria-label="SACHIN"><span aria-hidden="true">SACH</span><span className="hero-name-i" aria-hidden="true">I</span><span aria-hidden="true">N</span><RoleSelector /></div><h1>UI/UX DESIGNER <em>&amp;</em> CREATIVE</h1><p className="hero-copy">{profile.intro}</p><div className="hero-actions"><a className="button dark" href="#work">VIEW WORK <span>↓</span></a><a className="button outline hero-about" href="#about">ABOUT ME <Arrow /></a></div></div><div className="hero-art"><div className="portrait-placeholder hero-photo real-photo"><img src="/images/sachin-profile.jpg" alt="Sachin Ballari" /></div><div className="floating-card top-card">ECE ×<br/>DESIGN</div><div className="floating-card bottom-card">VISUAL<br/>STORYTELLER</div><div className="round-stamp">SCROLL<br/>TO SEE<br/>WORK ↓</div></div></div></section>

    <section className="creative-intro-art section"><div className="assembled-collage" role="img" aria-label="About Sachin: design, code, photography and visual storytelling"><img className="collage-piece piece-left" src="/images/about-me-art.png" alt=""/><img className="collage-piece piece-center" src="/images/about-me-art.png" alt=""/><img className="collage-piece piece-right" src="/images/about-me-art.png" alt=""/></div></section>

    <section id="work" className="work section"><div className="section-head"><h2>SELECTED<br/><em>WORK</em><span className="dot">.</span></h2></div><div className="featured-work"><div className="featured-index" role="list" aria-label="Portfolio projects">{projects.map((project, index) => <button type="button" role="listitem" className={`featured-project-name ${activeProjectIndex === index ? 'is-active' : ''}`} key={project.slug} onMouseEnter={() => setActiveProjectIndex(index)} onFocus={() => setActiveProjectIndex(index)} onClick={() => setActiveProjectIndex(index)} aria-pressed={activeProjectIndex === index}><small>{index + 1}</small><span>{project.title}</span><i>↗</i></button>)}</div><article className={`featured-preview preview-${activeProjectIndex + 1}`} aria-live="polite"><div className="featured-visual" key={activeProject.slug}><Artwork kind={`art-${activeProjectIndex + 1}`} label={activeProject.title}/></div><div className="featured-details"><div><p className="eyebrow">{activeProject.category}</p><h3>{activeProject.title}</h3><p>{activeProject.description}</p><div className="tags">{activeProject.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><a className="button dark" href={projectHref(activeProject)}>VIEW CASE STUDY <Arrow /></a></div></article></div></section>

    <section id="about" className="about section"><div className="about-image about-art"><img className="about-photo" src="/images/sachin-about.jpg" alt="Sachin Ballari"/><p className="side-note">TECHNOLOGY<br/>× VISUAL<br/>CREATIVITY</p></div><div className="about-copy"><h2>CURIOUS BY<br/><em>DEFAULT.</em></h2>{profile.about.map(text => <p key={text}>{text}</p>)}<div className="resume-actions"><a className="button outline" href={profile.resume} download>DOWNLOAD RESUME <Arrow /></a><a className="button outline view-resume" href={profile.resume} target="_blank" rel="noreferrer">VIEW RESUME <Arrow /></a></div></div></section>

    <ToolsSection />

    <section id="experience" className="experience section"><div className="section-head"><h2>EXPERIENCE<span className="dot">.</span></h2></div><div className="timeline">{experience.map(item => <article className="timeline-item" key={item.title}><div className="timeline-year">{item.period}</div><div><h3>{item.title}</h3><p className="timeline-role">{item.role}</p></div><p>{item.description}</p></article>)}</div></section>

    <TestimonialsTemplate />

    <ContactSection />
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
