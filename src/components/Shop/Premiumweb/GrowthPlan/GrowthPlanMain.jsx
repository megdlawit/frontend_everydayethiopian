import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server, backend_url } from '../../../../server';
import HeroHeader from './HeroHeader';
import GrowthPlanHero from './GrowthPlanHero';
import ProductCard from '../../../Route/ProductCard/ProductCard';
import GrowthPlanEvents from './GrowthPlanEvents';
import GrowthPlanVideo from './GrowthPlanVideo';
import GrowthPlanAbout from './GrowthPlanAbout';
import GrowthPlanContact from './GrowthPlanContact';
import Footer from '../../../Layout/Footer';
import { FaShareAlt } from 'react-icons/fa';
import TemplatesHeader from '../../../Layout/TemplatesHeader';

const GrowthPlanMain = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [shop, setShop] = useState({});
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      try {
        const shopRes = await axios.get(`${server}/shop/get-shop-info/${id}`);
        const shopRaw = shopRes.data.shop;
        console.log('Shop data:', shopRaw);
        if (!shopRaw?._id) {
          console.error('Shop ID is missing in API response');
          setShop({ error: 'Shop ID not found' });
          return;
        }
        const logo = shopRaw.avatar?.url
          ? `${backend_url}${shopRaw.avatar.url}`
          : '/Uploads/placeholder-image.jpg';
        setShop({
          ...shopRaw,
          logo,
          heroImage: shopRaw.heroImage?.url
            ? { url: `${backend_url}${shopRaw.heroImage.url}` }
            : { url: '/Uploads/placeholder-image.jpg' },
        });

        const productsRes = await axios.get(`${server}/product/get-all-products-shop/${id}`);
        setProducts(productsRes.data.products.map(p => ({
          ...p,
          images: p.images?.map(img => ({
            ...img,
            url: img.url.startsWith('http') ? img.url : `${backend_url}${img.url}`,
          })),
          video: p.video ? `${backend_url}${p.video}` : null,
        })));

        const eventsRes = await axios.get(`${server}/event/get-all-events/${id}`);
        setEvents(eventsRes.data.events);
      } catch (err) {
        console.error('Error fetching shop data:', err);
        setShop({ error: 'Failed to load shop data' });
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [id]);

  const scrollToSection = (sectionId, retries = 5, delay = 200) => {
    console.log(`Attempting to scroll to section: ${sectionId}`);
    const attemptScroll = (attempt) => {
      const element = document.getElementById(sectionId);
      if (element) {
        console.log(`Found element for ${sectionId}, scrolling...`);
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempt > 0) {
        console.log(`Element ${sectionId} not found, retrying (${attempt} attempts left)`);
        setTimeout(() => attemptScroll(attempt - 1), delay);
      } else {
        console.error(`Failed to find element with ID: ${sectionId}`);
      }
    };
    attemptScroll(retries);
  };

  useEffect(() => {
    const sectionIds = [
      'video-section',
      'products-section',
      'events-section',
      'about-section',
      'contact-section',
    ];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      // Only update activeSection if scrolled beyond a small threshold to avoid flicker on load
      if (scrollPosition < 50) {
        console.log('At top of page, keeping activeSection as home');
        setActiveSection('home');
        return;
      }
      let found = 'home';
      for (const sectionId of sectionIds) {
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop <= scrollPosition) {
          found = sectionId;
        }
      }
      const newActiveSection =
        found === 'products-section' ? 'shop' :
        found === 'video-section' ? 'video' :
        found === 'events-section' ? 'events' :
        found === 'about-section' ? 'about' :
        found === 'contact-section' ? 'contact' : 'home';
      console.log('Active section updated to:', newActiveSection);
      setActiveSection(newActiveSection);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run on mount to set initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      console.log(`Hash detected: ${hash}`);
      const hashMap = {
        video: 'video-section',
        events: 'events-section',
        shop: 'products-section',
        about: 'about-section',
        contact: 'contact-section',
      };
      const sectionId = hashMap[hash] || hash;
      const newActiveSection =
        hash === 'products-section' ? 'shop' :
        hash === 'video' ? 'video' :
        hash === 'events' ? 'events' :
        hash === 'about' ? 'about' :
        hash === 'contact' ? 'contact' : 'home';
      console.log('Setting activeSection from hash:', newActiveSection);
      setActiveSection(newActiveSection);
      setTimeout(() => scrollToSection(sectionId), 100);
    } else {
      console.log('No hash, setting activeSection to home and scrolling to top');
      setActiveSection('home');
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(() => setActiveSection('home'), 0);
    }
  }, [location]);

  const handleHeroHeaderNav = (section) => {
    console.log('Navigating to section:', section);
    if (!shop?._id) {
      console.warn('Shop ID not available, navigation blocked');
      return;
    }
    setActiveSection(section); // Update activeSection immediately
    if (section === 'home') {
      console.log(`Redirecting to /shop/premiumpreview/${shop._id}`);
      navigate(`/shop/premiumpreview/${shop._id}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (section === 'shop') {
      console.log(`Redirecting to /shop/${shop._id}/all-products`);
      navigate(`/shop/${shop._id}/all-products`);
    } else {
      const sectionIdMap = {
        video: 'video-section',
        events: 'events-section',
        about: 'about-section',
        contact: 'contact-section',
      };
      const sectionId = sectionIdMap[section];
      if (sectionId) {
        scrollToSection(sectionId);
      }
    }
  };
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: shop?.name ? `${shop.name} - Shop` : 'Shop',
          text: shop?.heroTagline || 'Check out this shop!',
          url,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert('Shop URL copied to clipboard!');
        })
        .catch((err) => console.error('Failed to copy: ', err));
    }
  };

  const handleLogoChange = (e) => {
    console.log('Logo change is not supported in GrowthPlanMain');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }
  if (shop.error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {shop.error}
      </div>
    );
  }

  return (
    <>
    <TemplatesHeader />
    <div className="min-h-screen bg-[#fff]">
  {/* <HeroHeader
  shop={shop}
  onNav={handleHeroHeaderNav}
  isEditing={false}
  onLogoChange={handleLogoChange}
  activeSection={activeSection}
/> */}
     <GrowthPlanHero shop={shop} onNav={handleHeroHeaderNav} />
      <section
        id="video-section"
        className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 bg-white mt-4 min-h-[200px] mt-[15rem]"
      >
        <h2
          className="text-3xl md:text-6xl text-[#1c3b3c] text-center mb-8 md:mb-10"
          style={{ fontFamily: "'Quesha', sans-serif" }}
        >
          Video Shopping
        </h2>
        <GrowthPlanVideo products={products.filter((p) => p.video)} />
      </section>
      <section
        id="products-section"
        className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 bg-white rounded-2xl mt-4 min-h-[200px]"
      >
        <h2
          className="text-3xl md:text-6xl text-[#1c3b3c] text-center mb-8 md:mb-10"
          style={{ fontFamily: "'Quesha', sans-serif" }}
        >
          Shop Our Collection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {products && products.length > 0 ? (
            products
              .filter(
                (product) =>
                  (product.shopId === id ||
                    (typeof product.shopId === 'object' && product.shopId?._id === id)) &&
                  Array.isArray(product.images) &&
                  product.images.length > 0 &&
                  !product.video
              )
              .slice(0, 4)
              .map((product) => (
                <ProductCard key={product._id} data={product} hideShopLink={true} />
              ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              No products available yet.
            </p>
          )}
        </div>
      </section>
      <section
        id="events-section"
        className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 bg-white mt-2 min-h-[200px]"
      >
        <h2
          className="text-3xl md:text-6xl text-[#1c3b3c] text-center mb-8 md:mb-10"
          style={{ fontFamily: "'Quesha', sans-serif" }}
        >
          Running Events
        </h2>
        {events && events.length > 0 ? (
          <GrowthPlanEvents key={events[0]._id} data={events[0]} />
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            No events available at the moment.
          </p>
        )}
      </section>
      <section
        id="about-section"
        className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 bg-white mt-0 min-h-[200px]"
      >
        <GrowthPlanAbout shop={shop} />
      </section>
      <section
        id="contact-section"
        className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 bg-white mt-0 min-h-[200px]"
      >
        <GrowthPlanContact shop={shop} />
      </section>
      <Footer />
      <button
        onClick={handleShare}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-16 md:h-16 bg-[#cc9a00] text-white rounded-full hover:bg-[#b38600] transition-all duration-300 flex items-center justify-center shadow-2xl z-50 animate-bounce"
        aria-label="Share Shop"
      >
        <FaShareAlt className="w-5 md:w-6 h-5 md:h-6" />
      </button>
      <style jsx global>{`
        @keyframes jump-infinite {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(3deg); }
          50% { transform: translateY(0) rotate(-3deg); }
          75% { transform: translateY(-4px) rotate(2deg); }
        }
        .animate-jump-infinite { animation: jump-infinite 0.6s ease-in-out infinite; }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-in-out; }
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }
        .animate-bounce { animation: bounce 0.5s ease-in-out infinite alternate; }
      `}</style>
    </div>
    </>
  );
};

export default GrowthPlanMain;