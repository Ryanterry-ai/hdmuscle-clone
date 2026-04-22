'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useCart } from './cart-context'
import { formatINR } from './lib/catalog'
import { useStore } from './store-context'

type MegaColumn = {
  title: string
  links: Array<{ label: string; href: string; badge?: string }>
}

type MegaPanel = {
  goalLinks?: Array<{ label: string; href: string; badge?: string }>
  columns: MegaColumn[]
  footerLink?: { label: string; href: string }
  featured?: { title: string; href: string; image: string; price: number }
}

type NavItem = {
  label: string
  href: string
  panel?: MegaPanel
}

const HD_PRIMARY_NAV_LABELS = ['SUPPLEMENTS', 'BUNDLES', 'APPAREL + ACCESSORIES', 'MORE']
const DEFAULT_ANNOUNCEMENT = `FREE SHIPPING OVER ${String.fromCharCode(8377)}9,999`

const NAV_ITEMS: NavItem[] = [
  {
    label: 'SUPPLEMENTS',
    href: '/collections/pre-workouts',
    panel: {
      goalLinks: [
        { label: 'PRE-WORKOUT \u2192', href: '/collections/pre-workouts' },
        { label: 'INTRA-WORKOUT \u2192', href: '/collections/intra-workouts' },
        { label: 'RECOVERY \u2192', href: '/collections/post-workout-recovery' },
        { label: 'PROTEIN \u2192', href: '/collections/protein' },
        { label: 'POST-WORKOUT \u2192', href: '/collections/post-workout-recovery' },
        { label: 'HEALTH + WELLNESS \u2192', href: '/collections/health-wellness' },
        { label: 'BUNDLES \u2192', href: '/collections/bundles', badge: 'Save' },
      ],
      columns: [
        {
          title: 'PRE-WORKOUT',
          links: [
            { label: 'PumpHD', href: '/products/pumphd', badge: 'New' },
            { label: 'PreHD Essential', href: '/products/prehd-essential' },
            { label: 'PreHD Ultra', href: '/products/prehd-ultra' },
            { label: 'PreHD Elite', href: '/products/prehd-elite' },
            { label: 'PreHD Black', href: '/products/prehd-black' },
            { label: 'StimHD', href: '/products/stimhd', badge: 'New' },
            { label: 'Shop All \u2192', href: '/collections/pre-workouts' },
          ],
        },
        {
          title: 'INTRA-WORKOUT + RECOVERY',
          links: [
            { label: 'CarbHD', href: '/collections/intra-workouts' },
            { label: 'CreaHD (Creapure\u00ae)', href: '/products/creahd' },
            { label: 'EaaHD', href: '/collections/intra-workouts' },
            { label: 'GlutaHD', href: '/products/glutahd' },
            { label: 'HydraHD', href: '/products/hydrahd', badge: 'New' },
            { label: 'IntraHD', href: '/products/intrahd' },
            { label: 'ProHD', href: '/products/prohd' },
            { label: 'Shop All \u2192', href: '/collections/intra-workouts' },
          ],
        },
        {
          title: 'PROTEIN',
          links: [{ label: 'ProHD', href: '/products/prohd' }],
        },
        {
          title: 'HEALTH + WELLNESS',
          links: [
            { label: 'Betaine HCL', href: '/collections/health-wellness' },
            { label: 'LiverHD', href: '/collections/health-wellness' },
            { label: 'BurnHD', href: '/collections/health-wellness' },
            { label: 'MultiHD', href: '/products/multihd' },
            { label: 'Citrus Bergamot', href: '/collections/health-wellness' },
            { label: 'Magnesium', href: '/collections/health-wellness' },
            { label: 'Curcumin', href: '/collections/health-wellness' },
            { label: 'Omega3', href: '/collections/health-wellness' },
            { label: 'CollagenHD', href: '/collections/health-wellness' },
            { label: 'SleepHD', href: '/collections/health-wellness' },
            { label: 'CreaHD (Creapure\u00ae)', href: '/products/creahd' },
            { label: 'VitaHD', href: '/collections/health-wellness' },
            { label: 'D3', href: '/collections/health-wellness' },
            { label: 'Zinc', href: '/collections/health-wellness' },
            { label: 'EaaHD', href: '/collections/intra-workouts' },
            { label: 'Shop All \u2192', href: '/collections/health-wellness' },
          ],
        },
      ],
      footerLink: { label: 'Shop All \u2192', href: '/collections/pre-workouts' },
      featured: {
        title: 'PUMPHD',
        href: '/products/pumphd',
        image: '/pumphd-rainbow-strips-ead9f7c7e482.png',
        price: 2799,
      },
    },
  },
  {
    label: 'BUNDLES',
    href: '/collections/bundles',
    panel: {
      columns: [
        {
          title: 'BUNDLES',
          links: [
            { label: 'Performance Stack', href: '/collections/bundles' },
            { label: 'Wellness Stack', href: '/collections/bundles' },
            { label: 'Pump + Recovery Stack', href: '/collections/bundles' },
            { label: 'Shop All \u2192', href: '/collections/bundles' },
          ],
        },
      ],
      featured: {
        title: 'BUNDLES',
        href: '/collections/bundles',
        image: '/hdmuscle72-1775078686011-5c8049f904ea.webp',
        price: 7999,
      },
    },
  },
  {
    label: 'APPAREL + ACCESSORIES',
    href: '/collections/apparel-accessories-2',
    panel: {
      columns: [
        {
          title: 'APPAREL',
          links: [
            { label: 'Jerseys', href: '/collections/apparel-accessories-2' },
            { label: 'T-Shirts', href: '/collections/apparel-accessories-2' },
            { label: 'Hats', href: '/collections/apparel-accessories-2' },
            { label: 'Accessories', href: '/collections/apparel-accessories-2' },
            { label: 'Shop All \u2192', href: '/collections/apparel-accessories-2' },
          ],
        },
      ],
      featured: {
        title: 'VARSITY BASEBALL JERSEY - NAVY BLUE',
        href: '/products/varsity-baseball-jersey-navy-blue',
        image: '/hd-jersey-navy-front-2c752149576d.jpg',
        price: 3999,
      },
    },
  },
  {
    label: 'MORE',
    href: '/pages/about-us',
    panel: {
      columns: [
        {
          title: 'INFORMATION',
          links: [
            { label: 'About Us', href: '/pages/about-us' },
            { label: 'Join The HD Collective', href: '/pages/ambassador-program' },
            { label: 'FAQ', href: '/pages/faq' },
            { label: 'Contact', href: '/pages/contact-us' },
            { label: 'Shipping Policy', href: '/pages/shipping-policy' },
            { label: 'Return Policy', href: '/pages/return-policy' },
          ],
        },
      ],
    },
  },
]

function mapCmsNavLinks(raw: any[]): NavItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return NAV_ITEMS

  const mapped: NavItem[] = raw.map((item: any, index: number) => {
    const label = String(item?.label || item?.title || '').trim() || `ITEM ${index + 1}`
    const href = String(item?.url || item?.link || '#').trim() || '#'
    const children = Array.isArray(item?.children) ? item.children : []

    if (children.length === 0) {
      return { label, href }
    }

    return {
      label,
      href,
      panel: {
        columns: [
          {
            title: label,
            links: children.map((child: any) => ({
              label: String(child?.label || child?.title || '').trim() || 'Link',
              href: String(child?.url || child?.link || '#').trim() || '#',
            })),
          },
        ],
      },
    }
  })

  const normalizedLabels = mapped.map((item) => item.label.toUpperCase())
  const hasPrimaryParity = HD_PRIMARY_NAV_LABELS.every((label) => normalizedLabels.includes(label))
  const supplementsItem = mapped.find((item) => item.label.toUpperCase() === 'SUPPLEMENTS')
  const hasSupplementsMega =
    Boolean(supplementsItem?.panel?.goalLinks?.length) && Boolean(supplementsItem?.panel?.columns?.length)

  // Keep strict parity with the reference nav whenever CMS data is a simplified variant.
  return hasPrimaryParity && hasSupplementsMega ? mapped : NAV_ITEMS
}

function normalizeAnnouncementText(raw: string | undefined) {
  const value = String(raw || '').trim()
  if (!value) return DEFAULT_ANNOUNCEMENT
  if (value.includes('$') || /\bUSD\b/i.test(value) || value.includes('?')) return DEFAULT_ANNOUNCEMENT
  return value
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  )
}

function AccountIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  )
}

function MobileDrawer({ open, onClose, navItems }: { open: boolean; onClose: () => void; navItems: NavItem[] }) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      drawerRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div className={`mobile-overlay${open ? ' open' : ''}`} onClick={onClose} aria-hidden />

      <div
        ref={drawerRef}
        className={`mobile-drawer${open ? ' open' : ''}`}
        role="dialog"
        aria-modal
        aria-label="Navigation menu"
        tabIndex={-1}
      >
        <div className="mobile-drawer__header">
          <span className="mobile-drawer__title">Menu</span>
          <button onClick={onClose} className="icon-btn" aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Mobile navigation">
          <ul className="mobile-nav__list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="mobile-nav__link" onClick={onClose}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { itemCount } = useCart()
  const { settings, storefront } = useStore()
  const navItems = mapCmsNavLinks(storefront?.navigation?.header_main || [])
  const activeItem = navItems.find((item) => item.label === activeMenu)

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function openMenu(label: string) {
    clearCloseTimer()
    setActiveMenu(label)
  }

  function scheduleClose() {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => setActiveMenu(null), 120)
  }

  return (
    <>
      <div className="announcement-bar" role="status" aria-live="polite">
        <p className="announcement-bar__text">{normalizeAnnouncementText(settings.announcement_text)}</p>
      </div>

      <header className="site-header">
        <div className="header-shell" onMouseLeave={scheduleClose}>
          <div className="header-left">
            <button
              className="header-mobile-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <MenuIcon />
            </button>

            <Link href="/" className="header-logo" aria-label="HD Muscle home">
              <img src={settings.logo || '/assets/HD logo.png'} alt="HD Muscle" />
            </Link>
          </div>

          <nav className="header-center" aria-label="Primary navigation">
            <ul className="header__nav">
              {navItems.map((item) => (
                <li className="header__nav-item" key={item.href} onMouseEnter={() => openMenu(item.label)}>
                  <Link href={item.href} className="header__nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-right">
            <button className="icon-btn" aria-label="Search">
              <SearchIcon />
            </button>

            <Link href="/auth" className="icon-btn" aria-label="Account">
              <AccountIcon />
            </Link>

            <Link href="/cart" className="cart-box" aria-label={`Cart ${itemCount}`}>
              {itemCount}
            </Link>
          </div>
        </div>

        <div
          className={`mega-panel${activeItem?.panel ? ' open' : ''}`}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
          aria-hidden={!activeItem?.panel}
        >
          {activeItem?.panel ? (
            <div className="mega-panel__shell">
              <div className="mega-panel__content">
                {activeItem.panel.goalLinks ? (
                  <div className="mega-panel__goal-col">
                    <p className="mega-panel__title">SHOP BY GOAL</p>
                    {activeItem.panel.goalLinks.map((link) => (
                      <Link key={link.href + link.label} href={link.href} className="mega-panel__goal-link">
                        <span>{link.label}</span>
                        {link.badge ? <span className="mega-panel__badge">{link.badge}</span> : null}
                      </Link>
                    ))}
                  </div>
                ) : null}

                {activeItem.panel.columns.map((column) => (
                  <div key={column.title} className="mega-panel__col">
                    <p className="mega-panel__title">{column.title}</p>
                    {column.links.map((link) => (
                      <Link key={link.href + link.label} href={link.href} className="mega-panel__link">
                        <span>{link.label}</span>
                        {link.badge ? <span className="mega-panel__badge">{link.badge}</span> : null}
                      </Link>
                    ))}
                  </div>
                ))}

                {activeItem.panel.footerLink ? (
                  <div className="mega-panel__footer-link">
                    <Link href={activeItem.panel.footerLink.href}>{activeItem.panel.footerLink.label}</Link>
                  </div>
                ) : null}
              </div>

              {activeItem.panel.featured ? (
                <Link href={activeItem.panel.featured.href} className="mega-panel__featured">
                  <img src={activeItem.panel.featured.image} alt={activeItem.panel.featured.title} />
                  <div>
                    <p>{activeItem.panel.featured.title}</p>
                    <span>{formatINR(activeItem.panel.featured.price)}</span>
                  </div>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} navItems={navItems} />
    </>
  )
}
