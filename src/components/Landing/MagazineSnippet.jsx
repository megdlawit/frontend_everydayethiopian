import React from "react";
import { Link } from "react-router-dom";
import meg1 from "../../Assests/images/meg1.jpg";
import meg2 from "../../Assests/images/meg2.jpg";
import meg3 from "../../Assests/images/meg3.png";
const MagazineSnippet = () => {
  return (
    <section className="bg-gradient-to-b from-[#050808] to-[#0b0c0c] text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <h2
          className="text-4xl md:text-5xl font-light mb-14"
          style={{ fontFamily: "Quesha" }}
        >
          We stand beside you as you grow
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1 - Featured */}
          <div className="relative border border-yellow-500/80 rounded-xl p-5">
            <img
              src={meg2}
              alt="Abeba, handloom artisan"
              className="w-full h-60 object-cover rounded-lg mb-5"
            />

            <p className="text-sm leading-relaxed text-gray-200 mb-4">
              “Every thread has a memory. When someone wears my work, they carry
              a piece of our culture with them.” — Abeba, handloom artisan.
            </p>

            <Link
              to="/magazine/abeba"
              className="text-sm text-gray-400 hover:text-yellow-400 transition"
            >
              Read more
            </Link>

            {/* New badge */}
            <span className="absolute bottom-5 right-5 bg-yellow-500 text-white text-xs font-regular px-4 py-1.5 rounded-md">
              New
            </span>
          </div>

          {/* Card 2 */}
          <div className="border border-gray-700/60 rounded-xl p-5">
            <img
              src={meg1}
              alt="Dawit, spice farmer & seller"
              className="w-full h-60 object-cover rounded-lg mb-5"
            />

            <p className="text-sm leading-relaxed text-gray-200 mb-4">
              “When people taste my spices, I want them to feel like they’re back
              at their mother’s table.” — Dawit, spice farmer & seller.
            </p>

            <Link
              to="/magazine/dawit"
              className="text-sm text-gray-400 hover:text-yellow-400 transition"
            >
              Read more
            </Link>
          </div>

          {/* Card 3 */}
          <div className="border border-gray-700/60 rounded-xl p-5">
            <img
              src={meg3}
              alt="Hana, potter"
              className="w-full h-60 object-cover rounded-lg mb-5"
            />

            <p className="text-sm leading-relaxed text-gray-200 mb-4">
              “These hands don’t just shape clay; they keep our traditions alive
              for the next generation.” — Hana, potter.
            </p>

            <Link
              to="/magazine/hana"
              className="text-sm text-gray-400 hover:text-yellow-400 transition"
            >
              Read more
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MagazineSnippet;
