import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-deep-amethyst via-plum-builder to-deep-amethyst">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="text-6xl mb-6">🦫</div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-vanilla-milk mb-6">
          Ready to Transform Your Commute?
        </h2>
        
        <p className="text-xl text-orchid-petal mb-10 max-w-2xl mx-auto">
          Join thousands of commuters making public transit fun, rewarding, and community-driven.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-vanilla-milk text-deep-amethyst text-base font-semibold hover:bg-orchid-petal transition-all hover:scale-105"
          >
            Start Your Journey
          </Link>
          <a
            href="mailto:hello@komiota.com"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-vanilla-milk text-vanilla-milk text-base font-semibold hover:bg-vanilla-milk hover:text-deep-amethyst transition-all"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
