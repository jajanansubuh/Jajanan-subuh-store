import { Banner as BannerType } from "@/types";

interface BannerProps {
  data: BannerType;
}

const Banner: React.FC<BannerProps> = ({ data }) => {
  return (
    <div className="overflow-hidden z-0 w-full relative mx-auto my-6 sm:my-8 md:my-10 px-4 sm:px-6">
      <div
        className="relative overflow-hidden bg-cover bg-center h-40 sm:h-56 md:h-72 w-full rounded-md py-4 sm:py-6 md:py-8"
        style={{ backgroundImage: `url(${data?.imageUrl})` }}
      >
        {/* dark overlay to keep white text readable on all images/devices */}
        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-black/50 via-black/30 to-transparent pointer-events-none" />

        <div className="relative z-10 h-full w-full flex flex-col justify-start items-start text-white gap-y-4 px-6 pt-6 sm:pt-8 md:pt-10">
          <div
            className="tracking-widest leading-relaxed text-2xl sm:text-4xl md:text-4xl sm:max-w-xl max-w-full drop-shadow-lg"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "0.01em",
              // subtle text shadow for better legibility on bright images
              textShadow: "0 2px 6px rgba(0,0,0,0.6)",
              // thin outline for sharper edge (works in WebKit/Blink browsers)
              WebkitTextStroke: "0.35px rgba(0,0,0,0.65)",
            }}
          >
            {data?.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
