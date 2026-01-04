import React, { memo } from 'react';

interface HeroLeafBadgeProps {
    className?: string;
    /** Custom single-line text to display. If not provided, shows "Lite godare & bättre mat" */
    text?: string;
}

/**
 * Hero leaf badge - uses exact path from Path 112.svg
 * ViewBox adjusted to show only the left leaf (x: 185-545, y: 150-400)
 * Supports custom text for different pages (e.g., "Leverans", "Om oss")
 */
const HeroLeafBadge: React.FC<HeroLeafBadgeProps> = memo(({ className = '', text }) => {
    const ariaLabel = text || "Lite godare & bättre mat";

    return (
        <svg
            viewBox="280 150 270 250"
            className={className}
            aria-label={ariaLabel}
            role="img"
            xmlns="http://www.w3.org/2000/svg"
        >
            <style>
                {`
          tspan { white-space: pre; }
          .leaf-shape { fill: hsl(var(--primary)); }
          .leaf-text-1 { 
            font-size: 34px;
            fill: #ffffff;
            font-weight: 700;
            font-family: "Josefin Sans", sans-serif;
          }
          .leaf-text-2 { 
            font-size: 34px;
            fill: #ffffff;
            font-weight: 700;
            font-family: "Josefin Sans", sans-serif;
          }
          .leaf-text-single { 
            font-size: 32px;
            fill: #ffffff;
            font-weight: 700;
            font-family: "Josefin Sans", sans-serif;
          }
        `}
            </style>

            {/* Exact path from Path 112.svg - left leaf only */}
            <path
                fillRule="evenodd"
                className="leaf-shape"
                d="m533.39 160.29c0 0-1.74 39.68-26.38 57.45-7.54 5.44-16.36 8.2-24.96 9.41 10.15 15.96 16.03 34.89 16.03 55.21 0 56.91-46.14 103.05-103.06 103.05-56.91 0-103.05-46.14-103.05-103.05 0-56.92 46.14-103.06 103.05-103.06 20.42 0 39.45 5.94 55.46 16.18 3.87-10.29 10.09-21.08 20.07-28.28 24.64-17.77 62.84-6.91 62.84-6.91z"
            />

            {/* Text - either custom single line or original multi-line */}
            {text ? (
                <text
                    x="395"
                    y="295"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="leaf-text-single"
                >
                    {text}
                </text>
            ) : (
                <text className="hero-leaf-text-transform">
                    <tspan x="49" y="25.2" className="leaf-text-1">Lite  </tspan>
                    <tspan x="10" y="61.2" className="leaf-text-2">godare </tspan>
                    <tspan x="0" y="97.2" className="leaf-text-2">&amp; bättre  </tspan>
                    <tspan x="35" y="133.2" className="leaf-text-2">mat</tspan>
                </text>
            )}
        </svg>
    );
});

export default HeroLeafBadge;
