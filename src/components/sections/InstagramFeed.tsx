const FeaturedSection = () => {
    return (
        <section className="py-16 md:py-24 bg-transparent">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Aktuellt</h2>
                </div>

                {/* Video - Clean, minimal presentation */}
                <div className="flex justify-center">
                    <div className="rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: '9/16', width: '340px' }}>
                        <iframe
                            src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F850613071270264%2F&show_text=false&width=267&t=0"
                            className="w-full h-full"
                            style={{ border: 'none' }}
                            scrolling="no"
                            frameBorder="0"
                            allowFullScreen={true}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            title="Video från butiken"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedSection;
