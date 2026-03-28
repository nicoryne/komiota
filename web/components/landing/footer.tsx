import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-orchid-petal/20 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🦫</div>
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-bold text-deep-amethyst font-quicksand">Komiota</span>
                <span className="text-sm text-plum-builder">Navigate Cebu Together</span>
              </div>
            </div>
            <p className="text-gray-600 max-w-sm">
              Making public transit fun, rewarding, and community-driven. Join us in building a better commuting experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-deep-amethyst mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-600 hover:text-plum-builder transition-colors">
                  Features
                </a>
              </li>
              <li>
                <Link href="/login" className="text-gray-600 hover:text-plum-builder transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-deep-amethyst mb-4">Get in Touch</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:hello@komiota.com" className="text-gray-600 hover:text-plum-builder transition-colors">
                  hello@komiota.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-orchid-petal/20 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Komiota. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
