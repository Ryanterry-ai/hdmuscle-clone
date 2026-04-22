'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TemplateIcon,
  TrashIcon,
} from '@heroicons/react/outline';

interface Section {
  id: string;
  section_key: string;
  section_type: string;
  title: string | null;
  content: string;
  position: number;
  status: string;
  updated_at: string;
  published_at?: string | null;
}

interface SectionEditorState {
  id: string;
  section_key: string;
  section_type: string;
  title: string;
  content: string;
  position: number;
  status: string;
}

type SectionTemplate = {
  type: string;
  label: string;
  description: string;
  runtime: 'live' | 'planned';
};

const sectionTypes: SectionTemplate[] = [
  {
    type: 'hero',
    label: 'Homepage hero',
    description: 'Controls the homepage hero heading, subheading, and CTA buttons.',
    runtime: 'live',
  },
  {
    type: 'announcement_bar',
    label: 'Announcement bar',
    description: 'Controls the global shipping or campaign message at the top of the site.',
    runtime: 'live',
  },
  {
    type: 'brand_story',
    label: 'Brand story',
    description: 'Controls the homepage brand story heading and supporting copy.',
    runtime: 'live',
  },
  {
    type: 'faq',
    label: 'Homepage FAQ',
    description: 'Controls the homepage FAQ title and question-answer pairs.',
    runtime: 'live',
  },
  {
    type: 'footer_newsletter',
    label: 'Footer newsletter',
    description: 'Controls the footer email capture copy, placeholder, and CTA label.',
    runtime: 'live',
  },
  {
    type: 'featured_products',
    label: 'Featured products',
    description: 'Controls the homepage best-seller strip heading and view-all CTA without touching cart logic.',
    runtime: 'live',
  },
  {
    type: 'collection_spotlight',
    label: 'Collection spotlight',
    description: 'Controls the homepage collection cards, links, and artwork.',
    runtime: 'live',
  },
  {
    type: 'custom_html',
    label: 'Custom HTML block',
    description: 'Use for future runtime extensions and one-off published payload blocks.',
    runtime: 'planned',
  },
];

function stringifyContent(payload: unknown) {
  return JSON.stringify(payload, null, 2);
}

function buildDefaultContent(type: string) {
  switch (type) {
    case 'hero':
      return stringifyContent({
        heading: 'FIND YOUR FORMULA',
        subheading: 'Premium quality supplements for athletes built for performance, strength, and recovery.',
        cta_text: 'FIND YOUR FORMULA',
        cta_link: '/collections/pre-workouts',
        secondary_cta_text: 'Shop All Supplements',
        secondary_cta_link: '/collections/shop-all-supplements',
      });
    case 'announcement_bar':
      return stringifyContent({
        text: 'FREE SHIPPING OVER ₹149',
        link: '/collections/best-selling-collection',
      });
    case 'brand_story':
      return stringifyContent({
        heading: 'ABOUT HD MUSCLE',
        body: 'HD Muscle is a family-built, performance-driven supplement brand focused on strength, recovery, daily wellness, and athlete-first product development.',
      });
    case 'faq':
      return stringifyContent({
        heading: 'Frequently Asked Questions',
        items: [
          {
            question: 'What makes HD Muscle supplements different?',
            answer:
              'Our formulas use clinically backed ingredients, transparent labels, and effective dosages. No proprietary blends, no fillers — just supplements that work.',
          },
          {
            question: 'Are your products safe and third-party tested?',
            answer:
              'Yes. All HD Muscle supplements are produced in GMP-certified facilities and tested for purity, potency, and heavy metals.',
          },
          {
            question: 'Are your products vegan or gluten-free?',
            answer:
              'It depends on the product. Many health and wellness items are vegan-friendly, while some performance formulas contain dairy or animal-based ingredients.',
          },
        ],
      });
    case 'footer_newsletter':
      return stringifyContent({
        body: 'Receive email updates on stuff you will probably want to know about, including products, launches, and events.',
        placeholder: 'your@email.address',
        button_text: 'Subscribe',
      });
    case 'featured_products':
      return stringifyContent({
        heading: 'SHOP OUR BEST SELLERS',
        cta_text: 'View all products',
        cta_link: '/collections/best-selling-collection',
      });
    case 'collection_spotlight':
      return stringifyContent({
        heading: 'Shop by Collection',
        items: [
          {
            image_url: '/assets/images/img_4801-62368a701296.jpg',
            title: 'Health + Wellness',
            link: '/collections/health-wellness',
          },
          {
            image_url: '/assets/images/untitled_design_32-a97760a5a7fa.png',
            title: 'Pre-workout',
            link: '/collections/pre-workouts',
          },
          {
            image_url: '/assets/images/max09367-79d461f0e988.jpg',
            title: 'Intra-workout',
            link: '/collections/intra-workouts',
          },
          {
            image_url: '/assets/images/untitled_design_28-aaf3dbf0accf.png',
            title: 'Recovery',
            link: '/collections/post-workout',
          },
        ],
        collections: [
          {
            image_url: '/assets/images/untitled_design_32-a97760a5a7fa.png',
            title: 'Pre-workout',
            link: '/collections/pre-workouts',
          },
        ],
      });
    default:
      return stringifyContent({
        heading: 'New section',
        body: 'Replace this placeholder content in the CMS editor.',
      });
  }
}

function toEditorState(section: Section): SectionEditorState {
  return {
    id: section.id,
    section_key: section.section_key,
    section_type: section.section_type,
    title: section.title || '',
    content: section.content,
    position: section.position,
    status: section.status,
  };
}

function getTemplate(type: string) {
  return sectionTypes.find((item) => item.type === type) || null;
}

function validateJson(value: string) {
  try {
    const parsed = JSON.parse(value);
    return {
      valid: true,
      formatted: JSON.stringify(parsed, null, 2),
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      formatted: value,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
}

export default function ContentPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [submittingType, setSubmittingType] = useState<string | null>(null);
  const [editorSaving, setEditorSaving] = useState(false);
  const [activeEditor, setActiveEditor] = useState<SectionEditorState | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const publishedCount = useMemo(
    () => sections.filter((section) => section.status === 'PUBLISHED').length,
    [sections],
  );

  const liveRuntimeCount = useMemo(() => sectionTypes.filter((section) => section.runtime === 'live').length, []);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/content/sections', { credentials: 'include' });
      const data = await res.json();
      setSections(data.sections || []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSection = async (type: string) => {
    setSubmittingType(type);

    try {
      const countForType = sections.filter((section) => section.section_type === type).length + 1;
      const title = getTemplate(type)?.label || 'New section';

      const res = await fetch('/api/content/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          section_key: `${type}-${Date.now()}`,
          section_type: type,
          title: countForType > 1 ? `${title} ${countForType}` : title,
          content: buildDefaultContent(type),
          position: sections.length + 1,
          status: 'DRAFT',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create section');
      }

      const createdSection = (await res.json()) as Section;
      setShowAddModal(false);
      await fetchSections();
      setActiveEditor(toEditorState(createdSection));
      setEditorOpen(true);
    } catch (error) {
      console.error(error);
      alert('Unable to create a section right now.');
    } finally {
      setSubmittingType(null);
    }
  };

  const saveSection = async (nextStatus?: 'DRAFT' | 'PUBLISHED') => {
    if (!activeEditor) {
      return;
    }

    const validation = validateJson(activeEditor.content);
    if (!validation.valid) {
      alert(`The JSON content is invalid: ${validation.error}`);
      return;
    }

    setEditorSaving(true);

    try {
      const res = await fetch(`/api/content/sections/${activeEditor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...activeEditor,
          content: validation.formatted,
          status: nextStatus || activeEditor.status,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save section');
      }

      const updatedSection = (await res.json()) as Section;
      setActiveEditor(toEditorState(updatedSection));
      await fetchSections();
    } catch (error) {
      console.error(error);
      alert('Unable to save this section right now.');
    } finally {
      setEditorSaving(false);
    }
  };

  const deleteSection = async (id: string) => {
    const confirmed = window.confirm('Delete this section permanently?');
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/content/sections/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete section');
      }

      if (activeEditor?.id === id) {
        setEditorOpen(false);
        setActiveEditor(null);
      }

      await fetchSections();
    } catch (error) {
      console.error(error);
      alert('Unable to delete this section right now.');
    }
  };

  const openEditor = (section: Section) => {
    setActiveEditor(toEditorState(section));
    setEditorOpen(true);
  };

  const activeTemplate = activeEditor ? getTemplate(activeEditor.section_type) : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-72 animate-pulse rounded-[2rem] bg-white/70" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Storefront editor</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-stone-950">Published content</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
            This screen is now the source of truth for the blocks exposed to <strong>hdmuscle.in</strong> through the
            public CMS API. Draft sections stay private. Published sections are available to the live site
            immediately.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100">
            <EyeIcon className="h-4 w-4" />
            {publishedCount} published
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <PlusIcon className="h-4 w-4" />
            Add section
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 border-b border-black/5 px-6 py-4 text-sm text-stone-500 md:grid-cols-3">
          <div>
            <span className="font-semibold text-stone-900">{sections.length}</span> sections in CMS
          </div>
          <div>
            <span className="font-semibold text-stone-900">{publishedCount}</span> visible to the public API
          </div>
          <div>
            <span className="font-semibold text-stone-900">{liveRuntimeCount}</span> section types wired into the live
            homepage/global runtime
          </div>
        </div>

        {sections.length > 0 ? (
          <div className="divide-y divide-black/5">
            {sections.map((section) => {
              const template = getTemplate(section.section_type);
              const isRuntimeLive = template?.runtime === 'live';

              return (
                <article
                  key={section.id}
                  className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
                      <TemplateIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-heading text-xl font-semibold text-stone-950">
                          {section.title || section.section_key}
                        </h2>
                        <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
                          {section.section_type.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            section.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {section.status}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            isRuntimeLive ? 'bg-sky-100 text-sky-700' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {isRuntimeLive ? 'Runtime live' : 'Planned'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-500">
                        Key: <span className="font-medium text-stone-700">{section.section_key}</span> · Position:{' '}
                        <span className="font-medium text-stone-700">{section.position}</span>
                      </p>
                      {template?.description ? (
                        <p className="mt-2 text-sm leading-6 text-stone-500">{template.description}</p>
                      ) : null}
                      <p className="mt-3 line-clamp-4 max-w-3xl whitespace-pre-wrap rounded-2xl bg-stone-50 p-4 text-xs leading-6 text-stone-500">
                        {section.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openEditor(section)}
                      className="rounded-full border border-black/10 p-3 text-stone-500 transition hover:border-orange-300 hover:text-orange-700"
                      title="Edit section"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditor(section)}
                      className={`rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${
                        section.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-900 text-white'
                      }`}
                    >
                      {section.status === 'PUBLISHED' ? 'Published' : 'Open editor'}
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="rounded-full border border-black/10 p-3 text-stone-500 transition hover:border-red-300 hover:text-red-700"
                      title="Delete section"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="font-heading text-2xl font-semibold text-stone-950">No sections yet</p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-500">
              Start with an announcement bar, homepage hero, brand story, FAQ, and footer newsletter. Those are the
              first content blocks now wired into the public runtime.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <PlusIcon className="h-4 w-4" />
              Create first section
            </button>
          </div>
        )}
      </section>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-4xl rounded-[2rem] bg-[#14110f] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-orange-300">Add section</p>
                <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Choose a content block</h2>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  Selecting a block creates a draft section in Prisma immediately. Open the editor, refine the JSON,
                  then publish when it is ready for the live site.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-stone-300 transition hover:border-white/20 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {sectionTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => createSection(type.type)}
                  disabled={Boolean(submittingType)}
                  className="flex items-start justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-orange-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div>
                    <p className="font-medium text-white">{type.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">{type.type}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-400">{type.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                      type.runtime === 'live' ? 'bg-sky-400/15 text-sky-200' : 'bg-white/10 text-stone-300'
                    }`}
                  >
                    {submittingType === type.type ? 'Creating…' : type.runtime}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {editorOpen && activeEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-5xl rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 border-b border-black/5 pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Section editor</p>
                <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-stone-950">
                  {activeEditor.title || activeEditor.section_key}
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Edit the JSON payload for this section. Save as draft to keep it private, or publish it so the
                  storefront API can expose it to <strong>hdmuscle.in</strong>.
                </p>
              </div>
              <button
                onClick={() => setEditorOpen(false)}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr,1.9fr]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Title</label>
                  <input
                    value={activeEditor.title}
                    onChange={(event) =>
                      setActiveEditor((current) =>
                        current
                          ? {
                              ...current,
                              title: event.target.value,
                            }
                          : current,
                      )
                    }
                    className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Section key</label>
                  <input
                    value={activeEditor.section_key}
                    onChange={(event) =>
                      setActiveEditor((current) =>
                        current
                          ? {
                              ...current,
                              section_key: event.target.value,
                            }
                          : current,
                      )
                    }
                    className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Section type</label>
                  <input
                    value={activeEditor.section_type}
                    readOnly
                    className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-stone-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Position</label>
                  <input
                    type="number"
                    value={activeEditor.position}
                    onChange={(event) =>
                      setActiveEditor((current) =>
                        current
                          ? {
                              ...current,
                              position: Number(event.target.value || 0),
                            }
                          : current,
                      )
                    }
                    className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="rounded-3xl bg-stone-50 p-4 text-sm leading-6 text-stone-500">
                  <p className="font-semibold text-stone-800">Runtime support</p>
                  <p className="mt-2">{activeTemplate?.description || 'This section has no runtime note yet.'}</p>
                  <p className="mt-2">
                    Status:{' '}
                    <span className="font-medium text-stone-700">
                      {activeTemplate?.runtime === 'live' ? 'Live on public site' : 'Planned for later runtime pass'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">JSON content</label>
                  <textarea
                    rows={22}
                    value={activeEditor.content}
                    onChange={(event) =>
                      setActiveEditor((current) =>
                        current
                          ? {
                              ...current,
                              content: event.target.value,
                            }
                          : current,
                      )
                    }
                    className="w-full rounded-[1.5rem] border border-black/10 px-4 py-4 font-mono text-sm leading-6 text-stone-900 focus:border-orange-500 focus:outline-none"
                  />
                  <p className="mt-2 text-xs leading-5 text-stone-500">
                    JSON is validated before save. Use pretty-printed objects so future editors can understand the
                    payload shape quickly.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => saveSection('DRAFT')}
                    disabled={editorSaving}
                    className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
                  >
                    {editorSaving ? 'Saving…' : 'Save draft'}
                  </button>
                  <button
                    onClick={() => saveSection('PUBLISHED')}
                    disabled={editorSaving}
                    className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                  >
                    {editorSaving ? 'Publishing…' : 'Publish section'}
                  </button>
                  <button
                    onClick={() => deleteSection(activeEditor.id)}
                    disabled={editorSaving}
                    className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    Delete section
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
