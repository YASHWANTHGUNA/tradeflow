import Link from "next/link";
import { 
  ShoppingCart, ShieldCheck, Zap, BarChart3, 
  Package, Users, ArrowRight, CheckCircle2,
  Store, Globe, ArrowRightLeft, CreditCard
} from "lucide-react";


export default function LandingPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-blue-200">
      
      {/* ----- NAVIGATION ----- */}
      <header className="absolute inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky">
        <nav className="flex items-center justify-between p-4 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <span className="text-2xl font-black text-blue-600 tracking-tighter">TradeFlow.</span>
          </div>
          <div className="flex flex-1 justify-end gap-x-6 items-center">
            <Link href="/marketplace" className="hidden sm:block text-sm font-semibold leading-6 text-slate-600 hover:text-blue-600 transition">
              Marketplace
            </Link>
            <Link href="/login" className="text-sm font-semibold leading-6 text-slate-900 hover:text-blue-600 transition">
              Log in
            </Link>
            <Link href="/signup" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition">
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ----- HERO SECTION ----- */}
        <section className="relative overflow-hidden bg-white pt-16 pb-32">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-60"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 relative z-10">
            
            {/* Left Content */}
            <div className="lg:w-1/2 text-center lg:text-left pt-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6 border border-blue-100">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                v2.0 Multi-Vendor is Live
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6 leading-tight">
                Premium tech, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">sold directly.</span>
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                TradeFlow connects elite tech merchants with enthusiasts. Experience seamless transactions, real-time inventory ledgers, and a frictionless checkout process.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/marketplace" className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group">
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/signup" className="w-full sm:w-auto rounded-xl bg-white border-2 border-slate-200 px-8 py-4 text-base font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all text-center">
                  Become a Merchant
                </Link>
              </div>
            </div>

            {/* Right Visual: Abstract Network Diagram */}
            <div className="lg:w-1/2 relative w-full h-[500px] flex items-center justify-center hidden md:flex">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-3xl opacity-50 transform scale-110 pointer-events-none"></div>
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6" className="animate-[pulse_2s_infinite]" />
                <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6" className="animate-[pulse_3s_infinite]" />
                <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6" className="animate-[pulse_2.5s_infinite]" />
                <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6" className="animate-[pulse_3.5s_infinite]" />
              </svg>

              <div className="absolute z-10 w-28 h-28 bg-white rounded-3xl shadow-2xl border border-blue-100 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Store className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="absolute z-10 w-16 h-16 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-slate-100 flex items-center justify-center -translate-x-36 -translate-y-32 animate-[bounce_3s_infinite]">
                <Users className="w-6 h-6 text-indigo-500" />
              </div>

              <div className="absolute z-10 w-16 h-16 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-slate-100 flex items-center justify-center translate-x-36 -translate-y-32 animate-[bounce_4s_infinite]">
                <CreditCard className="w-6 h-6 text-emerald-500" />
              </div>

              <div className="absolute z-10 w-16 h-16 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-slate-100 flex items-center justify-center -translate-x-36 translate-y-32 animate-[bounce_5s_infinite]">
                <ArrowRightLeft className="w-6 h-6 text-blue-500" />
              </div>

              <div className="absolute z-10 w-16 h-16 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-slate-100 flex items-center justify-center translate-x-36 translate-y-32 animate-[bounce_3.5s_infinite]">
                <Globe className="w-6 h-6 text-purple-500" />
              </div>
              
              <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-700">Verified Flow</span>
              </div>
              
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Zero Friction</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
            </div>

          </div>
        </section>

        {/* ----- WHY TRADEFLOW (FEATURES) ----- */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Platform Architecture
              </h2>
              <h3 className="text-4xl font-extrabold text-slate-900">Engineered for speed. Built for security.</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <ShoppingCart className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Dynamic Marketplace</h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Our full-stack architecture ensures blazing-fast rendering of product pages. Buyers can browse and transition to checkout with zero lag.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                  <ShieldCheck className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Role-Based Security</h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Strict JWT authorization separates buyers from merchants, ensuring that your inventory ledger and business logic remain completely private.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                  <Users className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Frictionless Demo</h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Custom bypass OTPs and instant-login demo accounts allow third parties to evaluate the platform without jumping through hoops.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ----- DARK BOTTOM CTA ----- */}
        <section className="relative py-24 bg-slate-900 overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
              Ready to scale your tech business?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Join the marketplace built by developers, for developers. Set up your merchant account in seconds and list your first product today.
            </p>
            <Link href="/signup" className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl hover:bg-blue-500 transition-all duration-300">
              Start Selling Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center">
        <p className="text-sm font-medium text-slate-500">
          &copy; {new Date().getFullYear()} TradeFlow MERN Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
}