import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { useListViewings, useUpdateViewing, getListViewingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate, formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  pending: { icon: AlertCircle, label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  confirmed: { icon: CheckCircle, label: "Confirmed", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { icon: XCircle, label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
  completed: { icon: CheckCircle, label: "Completed", className: "bg-blue-100 text-blue-700 border-blue-200" },
};

export default function ViewingsPage() {
  const { data, isLoading } = useListViewings();
  const updateViewing = useUpdateViewing();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCancel = async (id: number) => {
    await updateViewing.mutateAsync({ viewingId: id, data: { status: "cancelled" } });
    queryClient.invalidateQueries({ queryKey: getListViewingsQueryKey() });
    toast({ title: "Viewing cancelled" });
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-secondary/40 border-b border-border py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Viewings</h1>
              <p className="text-muted-foreground text-sm">Scheduled property viewings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-xl p-5">
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-20 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No viewings scheduled</h3>
            <p className="text-muted-foreground text-sm mb-6">Find a property and request a viewing to see it here.</p>
            <Link href="/properties"><Button className="bg-primary">Browse Properties</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.map((viewing) => {
              const status = statusConfig[viewing.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = status.icon;
              const primaryImg = viewing.property?.images?.find((i: any) => i.isPrimary)?.url || viewing.property?.images?.[0]?.url;

              return (
                <div key={viewing.id} className="bg-card border border-card-border rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {primaryImg && (
                      <Link href={`/properties/${viewing.propertyId}`} className="flex-shrink-0">
                        <img src={primaryImg} className="w-full sm:w-28 h-20 rounded-lg object-cover" />
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <Link href={`/properties/${viewing.propertyId}`} className="font-semibold text-foreground hover:text-primary transition-colors text-sm line-clamp-1">
                            {viewing.property?.title || `Property #${viewing.propertyId}`}
                          </Link>
                          {viewing.property && (
                            <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                              <MapPin className="w-3 h-3" />{viewing.property.neighborhood}, Kisii
                            </div>
                          )}
                          {viewing.property && (
                            <div className="text-primary font-semibold text-sm mt-1">
                              {formatPrice(viewing.property.price, viewing.property.pricePeriod, viewing.property.listingType)}
                            </div>
                          )}
                        </div>
                        <Badge className={`text-xs border ${status.className} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />{status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        Scheduled for {new Date(viewing.scheduledAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                      {viewing.message && <p className="text-xs text-muted-foreground mt-1 italic">"{viewing.message}"</p>}
                    </div>
                    {viewing.status === "pending" && (
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5 self-start" onClick={() => handleCancel(viewing.id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
