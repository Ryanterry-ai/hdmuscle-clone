import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
}

export default function StarRating({ rating, count }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: fullStars }, (_, i) => (
          <Star
            key={`full-${i}`}
            className="w-4 h-4 fill-warning text-warning"
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-warning" />
            <StarHalf className="w-4 h-4 fill-warning text-warning absolute top-0 left-0" />
          </div>
        )}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-4 h-4 text-gray-300"
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs sm:text-sm text-text-muted">
          ({count})
        </span>
      )}
    </div>
  );
}
