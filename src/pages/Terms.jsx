import React, { useState, useEffect } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import {
  BookOpen,
  User,
  Store,
  Truck,
  DollarSign,
  Image,
  AlertTriangle,
  Shield,
  RefreshCcw,
  Mail,
  Ban,
  Coins,
  Users,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";

const Terms= () => {
  const navItems = [
    { id: "about", label: "About Everyday Ethiopian" },
    { id: "who", label: "Who Can Use the Platform" },
    { id: "seller", label: "Seller Responsibilities" },
    { id: "orders", label: "Orders, Delivery & Payments" },
    { id: "fees", label: "Platform Fees" },
    { id: "content", label: "Content & Listings" },
    { id: "early", label: "Early-Stage Disclaimer" },
    { id: "suspension", label: "Account Suspension" },
    { id: "liability", label: "Limitation of Liability" },
    { id: "changes", label: "Changes to These Terms" },
    { id: "contact", label: "Contact Us" },
  ];

  const navIconMap = {
    about: <BookOpen size={16} />,
    who: <User size={16} />,
    seller: <Store size={16} />,
    orders: <Truck size={16} />,
    fees: <DollarSign size={16} />,
    content: <Image size={16} />,
    early: <AlertTriangle size={16} />,
    suspension: <Ban size={16} />,
    liability: <Shield size={16} />,
    changes: <RefreshCcw size={16} />,
    contact: <Mail size={16} />,
  };

  const [activeSection, setActiveSection] = useState("about");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-120px 0px -30% 0px",
        threshold: 0,
      }
    );

    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileNavOpen(false);
  };

  return (
    <>
      <Header />
      <div className="bg-[#faf9f6] min-h-screen font-inter">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <span className="inline-flex items-center gap-2 mb-4 px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-700" />
              LEGAL & PRIVACY
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-regular mb-3 font-['Quesha'] text-[#1C3B3E]">
              Terms and Conditions
            </h1>

            <p className="text-[#57534D] max-w-xl text-sm sm:text-base">
              Welcome to Everyday Ethiopian. These terms explain how our platform works and what to expect when using it.
            </p>
            <p className="text-sm text-[#A6A09B] mt-2">Last updated: January 2026</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Mobile Navigation Toggle */}
            <div className="lg:hidden sticky top-16 z-40 mb-4 bg-[#faf9f6] shadow-sm">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 text-gray-700"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">Menu</span>
                </div>
                <span className="text-gray-400">
                  {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
                </span>
              </button>
            </div>

            {/* Sidebar */}
            <aside
              className={`${
                mobileNavOpen ? "block" : "hidden"
              } lg:block lg:col-span-4 lg:sticky lg:top-24 self-start h-fit`}
            >
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 space-y-1 mb-6 lg:mb-0">
                {navItems.map((item, i) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 md:gap-4 text-left px-3 md:px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#035855] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                          isActive ? "text-[#FFC300]" : "text-[#A6A09B]"
                        }`}
                      >
                        {navIconMap[item.id]}
                      </span>

                      <span className="text-left">
                        <span className="hidden sm:inline">
                          {i + 1}. {item.label}
                        </span>
                        <span className="sm:hidden">{item.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Support Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                <h3 className="text-xl md:text-2xl font-regular mb-3 md:mb-4 text-gray-900">
                  Need help?
                </h3>
                <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 leading-relaxed">
                  Can't find what you're looking for? Our support team is here.
                </p>
                <button
                  onClick={() => handleNavClick("contact")}
                  className="inline-block font-medium text-base md:text-xl border-b-2 border-gray-900 pb-1 hover:border-gray-600 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-8 space-y-6 md:space-y-10 text-gray-700">
              <Card id="about" title="1. About Everyday Ethiopian" icon={<BookOpen />}>
                <p className="text-sm md:text-base">
                  Everyday Ethiopian is a platform built to help Ethiopian sellers sell their products, manage delivery, and receive payments more easily.
                </p>
                <div className="bg-[#FAFAF9] text-[#57534D] px-4 md:px-10 py-4 md:py-5 rounded-sm mt-3 md:mt-2 text-sm md:text-base">
                  <p>We are currently in an early stage, and some features may change as we grow.</p>
                </div>
              </Card>

              <Card id="who" title="2. Who Can Use the Platform" icon={<User />}>
                <p className="text-sm md:text-base">You can use Everyday Ethiopian if:</p>
                <ul className="list-disc pl-5 md:pl-6 space-y-2 md:space-y-3 mt-3 md:mt-4 mb-4 list-none">
                  <li className="text-sm md:text-base">You are 18 years or older</li>
                  <li className="text-sm md:text-base">You are based in Ethiopia</li>
                  <li className="text-sm md:text-base">You provide accurate information</li>
                </ul>
                <div className="italic text-[#79716B] text-sm md:text-base">
                  <p>We may limit access if information provided is false or misleading.</p>
                </div>
              </Card>

              <Card id="seller" title="3. Seller Responsibilities" icon={<Store />}>
                <p className="text-sm md:text-base">As a seller, you agree to:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <MiniCard title="Accuracy" desc="Provide correct information" />
                  <MiniCard title="Legality" desc="Sell permitted products only" />
                  <MiniCard title="Respect" desc="Treat customers respectfully" />
                  <MiniCard title="Fulfillment" desc="Deliver honestly and on time" />
                </div>
                <p className="mt-4 md:mt-6 text-sm md:text-base">You are responsible for the quality of your products.</p>
              </Card>

              <Card id="orders" title="4. Orders, Delivery & Payments" icon={<Truck />}>
                <div className="mt-6 md:mt-8 space-y-6 md:space-y-10">
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-base md:text-lg mb-1 md:mb-2">Connections</p>
                      <p className="text-sm md:text-base text-gray-700">
                        Everyday Ethiopian helps connect sellers with buyers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 md:gap-5">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Truck className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-base md:text-lg mb-1 md:mb-2">Logistics</p>
                      <p className="text-sm md:text-base text-gray-700">
                        We support delivery and payment processes, but timelines may vary. We work to improve reliability but delays can happen.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 md:gap-5">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Coins className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-base md:text-lg mb-1 md:mb-2">Payments</p>
                      <p className="text-sm md:text-base text-gray-700">
                        Payments are processed through supported providers (e.g., Telebirr). Payout timelines will be communicated clearly.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card id="fees" title="5. Platform Fees" icon={<DollarSign />}>
                <p className="text-sm md:text-base">
                  Some services may include fees (such as delivery, premium tools, or promotions).
                </p>
                <div className="flex items-center bg-[#FEFCE8] text-[#733E0A] px-4 md:px-10 py-3 md:py-5 rounded-full mt-3 md:mt-4 gap-3 md:gap-5">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#D97706]" />
                  <span className="text-sm md:text-base font-medium">
                    Any fees will be clearly shared before they apply.
                  </span>
                </div>
              </Card>

              <Card id="content" title="6. Content & Listings" icon={<Image />}>
                <p className="text-sm md:text-base">By listing products on Everyday Ethiopian:</p>
                <ul className="list-none pl-5 md:pl-6 space-y-2 md:space-y-3 mt-3 md:mt-4 mb-4">
                  <li className="text-sm md:text-base">You allow us to display your products on our platform</li>
                  <li className="text-sm md:text-base">
                    You confirm that images and descriptions belong to you or you have permission to use them
                  </li>
                </ul>
                <div className="bg-[#FEF2F2] text-[#C10007] px-4 md:px-10 py-3 md:py-5 rounded-sm mt-2 md:mt-2 text-sm md:text-base">
                  <p>We may remove listings that violate our guidelines.</p>
                </div>
              </Card>

              <Card id="early" title="7. Early-Stage Disclaimer" icon={<AlertTriangle />}>
                <p className="text-base md:text-lg font-medium mb-3 md:mb-4">
                  Everyday Ethiopian is still being built.
                </p>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">This means:</p>

                <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8 justify-start">
                  <span className="bg-gray-100 rounded-md px-4 py-2 md:px-8 md:py-3 text-xs md:text-sm font-medium text-gray-800">
                    Features may change
                  </span>
                  <span className="bg-gray-100 rounded-md px-4 py-2 md:px-8 md:py-3 text-xs md:text-sm font-medium text-gray-800">
                    Tools may be limited
                  </span>
                  <span className="bg-gray-100 rounded-md px-4 py-2 md:px-8 md:py-3 text-xs md:text-sm font-medium text-gray-800">
                    Updates to terms
                  </span>
                </div>

                <p className="text-sm md:text-base text-gray-600">
                  We'll always aim to communicate changes clearly.
                </p>
              </Card>

              <Card id="suspension" title="8. Account Suspension" icon={<Ban />}>
                <p className="text-sm md:text-base">We may suspend or remove accounts if:</p>
                <ul className="list-disc pl-5 md:pl-6 space-y-2 md:space-y-3 mt-3 md:mt-4 mb-4 marker:text-[#FF6467]">
                  <li className="text-sm md:text-base">Terms are violated</li>
                  <li className="text-sm md:text-base">Illegal products are sold</li>
                  <li className="text-sm md:text-base">Fraud or abuse is suspected</li>
                </ul>
                <div className="italic text-[#79716B] text-sm md:text-base">
                  <p>We aim to be fair and transparent in all decisions.</p>
                </div>
              </Card>

              <Card id="liability" title="9. Limitation of Liability" icon={<Shield />}>
                <p className="text-sm md:text-base">Everyday Ethiopian is not responsible for:</p>
                <ul className="list-none pl-5 md:pl-6 space-y-2 md:space-y-3 mt-3 md:mt-4 mb-4">
                  <li className="text-sm md:text-base">Losses caused by incorrect seller information</li>
                  <li className="text-sm md:text-base">
                    Issues outside our control (network outages, third-party services)
                  </li>
                </ul>
                <div className="italic text-[#79716B] text-sm md:text-base">
                  <p>We do our best to support sellers, but using the platform is at your own risk.</p>
                </div>
              </Card>

              <Card id="changes" title="10. Changes to These Terms" icon={<RefreshCcw />}>
                <p className="text-sm md:text-base">We may update these terms at any time.</p>
                <p className="text-sm md:text-base">
                  If changes are made, we'll update the date at the top of this page.
                </p>
              </Card>

              <Card id="contact" title="11. Contact Us" icon={<Mail />}>
                <p className="text-sm md:text-base">If you have questions, reach out to us anytime.</p>
                <div className="mt-4 md:mt-6 w-full sm:w-fit flex items-center justify-center sm:justify-start gap-3 bg-[#1C3B3E] text-white px-4 py-3 md:px-6 md:py-4 rounded-xl text-sm md:text-base">
                  <Mail size={16} className="md:size-[18px]" />
                  support@everydayethiopian.com
                </div>
              </Card>
            </main>
          </div>

          <div className="mt-8 md:mt-10 text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-regular font-['Quesha'] text-[#79716B]">
              Built for everyday Ethiopia. Growing together.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

const Card = ({ id, title, icon, children }) => (
  <div
    id={id}
    className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-5 md:p-8 scroll-mt-32 font-inter"
  >
    <h2 className="flex items-center gap-3 md:gap-4 text-lg md:text-xl font-regular mb-4 md:mb-6 text-[#1C1917]">
      <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FAFAF9] flex items-center justify-center text-[#57534D] flex-shrink-0">
        {React.cloneElement(icon, { size: 20 })}
      </span>
      <span className="break-words">{title}</span>
    </h2>
    <div className="text-gray-600 leading-relaxed">{children}</div>
  </div>
);

const MiniCard = ({ title, desc }) => (
  <div className="border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-5 shadow-sm">
    <h3 className="text-xs md:text-sm font-semibold text-gray-900">{title}</h3>
    <p className="text-xs md:text-sm text-gray-500 mt-1">{desc}</p>
  </div>
);

export default Terms;