'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from './cart-context';
import { fetchStorefrontPayload, getNavigation, getSettings, type HeaderNavItem } from './lib/cms';
import MegaMenu from './components/MegaMenu';
import SearchDrawer from './components/SearchDrawer';

export default function Header() {
  const { items } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [nav, setNav] = useState<{ header_main: HeaderNavItem[]; utility_links?: any[] }>({
    header_main: [],
    utility_links: [],
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStorefrontPayload().then((data) => {
      setSettings(getSettings(data));
      setNav(getNavigation(data));
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const announcement = settings?.announcement_bar;
  const utilityLinks = nav?.utility_links || [];

  return (
    <>
      {announcement?.enabled ? (
        <div className="announcement-bar">
          <div className="container-wide announcement-bar__inner">
            <span>{announcement.text}</span>
            {announcement.link && announcement.link_text ? (
              <Link href={announcement.link} className="announcement-bar__link">
                {announcement.link_text}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <header
        ref={menuRef}
        className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}
      >
        <div className="container-wide">
          <div className="site-header__top">
            <div className="site-header__brand">
              <button
                className="site-header__mobile-toggle"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                ☰
              </button>

              <Link href="/" className="site-header__logo">
                {settings?.logo_text || 'HD MUSCLE'}
              </Link>
            </div>

            <MegaMenu items={nav?.header_main || []} />

            <div className="site-header__actions">
              <button
                className="site-header__icon-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <i className="fas fa-search" />
              </button>
              <Link href="/auth" className="site-header__icon-btn" aria-label="Account">
                <i className="far fa-user" />
              </Link>
              <Link href="/cart" className="site-header__icon-btn site-header__cart" aria-label="Cart">
                <i className="fas fa-shopping-bag" />
                {items.length > 0 ? <span className="site-header__cart-count">{items.length}</span> : null}
              </Link>
            </div>
          </div>

          {(utilityLinks?.length || 0) > 0 ? (
            <div className="site-header__utility">
              {utilityLinks.map((item, index) => (
                <Link key={`${item.title}-${index}`} href={item.link} className="site-header__utility-link">
                  {item.title}
                </Link>
              ))}
            </div>
          ) : null}

          {mobileOpen ? (
            <div className="site-header__mobile-menu">
              <div className="site-header__mobile-links">
                {(nav?.header_main || []).map((item, index) => (
                  <div key={`${item.title}-${index}`} className="site-header__mobile-group">
                    <Link href={item.link || '#'} className="site-header__mobile-parent">
                      {item.title}
                    </Link>
                    {item.children?.length ? (
                      <div className="site-header__mobile-children">
                        {item.children.map((group, groupIndex) => (
                          <div key={`${group.title}-${groupIndex}`} className="site-header__mobile-child-group">
                            <div className="site-header__mobile-child-heading">{group.title}</div>
                            {group.items.map((sub, subIndex) => (
                              <Link key={`${sub.title}-${subIndex}`} href={sub.link} className="site-header__mobile-child-link">
                                {sub.title}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}

                {(utilityLinks || []).map((item, index) => (
                  <Link key={`${item.title}-util-${index}`} href={item.link} className="site-header__mobile-utility">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <SearchDrawer
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        suggestions={settings?.search_suggestions || []}
      />
    </>
  );
}