import { useEffect, useState } from "react";
import { fetchActiveAd, type AdPlacement, type SponsoredAd } from "../lib/adsApi";

interface AdPlaceholderProps {
  placement: AdPlacement;
  width?: number;
  height?: number;
}

export function AdPlaceholder({ placement, width = 300, height = 250 }: AdPlaceholderProps) {
  const [ad, setAd] = useState<SponsoredAd | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchActiveAd(placement)
      .then((result) => {
        if (!cancelled) setAd(result);
      })
      .catch(() => {
        if (!cancelled) setAd(null);
      });
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (ad) {
    return (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={`Advertisement: ${ad.advertiserName}`}
        className="block w-full overflow-hidden rounded-lg"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <img
          src={ad.image}
          alt={`${ad.advertiserName} advertisement`}
          className="h-full w-full object-cover"
        />
      </a>
    );
  }

  return (
    <div
      role="complementary"
      aria-label="Advertisement placeholder"
      className="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-400"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      Advertisement
      <span className="ml-1 text-slate-300">
        ({width}&times;{height})
      </span>
    </div>
  );
}
