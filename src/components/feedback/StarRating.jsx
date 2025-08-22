import React, { useState } from 'react';
import { Star } from 'lucide-react';

const getStarFillPercentage = (rating, index) => {
    const starValue = index + 1;
    if (rating >= starValue) {
      return 100; // Full star
    }
    if (rating > index && rating < starValue) {
      return (rating - index) * 100; // Partial star (e.g., 3.5 for index 3 -> 50%)
    }
    return 0; // Empty star
};

export default function StarRating({
  count = 5,
  initialRating = 0,
  onRatingChange,
  size = 32,
}) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseMove = (e, index) => {
    const starContainer = e.currentTarget;
    const rect = starContainer.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    setHoverRating(index + (isHalf ? 0.5 : 1));
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (currentHoverRating) => {
    const newRating = currentHoverRating === rating ? 0 : currentHoverRating;
    setRating(newRating);
    onRatingChange(newRating);
  };

  const stars = [...Array(count)].map((_, index) => {
    const displayRating = hoverRating > 0 ? hoverRating : rating;
    const fillPercentage = getStarFillPercentage(displayRating, index);
    const starKey = `star-${index}`;

    return (
      <div
        key={starKey}
        className="relative cursor-pointer"
        onMouseMove={(e) => handleMouseMove(e, index)}
        onClick={() => handleClick(hoverRating)}
      >
        <Star size={size} className="text-slate-300 fill-slate-200" />
        <div
          className="absolute top-0 left-0 h-full overflow-hidden transition-all duration-100"
          style={{ width: `${fillPercentage}%` }}
        >
          <Star size={size} className="text-yellow-400 fill-yellow-400" />
        </div>
      </div>
    );
  });

  return (
    <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
      {stars}
    </div>
  );
}