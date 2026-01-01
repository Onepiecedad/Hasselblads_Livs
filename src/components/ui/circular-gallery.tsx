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
    /** Controls the speed of auto-rotation. */
    autoRotateSpeed?: number;
    /** Callback when an item is clicked */
    onItemClick?: (item: GalleryItem) => void;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
    ({ items, className, radius = 400, autoRotateSpeed = 0.15, onItemClick, ...props }, ref) => {
        const [rotation, setRotation] = useState(0);
        const [isHovering, setIsHovering] = useState(false);
        const [hoverDirection, setHoverDirection] = useState(0); // -1 = left (clockwise), 1 = right (counter-clockwise)
        const animationFrameRef = useRef<number | null>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const galleryRef = useRef<HTMLDivElement>(null);

        // Rotation effect based on hover position
        useEffect(() => {
            const animate = () => {
                if (isHovering && hoverDirection !== 0) {
                    // Rotate based on hover direction
                    setRotation(prev => prev + hoverDirection * autoRotateSpeed * 6);
                } else if (!isHovering) {
                    // Auto-rotate when not hovering
                    setRotation(prev => prev + autoRotateSpeed);
                }
                animationFrameRef.current = requestAnimationFrame(animate);
            };

            animationFrameRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [isHovering, hoverDirection, autoRotateSpeed]);

        // Handle mouse position to determine rotation direction
        const handleMouseMove = (e: React.MouseEvent) => {
            if (!galleryRef.current) return;
            const rect = galleryRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const mouseX = e.clientX;
            const distanceFromCenter = mouseX - centerX;
            const normalizedDistance = distanceFromCenter / (rect.width / 2);

            // Use exponential scaling for more dramatic speed increase toward edges
            const exponentialDistance = Math.sign(normalizedDistance) * Math.pow(Math.abs(normalizedDistance), 1.5);

            // Left side = positive rotation (clockwise), right side = negative (counter-clockwise)
            setHoverDirection(-exponentialDistance);
        };

        const handleMouseEnter = () => {
            setIsHovering(true);
        };

        const handleMouseLeave = () => {
            setIsHovering(false);
            setHoverDirection(0);
        };

        // Touch handlers for mobile
        const handleTouchMove = (e: React.TouchEvent) => {
            if (!galleryRef.current) return;
            const rect = galleryRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const touchX = e.touches[0].clientX;
            const distanceFromCenter = touchX - centerX;
            const normalizedDistance = distanceFromCenter / (rect.width / 2);
            setHoverDirection(-normalizedDistance);
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
                    "relative w-full h-[400px] md:h-[500px] flex items-center justify-center select-none",
                    className
                )}
                style={{ perspective: '1200px' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseLeave}
                {...props}
            >
                <div
                    ref={containerRef}
                    className="relative w-full h-full"
                    style={{
                        transform: `rotateY(${-rotation}deg)`,
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.15s ease-out',
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
                                className="absolute w-[160px] h-[160px] md:w-[200px] md:h-[200px] transition-opacity duration-300"
                                style={{
                                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px) scale(${scale})`,
                                    left: '50%',
                                    top: '50%',
                                    marginLeft: '-80px',
                                    marginTop: '-80px',
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
