import React from "react";

const ProPlanCollection = () => {
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-10 py-10 flex flex-col md:flex-row items-center gap-10" id="collection-section">
      {/* Left: Video Preview */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-lg bg-[#e7d7c9]">
          <video
            src="/Uploads/placeholder-video.mp4"
            poster="/Uploads/photo-image.jpg"
            className="w-full h-full object-cover"
            controls={false}
          />
          <button className="absolute inset-0 flex items-center justify-center text-white text-4xl bg-black/20 hover:bg-black/40 transition-all rounded-2xl">
            ▶
          </button>
        </div>
      </div>
      {/* Right: Choose The Type */}
      <div className="w-full md:w-1/2 flex flex-col items-start">
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Quesha', serif" }}>Choose The Type!</h2>
        <p className="text-gray-500 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <img src="/Uploads/photo-image.jpg" alt="Ring" className="w-20 h-20 rounded-full object-cover mb-2 border-4 border-[#fbbf24]" />
            <span className="font-semibold">Ring</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/Uploads/photo-image.jpg" alt="Necklace" className="w-20 h-20 rounded-full object-cover mb-2 border-4 border-[#1ec28b]" />
            <span className="font-semibold">Necklace</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/Uploads/photo-image.jpg" alt="Bracelet" className="w-20 h-20 rounded-full object-cover mb-2 border-4 border-[#38bdf8]" />
            <span className="font-semibold">Bracelet</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProPlanCollection; 