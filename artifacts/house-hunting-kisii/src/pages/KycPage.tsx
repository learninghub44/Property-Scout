import { useState } from "react";
import { ShieldCheck, Upload, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGetKycStatus, useSubmitKyc } from "@workspace/api-client-react";
import Footer from "@/components/Footer";

const statusDisplay = {
  pending: { icon: Clock, label: "Verification Pending", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", desc: "Your documents are being reviewed. This typically takes 1-2 business days." },
  approved: { icon: CheckCircle, label: "Verified", color: "text-green-600", bg: "bg-green-50 border-green-200", desc: "Your identity has been verified. You can now publish listings." },
  rejected: { icon: XCircle, label: "Verification Rejected", color: "text-red-600", bg: "bg-red-50 border-red-200", desc: "Your verification was rejected. Please resubmit with correct documents." },
  suspended: { icon: AlertCircle, label: "Account Suspended", color: "text-red-700", bg: "bg-red-100 border-red-300", desc: "Your account has been suspended. Contact support for assistance." },
};

export default function KycPage() {
  const { toast } = useToast();
  const { data: kycStatus, isLoading } = useGetKycStatus();
  const submitKyc = useSubmitKyc();

  const [idType, setIdType] = useState("national_id");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitKyc.mutateAsync({ data: { idType: idType as any, idNumber, address } });
      toast({ title: "KYC submitted!", description: "Your documents are under review." });
    } catch {
      toast({ title: "Submission failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-muted animate-pulse mx-auto mb-4" />
        <div className="h-4 bg-muted rounded w-1/2 mx-auto animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-secondary/40 border-b border-border py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">KYC Verification</h1>
              <p className="text-muted-foreground text-sm">Verify your identity to publish listings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Steps */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Verification Requirements</h2>
          <div className="space-y-3">
            {[
              { n: 1, label: "Valid ID", desc: "National ID or Passport number" },
              { n: 2, label: "Residential Address", desc: "Your current physical address" },
              { n: 3, label: "Email Verification", desc: "Verify your registered email" },
            ].map(({ n, label, desc }) => (
              <div key={n} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{n}</div>
                <div>
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        {kycStatus && (
          (() => {
            const s = statusDisplay[kycStatus.status as keyof typeof statusDisplay];
            if (!s) return null;
            const Icon = s.icon;
            return (
              <div className={`border rounded-xl p-5 flex gap-3 ${s.bg}`}>
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.color}`} />
                <div>
                  <div className={`font-semibold ${s.color}`}>{s.label}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{s.desc}</div>
                  {kycStatus.rejectionReason && (
                    <div className="text-sm text-red-700 mt-1">Reason: {kycStatus.rejectionReason}</div>
                  )}
                </div>
              </div>
            );
          })()
        )}

        {/* Form */}
        {(!kycStatus || kycStatus.status === "rejected") && (
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">{kycStatus?.status === "rejected" ? "Resubmit Verification" : "Submit Verification"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>ID Type *</Label>
                <Select value={idType} onValueChange={setIdType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national_id">National ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ID Number *</Label>
                <Input className="mt-1" placeholder="Enter your ID or Passport number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
              </div>
              <div>
                <Label>Residential Address *</Label>
                <Textarea className="mt-1 h-20 resize-none" placeholder="e.g. Nyanchwa Estate, House 12, Kisii" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div>
                <Label>Selfie / Document Photo</Label>
                <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag your selfie / ID photo here</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary" disabled={submitKyc.isPending}>
                {submitKyc.isPending ? "Submitting..." : "Submit Verification"}
              </Button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
