'use client'

import Link from 'next/link'
import { useStore } from '../store-context'

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.4 2v12.1a3.9 3.9 0 1 1-3.2-3.8v2.3a1.7 1.7 0 1 0 1 1.5V2h2.2c.1 1.3.8 2.4 1.8 3.1.7.5 1.5.8 2.3.8v2.2a6.2 6.2 0 0 1-4.1-1.5V2z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.8 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5H17V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v1.8H7.8v3h2.5V21z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M22 12s0-3-1-4.4c-1.1-1.4-2.3-1.4-2.8-1.5C14.2 5.8 12 5.8 12 5.8h0s-2.2 0-6.2.3c-.5 0-1.7.1-2.8 1.5C2 9 2 12 2 12s0 3 1 4.4c1.1 1.4 2.6 1.4 3.3 1.5 2.4.2 5.7.3 5.7.3s2.2 0 6.2-.3c.5 0 1.7-.1 2.8-1.5 1-1.4 1-4.4 1-4.4z" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function Footer() {
  const { settings, storefront } = useStore()
  const rawFooter = storefront?.navigation?.footer_main
  const footerGroups = Array.isArray(rawFooter) && rawFooter.length > 0
    ? rawFooter
    : [
        {
          title: 'Support',
          links: [
            { label: 'PRIVACY POLICY', url: '/pages/privacy-policy' },
            { label: 'TERMS OF SERVICE', url: '/pages/terms-of-service' },
            { label: 'SHIPPING POLICY', url: '/pages/shipping-policy' },
            { label: 'REFUND POLICY', url: '/pages/refund-policy' },
          ],
        },
      ]

  const normalizedGroups: Array<{ title: string; links: Array<{ label: string; href: string }> }> = footerGroups.map((group: any, index: number) => {
    if (Array.isArray(group?.links)) {
      return {
        title: String(group?.title || `Group ${index + 1}`),
        links: group.links.map((link: any) => ({
          label: String(link?.label || link?.title || 'Link'),
          href: String(link?.url || link?.link || '#'),
        })),
      }
    }

    return {
      title: String(group?.label || group?.title || `Group ${index + 1}`),
      links: [
        {
          label: String(group?.label || group?.title || 'Link'),
          href: String(group?.url || group?.link || '#'),
        },
      ],
    }
  })

  const socialLinks = [
    { href: settings.instagram_url || 'https://instagram.com/hdmuscle.in', label: 'Instagram', Icon: InstagramIcon },
    { href: settings.tiktok_url || 'https://tiktok.com/@hdmuscle', label: 'TikTok', Icon: TikTokIcon },
    { href: settings.facebook_url || 'https://facebook.com/hdmuscle', label: 'Facebook', Icon: FacebookIcon },
    { href: settings.youtube_url || 'https://youtube.com/@hdmuscle', label: 'YouTube', Icon: YouTubeIcon },
  ]

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-back-top">BACK TO TOP</div>

      <div className="footer-news-grid">
        <div />

        <div className="footer-newsletter">
          <p className="footer-newsletter__copy">
            Receive email updates on stuff you'll probably want to know about, including products, launches, and events. All hype, no spam - but you can always unsubscribe at anytime.
          </p>

          <form className="footer-newsletter__form" onSubmit={(event) => event.preventDefault()}>
            <input type="email" placeholder="your@email.address" aria-label="Email" />
            <button type="submit">SUBSCRIBE</button>
          </form>
        </div>

        <div className="footer-links-grid">
          {normalizedGroups.slice(0, 3).map((group, idx) => (
            <div key={`${group.title}-${idx}`}>
              {group.links.map((link) => (
                <Link key={`${link.href}-${link.label}`} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="footer-social-row" aria-label="Social links">
        {socialLinks.map(({ href, label, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
            <Icon />
          </a>
        ))}
      </div>

      <div className="footer-bottom-row">
        <div className="footer-payments">
          <span>AMEX</span>
          <span>Apple Pay</span>
          <span>Discover</span>
          <span>G Pay</span>
          <span>Mastercard</span>
          <span>Shop</span>
          <span>VISA</span>
        </div>

        <div className="footer-country">( {settings.currency || 'INR'} {settings.symbol || String.fromCharCode(8377)} )</div>
      </div>

      <div className="footer-copyright">{settings.copyright_text || '(c) 2026 HD MUSCLE INDIA. All rights reserved.'}</div>
    </footer>
  )
}
