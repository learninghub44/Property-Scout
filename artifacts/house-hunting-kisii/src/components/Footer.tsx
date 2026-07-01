import { Link } from "wouter";
import { Home } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white mt-20 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">HouseKisii</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Kisii's most trusted real estate marketplace. Find your perfect home, apartment, or investment property with verified listings and direct seller contact.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-white/80 uppercase tracking-wide">Explore</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/properties?type=sale" className="hover:text-white transition-colors">Properties for Sale</Link></li>
              <li><Link href="/properties?type=rent" className="hover:text-white transition-colors">Rentals</Link></li>
              <li><Link href="/properties?propertyType=Land" className="hover:text-white transition-colors">Land</Link></li>
              <li><Link href="/properties?isFeatured=true" className="hover:text-white transition-colors">Featured Listings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-white/80 uppercase tracking-wide">Account</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/new-property" className="hover:text-white transition-colors">List a Property</Link></li>
              <li><Link href="/kyc" className="hover:text-white transition-colors">KYC Verification</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-sm text-white/40 flex flex-col md:flex-row justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} HouseKisii. All rights reserved.</span>
          <span>Kisii County, Kenya</span>
        </div>
      </div>
    </footer>
  );
}
