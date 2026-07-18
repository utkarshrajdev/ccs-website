import { FaStar } from 'react-icons/fa';
import LazyImage from '../common/LazyImage';
import { toNumber } from '../../utils/helpers';

export default function TestimonialCard({ testimonial }) {
  const rating = Math.min(5, Math.max(0, Math.round(toNumber(testimonial.rating) || 5)));

  return (
    <figure className="card mx-auto max-w-2xl p-8 text-center">
      <LazyImage
        src={testimonial.photo}
        alt={testimonial.name}
        className="mx-auto mb-4 h-16 w-16 rounded-full"
      />
      <div className="mb-3 flex justify-center gap-1 text-accent-500" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: rating }).map((_, i) => (
          <FaStar key={i} aria-hidden="true" />
        ))}
      </div>
      <blockquote className="mb-4 text-slate-600 dark:text-slate-300 md:text-lg">
        “{testimonial.review}”
      </blockquote>
      <figcaption>
        <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
        <p className="text-sm text-slate-500">
          {testimonial.designation}
          {testimonial.company ? ` · ${testimonial.company}` : ''}
        </p>
      </figcaption>
    </figure>
  );
}
