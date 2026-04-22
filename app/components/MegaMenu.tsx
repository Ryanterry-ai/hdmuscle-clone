'use client';

import Link from 'next/link';
import { useState } from 'react';

type HeaderNavItem = {
  id?: string;
  title?: string;
  link?: string;
  type?: string;
  children?: Array<{
    title?: string;
    items: Array<{
      title?: string;
      link?: string;
    }>;
  }>;
  promoCard?: {
    link?: string;
    image?: string;
    title?: string;
    subtitle?: string;
  };
};

function normalizeLink(url?: string) {
  if (!url || typeof url !== 'string') return '/';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

export default function MegaMenu({ items }: { items: HeaderNavItem[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <nav className="mega-menu">
      {items.map((item, index) => {
        if (item.type !== 'megamenu') {
          return (
            <Link
              key={item.id || `${item.title || 'link'}-${index}`}
              href={normalizeLink(item.link)}
              className="mega-menu__link"
            >
              {item.title || 'Menu'}
            </Link>
          );
        }

        return (
          <div
            key={item.id || `${item.title || 'menu'}-${index}`}
            className="mega-menu__item"
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
          >
            <button type="button" className="mega-menu__trigger">
              {item.title || 'Menu'}
            </button>

            {active === index ? (
              <div className="mega-menu__panel">
                <div className="mega-menu__grid">
                  {item.promoCard ? (
                    <Link
                      href={normalizeLink(item.promoCard.link)}
                      className="mega-menu__promo"
                    >
                      {item.promoCard.image ? (
                        <img
                          src={item.promoCard.image}
                          alt={item.promoCard.title || 'Promo'}
                        />
                      ) : null}

                      <div className="mega-menu__promo-content">
                        <div className="mega-menu__promo-title">
                          {item.promoCard.title || 'Featured'}
                        </div>

                        {item.promoCard.subtitle ? (
                          <div className="mega-menu__promo-subtitle">
                            {item.promoCard.subtitle}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}

                  <div className="mega-menu__groups">
                    {(item.children || []).map((group, gIndex) => (
                      <div key={`${group.title || 'group'}-${gIndex}`}>
                        <div className="mega-menu__group-title">
                          {group.title || 'Category'}
                        </div>

                        {(group.items || []).map((sub, sIndex) => (
                          <Link
                            key={`${sub.title || 'sub'}-${sIndex}`}
                            href={normalizeLink(sub.link)}
                            className="mega-menu__group-link"
                          >
                            {sub.title || 'Item'}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}