'use client';

export default function ProductBlocks({ blocks }: { blocks: any[] }) {
  if (!blocks?.length) return null;

  return (
    <div className="home-section">
      <div className="container-wide space-y-20">
        {blocks.map((block, index) => {
          if (block.type === 'benefits') {
            return (
              <section key={index}>
                <div className="section-heading">
                  <h2 className="section-heading__title">{block.title}</h2>
                </div>
                <div className="trust-grid">
                  {(block.items || []).map((item: string, i: number) => (
                    <div key={i} className="trust-card p-6">
                      <div className="font-semibold text-lg">{item}</div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (block.type === 'stats') {
            return (
              <section key={index}>
                <div className="trust-grid">
                  {(block.items || []).map((item: any, i: number) => (
                    <div key={i} className="trust-card p-8 text-center">
                      <div className="text-4xl font-black">{item.value}</div>
                      <div className="mt-2 uppercase tracking-[0.12em] text-sm text-neutral-500">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (block.type === 'story') {
            return (
              <section key={index} className="story-section__grid">
                <div>
                  <h2 className="story-section__title">{block.title}</h2>
                  <div className="story-section__body">{block.body}</div>
                </div>
                {block.image ? (
                  <div className="story-section__image">
                    <img src={block.image} alt={block.title} />
                  </div>
                ) : null}
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
