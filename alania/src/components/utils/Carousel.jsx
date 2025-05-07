import React, { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useSwipeable } from "react-swipeable";

const Carousel = ({ items, renderItem }) => {
  const scrollRef = useRef(null);

  const getScrollAmount = () => {
    const container = scrollRef.current;
    if (!container) return 0;

    const visibleChildren = Array.from(container.children).filter(child => {
      const rect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return rect.left >= containerRect.left && rect.right <= containerRect.right;
    });

    if (visibleChildren.length > 0) {
      const child = visibleChildren[0];
      const style = window.getComputedStyle(child);
      const marginRight = parseFloat(style.marginRight) || 0;
      return child.offsetWidth + marginRight;
    }

    return container.firstChild?.offsetWidth || 150;
  };

  const scrollLeft = () => {
    const amount = getScrollAmount();
    scrollRef.current?.scrollBy({ left: -amount, behavior: "smooth" });
  };

  const scrollRight = () => {
    const amount = getScrollAmount();
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: scrollRight,
    onSwipedRight: scrollLeft,
    delta: 10,
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
  });

  return (
    <div className="w-full overflow-hidden" {...swipeHandlers} style={{ touchAction: "pan-y" }}>
      <div className="flex items-center">
        {/* Colonne gauche - Chevron gauche */}
        <div className="hidden md:flex items-center justify-center px-2">
        <button
            onClick={scrollLeft}
            className="bg-white rounded-full p-2 shadow hover:bg-gray-200"
            aria-label="Scroll Left"
        >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        </div>

        {/* Colonne centrale - Carrousel */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory"
          >
            {items.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 mr-4 snap-start"
              >
                {renderItem ? renderItem(item, index) : item}
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite - Chevron droit */}
        <div className="hidden md:flex items-center justify-center px-2">
        <button
            onClick={scrollRight}
            className="bg-white rounded-full p-2 shadow hover:bg-gray-200"
            aria-label="Scroll Right"
        >
            <ChevronRightIcon className="w-6 h-6 text-gray-600" />
        </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
