import { Card, CardContent } from "@/components/ui/card";

const ProductCardSkeleton = () => {
    return (
        <Card className="flex h-full flex-col overflow-hidden border-0 bg-card/60 backdrop-blur-sm shadow-sm rounded-2xl animate-pulse">
            {/* Image skeleton */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted/50 rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60" />
            </div>

            <CardContent className="flex flex-1 flex-col p-3 sm:p-5">
                <div className="flex-1 space-y-3">
                    {/* Title skeleton */}
                    <div className="h-4 bg-muted/50 rounded-full w-3/4" />
                    {/* Description skeleton */}
                    <div className="space-y-2">
                        <div className="h-3 bg-muted/30 rounded-full w-full" />
                        <div className="h-3 bg-muted/30 rounded-full w-2/3" />
                    </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-1">
                    <div>
                        {/* Price skeleton */}
                        <div className="h-6 bg-muted/50 rounded-full w-16" />
                        {/* Unit skeleton */}
                        <div className="h-3 bg-muted/30 rounded-full w-10 mt-1" />
                    </div>
                    {/* Button skeleton */}
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted/40" />
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductCardSkeleton;
