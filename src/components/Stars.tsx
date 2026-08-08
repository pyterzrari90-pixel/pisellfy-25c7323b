export function Stars({ rating, count }: { rating: number; count?: number }) {
  const rounded = Math.round(rating * 10) / 10;
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span aria-hidden className="text-primary">
        {[1, 2, 3, 4, 5].map((i) => (i <= Math.round(rating) ? "★" : "☆")).join("")}
      </span>
      <span className="font-medium">{rounded ? rounded.toFixed(1) : "—"}</span>
      {count !== undefined && <span className="text-muted-foreground">({count})</span>}
    </span>
  );
}
