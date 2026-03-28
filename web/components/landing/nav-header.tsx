import Link from 'next/link';

export function NavHeader() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-white border-b border-orchid-petal/20">
      <Link href="/" className="flex items-center gap-3">
        <div className="text-2xl">🦫</div>
        <div className="flex flex-col leading-tight">
          <span className="text-xl font-bold text-deep-amethyst font-quicksand">Komiota</span>
          <span className="text-xs text-plum-builder font-medium">Navigate Cebu Together</span>
        </div>
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-deep-amethyst text-vanilla-milk text-sm font-semibold hover:bg-plum-builder transition-colors"
      >
        Dashboard Login
      </Link>
    </header>
  );
}
