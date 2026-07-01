import { Heart } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import Footer from "@/components/Footer";
import { useListFavorites } from "@workspace/api-client-react";

export default function FavoritesPage() {
  const { data, isLoading } = useListFavorites();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-secondary/40 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Saved Properties</h1>
              <p className="text-muted-foreground text-sm">{isLoading ? "Loading..." : `${data?.length ?? 0} saved`}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : data?.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No saved properties yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Browse listings and tap the heart icon to save properties you love.</p>
            <Link href="/properties"><Button className="bg-primary">Browse Properties</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data?.map((fav) => (
              <PropertyCard key={fav.id} property={fav.property as any} isFavorited />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
