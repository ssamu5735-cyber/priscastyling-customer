'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Heart, Menu, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import { listProducts } from '@/src/appwrite';
import { money, whatsappNumber, type Product } from '@/src/data';

type CartItem = { product: Product; size: string; neededBy: string; quantity: number };
const wa = (text: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

/* Real brand mark — swap the file at /public/images/logo-mark.png if the
   brand ever supplies a refined vector version. */
function Monogram({ size = 44 }: { size?: number }) {
  return <Image src="/images/logo-mark.png" alt="Priscastyling" width={size} height={size} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
}

/* Decorative arch used wherever there is no photograph yet. */
function ArchPanel({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`arch-frame arch relative aspect-[4/5] ${className}`}>
      <svg viewBox="0 0 300 375" className="absolute inset-0 h-full w-full">
        <path className="arch-line" d="M40 375 V150 A110 110 0 0 1 260 150 V375" />
        <path className="arch-line" d="M70 375 V150 A80 80 0 0 1 230 150 V375" opacity=".35" />
      </svg>
      {children}
    </div>
  );
}

function Price({ product }: { product: Product }) {
  return (
    <span className="inline-flex flex-wrap items-baseline justify-end gap-2">
      {product.hasDiscount && product.originalPrice && (
        <>
          <del className="text-sm font-normal text-[var(--muted)]">{money(product.originalPrice)}</del>
          <span className="rounded-full bg-[var(--blush)] px-2 py-0.5 text-[11px] font-medium text-[var(--rose-deep)]">
            {product.discountLabel || 'Offer'}
          </span>
        </>
      )}
      <span>{money(product.price)}</span>
    </span>
  );
}

function ProductModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (p: Product, s: string, d: string, q: number) => void }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [neededBy, setNeededBy] = useState('');
  const [q, setQ] = useState(1);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[var(--dusk)]/70 p-4">
      <div className="relative grid w-full max-w-3xl gap-6 rounded-[28px] bg-[var(--white)] p-5 md:grid-cols-2">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full border border-[var(--line)] bg-[var(--white)] p-2" aria-label="Close">
          <X size={17} />
        </button>
        <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>
        <div className="self-center p-3">
          <p className="label">{product.category}</p>
          <h2 className="serif mt-3 text-4xl">{product.name}</h2>
          <p className="mt-3 text-2xl"><Price product={product} /></p>
          <p className="mt-5 leading-7 text-[var(--muted)]">{product.description}</p>
          <p className="mt-5 text-sm text-[var(--muted)]">Cut to order in our Festac atelier. Choose a size, or leave it for us to confirm your measurements on WhatsApp.</p>
          <label className="mt-5 block text-sm font-medium">
            Size
            <select className="input mt-2" value={size} onChange={e => setSize(e.target.value)}>
              {product.sizes.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-sm font-medium">
            Needed by (optional)
            <input className="input mt-2" type="date" value={neededBy} onChange={e => setNeededBy(e.target.value)} />
          </label>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center gap-3 rounded-full border border-[var(--line)] px-3 py-1">
              <button onClick={() => setQ(Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus size={15} /></button>
              <span>{q}</span>
              <button onClick={() => setQ(q + 1)} aria-label="Increase quantity"><Plus size={15} /></button>
            </div>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button onClick={() => onAdd(product, size, neededBy, q)} className="btn btn-dark">Add to cart</button>
            <a href={wa(`Hello Priscastyling, I am interested in ${product.name}. Size: ${size}. Please confirm availability and timeline.`)} className="btn btn-line">Ask on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Drawer({ type, cart, wishlist, setCart, setWishlist, onClose, cartText, wishText }: {
  type: 'cart' | 'wishlist'; cart: CartItem[]; wishlist: Product[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; setWishlist: React.Dispatch<React.SetStateAction<Product[]>>;
  onClose: () => void; cartText: string; wishText: string;
}) {
  const isCart = type === 'cart';
  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-[var(--dusk)]/60" onClick={onClose} aria-label="Close" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-[var(--white)] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="label">{isCart ? 'Your cart' : 'Your wishlist'}</p>
            <h2 className="serif mt-2 text-3xl">{isCart ? 'Ready when you are.' : 'Pieces to remember.'}</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-[var(--line)] p-2" aria-label="Close"><X size={18} /></button>
        </div>
        {isCart ? (
          cart.length ? (
            <div className="mt-8 grid gap-4">
              {cart.map((i, n) => (
                <div key={n} className="flex gap-3 border-b border-[var(--line)] pb-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl"><Image src={i.product.image} alt={i.product.name} fill className="object-cover" /></div>
                  <div className="flex-1">
                    <strong className="serif text-lg">{i.product.name}</strong>
                    <p className="mt-1 text-sm text-[var(--muted)]">Size {i.size} · Qty {i.quantity}</p>
                    <button onClick={() => setCart(v => v.filter((_, idx) => idx !== n))} className="mt-2 text-xs font-medium underline">Remove</button>
                  </div>
                </div>
              ))}
              <a href={wa(cartText)} className="btn btn-dark mt-5 w-full">Checkout on WhatsApp</a>
            </div>
          ) : <Empty text="Your cart is empty. Tap the bag icon on any piece to add it here." />
        ) : (
          wishlist.length ? (
            <div className="mt-8 grid gap-4">
              {wishlist.map(p => (
                <div key={p.slug} className="flex gap-3 border-b border-[var(--line)] pb-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl"><Image src={p.image} alt={p.name} fill className="object-cover" /></div>
                  <div className="flex-1">
                    <strong className="serif text-lg">{p.name}</strong>
                    <p className="mt-1 text-sm text-[var(--muted)]">{money(p.price)}</p>
                    <button onClick={() => setWishlist(v => v.filter(x => x.slug !== p.slug))} className="mt-2 text-xs font-medium underline">Remove</button>
                  </div>
                </div>
              ))}
              <a href={wa(wishText)} className="btn btn-dark mt-5 w-full">Ask on WhatsApp</a>
            </div>
          ) : <Empty text="Your wishlist is empty. Tap the heart on any piece to save it here." />
        )}
        <p className="mt-8 text-center text-xs leading-5 text-[var(--muted)]">We reply with sizing, fabric options and timeline the same day.</p>
      </aside>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="mt-12 rounded-2xl border border-dashed border-[var(--line)] p-6 text-center text-sm leading-6 text-[var(--muted)]">{text}</div>;
}

export default function PublicStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quick, setQuick] = useState<Product | null>(null);
  const [drawer, setDrawer] = useState<'cart' | 'wishlist' | null>(null);
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => { listProducts().then(setProducts); }, []);
  const cats = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = useMemo(
    () => products.filter(p => (category === 'All' || p.category === category) && (!search || `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())) && p.status === 'Published'),
    [products, category, search]
  );
  const toggleWish = (p: Product) => setWishlist(v => v.some(x => x.slug === p.slug) ? v.filter(x => x.slug !== p.slug) : [...v, p]);
  const addCart = (p: Product, size: string, neededBy: string, quantity: number) => {
    setCart(v => [...v, { product: p, size, neededBy, quantity }]);
    setQuick(null);
    setNotice(`${p.name} added to your cart`);
    setTimeout(() => setNotice(''), 2600);
  };
  const cartText = cart.length
    ? `Hello Priscastyling, I would like to order:\n${cart.map(i => `• ${i.product.name} — size ${i.size}, quantity ${i.quantity}${i.neededBy ? `, needed by ${i.neededBy}` : ''}`).join('\n')}\n\nPlease confirm availability, fabric options and delivery timeline.`
    : 'Hello Priscastyling, I would like to make an enquiry.';
  const wishText = wishlist.length
    ? `Hello Priscastyling, I would like to enquire about these saved pieces:\n${wishlist.map(i => `• ${i.name} — ${money(i.price)}${i.hasDiscount && i.originalPrice ? ` (was ${money(i.originalPrice)})` : ''}`).join('\n')}\n\nPlease advise on sizing, fabric options and timeline.`
    : 'Hello Priscastyling, I would like to make an enquiry.';

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">
        <div className="shell flex h-[80px] items-center justify-between gap-5">
          <Link href="#top" className="flex items-center gap-3">
            <Monogram />
            <span>
              <strong className="serif block text-xl uppercase leading-none tracking-[.04em]">Priscastyling</strong>
              <small className="mt-1 block text-[11px] text-[var(--muted)]">Festac, Lagos</small>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-[14.5px] font-medium md:flex">
            <a href="#shop">Collections</a>
            <a href="#atelier">The atelier</a>
            <a href="#visit">Visit &amp; connect</a>
            <a href="#how">How it works</a>
            <a href="#contact">Book a fitting</a>
          </nav>
          <div className="flex items-center gap-1">
            <button onClick={() => setDrawer('wishlist')} className="relative rounded-full p-2" aria-label="Open wishlist">
              <Heart size={19} />
              {wishlist.length > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[var(--rose)] text-[9px] text-white">{wishlist.length}</span>}
            </button>
            <button onClick={() => setDrawer('cart')} className="relative rounded-full p-2" aria-label="Open cart">
              <ShoppingBag size={19} />
              {cart.length > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[var(--rose)] text-[9px] text-white">{cart.length}</span>}
            </button>
            <button onClick={() => setMenu(!menu)} className="rounded-full p-2 md:hidden" aria-label="Menu">{menu ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
        {menu && (
          <div className="shell grid gap-4 border-t border-[var(--line)] py-5 text-[15px] font-medium md:hidden">
            <a href="#shop" onClick={() => setMenu(false)}>Collections</a>
            <a href="#atelier" onClick={() => setMenu(false)}>The atelier</a>
            <a href="#visit" onClick={() => setMenu(false)}>Visit &amp; connect</a>
            <a href="#how" onClick={() => setMenu(false)}>How it works</a>
            <a href="#contact" onClick={() => setMenu(false)}>Book a fitting</a>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero — no stock photography; the arch is the signature device */}
        <section className="relative overflow-hidden border-b border-[var(--line)]" style={{ background: 'linear-gradient(180deg,var(--blush) 0%,var(--paper) 55%)' }}>
          <div className="shell grid gap-10 py-20 md:grid-cols-[1.1fr_.9fr] md:items-center md:py-28">
            <div className="max-w-xl">
              <p className="label">Ready-to-wear · bespoke · bridal</p>
              <h1 className="serif mt-5 text-[15vw] leading-[.98] sm:text-7xl md:text-[5.2rem]">
                Style that remembers who you are.
              </h1>
              <p className="mt-7 max-w-md text-[17px] leading-8 text-[var(--muted)]">
                Every piece begins with your occasion, your measurements and your confidence — cut to order in our Festac atelier.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#shop" className="btn btn-grad">Explore the collection</a>
                <a href="#contact" className="btn btn-line">Book a fitting</a>
              </div>
              <p className="mt-6 text-sm text-[var(--muted)]">★★★★★ 4.9 on Google, from 28 reviews</p>
            </div>
            <ArchPanel className="mx-auto w-full max-w-sm md:max-w-none">
              <div className="relative flex h-full flex-col items-center justify-end pb-10 text-center">
                <Image src="/images/logo-full.png" alt="Priscastyling — Lagos Atelier" width={520} height={275} className="w-[72%] max-w-[320px] object-contain" />
              </div>
            </ArchPanel>
          </div>
        </section>

        {/* The house */}
        <section id="atelier" className="shell grid gap-12 py-24 md:grid-cols-2 md:items-center">
          <ArchPanel className="order-2 md:order-1" />
          <div className="order-1 md:order-2">
            <p className="label">Meet the designer</p>
            <h2 className="serif mt-4 text-4xl leading-tight sm:text-5xl">
              Prisca designs for the body you actually have.
            </h2>
            <p className="mt-6 leading-8 text-[var(--muted)]">
              Priscastyling is a small Festac atelier. Prisca takes a limited number of commissions each month so that every seam, every hem and every fitting gets the attention it deserves — nothing leaves the atelier until it sits the way it should.
            </p>
            <blockquote className="serif mt-6 border-l-2 border-[var(--rose)] pl-5 text-2xl italic leading-snug text-[var(--ink)]">
              "I made it with you on my mind — Ladies, I am you and you are me."
            </blockquote>
            <p className="mt-2 text-sm text-[var(--muted)]">— Prisca, founder</p>
            <a href="#contact" className="btn btn-dark mt-8">Book a fitting</a>
          </div>
        </section>

        {/* Visit & connect — one place with every real-world detail: address, hours, phone and socials */}
        <section id="visit" className="border-t border-[var(--line)] bg-[var(--paper)] py-24">
          <div className="shell grid gap-10 lg:grid-cols-[1fr_.9fr]">
            <div>
              <p className="label">Visit &amp; connect</p>
              <h2 className="serif mt-3 text-4xl sm:text-5xl">Everything you need to find us.</h2>
              <p className="mt-5 max-w-lg leading-8 text-[var(--muted)]">
                Priscastyling is a working atelier in Festac Town. Come in for a fitting, or reach us on WhatsApp and social media from anywhere in Lagos — and beyond.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="card p-5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">Atelier address</p>
                  <p className="serif mt-2 text-xl leading-snug">401 Road, I Close,<br />Festac Town, Lagos 102102</p>
                  <a href="https://www.google.com/maps/search/?api=1&query=401+Road%2C+I+Close%2C+Festac+Town%2C+Lagos+102102%2C+Nigeria" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--rose-deep)] underline">Get directions <ArrowUpRight size={14} /></a>
                </div>
                <div className="card p-5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">Service area</p>
                  <p className="serif mt-2 text-xl leading-snug">Festac Town &amp;<br />surrounding Lagos</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Outside Lagos? We take measurements and fabric preference over WhatsApp before we confirm a delivery date.</p>
                </div>
              </div>
            </div>
            <div className="card flex flex-col justify-center gap-1 p-2">
              {[
                ['WhatsApp', '0813 529 6095 · tap to chat', wa('Hello Priscastyling, I would like to make an enquiry.')],
                ['Instagram', '@rtwbypriscastyling', 'https://www.instagram.com/rtwbypriscastyling/'],
                ['TikTok', '@priscastyling', 'https://www.tiktok.com/@priscastyling'],
                ['Facebook', 'Priscastyling', 'https://www.facebook.com/61561086839715/'],
              ].map(([label, handle, href]) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center justify-between gap-4 rounded-2xl px-4 py-4 transition hover:bg-[var(--paper)]">
                  <span>
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</span>
                    <span className="serif block text-xl">{handle}</span>
                  </span>
                  <ArrowUpRight size={18} className="shrink-0 text-[var(--rose)]" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="border-y border-[var(--line)] bg-[var(--white)] py-20">
          <div className="shell">
            <p className="label">What we make</p>
            <h2 className="serif mt-3 text-4xl sm:text-5xl">Six ways we can dress you.</h2>
            <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Ready-to-wear', 'Ankara, Adire and everyday pieces cut in inclusive sizing.'],
                ['Bespoke & custom design', 'A garment built around your own measurements and occasion.'],
                ['Bridal', 'Wedding-day design from first sketch to final fitting.'],
                ['Pageant & occasion wear', 'Structured, statement pieces for the moments that matter.'],
                ["Children's fashion", 'Bright, comfortable occasionwear little ones can move in.'],
                ['Restyling & alterations', "Bring a piece back to life, or adjust one until it's right."],
              ].map(([t, d]) => (
                <div key={t}>
                  <h3 className="serif text-2xl">{t}</h3>
                  <p className="mt-2 leading-7 text-[var(--muted)]">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shop */}
        <section id="shop" className="border-y border-[var(--line)] bg-[var(--white)] py-24">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="label">Selected pieces</p>
                <h2 className="serif mt-3 text-4xl sm:text-5xl">From the current collection.</h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5"><Heart size={16} />{wishlist.length} saved</span>
                <span className="inline-flex items-center gap-1.5"><ShoppingBag size={16} />{cart.length} in cart</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-5">
              <div className="flex items-center gap-2 overflow-x-auto">
                {cats.map(c => (
                  <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-4 py-2 text-[13.5px] font-medium ${category === c ? 'bg-[var(--ink)] text-white' : 'border border-[var(--line)]'}`}>{c}</button>
                ))}
              </div>
              <label className="ml-auto flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-2 text-sm">
                <Search size={15} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="w-20 bg-transparent outline-none sm:w-32" />
              </label>
            </div>

            {filtered.length > 0 ? (
              <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-3">
                {filtered.map(p => (
                  <article key={p.slug} className="group">
                    <div className="arch relative aspect-[3/4] overflow-hidden bg-[var(--paper)]">
                      <Image src={p.image} alt={p.name} fill className="object-cover transition duration-700 group-hover:scale-105" />
                      <div className="absolute left-3 top-3 rounded-full bg-[var(--white)]/90 px-3 py-1 text-[11px] font-medium">{p.category}</div>
                      <div className="absolute right-3 top-3 flex gap-2">
                        <button onClick={() => toggleWish(p)} className="grid size-9 place-items-center rounded-full bg-[var(--white)]/90" aria-label="Save to wishlist">
                          <Heart size={16} className={wishlist.some(x => x.slug === p.slug) ? 'fill-[var(--rose)] text-[var(--rose)]' : ''} />
                        </button>
                        <button onClick={() => setQuick(p)} className="grid size-9 place-items-center rounded-full bg-[var(--white)]/90" aria-label="Quick view"><ShoppingBag size={16} /></button>
                      </div>
                      <button onClick={() => setQuick(p)} className="absolute bottom-3 left-3 right-3 translate-y-2 rounded-full bg-[var(--white)]/95 px-4 py-3 text-sm font-medium opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">Quick view</button>
                    </div>
                    <div className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="serif text-2xl">{p.name}</h3>
                          <p className="mt-1 text-sm text-[var(--muted)]">{p.category}</p>
                        </div>
                        <span className="text-right"><Price product={p} /></span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-[28px] border border-dashed border-[var(--line)] bg-[var(--paper)] px-6 py-20 text-center">
                <p className="label justify-center">New pieces are coming</p>
                <h3 className="serif mt-3 text-4xl">The storefront is being prepared.</h3>
                <p className="mx-auto mt-4 max-w-lg leading-7 text-[var(--muted)]">Priscastyling is curating the first live collection. Check back soon, or send a WhatsApp message for ready-to-wear and bespoke enquiries.</p>
                <a href={wa('Hello Priscastyling, I would like to enquire about the current collection.')} className="btn btn-dark mt-7">Enquire on WhatsApp</a>
              </div>
            )}
            {filtered.length > 0 && category !== 'All' && (
              <div className="mt-10 text-center"><button onClick={() => setCategory('All')} className="btn btn-line">View all collections</button></div>
            )}
          </div>
        </section>

        {/* Philosophy */}
        <section className="shell grid gap-10 py-24 md:grid-cols-[1fr_1.2fr] md:items-center">
          <ArchPanel />
          <div>
            <p className="label">Made in Lagos</p>
            <h2 className="serif mt-4 text-4xl sm:text-5xl">Designed with you in mind. No hiding required.</h2>
            <p className="mt-5 leading-8 text-[var(--muted)]">
              From Ankara and Adire to bridal and pageant looks, every piece begins with your occasion, your measurements and your confidence.
            </p>
            <a href="#contact" className="btn btn-dark mt-8">Inside the atelier</a>
          </div>
        </section>

        {/* How it works — a genuine sequence, so numbering earns its place */}
        <section id="how" className="border-y border-[var(--line)] bg-[var(--blush)]/40 py-24">
          <div className="shell">
            <p className="label">How it works</p>
            <h2 className="serif mt-3 text-4xl sm:text-5xl">From first message to final fitting.</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                ['01', 'Send us the piece', 'Browse the collection, save what you love, and send it through on WhatsApp. We reply with sizing, fabric options and timeline the same day.'],
                ['02', 'Measure and confirm', "Come into the Festac atelier, or send measurements if you're outside Lagos. We confirm the cut, fabric and delivery date in writing before anything is cut."],
                ['03', 'Fitting and finish', 'One fitting for ready-to-wear, two for bridal and couture. Adjustments are included — the piece is not finished until it sits right.'],
              ].map(([n, t, d]) => (
                <div key={n} className="border-t-2 border-[var(--rose)] pt-5">
                  <span className="serif text-2xl text-[var(--rose)]">{n}</span>
                  <h3 className="serif mt-3 text-3xl">{t}</h3>
                  <p className="mt-4 leading-7 text-[var(--ink)]/70">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" style={{ background: 'var(--dusk)' }} className="py-16 text-white">
        <div className="shell grid gap-10 md:grid-cols-2 md:items-end">
          <div>
            <Image src="/images/logo-full-white.png" alt="Priscastyling" width={340} height={180} className="mb-8 w-[220px] object-contain" />
            <p className="label" style={{ color: 'var(--blush)' }}>Commissions open</p>
            <h2 className="serif mt-3 text-4xl sm:text-5xl">We take a limited number of pieces each month.</h2>
            <p className="mt-5 max-w-xl leading-7 text-white/60">Tell us the occasion and the date. We'll tell you honestly whether we can do it justice in the time you have.</p>
            <a href={wa('Hello Priscastyling, I would like to book a fitting.')} className="btn btn-grad mt-8">Book a fitting on WhatsApp</a>
          </div>
          <div className="text-sm text-white/65 md:text-right">
            <p>401 Road, I Close, Festac Town, Lagos 102102</p>
            <p className="mt-2">Open 24 hours</p>
            <a className="mt-4 inline-block text-lg font-medium text-white" href={wa('Hello Priscastyling, I would like to make an enquiry.')}>WhatsApp: 0813 529 6095</a>
            <div className="mt-8 flex flex-wrap justify-start gap-x-4 gap-y-2 md:justify-end">
              <a href={process.env.NEXT_PUBLIC_ADMIN_SITE_URL || 'https://priscastyling-admin.netlify.app'}>Admin access</a>
              <a href="https://www.instagram.com/rtwbypriscastyling/" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.tiktok.com/@priscastyling" target="_blank" rel="noreferrer">TikTok</a>
              <a href="https://www.facebook.com/61561086839715/" target="_blank" rel="noreferrer">Facebook</a>
            </div>
          </div>
        </div>
        <div className="shell mt-12 border-t border-white/15 pt-5 text-xs text-white/40">
          © 2026 Priscastyling · Body-positive ready-to-wear, bespoke and bridal fashion designed in Festac, Lagos.
        </div>
      </footer>

      {quick && <ProductModal product={quick} onClose={() => setQuick(null)} onAdd={addCart} />}
      {drawer && <Drawer type={drawer} cart={cart} wishlist={wishlist} setCart={setCart} setWishlist={setWishlist} onClose={() => setDrawer(null)} cartText={cartText} wishText={wishText} />}
      {notice && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-white shadow-xl">{notice}</div>}
    </>
  );
}
