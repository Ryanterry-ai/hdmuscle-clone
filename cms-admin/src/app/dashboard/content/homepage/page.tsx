'use client';

import { useState, useState as ReactUseState } from 'react';
import { SaveIcon, PhotographIcon, StarIcon, ShieldCheckIcon, TruckIcon, LockClosedIcon, ReplyIcon, UploadIcon, LinkIcon } from '@heroicons/react/outline';
import PublishButton from '@/components/PublishButton';

interface Section {
  id: string;
  section_key: string;
  title: string | null;
  content: string;
}

export default function HomepageSectionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'base64'>('url');
  
  const [hero, setHero] = useState({
    heading: 'FIND YOUR FORMULA',
    subheading: 'Premium Quality Supplements for Athletes',
    cta_text: 'Shop All — Supplements',
    cta_link: '/collections/best-selling-collection',
    hero_image: '',
    hero_image_base64: '',
  });

  const [gallery, setGallery] = useState({
    image_1: '', image_1_base64: '',
    image_2: '', image_2_base64: '',
    image_3: '', image_3_base64: '',
    image_4: '', image_4_base64: '',
    image_5: '', image_5_base64: '',
  });

  const [about, setAbout] = useState({
    heading: 'ABOUT US',
    content: 'HD Muscle is a family-built, performance-driven supplement brand founded in Canada.',
    image: '',
    image_base64: '',
  });

  const [bestSellers, setBestSellers] = useState({ heading: 'SHOP OUR BEST SELLERS' });
  const [reviews, setReviews] = useState({ heading: 'REAL PEOPLE, REAL REVIEWS', enable: true });

  const [covered, setCovered] = useState({
    heading: "YOU'RE COVERED",
    easy_returns: "If something isn't right, we'll make it right.",
    fast_shipping: "We ship from warehouses in both Canada and the USA.",
    guarantee: "We stand behind every formula we make.",
    secure_checkout: "Encrypted, secure payment processing.",
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, section: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadMethod === 'url') {
      alert('Please use the URL field, or change method to Base64 for small images');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (base64.length > 500000) {
        alert('Image too large! Use URL method or resize image below 500KB');
        return;
      }

      if (section === 'hero') {
        setHero(prev => ({ ...prev, hero_image_base64: base64, hero_image: '' }));
      } else if (section === 'about') {
        setAbout(prev => ({ ...prev, image_base64: base64, image: '' }));
      } else if (section === 'gallery') {
        setGallery(prev => ({ ...prev, [`${field}_base64`]: base64, [field]: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/content/sections');
      const data = await res.json();
      (data.sections || []).forEach((s: Section) => {
        const c = JSON.parse(s.content || '{}');
        if (s.section_key === 'hero') setHero(prev => ({ ...prev, ...c }));
        if (s.section_key === 'hero_gallery') setGallery(prev => ({ ...prev, ...c }));
        if (s.section_key === 'about') setAbout(prev => ({ ...prev, ...c }));
        if (s.section_key === 'best_sellers') setBestSellers(prev => ({ ...prev, ...c }));
        if (s.section_key === 'reviews') setReviews(prev => ({ ...prev, ...c }));
        if (s.section_key === 'you_re_covered') setCovered(prev => ({ ...prev, ...c }));
      });
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  ReactUseState(() => { fetchSections(); });

  const handleSave = async () => {
    setSaving(true);
    try {
      const sectionData = [
        { key: 'hero', title: 'Hero', content: { ...hero, hero_image: hero.hero_image_base64 || hero.hero_image } },
        { key: 'hero_gallery', title: 'Gallery', content: gallery },
        { key: 'about', title: 'About', content: { ...about, image: about.image_base64 || about.image } },
        { key: 'best_sellers', title: 'Best Sellers', content: bestSellers },
        { key: 'reviews', title: 'Reviews', content: reviews },
        { key: 'you_re_covered', title: "You're Covered", content: covered },
      ];

      for (const { key, title, content } of sectionData) {
        await fetch('/api/content/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section_key: key, section_type: key, title, content: JSON.stringify(content), status: 'PUBLISHED' }),
        });
      }
      alert('Saved successfully!\n\nNote: Base64 images are stored temporarily and will reset on redeploy. Use URL method for permanence.');
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const Input = ({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
    <input 
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ color: '#111827' }}
      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white"
    />
  );

  const Textarea = ({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
    <textarea 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      style={{ color: '#111827' }}
      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white"
    />
  );

  const ImageField = ({ label, urlValue, base64Value, urlOnChange, section, field }: { 
    label: string, 
    urlValue: string, 
    base64Value: string,
    urlOnChange: (v: string) => void, 
    section: string, 
    field: string 
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="https://example.com/image.jpg" 
          style={{ color: '#111827' }}
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg bg-white placeholder-gray-400" 
          value={urlValue} 
          onChange={(e) => urlOnChange(e.target.value)} 
        />
        {uploadMethod === 'base64' && (
          <label className="px-4 py-2.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 flex items-center gap-2 bg-white">
            <UploadIcon className="w-4 h-4" />
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, section, field)} />
          </label>
        )}
      </div>
      {urlValue && (
        <div className="mt-2">
          <img 
            src={urlValue} 
            alt="Preview" 
            className="w-24 h-24 object-cover rounded-lg border"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}
      {base64Value && (
        <img src={base64Value} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-lg border" />
      )}
    </div>
  );

  if (loading) return <div className="animate-pulse h-96 bg-gray-200 rounded-xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homepage Content</h1>
          <p className="text-slate-500 mt-1">
            {uploadMethod === 'url' ? 'Use Image URLs (permanent)' : 'Base64 Upload (temporary - resets on deploy)'}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button 
              onClick={() => setUploadMethod('url')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 ${uploadMethod === 'url' ? 'bg-white shadow' : 'text-slate-500'}`}
            >
              <LinkIcon className="w-4 h-4" /> URL
            </button>
            <button 
              onClick={() => setUploadMethod('base64')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 ${uploadMethod === 'base64' ? 'bg-white shadow' : 'text-slate-500'}`}
            >
              <UploadIcon className="w-4 h-4" /> Upload
            </button>
          </div>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl">
            <SaveIcon className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <PublishButton onPublish={fetchSections} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200"><h2 className="font-semibold text-slate-900 flex items-center gap-3"><PhotographIcon className="w-6 h-6 text-indigo-600" />Hero</h2></div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Heading</label><Input label="Heading" value={hero.heading} onChange={(v) => setHero({...hero, heading: v})} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Subheading</label><Input label="Subheading" value={hero.subheading} onChange={(v) => setHero({...hero, subheading: v})} /></div>
          </div>
          <ImageField label="Hero Image" urlValue={hero.hero_image} base64Value={hero.hero_image_base64} urlOnChange={(v) => setHero({...hero, hero_image: v, hero_image_base64: ''})} section="hero" field="image" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200"><h2 className="font-semibold text-slate-900 flex items-center gap-3"><UploadIcon className="w-6 h-6 text-indigo-600" />Gallery Images</h2></div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4,5].map(i => (
              <ImageField key={i} label={`Image ${i}`} urlValue={gallery[`image_${i}` as keyof typeof gallery]} base64Value={gallery[`image_${i}_base64` as keyof typeof gallery]} urlOnChange={(v) => setGallery({...gallery, [`image_${i}`]: v, [`image_${i}_base64`]: ''})} section="gallery" field={`image_${i}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200"><h2 className="font-semibold text-slate-900 flex items-center gap-3"><PhotographIcon className="w-6 h-6 text-indigo-600" />About</h2></div>
        <div className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Heading</label><Input label="Heading" value={about.heading} onChange={(v) => setAbout({...about, heading: v})} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Content</label><Textarea label="Content" value={about.content} onChange={(v) => setAbout({...about, content: v})} rows={4} /></div>
          <ImageField label="About Image" urlValue={about.image} base64Value={about.image_base64} urlOnChange={(v) => setAbout({...about, image: v, image_base64: ''})} section="about" field="image" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200"><h2 className="font-semibold text-slate-900 flex items-center gap-3"><StarIcon className="w-6 h-6 text-amber-500" />Best Sellers</h2></div>
        <div className="p-6"><Input label="Heading" value={bestSellers.heading} onChange={(v) => setBestSellers({...bestSellers, heading: v})} /></div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200"><h2 className="font-semibold text-slate-900 flex items-center gap-3"><StarIcon className="w-6 h-6 text-yellow-500" />Reviews</h2></div>
        <div className="p-6">
          <Input label="Heading" value={reviews.heading} onChange={(v) => setReviews({...reviews, heading: v})} />
          <label className="flex items-center gap-2 mt-3"><input type="checkbox" checked={reviews.enable} onChange={(e) => setReviews({...reviews, enable: e.target.checked})} /><span className="text-sm font-medium text-slate-700">Enable</span></label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200"><h2 className="font-semibold text-slate-900 flex items-center gap-3"><ShieldCheckIcon className="w-6 h-6 text-emerald-600" />You're Covered</h2></div>
        <div className="p-6 space-y-4">
          <Input label="Heading" value={covered.heading} onChange={(v) => setCovered({...covered, heading: v})} />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Easy Returns</label><Textarea label="Easy Returns" value={covered.easy_returns} onChange={(v) => setCovered({...covered, easy_returns: v})} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Fast Shipping</label><Textarea label="Fast Shipping" value={covered.fast_shipping} onChange={(v) => setCovered({...covered, fast_shipping: v})} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Guarantee</label><Textarea label="Guarantee" value={covered.guarantee} onChange={(v) => setCovered({...covered, guarantee: v})} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Secure Checkout</label><Textarea label="Secure Checkout" value={covered.secure_checkout} onChange={(v) => setCovered({...covered, secure_checkout: v})} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}