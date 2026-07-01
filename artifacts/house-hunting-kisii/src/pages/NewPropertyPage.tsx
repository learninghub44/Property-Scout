import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateProperty } from "@workspace/api-client-react";

const STEPS = ["Basic Info", "Details", "Contact", "Review"];
const PROPERTY_TYPES = ["House", "Apartment", "Studio", "Villa", "Maisonette", "Mansion", "Land", "Commercial"];
const NEIGHBORHOODS = ["Kisii Town Centre", "Nyanchwa", "Bonchari", "Daraja Mbili", "Suneka", "Manga"];
const AMENITIES_LIST = ["Parking", "Garden", "Security", "Water Tank", "Solar Panel", "Generator", "Swimming Pool", "CCTV", "Balcony", "Servant Quarters"];

export default function NewPropertyPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createProperty = useCreateProperty();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    title: "", description: "", price: "", pricePeriod: "total", listingType: "sale",
    propertyType: "House", location: "", neighborhood: "Kisii Town Centre",
    area: "", bedrooms: "3", bathrooms: "2",
    sellerName: "", sellerPhone: "", sellerEmail: "", sellerWhatsapp: "",
    amenities: [] as string[], images: [] as string[],
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleAmenity = (a: string) =>
    set("amenities", form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);

  const handleSubmit = async () => {
    try {
      const created = await createProperty.mutateAsync({
        data: {
          title: form.title,
          description: form.description,
          price: Number(form.price),
          pricePeriod: form.pricePeriod as any,
          listingType: form.listingType as any,
          propertyType: form.propertyType,
          location: form.location || `${form.neighborhood}, Kisii`,
          neighborhood: form.neighborhood,
          area: form.area ? Number(form.area) : undefined,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          sellerPhone: form.sellerPhone || undefined,
          sellerEmail: form.sellerEmail || undefined,
          sellerWhatsapp: form.sellerWhatsapp || undefined,
          amenities: form.amenities,
          images: form.images,
        }
      });
      toast({ title: "Property listed!", description: "Your listing is now live." });
      navigate(`/properties/${created.id}`);
    } catch {
      toast({ title: "Failed to create listing", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-secondary/40 border-b border-border py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">List a Property</h1>
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${i === step ? "font-medium text-foreground" : "text-muted-foreground"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card border border-card-border rounded-xl p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Basic Information</h2>
              <div>
                <Label>Title *</Label>
                <Input className="mt-1" placeholder="e.g. Modern 3-Bedroom House in Nyanchwa" value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1 h-28 resize-none" placeholder="Describe your property..." value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Listing Type *</Label>
                  <Select value={form.listingType} onValueChange={(v) => set("listingType", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Property Type *</Label>
                  <Select value={form.propertyType} onValueChange={(v) => set("propertyType", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (KES) *</Label>
                  <Input className="mt-1" type="number" placeholder="e.g. 8500000" value={form.price} onChange={(e) => set("price", e.target.value)} />
                </div>
                <div>
                  <Label>Price Period</Label>
                  <Select value={form.pricePeriod} onValueChange={(v) => set("pricePeriod", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Total (Sale)</SelectItem>
                      <SelectItem value="per_month">Per Month</SelectItem>
                      <SelectItem value="per_year">Per Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Property Details</h2>
              <div>
                <Label>Neighborhood *</Label>
                <Select value={form.neighborhood} onValueChange={(v) => set("neighborhood", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NEIGHBORHOODS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Bedrooms</Label>
                  <Input className="mt-1" type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <Input className="mt-1" type="number" min="0" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
                </div>
                <div>
                  <Label>Area (m&sup2;)</Label>
                  <Input className="mt-1" type="number" placeholder="e.g. 180" value={form.area} onChange={(e) => set("area", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Amenities</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AMENITIES_LIST.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.amenities.includes(a) ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border hover:border-primary"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Contact Information</h2>
              <p className="text-sm text-muted-foreground">Your contact details will be shown on the listing for buyers and tenants to reach you directly.</p>
              <Input placeholder="Your full name" value={form.sellerName} onChange={(e) => set("sellerName", e.target.value)} />
              <Input placeholder="Phone number (e.g. +254712345678)" value={form.sellerPhone} onChange={(e) => set("sellerPhone", e.target.value)} />
              <Input type="email" placeholder="Email address" value={form.sellerEmail} onChange={(e) => set("sellerEmail", e.target.value)} />
              <Input placeholder="WhatsApp number (optional)" value={form.sellerWhatsapp} onChange={(e) => set("sellerWhatsapp", e.target.value)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Review Your Listing</h2>
              <div className="bg-secondary/40 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Title</span><span className="font-medium text-right">{form.title || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{form.listingType === "sale" ? "For Sale" : "For Rent"} — {form.propertyType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-semibold text-primary">KES {Number(form.price || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{form.neighborhood}, Kisii</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bedrooms / Baths</span><span>{form.bedrooms} bd / {form.bathrooms} ba</span></div>
                {form.amenities.length > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Amenities</span><span className="text-right">{form.amenities.join(", ")}</span></div>}
                {form.sellerPhone && <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span>{form.sellerPhone}</span></div>}
              </div>
              <p className="text-xs text-muted-foreground">By submitting, you confirm this listing is accurate. Listings are subject to review before appearing publicly.</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && (!form.title || !form.price)} className="bg-primary">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createProperty.isPending} className="bg-primary">
                {createProperty.isPending ? "Publishing..." : "Publish Listing"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
