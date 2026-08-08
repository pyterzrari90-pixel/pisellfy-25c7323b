import { useState, type FormEvent } from "react";

import { Stars } from "@/components/Stars";
import type { Review } from "@/lib/freelance/types";
import { averageRating } from "@/lib/freelance/types";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Reviews</h2>
        <Stars rating={averageRating(reviews)} count={reviews.length} />
      </div>
      {reviews.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">@{review.authorName}</span>
                <Stars rating={review.rating} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ReviewForm({
  onSubmit,
  label = "Leave a review",
}: {
  onSubmit: (rating: number, comment: string) => void;
  label?: string;
}) {
  const [rating, setRating] = useState(5);
  const [done, setDone] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const comment = String(form.get("comment") ?? "").trim().slice(0, 600);
    if (!comment) return;
    onSubmit(rating, comment);
    event.currentTarget.reset();
    setDone(true);
  }

  if (done) return <p className="text-sm text-muted-foreground">Thanks for your review!</p>;

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            onClick={() => setRating(value)}
            className={`text-xl leading-none ${value <= rating ? "text-primary" : "text-muted-foreground"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        rows={3}
        required
        maxLength={600}
        placeholder="How was it?"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Post review
      </button>
    </form>
  );
}
