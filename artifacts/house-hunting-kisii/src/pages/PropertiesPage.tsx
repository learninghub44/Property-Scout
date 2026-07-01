import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Search, SlidersHorizontal, Grid3x3, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import Footer from "@/components/Footer";
import { useListProperties } from "@workspace/api-client-react";
import { motion } from "framer-motion";

const PROPERTY_TYPES = ["House", "Apartment", "Studio", "Villa", "Maisonette", "Mansion", "Land", "Commercial"];

export default function PropertiesPage() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);

  const [location, setLocation] = useState(params.get("location") || "");
  const [type, setType] = useState(params.get("type") || "all");
  const [propertyType, setPropertyType] = useState(params.get("propertyType") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");

  const queryParams: any = { page, limit: 12, sortBy };
  if (location) queryParams.location = location;
  if (type && type !== "all") queryParams.type = type;
  if (propertyType) queryParams.propertyType = propertyType;
  if (minPrice) queryParams.minPrice = Number(minPrice);
  if (maxPrice) queryParams.maxPrice = Number(maxPrice);
  if (bedrooms) queryParams.bedrooms = Number(bedrooms);
  if (params.get("isFeatured") === "true") queryParams.isFeatured = true;

  const { data, isLoading } = useListProperties(queryParams);

  const totalPages = data ? Math.ceil(data.total / 12) : 0;

  const clearFilters = () => {
    setLocation(""); setType("all"); setPropertyType("");
    setMinPrice(""); setMaxPrice(""); setBedrooms("");
    setPage(1);
  };

  const hasFilters = location || type !== "all" || propertyType || minPrice || maxPrice || bedrooms;

  const FilterContent = () => (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium">Listing Type</Label>
        <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="sale">For Sale</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Property Type</Label>
        <Select value={propertyType || "all"} onValueChange={(v) => { setPropertyType(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder="Any type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Bedrooms</Label>
        <Select value={bedrooms || "any"} onValueChange={(v) => { setBedrooms(v === "any" ? "" : v); setPage(1); }}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}+</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Min Price (KES)</Label>
        <Input className="mt-1.5" placeholder="e.g. 500000" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} />
      </div>
      <div>
        <Label className="text-sm font-medium">Max Price (KES)</Label>
        <Input className="mt-1.5" placeholder="e.g. 10000000" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} />
      </div>
      {hasFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-1" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-secondary/40 border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Browse Properties</h1>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                placeholder="Search by location..."
                className="pl-9 bg-white"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price_asc">Price: Low</SelectItem>
                <SelectItem value="price_desc">Price: High</SelectItem>
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
            <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
              <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-primary text-white" : "bg-white text-muted-foreground"}`}><Grid3x3 className="w-4 h-4" /></button>
              <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-white" : "bg-white text-muted-foreground"}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${data?.total ?? 0} properties found`}
          </p>
        </div>

        {isLoading ? (
          <div className={`grid gap-5 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : data?.properties.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search terms</p>
            <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
          </div>
        ) : (
          <motion.div
            className={`grid gap-5 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            {data?.properties.map((p) => (
              <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
                <PropertyCard property={p as any} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
