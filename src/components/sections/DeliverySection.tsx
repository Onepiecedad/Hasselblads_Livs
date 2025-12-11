const DeliverySection = () => {
  return (
    <section className="py-16 bg-cream/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-4xl mx-auto">
          <div className="w-72 md:w-96 flex-shrink-0">
            <img
              src="/hasselblads-bicycle-logo.png"
              alt="Hasselblads Livs - Leverans med cykel"
              className="w-full h-auto"
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Vi levererar direkt<br />till din dörr
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Handla enkelt online och få färska varor hemlevererade samma dag i Mölndalsområdet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;
