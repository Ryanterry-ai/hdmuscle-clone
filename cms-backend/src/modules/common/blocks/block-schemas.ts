export const blockSchemas = {
  hero: {
    type: 'object',
    properties: {
      headline: { type: 'string' },
      subheadline: { type: 'string' },
      cta_text: { type: 'string' },
      cta_link: { type: 'string' },
      background_image: { type: 'string' },
      background_video: { type: 'string' },
      overlay_opacity: { type: 'number', minimum: 0, maximum: 100 },
      alignment: { type: 'string', enum: ['left', 'center', 'right'] },
    },
    required: ['headline'],
  },
  banner: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      subtitle: { type: 'string' },
      image: { type: 'string' },
      cta_text: { type: 'string' },
      cta_link: { type: 'string' },
      background_color: { type: 'string' },
      height: { type: 'string' },
      full_width: { type: 'boolean' },
    },
  },
  featured_products: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      subtitle: { type: 'string' },
      max_products: { type: 'number', minimum: 1, maximum: 24 },
      product_handles: { type: 'array', items: { type: 'string' } },
      collection_handle: { type: 'string' },
    },
  },
  newsletter: {
    type: 'object',
    properties: {
      heading: { type: 'string' },
      subtext: { type: 'string' },
      placeholder_text: { type: 'string' },
      button_text: { type: 'string' },
      background_color: { type: 'string' },
    },
  },
  testimonials: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      testimonials: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            quote: { type: 'string' },
            author: { type: 'string' },
            role: { type: 'string' },
            avatar: { type: 'string' },
            rating: { type: 'number', minimum: 1, maximum: 5 },
          },
          required: ['quote', 'author'],
        },
      },
    },
  },
  faq: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      faqs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            answer: { type: 'string' },
          },
          required: ['question', 'answer'],
        },
      },
    },
  },
  announcement_bar: {
    type: 'object',
    properties: {
      text: { type: 'string' },
      background_color: { type: 'string' },
      text_color: { type: 'string' },
      link: { type: 'string' },
    },
    required: ['text'],
  },
  video: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      video_url: { type: 'string' },
      thumbnail: { type: 'string' },
      autoplay: { type: 'boolean' },
      loop: { type: 'boolean' },
      muted: { type: 'boolean' },
    },
  },
  image_gallery: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      images: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            src: { type: 'string' },
            alt: { type: 'string' },
            caption: { type: 'string' },
          },
        },
      },
      columns_count: { type: 'number', minimum: 2, maximum: 6 },
    },
  },
  rich_text: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      content: { type: 'string' },
      alignment: { type: 'string', enum: ['left', 'center', 'right'] },
      background_color: { type: 'string' },
    },
  },
  custom_html: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      html: { type: 'string' },
    },
  },
  divider: {
    type: 'object',
    properties: {
      style: { type: 'string', enum: ['solid', 'dashed', 'dotted'] },
      color: { type: 'string' },
      spacing: { type: 'string' },
    },
  },
  spacer: {
    type: 'object',
    properties: {
      height: { type: 'string' },
    },
  },
  countdown: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      end_date: { type: 'string' },
      background_color: { type: 'string' },
    },
    required: ['end_date'],
  },
  contact_form: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      fields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string', enum: ['text', 'email', 'tel', 'textarea', 'select'] },
            label: { type: 'string' },
            required: { type: 'boolean' },
            options: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  },
  dual_image: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      left_image: { type: 'string' },
      right_image: { type: 'string' },
      left_cta_text: { type: 'string' },
      left_cta_link: { type: 'string' },
      right_cta_text: { type: 'string' },
      right_cta_link: { type: 'string' },
    },
  },
} as const;

export type BlockType = keyof typeof blockSchemas;
