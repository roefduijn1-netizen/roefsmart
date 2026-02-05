import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
interface StarRatingProps {
  rating: number; // 1-5
  maxRating?: number;
  className?: string;
}
export function StarRating({ rating, maxRating = 5, className }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[...Array(maxRating)].map((_, i) => {
        const isFilled = i < rating;
        return (
          <Star
            key={i}
            className={cn(
              "w-3.5 h-3.5 transition-colors duration-300",
              isFilled
                ? "fill-amber-500 text-amber-500"
                : "fill-neutral-800 text-neutral-800"
            )}
          />
        );
      })}
    </div>
  );
}