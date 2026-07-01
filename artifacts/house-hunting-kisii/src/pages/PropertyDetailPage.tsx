import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  Bed, Bath, Maximize2, MapPin, ShieldCheck, Phone, Mail, MessageCircle,
  ChevronLeft, ChevronRight, Calendar, Star, AlertTriangle, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { useGetProperty, useListProperties, useCreateViewing, useAddFavorite } from "@workspace/api-client-react";
import { formatPrice, formatDate } from "@/lib/utils";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [imgIdx, setImgIdx] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [favorited, setFavorited] = useState(false);

  const { data: property, isLoading } = useGetProperty(Number(id), { query: { enabled: !!id } });
  const { data: similar } = useListProperties({ limit: 4, page: 1 });
  const createViewing = useCreateViewing();
  const addFavorite = useAddFavorite();

  const handleViewing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    try {
      await createViewing.mutateAsync({
        data: {
          propertyId: property.id,
          scheduledAt: new Date(date).toISOString(),
          message,
          requesterName: name,
          requesterEmail: email,
          requesterPhone: phone,
        }
      });
      toast({ title: "Viewing requested!", description: "The seller will contact you to confirm." });
      setName(""); setEmail(""); setPhone(""); setMessage(""); setDate("");
    } catch {
      toast({ title: "Failed to request viewing", variant: "destructive" });
    }
  };

  const handleFavorite = async () => {
    if (!property) return;
    setFavorited(true);
    await addFavorite.mutateAsync({ data: { propertyId: property.id } });
    toast({ title: "Added to favorites" });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full rounded-xl mb-6" />
        <Skeleton className="h-8 w-1/2 mb-3" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Property not found</h2>
        <Link href="/properties"><Button className="mt-4">Browse Properties</Button></Link>
      </div>
    );
  }

  const images = property.images || [];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/properties" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Info */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-[16/9] mb-3">
              {images.length > 0 ? (
                <img src={images[imgIdx]?.url} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No images</div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setImgIdx((i) => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-primary" : "border-transparent"}`}>
                    <img src={img.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Property Info */}
            <div className="mt-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={property.listingType === "sale" ? "bg-primary text-white" : "bg-foreground text-white"}>
                      {property.listingType === "sale" ? "For Sale" : "For Rent"}
                    </Badge>
                    {property.isFeatured && <Badge className="bg-amber-500 text-white"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
                    {property.isVerified && <Badge variant="outline" className="text-primary border-primary"><ShieldCheck className="w-3 h-3 mr-1" />Verified</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">{property.title}</h1>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    {property.neighborhood}, Kisii
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{formatPrice(property.price, property.pricePeriod, property.listingType)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Listed {formatDate(property.createdAt)}</div>
                </div>
              </div>

              <div className="flex items-center gap-6 py-4 border-y border-border my-4">
                {property.bedrooms > 0 && <div className="text-center"><div className="font-bold text-lg">{property.bedrooms}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><Bed className="w-3 h-3" />Beds</div></div>}
                {property.bathrooms > 0 && <div className="text-center"><div className="font-bold text-lg">{property.bathrooms}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><Bath className="w-3 h-3" />Baths</div></div>}
                {property.area && <div className="text-center"><div className="font-bold text-lg">{property.area}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><Maximize2 className="w-3 h-3" />m²</div></div>}
                <div className="text-center"><div className="font-bold text-sm">{property.propertyType}</div><div className="text-xs text-muted-foreground">Type</div></div>
              </div>

              {property.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">About this property</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{property.description}</p>
                </div>
              )}

              {(property as any).amenities && (property as any).amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {(property as any).amenities.map((a: string) => (
                      <span key={a} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-amber-800 mb-1">Safety Tips</div>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>Visit the property in person before making any payment</li>
                      <li>Verify the seller's identity with their KYC badge</li>
                      <li>Do not transfer money without signing a legal agreement</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sticky Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {property.sellerName && (
                <div className="bg-card border border-card-border rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Contact Seller</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {property.sellerName[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{property.sellerName}</div>
                      <div className="text-xs text-muted-foreground">Property Owner</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {property.sellerPhone && (
                      <a href={`tel:${property.sellerPhone}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                        <Phone className="w-4 h-4 text-muted-foreground" />{property.sellerPhone}
                      </a>
                    )}
                    {property.sellerEmail && (
                      <a href={`mailto:${property.sellerEmail}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                        <Mail className="w-4 h-4 text-muted-foreground" />{property.sellerEmail}
                      </a>
                    )}
                    {property.sellerWhatsapp && (
                      <a href={`https://wa.me/${property.sellerWhatsapp?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
                        <MessageCircle className="w-4 h-4" />WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-card border border-card-border rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Request a Viewing</h3>
                <form onSubmit={handleViewing} className="space-y-3">
                  <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
                  <Textarea placeholder="Any message for the seller..." value={message} onChange={(e) => setMessage(e.target.value)} className="h-20 resize-none" />
                  <Button type="submit" className="w-full bg-primary" disabled={createViewing.isPending}>
                    {createViewing.isPending ? "Sending..." : "Request Viewing"}
                  </Button>
                </form>
              </div>

              <Button variant="outline" className="w-full gap-2" onClick={handleFavorite} disabled={favorited}>
                <Heart className={favorited ? "fill-red-500 text-red-500 w-4 h-4" : "w-4 h-4"} />
                {favorited ? "Saved to favorites" : "Save to favorites"}
              </Button>
            </div>
          </div>
        </div>

        {similar && similar.properties.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.properties.filter((p) => p.id !== property.id).slice(0, 4).map((p) => (
                <PropertyCard key={p.id} property={p as any} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
