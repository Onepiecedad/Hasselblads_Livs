import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Define the type for a single gallery item
export interface GalleryItem {
    name: string;
    image: string;
    href: string;
}

// Define the props for the CircularGallery component
interface CircularGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
    items: GalleryItem[];
    /** Controls how far the items are from the center. */
    radius?: number;
    /** Controls how far the items are from the center on mobile. */
    mobileRadius?: number;
    /** Controls the speed of auto-rotation. */
    autoRotateSpeed?: number;
    /** Callback when an item is clicked */
    onItemClick?: (item: GalleryItem) => void;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
    ({ items, className, radius = 400, mobileRadius, autoRotateSpeed = 0.15, onItemClick, ...props }, ref) => {
        const [rotation, setRotation] = useState(0);
        const [isHovering, setIsHovering] = useState(false);
        const [hoverDirection, setHoverDirection] = useState(0);
        const [isMobile, setIsMobile] = useState(false);
        const [touchStartX, setTouchStartX] = useState<number | null>(null);
        const animationFrameRef = useRef<number | null>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const galleryRef = useRef<HTMLDivElement>(null);

        // Check if mobile on mount and resize
        useEffect(() => {
            const checkMobile = () => setIsMobile(window.innerWidth < 768);
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }, []);

        // Use mobileRadius on small screens
        const effectiveRadius = isMobile && mobileRadius ? mobileRadius : radius;

        // Rotation effect - hover-based on desktop only, no auto-rotation on mobile
        useEffect(() => {
            const animate = () => {
                // Only rotate on desktop when hovering
                if (!isMobile && isHovering && hoverDirection !== 0) {
                    setRotation(prev => prev + hoverDirection * autoRotateSpeed * 6);
                }
                animationFrameRef.current = requestAnimationFrame(animate);
            };

            animationFrameRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [isHovering, hoverDirection, autoRotateSpeed, isMobile]);

        // Handle mouse position to determine rotation direction
        const handleMouseMove = (e: React.MouseEvent) => {
            if (!galleryRef.current) return;
            const rect = galleryRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const mouseX = e.clientX;
            const distanceFromCenter = mouseX - centerX;
            const normalizedDistance = distanceFromCenter / (rect.width / 2);
            const exponentialDistance = Math.sign(normalizedDistance) * Math.pow(Math.abs(normalizedDistance), 1.5);
            setHoverDirection(-exponentialDistance);
        };

        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => {
            setIsHovering(false);
            setHoverDirection(0);
        };

        // Touch handlers for mobile - drag to rotate
        const handleTouchStart = (e: React.TouchEvent) => {
            setTouchStartX(e.touches[0].clientX);
        };

        const handleTouchMove = (e: React.TouchEvent) => {
            if (touchStartX === null) return;
            const touchX = e.touches[0].clientX;
            const deltaX = touchX - touchStartX;
            // Rotate based on drag distance
            setRotation(prev => prev - deltaX * 0.3);
            setTouchStartX(touchX);
        };

        const handleTouchEnd = () => {
            setTouchStartX(null);
        };

        const anglePerItem = 360 / items.length;

        return (
            <div
                ref={(node) => {
                    galleryRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) ref.current = node;
                }}
                role="region"
                aria-label="Circular 3D Gallery"
                className={cn(
                    "relative w-full h-[280px] md:h-[320px] flex items-center justify-center select-none",
                    className
                )}
                style={{ perspective: '1200px' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                {...props}
            >
                <div
                    ref={containerRef}
                    className="relative w-full h-full"
                    style={{
                        transform: `rotateY(${-rotation}deg)`,
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {items.map((item, i) => {
                        const itemAngle = i * anglePerItem;
                        const totalRotation = rotation % 360;
                        const relativeAngle = (itemAngle - totalRotation + 360) % 360;
                        const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
                        const opacity = Math.max(0.4, 1 - (normalizedAngle / 180) * 0.6);
                        const scale = Math.max(0.7, 1 - (normalizedAngle / 180) * 0.3);
                        const isFront = normalizedAngle < 45;

                        return (
                            <div
                                key={item.name}
                                role="button"
                                tabIndex={0}
                                aria-label={item.name}
                                className="absolute w-[130px] h-[130px] md:w-[200px] md:h-[200px] transition-opacity duration-300"
                                style={{
                                    transform: `rotateY(${itemAngle}deg) translateZ(${effectiveRadius}px) scale(${scale})`,
                                    left: '50%',
                                    top: '50%',
                                    marginLeft: isMobile ? '-65px' : '-100px',
                                    marginTop: isMobile ? '-65px' : '-100px',
                                    opacity: opacity,
                                    zIndex: isFront ? 10 : 1,
                                }}
                                onClick={() => onItemClick?.(item)}
                                onKeyDown={(e) => e.key === 'Enter' && onItemClick?.(item)}
                            >
                                <div className={cn(
                                    "relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300",
                                    "shadow-lg hover:shadow-2xl",
                                    isFront && "ring-2 ring-primary/30"
                                )}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        draggable={false}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
