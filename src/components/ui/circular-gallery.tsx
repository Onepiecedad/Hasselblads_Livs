import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Define the type for a single gallery item
export interface GalleryItem {
    name: string;
    image: string;
    href: string;
    imageClassName?: string;
    bgColor?: string;
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
        const [velocity, setVelocity] = useState(0);
        const [isDragging, setIsDragging] = useState(false);
        const [isVisible, setIsVisible] = useState(false);
        const animationFrameRef = useRef<number | null>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const galleryRef = useRef<HTMLDivElement>(null);
        const lastTouchX = useRef<number>(0);
        const lastTouchTime = useRef<number>(0);
        const hasDragged = useRef<boolean>(false);
        const dragDistance = useRef<number>(0);

        // Check if mobile on mount and resize
        useEffect(() => {
            const checkMobile = () => setIsMobile(window.innerWidth < 768);
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }, []);

        // Track visibility with IntersectionObserver - pause animation when off-screen
        useEffect(() => {
            const el = galleryRef.current;
            if (!el) return;
            const observer = new IntersectionObserver(
                ([entry]) => setIsVisible(entry.isIntersecting),
                { threshold: 0.1 }
            );
            observer.observe(el);
            return () => observer.disconnect();
        }, []);

        // Use mobileRadius on small screens
        const effectiveRadius = isMobile && mobileRadius ? mobileRadius : radius;

        // Rotation effect - hover-based on desktop, momentum on mobile
        // Only runs when gallery is visible in viewport
        useEffect(() => {
            if (!isVisible) return;

            const animate = () => {
                // Desktop: rotate on hover
                if (!isMobile && isHovering && hoverDirection !== 0) {
                    setRotation(prev => prev + hoverDirection * autoRotateSpeed * 6);
                }
                // Mobile: apply momentum/inertia when not dragging
                if (isMobile && !isDragging && Math.abs(velocity) > 0.1) {
                    setRotation(prev => prev + velocity);
                    setVelocity(prev => prev * 0.95); // Friction - slow down gradually
                } else if (isMobile && !isDragging) {
                    setVelocity(0);
                }
                animationFrameRef.current = requestAnimationFrame(animate);
            };

            animationFrameRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [isVisible, isHovering, hoverDirection, autoRotateSpeed, isMobile, velocity, isDragging]);

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

        // Touch handlers for mobile - drag to rotate with momentum
        const handleTouchStart = (e: React.TouchEvent) => {
            setTouchStartX(e.touches[0].clientX);
            setIsDragging(true);
            setVelocity(0);
            lastTouchX.current = e.touches[0].clientX;
            lastTouchTime.current = Date.now();
            hasDragged.current = false;
            dragDistance.current = 0;
        };

        const handleTouchMove = (e: React.TouchEvent) => {
            if (touchStartX === null) return;
            const touchX = e.touches[0].clientX;
            const deltaX = touchX - lastTouchX.current;
            const deltaTime = Date.now() - lastTouchTime.current;

            // Track total drag distance
            dragDistance.current += Math.abs(deltaX);
            if (dragDistance.current > 10) {
                hasDragged.current = true;
            }

            // Calculate velocity for momentum
            if (deltaTime > 0) {
                setVelocity(-deltaX * 0.5);
            }

            // Rotate based on drag distance
            setRotation(prev => prev - deltaX * 0.4);
            lastTouchX.current = touchX;
            lastTouchTime.current = Date.now();
        };

        const handleTouchEnd = () => {
            setTouchStartX(null);
            setIsDragging(false);
            // Reset hasDragged after a short delay to allow click to be prevented
            setTimeout(() => {
                hasDragged.current = false;
                dragDistance.current = 0;
            }, 100);
        };

        const anglePerItem = 360 / items.length;

        // Card size varies by viewport
        const cardSize = isMobile ? 100 : 220;
        const cardOffset = cardSize / 2;

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
                    "relative w-full flex items-center justify-center select-none",
                    isMobile ? "h-[240px]" : "h-[320px]",
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
                                className="absolute transition-opacity duration-300"
                                style={{
                                    width: cardSize,
                                    height: cardSize,
                                    transform: `rotateY(${itemAngle}deg) translateZ(${effectiveRadius}px) scale(${scale})`,
                                    left: '50%',
                                    top: '50%',
                                    marginLeft: `-${cardOffset}px`,
                                    marginTop: `-${cardOffset}px`,
                                    opacity: opacity,
                                    zIndex: isFront ? 10 : 1,
                                }}
                                onClick={() => {
                                    if (!hasDragged.current && dragDistance.current < 10) {
                                        onItemClick?.(item);
                                    }
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && onItemClick?.(item)}
                            >
                                <div className={cn(
                                    "relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300",
                                    "shadow-lg hover:shadow-2xl",
                                    isFront && "ring-2 ring-primary/30"
                                )}
                                    style={item.bgColor ? { backgroundColor: item.bgColor } : undefined}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        loading="lazy"
                                        decoding="async"
                                        className={cn("absolute inset-0 w-full h-full object-cover", item.imageClassName)}
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
