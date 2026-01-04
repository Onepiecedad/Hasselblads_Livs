const DeliverySection = () => {
  return (
    <section className="py-16 md:py-24 bg-cream/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-5xl mx-auto">

          {/* Butik section */}
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="flex-shrink-0">
              <img
                src="/Bilder frukt/Butik_ikon.png"
                alt="Butik"
                className="w-32 h-32 md:w-40 md:h-40 object-contain"
              />
            </div>
            <p className="text-lg md:text-xl text-primary font-medium italic leading-relaxed">
              Vår matbutik på Frejagatan 9 har funnits i 22 år
            </p>
          </div>

          {/* Leverans section */}
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="flex-shrink-0">
              <img
                src="/cykel.webp"
                alt="Leveranscykel"
                className="w-32 h-32 md:w-40 md:h-40 object-contain"
              />
            </div>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              På den gamla Hasselbladstiden (1878-1965) kunde man ringa in sin order och få den levererad av springpojkar. Det tänker vi börja med igen, men nu med webbutik och hemleverans via bil.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DeliverySection;
