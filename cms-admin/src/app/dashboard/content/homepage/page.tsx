'use client';

import { useEffect, useState } from 'react';
import { SaveIcon, PhotographIcon, StarIcon, ShieldCheckIcon, UploadIcon } from '@heroicons/react/outline';
import PublishButton from '@/components/PublishButton';
import MediaPickerField from '@/components/MediaPickerField';

interface Section {
  section_key: string;
  content: string;
}

function safeParse(value: string | null | undefined) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function HomepageSectionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const [hero, setHero] = useState({
    heading: 'FIND YOUR FORMULA',
    subheading: 'Premium quality supplements for athletes.',
    cta_text: 'FIND YOUR FORMULA',
    cta_link: '/collections/pre-workouts',
    hero_image: '',
  });

  const [gallery, setGallery] = useState({
    image_1: '',
    image_2: '',
    image_3: '',
    image_4: '',
    image_5: '',
  });

  const [about, setAbout] = useState({
    heading: 'ABOUT US',
    content: 'HD Muscle is a family-built, performance-driven supplement brand founded in Canada.',
    image: '',
  });

  const [bestSellers, setBestSellers] = useState({ heading: 'SHOP OUR BEST SELLERS' });
  const [reviews, setReviews] = useState({
    heading: 'REAL PEOPLE, REAL REVIEWS',
    enable: true,
    itemsText: '',
  });
  const [faq, setFaq] = useState({
    heading: 'FREQUENTLY ASKED QUESTIONS',
    questionsText: '',
  });

  const [covered, setCovered] = useState({
    heading: "YOU'RE COVERED",
    easy_returns: "If something isn't right, we'll make it right.",
    fast_shipping: 'We ship from warehouses in both Canada and the USA.',
    guarantee: 'We stand behind every formula we make.',
    secure_checkout: 'Encrypted, secure payment processing.',
  });

  const fetchSections = async () => {
    try {
      const [sectionsRes, mediaRes] = await Promise.all([
        fetch('/api/content/sections', { credentials: 'include' }),
        fetch('/api/media', { credentials: 'include' }),
      ]);

      const sectionsData = await sectionsRes.json();
      const mediaData = await mediaRes.json();
      setMediaUrls((mediaData.media || []).map((item: any) => String(item.url || '')).filter(Boolean));

      (sectionsData.sections || []).forEach((section: Section) => {
        const content = safeParse(section.content) as any;
        if (section.section_key === 'hero') setHero((prev) => ({ ...prev, ...content }));
        if (section.section_key === 'hero_gallery') setGallery((prev) => ({ ...prev, ...content }));
        if (section.section_key === 'about') setAbout((prev) => ({ ...prev, ...content }));
        if (section.section_key === 'best_sellers') setBestSellers((prev) => ({ ...prev, ...content }));
        if (section.section_key === 'reviews' || section.section_key === 'testimonials') {
          const items = Array.isArray(content.items) ? content.items : [];
          const itemLines = items
            .map((item: any) => String(item?.text || item?.quote || '').trim())
            .filter(Boolean)
            .join('\n');
          setReviews((prev) => ({
            ...prev,
            ...content,
            itemsText: itemLines,
          }));
        }
        if (section.section_key === 'faq') {
          const questions = Array.isArray(content.questions) ? content.questions : [];
          const questionLines = questions
            .map((item: any) => String(item?.question || '').trim())
            .filter(Boolean)
            .join('\n');
          setFaq((prev) => ({
            ...prev,
            ...content,
            questionsText: questionLines,
          }));
        }
        if (section.section_key === 'you_re_covered') setCovered((prev) => ({ ...prev, ...content }));
      });
    } catch (error) {
      console.error('Failed to fetch homepage sections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const reviewItems = normalizeLines(reviews.itemsText).map((line) => ({
        text: line,
        quote: line,
      }));

      const faqItems = normalizeLines(faq.questionsText).map((line) => ({
        question: line,
      }));

      const sectionData = [
        {
          key: 'hero',
          section_type: 'hero',
          title: 'Hero',
          content: hero,
        },
        { key: 'hero_gallery', section_type: 'hero_gallery', title: 'Gallery', content: gallery },
        {
          key: 'about',
          section_type: 'brand_story',
          title: 'About',
          content: about,
        },
        { key: 'best_sellers', section_type: 'featured_products', title: 'Best Sellers', content: bestSellers },
        {
          key: 'reviews',
          section_type: 'testimonials',
          title: 'Reviews',
          content: {
            heading: reviews.heading,
            enable: reviews.enable,
            items: reviewItems,
          },
        },
        {
          key: 'faq',
          section_type: 'faq',
          title: 'FAQ',
          content: {
            heading: faq.heading,
            questions: faqItems,
          },
        },
        { key: 'you_re_covered', section_type: 'guarantee', title: "You're Covered", content: covered },
      ];

      for (const section of sectionData) {
        await fetch('/api/content/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            section_key: section.key,
            section_type: section.section_type,
            title: section.title,
            content: JSON.stringify(section.content),
            status: 'PUBLISHED',
          }),
        });
      }

      alert('Homepage content saved successfully.');
    } catch (error) {
      console.error('Failed to save homepage sections:', error);
      alert('Failed to save homepage content.');
    } finally {
      setSaving(false);
    }
  };

  const Input = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={{ color: '#111827' }}
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5"
    />
  );

  const Textarea = ({
    value,
    onChange,
    rows = 2,
  }: {
    value: string;
    onChange: (value: string) => void;
    rows?: number;
  }) => (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      style={{ color: '#111827' }}
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5"
    />
  );

  if (loading) return <div className="h-96 animate-pulse rounded-xl bg-gray-200" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homepage Content</h1>
          <p className="mt-1 text-slate-500">Upload media directly or import URL, then Save and Publish.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            <SaveIcon className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <PublishButton onPublish={fetchSections} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="flex items-center gap-3 font-semibold text-slate-900">
            <PhotographIcon className="h-6 w-6 text-indigo-600" />
            Hero
          </h2>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Heading</label>
              <Input value={hero.heading} onChange={(value) => setHero({ ...hero, heading: value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Subheading</label>
              <Input value={hero.subheading} onChange={(value) => setHero({ ...hero, subheading: value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">CTA Text</label>
              <Input value={hero.cta_text} onChange={(value) => setHero({ ...hero, cta_text: value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">CTA Link</label>
              <Input value={hero.cta_link} onChange={(value) => setHero({ ...hero, cta_link: value })} />
            </div>
          </div>
          <MediaPickerField
            theme="light"
            label="Hero Image"
            value={hero.hero_image}
            onChange={(value) => setHero({ ...hero, hero_image: value })}
            mediaUrls={mediaUrls}
            datalistId="homepage-media-options-hero"
            helperText="Attach/upload media or import URL."
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="flex items-center gap-3 font-semibold text-slate-900">
            <UploadIcon className="h-6 w-6 text-indigo-600" />
            Gallery Images
          </h2>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5].map((index) => (
              <MediaPickerField
                key={index}
                theme="light"
                label={`Image ${index}`}
                value={gallery[`image_${index}` as keyof typeof gallery]}
                onChange={(value) =>
                  setGallery({
                    ...gallery,
                    [`image_${index}`]: value,
                  })
                }
                mediaUrls={mediaUrls}
                datalistId={`homepage-media-options-gallery-${index}`}
                helperText="Upload/import and this slot will be updated."
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="flex items-center gap-3 font-semibold text-slate-900">
            <PhotographIcon className="h-6 w-6 text-indigo-600" />
            About
          </h2>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Heading</label>
            <Input value={about.heading} onChange={(value) => setAbout({ ...about, heading: value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Content</label>
            <Textarea value={about.content} rows={4} onChange={(value) => setAbout({ ...about, content: value })} />
          </div>
          <MediaPickerField
            theme="light"
            label="About Image"
            value={about.image}
            onChange={(value) => setAbout({ ...about, image: value })}
            mediaUrls={mediaUrls}
            datalistId="homepage-media-options-about"
            helperText="Upload/import media for this block."
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="flex items-center gap-3 font-semibold text-slate-900">
            <StarIcon className="h-6 w-6 text-amber-500" />
            Product Row Titles
          </h2>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Best Sellers Heading</label>
            <Input value={bestSellers.heading} onChange={(value) => setBestSellers({ ...bestSellers, heading: value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Testimonials Heading</label>
            <Input value={reviews.heading} onChange={(value) => setReviews({ ...reviews, heading: value })} />
          </div>
          <label className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={reviews.enable}
              onChange={(event) => setReviews({ ...reviews, enable: event.target.checked })}
            />
            <span className="text-sm font-medium text-slate-700">Enable testimonial section</span>
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="flex items-center gap-3 font-semibold text-slate-900">
            <StarIcon className="h-6 w-6 text-yellow-500" />
            Testimonials
          </h2>
        </div>
        <div className="space-y-4 p-6">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Testimonial Entries (one quote per line)
          </label>
          <Textarea value={reviews.itemsText} rows={6} onChange={(value) => setReviews({ ...reviews, itemsText: value })} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900">FAQ</h2>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">FAQ Heading</label>
            <Input value={faq.heading} onChange={(value) => setFaq({ ...faq, heading: value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Questions (one per line)</label>
            <Textarea value={faq.questionsText} rows={6} onChange={(value) => setFaq({ ...faq, questionsText: value })} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="flex items-center gap-3 font-semibold text-slate-900">
            <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
            You're Covered
          </h2>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Heading</label>
            <Input value={covered.heading} onChange={(value) => setCovered({ ...covered, heading: value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Easy Returns</label>
              <Textarea value={covered.easy_returns} onChange={(value) => setCovered({ ...covered, easy_returns: value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Fast Shipping</label>
              <Textarea value={covered.fast_shipping} onChange={(value) => setCovered({ ...covered, fast_shipping: value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Guarantee</label>
              <Textarea value={covered.guarantee} onChange={(value) => setCovered({ ...covered, guarantee: value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Secure Checkout</label>
              <Textarea value={covered.secure_checkout} onChange={(value) => setCovered({ ...covered, secure_checkout: value })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

