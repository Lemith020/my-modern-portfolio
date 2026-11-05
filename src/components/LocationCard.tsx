import { useState } from "react";
import { ArrowUpRight, MapPin, Navigation } from "lucide-react";
import "@/styles/location.css";

type LocationCardProps = {
  location: string;
  mapsUrl: string;
  mapImage?: string;
  mapImageAlt?: string;
};

export function LocationCard({ location, mapsUrl, mapImage, mapImageAlt }: LocationCardProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const showMapImage = Boolean(mapImage && mapImage !== failedImage);

  return (
    <div className="contact-location">
      <div className="contact-location-label"><MapPin size={15} aria-hidden="true" /> Location</div>
      <a
        className="location-postcard"
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${location} on Google Maps (opens in a new tab)`}
      >
        <div className="location-postcard-top"><span><span className="location-status-dot" /> MY CORNER OF THE WORLD</span><ArrowUpRight size={17} aria-hidden="true" /></div>
        {showMapImage ? (
          <div className="location-map-preview">
            <img
              src={mapImage}
              alt={mapImageAlt || `Map of ${location}`}
              width={732}
              height={383}
              loading="lazy"
              onError={() => setFailedImage(mapImage || null)}
            />
          </div>
        ) : <div className="location-artwork" aria-hidden="true">
          <span className="location-orbit location-orbit-outer" />
          <span className="location-orbit location-orbit-inner" />
          <svg className="location-globe" viewBox="0 0 240 120" fill="none">
            <ellipse cx="120" cy="60" rx="110" ry="48" />
            <ellipse cx="120" cy="60" rx="65" ry="48" />
            <ellipse cx="120" cy="60" rx="25" ry="48" />
            <path d="M10 60h220M29 33h182M29 87h182" />
          </svg>
          <span className="location-pin-shadow" />
          <span className="location-pin"><MapPin strokeWidth={1.6} /></span>
          <span className="location-spark location-spark-one" />
          <span className="location-spark location-spark-two" />
        </div>}
        <div className="location-postcard-bottom">
          <span className="location-based-label">BASED IN</span>
          <strong>{location}</strong>
          <span className="location-map-link"><Navigation size={13} aria-hidden="true" /> View on Google Maps <ArrowUpRight size={13} aria-hidden="true" /></span>
        </div>
      </a>
    </div>
  );
}
