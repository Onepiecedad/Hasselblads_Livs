const DeliverySection = () => {
  return (
    <section className="py-16 md:py-24 bg-cream/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-4xl mx-auto">
          {/* Large bicycle illustration */}
          <div className="flex-shrink-0">
            <img
              src="/cykel.webp"
              alt="Leveranscykel"
              className="w-40 h-40 md:w-48 md:h-48 object-contain"
            />
          </div>

          {/* Text content */}
          <div className="text-center md:text-left space-y-4">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
              Vi vet var maten kommer ifrån och känner våra producenter personligen.
              Varje produkt handplockas med kärlek och noggrannhet.
            </p>
            <p className="text-xl md:text-2xl text-primary font-bold italic">
              Snart har vi även utkörning!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;
