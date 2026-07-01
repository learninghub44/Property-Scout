import { useState } from "react";
import { Link } from "wouter";
import { Heart, Bed, Bath, MapPin, ShieldCheck, Star, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAddFavorite, useRemoveFavorite, getListFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface Property {
  id: number;
  title: string;
  price: number;
  pricePeriod: string;
  listingType: string;
  propertyType: string;
  location: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  area?: number | null;
  isVerified: boolean;
  isFeatured: boolean;
  images: { id: number; url: string; isPrimary: boolean }[];
  createdAt: string;
}

interface PropertyCardProps {
  property: Property;
  isFavorited?: boolean;
}

export default function PropertyCard({ property, isFavorited = false }: PropertyCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const queryClient = useQueryClient();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const primaryImage = property.images.find((i) => i.isPrimary)?.url || property.images[0]?.url;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      setFavorited(false);
      await removeFavorite.mutateAsync({ propertyId: property.id });
    } else {
      setFavorited(true);
      await addFavorite.mutateAsync({ data: { propertyId: property.id } });
    }
    queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="group">
      <Link
        href={`/properties/${property.id}`}
        className="block bg-card rounded-xl overflow-hidden border border-card-border shadow-xs hover:shadow-md transition-shadow"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">No image</div>
          )}

          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge className={cn(
              "text-xs font-semibold px-2 py-0.5",
              property.listingType === "sale" ? "bg-primary text-white" : "bg-foreground text-white"
            )}>
              {property.listingType === "sale" ? "For Sale" : "For Rent"}
            </Badge>
            {property.isFeatured && (
              <Badge className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5">
                <Star className="w-3 h-3 mr-1" />Featured
              </Badge>
            )}
          </div>

          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <Heart className={cn("w-4 h-4", favorited ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{property.title}</h3>
            {property.isVerified && (
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            )}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{property.neighborhood}, Kisii</span>
          </div>

          <div className="text-primary font-bold text-base mb-3">
            {formatPrice(property.price, property.pricePeriod, property.listingType)}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" />{property.bedrooms} bed
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" />{property.bathrooms} bath
              </span>
            )}
            {property.area && (
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5" />{property.area} m²
              </span>
            )}
            <span className="ml-auto text-primary/70 font-medium">{property.propertyType}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
