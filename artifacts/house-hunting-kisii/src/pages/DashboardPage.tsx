import { Link } from "wouter";
import { Plus, Eye, Heart, Calendar, Home, TrendingUp, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { useGetDashboardStats, useListProperties } from "@workspace/api-client-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: properties, isLoading: propsLoading } = useListProperties({ limit: 10, page: 1 });

  const statCards = stats
    ? [
        { label: "Total Properties", value: stats.totalProperties, icon: Home, color: "text-primary bg-primary/10" },
        { label: "Active Listings", value: stats.activeListings, icon: TrendingUp, color: "text-green-600 bg-green-50" },
        { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-blue-600 bg-blue-50" },
        { label: "Saved by Users", value: stats.totalFavorites, icon: Heart, color: "text-red-500 bg-red-50" },
        { label: "Total Viewings", value: stats.totalViewings, icon: Calendar, color: "text-purple-600 bg-purple-50" },
        { label: "Pending Viewings", value: stats.pendingViewings, icon: Clock, color: "text-amber-600 bg-amber-50" },
      ]
    : [];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-secondary/40 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage your property listings</p>
            </div>
            <Link href="/dashboard/new-property">
              <Button className="bg-primary gap-2">
                <Plus className="w-4 h-4" /> Add Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-card-border rounded-xl p-4">
                  <Skeleton className="h-8 w-8 rounded-lg mb-3" />
                  <Skeleton className="h-6 w-12 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))
            : statCards.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-card-border rounded-xl p-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </div>
              ))}
        </div>

        {/* Chart */}
        {stats && stats.monthlyViews.length > 0 && (
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Monthly Views</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.monthlyViews}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(22, 90%, 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* KYC Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-foreground">Get KYC Verified to Publish Listings</div>
            <div className="text-sm text-muted-foreground">Verified sellers get a trust badge and more visibility</div>
          </div>
          <Link href="/kyc">
            <Button size="sm" className="bg-primary flex-shrink-0">Verify Now</Button>
          </Link>
        </div>

        {/* Listings Table */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Your Listings</h2>
            <Link href="/properties">
              <Button variant="ghost" size="sm" className="text-primary text-xs">View all</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Property</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Views</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Listed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {propsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                        <td className="px-6 py-4 hidden sm:table-cell"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4 hidden md:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></td>
                        <td className="px-6 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-8" /></td>
                        <td className="px-6 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))
                  : properties?.properties.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/properties/${p.id}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 max-w-[200px] block">{p.title}</Link>
                          <div className="text-xs text-muted-foreground mt-0.5">{p.neighborhood}</div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell text-muted-foreground">{p.propertyType}</td>
                        <td className="px-6 py-4 font-semibold text-primary">{formatPrice(p.price, p.pricePeriod, p.listingType)}</td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : p.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">{(p as any).viewCount ?? 0}</td>
                        <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
