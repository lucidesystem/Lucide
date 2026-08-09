 
      {/* STORY */}
      <section className="about-story reveal">
        <div className="about-story-copy">
          <p className="eyebrow">Our story</p>
          <h2>Started with a hobby and a future inmind</h2>
          <p>
            LucideSystems was founded on (xx/yy/zzzz) by two high school students Austin Rich and Sam Menninga. 
            As we investigated the small business community, we realized how far behind they were from lack of funds, no skills to build their own sites, or noo time.
          </p>
          <p>
            LucideSystems looks to close the gap between small businesses and how the rest of the world functions.
          </p>
        </div>
        <div className="about-stats">
          <div className="stat">
            <span className="stat-num">2019</span>
            <span className="stat-label">Founded</span>
          </div>
          <div className="stat">
            <span className="stat-num">120+</span>
            <span className="stat-label">Sites shipped</span>
          </div>
          <div className="stat">
            <span className="stat-num">12</span>
            <span className="stat-label">People on the team</span>
          </div>
        </div>
      </section>
 
      {/* VALUES */}
      <section className="services about-values reveal">
        <p className="eyebrow">What we value</p>
        <h2>How we make it affordable, yet customizable.</h2>
        <div className="services-grid reveal-stagger">
          {VALUES.map((v) => (
            <div className="service-card" key={v.title}>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* FOUNDERS */}
      <section className="founders reveal">
        <p className="eyebrow">Leadership</p>
        <h2>Founders &amp; team leads.</h2>
        <div className="founders-grid reveal-stagger">
          {FOUNDERS.map((f) => (
            <div className="founder-card" key={f.name}>
              <div className="founder-avatar">{f.initials}</div>
              <h3>{f.name}</h3>
              <p className="founder-role">{f.role}</p>
              <p>{f.bio}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* MILESTONES */}
      <section className="process about-milestones reveal">
        <p className="eyebrow">Milestones</p>
        <h2>Where we've been.</h2>
        <div className="process-list reveal-stagger">
          {MILESTONES.map((m, i) => (
            <div className="process-step" key={m.step}>
              <span className="process-num">{m.step}</span>
              <div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
              {i < MILESTONES.length - 1 && (
                <span className="process-line" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </section>
 
      {/* CTA */}
      <section className="cta-band reveal">
        <h2>Want to work with us?</h2>
        <button className="btn btn-primary" onClick={onStart}>
          Start a Project
        </button>
      </section>
    </>
  );
}
 
