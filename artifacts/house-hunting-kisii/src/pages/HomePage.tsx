import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Search, MapPin, ChevronRight, Shield, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import Footer from "@/components/Footer";
import { useGetFeaturedProperties, useGetRecentProperties, useListTestimonials, useListLocations, useGetPropertySummary } from "@workspace/api-client-react";
import { motion } from "framer-motion";

const HERO_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=85";
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export default function HomePage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [listingType, setListingType] = useState("all");

  const { data: featured, isLoading: featuredLoading } = useGetFeaturedProperties();
  const { data: recent, isLoading: recentLoading } = useGetRecentProperties();
  const { data: testimonials } = useListTestimonials();
  const { data: locations } = useListLocations();
  const { data: summary } = useGetPropertySummary();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("location", searchQuery);
    if (listingType !== "all") params.set("type", listingType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-sm font-medium mb-6">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Kisii County, Kenya
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Find Your Perfect<br />
              <span className="text-primary">Home in Kisii</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/80 text-lg mb-8 max-w-xl">
              Browse verified property listings from trusted sellers. From cozy apartments to executive villas, your next home is here.
            </motion.p>
            <motion.form variants={fadeUp} onSubmit={handleSearch} className="bg-white rounded-xl shadow-xl p-3 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, neighborhood..."
                  className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm"
                />
              </div>
              <Select value={listingType} onValueChange={setListingType}>
                <SelectTrigger className="w-full sm:w-36 border border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white px-6">Search</Button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {summary && (
        <section className="bg-primary text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Total Listings", value: summary.totalListings },
                { label: "For Sale", value: summary.forSale },
                { label: "For Rent", value: summary.forRent },
                { label: "Verified", value: summary.verifiedListings },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold">{s.value.toLocaleString()}</div>
                  <div className="text-white/70 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Featured Properties</h2>
            <p className="text-muted-foreground text-sm mt-1">Hand-picked premium listings</p>
          </div>
          <Link href="/properties?isFeatured=true">
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featuredLoading
            ? Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : featured?.map((p) => <PropertyCard key={p.id} property={p as any} />)
          }
        </div>
      </section>

      {/* Locations */}
      {locations && locations.length > 0 && (
        <section className="bg-secondary/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground">Popular Neighborhoods</h2>
              <p className="text-muted-foreground text-sm mt-2">Explore Kisii's most sought-after locations</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {locations.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/properties?location=${encodeURIComponent(loc.name)}`}
                  className="group block rounded-xl overflow-hidden relative aspect-square cursor-pointer"
                >
                  <img src={loc.imageUrl} alt={loc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="text-white font-semibold text-sm">{loc.name}</div>
                    <div className="text-white/70 text-xs">{loc.propertyCount} listings</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Recently Added</h2>
            <p className="text-muted-foreground text-sm mt-1">Fresh listings just posted</p>
          </div>
          <Link href="/properties">
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {recentLoading
            ? Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : recent?.slice(0, 4).map((p) => <PropertyCard key={p.id} property={p as any} />)
          }
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-foreground text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3">Why Choose HouseKisii?</h2>
            <p className="text-white/60">The most trusted platform for Kisii real estate</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "KYC Verified Sellers", desc: "Every landlord and seller is verified with national ID and address confirmation for your security." },
              { icon: Star, title: "Curated Listings", desc: "Our team reviews every listing for accuracy and quality before it goes live." },
              { icon: TrendingUp, title: "Market Insights", desc: "Get real price data and trends for Kisii neighborhoods to make informed decisions." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">What Our Users Say</h2>
            <p className="text-muted-foreground text-sm mt-2">Real stories from real people</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-card border border-card-border rounded-xl p-5">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  {t.avatarUrl && <img src={t.avatarUrl} alt={t.authorName} className="w-9 h-9 rounded-full object-cover" />}
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.authorName}</div>
                    {t.authorRole && <div className="text-xs text-muted-foreground">{t.authorRole}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to List Your Property?</h2>
          <p className="text-white/80 mb-8">Join hundreds of verified sellers and landlords reaching genuine buyers across Kisii.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button className="bg-white text-primary hover:bg-white/90 font-semibold px-8">Get Started</Button>
            </Link>
            <Link href="/kyc">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">Get Verified</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
