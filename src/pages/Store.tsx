import storeInterior from "@/assets/store-interior.png";
import storeProducts from "@/assets/store-products.png";

const Store = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Vår butik</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Frejagatan 9, Mölndal
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 mb-12">
              <p>
                Välkommen till vår butik på Frejagatan 9 i Mölndal.
                Här möts du av samma känsla som alltid har präglat Hasselblads – personlig service, noga utvalda råvaror och en varm, familjär atmosfär.
              </p>
              <p>
                Vi fyller hyllorna varje morgon med färsk frukt och grönsaker från lokala och internationella odlare. Du hittar också ett växande sortiment av delikatesser, skafferivaror och drycker för dig som uppskattar mat med kvalitet och ursprung.
              </p>
              <p>
                Hos oss får du smaka, fråga och ta del av vår kunskap. Vi tipsar gärna om säsongens bästa råvaror, hur du kombinerar smaker och vad som precis kommit in.
              </p>
              <p>
                Butiken har varit en del av Mölndal sedan 2003, men familjen Hasselblads mattradition sträcker sig ända tillbaka till 1878 – när Davida Hasselblad drev sitt charkuteri i Göteborg. I dag fortsätter vi samma resa, fast med fokus på frukt, grönt och god mat för framtiden.
              </p>
              <p className="text-lg font-semibold text-foreground">Välkommen in.</p>
            </div>

            {/* Store Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={storeInterior} 
                  alt="Hasselblads butik interiör" 
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={storeProducts} 
                  alt="Färska produkter i butiken" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Map Section */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Hitta hit</h2>
              <div className="rounded-lg overflow-hidden shadow-lg border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2134.8959746537877!2d12.013925476912!3d57.65548737387779!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x464ff3b3e3b3b3b3%3A0x3b3b3b3b3b3b3b3b!2sFrejagatan%209%2C%20431%2045%20M%C3%B6lndal!5e0!3m2!1ssv!2sse!4v1234567890123"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hasselblads butik på karta"
                ></iframe>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Kontakta oss</h3>
              <p className="text-muted-foreground">
                Frejagatan 9, 431 45 Mölndal
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Store;
