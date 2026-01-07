const DeliverySection = () => {
  return (
    <section className="py-10 md:py-14 bg-cream/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-5xl mx-auto">

          {/* Butik section */}
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
              <img
                src="/Bilder frukt/Butik_ikon.png"
                alt="Butik"
                className="max-w-full max-h-full object-contain scale-125"
              />
            </div>
            <p className="text-lg md:text-xl text-primary leading-relaxed">
              Vår matbutik på Frejagatan 9 har funnits i 22 år
            </p>
          </div>

          {/* Leverans section */}
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
              <img
                src="/cykel.webp"
                alt="Leveranscykel"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <p className="text-lg md:text-xl text-primary leading-relaxed">
              På den gamla Hasselbladstiden (1878-1965) kunde man ringa in sin order och få den levererad av springpojkar. Det tänker vi börja med igen, men nu med webbutik och leverans via bil eller lådcykel
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DeliverySection;
