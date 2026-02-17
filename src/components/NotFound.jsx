import { useLocation } from "react-router-dom";
import peacockImg from "../Assests/sad.png";
import { Home, ShoppingBag } from "lucide-react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

const NotFound = () => {
  const location = useLocation();

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FEF9F0] px-4">
        <Header />

        <div className="mt-16 md:mt-20 flex flex-col items-center">
          <p className="mb-3 text-base md:text-lg text-gray-500">
            You look a little lost...
          </p>

          {/* Title */}
          <h1 className="mb-5 md:mb-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-[quesha] text-gray-900 text-center leading-tight">
            Ooops! Page not found
          </h1>

          {/* Description */}
          <p className="mb-8 md:mb-10 text-center max-w-md md:max-w-lg text-gray-600 text-base md:text-lg">
            We can't seem to find the page you're looking for. Book a call to discuss
            your needs, or head back to the marketplace.
          </p>

          {/* Peacock Image - Increased size */}
          <img
            src={peacockImg}
            alt="Peacock mascot"
            className="mb-8 md:mb-10 w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80"
          />

          {/* Buttons */}
          <div className="mt-4 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 px-2 sm:px-0 mb-10">
            {/* Home Page Card */}
            <a
              href="/"
              className="group flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-sm transition hover:shadow-md hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                  <Home className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-lg">Home Page</p>
                  <p className="text-sm text-gray-500">
                    There’s no place like home…
                  </p>
                </div>
              </div>
              <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-600">
                →
              </span>
            </a>

            {/* Sellers Card */}
            <a
              href="/sellers"
              className="group flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-sm transition hover:shadow-md hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                  <ShoppingBag className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-lg">Sellers</p>
                  <p className="text-sm text-gray-500">
                    Manage your shop and sales
                  </p>
                </div>
              </div>
              <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-600">
                →
              </span>
            </a>
          </div>
        </div>

        
      </div>
      <Footer />
    </>
  );
};

export default NotFound;