import Link from "next/link";
import {
  ShoppingCart,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  Store,
  Globe,
  ArrowRightLeft,
  CreditCard,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      <main>
        {/* ----- HERO SECTION ----- */}
        <section className="relative overflow-hidden bg-white pb-32 pt-16">
          <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-12">
            <div className="h-[600px] w-[600px] rounded-full bg-blue-50 opacity-60 blur-3xl"></div>
          </div>

          <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row lg:px-8">
            {/* Left Content */}
            <div className="pt-10 text-center lg:w-1/2 lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-600"></span>
                v2.0 Multi-Vendor is Live
              </div>

              <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
                Premium tech, <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  sold directly.
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600 lg:mx-0">
                TradeFlow connects elite tech merchants with enthusiasts.
                Experience seamless transactions, real-time inventory ledgers,
                and a frictionless checkout process.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/marketplace"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-blue-700 sm:w-auto"
                >
                  Explore Marketplace
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/signup"
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-center text-base font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                >
                  Become a Merchant
                </Link>
              </div>
            </div>

            {/* Right Visual: Abstract Network Diagram */}
            <div className="relative hidden h-[500px] w-full items-center justify-center md:flex lg:w-1/2">
              <div className="pointer-events-none absolute inset-0 scale-110 transform rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50 blur-3xl"></div>

              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{ zIndex: 0 }}
              >
                <line
                  x1="50%"
                  y1="50%"
                  x2="20%"
                  y2="25%"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  className="animate-[pulse_2s_infinite]"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="80%"
                  y2="25%"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  className="animate-[pulse_3s_infinite]"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="20%"
                  y2="75%"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  className="animate-[pulse_2.5s_infinite]"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="80%"
                  y2="75%"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  className="animate-[pulse_3.5s_infinite]"
                />
              </svg>

              <div className="absolute z-10 flex h-28 w-28 transform items-center justify-center rounded-3xl border border-blue-100 bg-white shadow-2xl transition-transform duration-500 hover:scale-105">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-inner">
                  <Store className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="absolute z-10 flex h-16 w-16 -translate-x-36 -translate-y-32 items-center justify-center rounded-full border border-slate-100 bg-white/90 shadow-xl backdrop-blur-md animate-[bounce_3s_infinite]">
                <Users className="h-6 w-6 text-indigo-500" />
              </div>

              <div className="absolute z-10 flex h-16 w-16 translate-x-36 -translate-y-32 items-center justify-center rounded-full border border-slate-100 bg-white/90 shadow-xl backdrop-blur-md animate-[bounce_4s_infinite]">
                <CreditCard className="h-6 w-6 text-emerald-500" />
              </div>

              <div className="absolute z-10 flex h-16 w-16 -translate-x-36 translate-y-32 items-center justify-center rounded-full border border-slate-100 bg-white/90 shadow-xl backdrop-blur-md animate-[bounce_5s_infinite]">
                <ArrowRightLeft className="h-6 w-6 text-blue-500" />
              </div>

              <div className="absolute z-10 flex h-16 w-16 translate-x-36 translate-y-32 items-center justify-center rounded-full border border-slate-100 bg-white/90 shadow-xl backdrop-blur-md animate-[bounce_3.5s_infinite]">
                <Globe className="h-6 w-6 text-purple-500" />
              </div>

              <div className="absolute left-0 top-1/2 flex -translate-x-6 -translate-y-1/2 items-center gap-2 rounded-xl border border-slate-100 bg-white/90 px-4 py-2 shadow-lg backdrop-blur">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-700">
                  Verified Flow
                </span>
              </div>

              <div className="absolute right-0 top-1/2 flex translate-x-6 -translate-y-1/2 items-center gap-2 rounded-xl border border-slate-100 bg-white/90 px-4 py-2 shadow-lg backdrop-blur">
                <span className="text-xs font-bold text-slate-700">
                  Zero Friction
                </span>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          </div>
        </section>

        {/* ----- WHY TRADEFLOW (FEATURES) ----- */}
        <section className="border-t border-slate-100 bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide text-blue-600">
                <Zap className="h-4 w-4" />
                Platform Architecture
              </h2>
              <h3 className="text-4xl font-extrabold text-slate-900">
                Engineered for speed. Built for security.
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 transition-colors duration-300 group-hover:bg-blue-600">
                  <ShoppingCart className="h-7 w-7 text-blue-600 transition-colors group-hover:text-white" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-slate-900">
                  Dynamic Marketplace
                </h4>
                <p className="text-sm leading-relaxed text-slate-600">
                  Our full-stack architecture ensures blazing-fast rendering of
                  product pages. Buyers can browse and transition to checkout
                  with zero lag.
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 transition-colors duration-300 group-hover:bg-indigo-600">
                  <ShieldCheck className="h-7 w-7 text-indigo-600 transition-colors group-hover:text-white" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-slate-900">
                  Role-Based Security
                </h4>
                <p className="text-sm leading-relaxed text-slate-600">
                  Strict JWT authorization separates buyers from merchants,
                  ensuring that your inventory ledger and business logic remain
                  completely private.
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 transition-colors duration-300 group-hover:bg-emerald-600">
                  <Users className="h-7 w-7 text-emerald-600 transition-colors group-hover:text-white" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-slate-900">
                  Frictionless Demo
                </h4>
                <p className="text-sm leading-relaxed text-slate-600">
                  Custom bypass OTPs and instant-login demo accounts allow third
                  parties to evaluate the platform without jumping through
                  hoops.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ----- DARK BOTTOM CTA ----- */}
        <section className="relative overflow-hidden bg-slate-900 py-24">
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
            <h2 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Ready to scale your tech business?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
              Join the marketplace built by developers, for developers. Set up
              your merchant account in seconds and list your first product
              today.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl transition-all duration-300 hover:bg-blue-500"
            >
              Start Selling Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center">
        <p className="text-sm font-medium text-slate-500">
          &copy; {new Date().getFullYear()} TradeFlow MERN Platform. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}