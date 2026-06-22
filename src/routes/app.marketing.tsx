import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { type CampaignStatus } from "@/lib/erp-data";
import {
  Plus, Megaphone, Target, TrendingUp, Users,
  Mail, Share2, Monitor, Calendar, Globe,
  CheckCircle2, ArrowLeft, Package, Link2,
  ChevronRight, Linkedin, X,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/marketing")({
  component: Marketing,
});

// ── Types ─────────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  addedOn: string;
};

type ProductCampaign = {
  id: string;
  productId: string;
  name: string;
  channel: string;
  status: CampaignStatus;
  owner: string;
  startDate: string;
  endDate: string;
  budget: string;
  reach: string;
  leads: string;
};

type ContentStatus = "Draft" | "Scheduled" | "Published" | "Archived";

type ChannelContent = {
  id: string;
  productId: string;
  channel: string;
  title: string;
  contentType: string;
  topic: string;
  author: string;
  publishDate: string;
  status: ContentStatus;
  tagline: string;
  targetAudience: string;
  keyMessage: string;
  sharepointLink: string;
  performance: string;
  addedOn: string;
};

// ── Static data ───────────────────────────────────────────────────────────────

const CHANNELS = [
  { key: "LinkedIn",    label: "LinkedIn",   Icon: Linkedin, color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"   },
  { key: "Email",       label: "Email",      Icon: Mail,     color: "text-cyan-700",   bg: "bg-cyan-50",   border: "border-cyan-200"   },
  { key: "Google Ads",  label: "Google Ads", Icon: Target,   color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"    },
  { key: "Facebook",    label: "Facebook",   Icon: Globe,    color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  { key: "Referral",    label: "Referral",   Icon: Share2,   color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200"  },
  { key: "Webinar",     label: "Webinar",    Icon: Monitor,  color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  { key: "Events",      label: "Events",     Icon: Calendar, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
];

const PRODUCT_CATEGORIES = [
  "SaaS Platform", "Mobile App", "API / Integration", "Hardware", "Service", "Consulting", "Other",
];

const PLATFORM_COLOR: Record<string, string> = {
  LinkedIn:    "text-blue-700 bg-blue-50",
  Email:       "text-cyan-700 bg-cyan-50",
  "Google Ads":"text-red-600 bg-red-50",
  Facebook:    "text-indigo-700 bg-indigo-50",
  Referral:    "text-green-700 bg-green-50",
  Webinar:     "text-purple-700 bg-purple-50",
  Events:      "text-orange-700 bg-orange-50",
  Multi:       "text-violet-700 bg-violet-50",
};

const STATUS_TONE = {
  active: "success", draft: "neutral", paused: "warning",
  complete: "info", scheduled: "neutral",
} as const;

const SEED_PRODUCTS: Product[] = [
  { id: "PRD-001", name: "Keehoo CRM",     category: "SaaS Platform", description: "AI-native CRM for sales teams.",     addedOn: "2026-05-10" },
  { id: "PRD-002", name: "Keehoo ERP Hub", category: "SaaS Platform", description: "Unified ERP for finance, HR & ops.", addedOn: "2026-05-18" },
];

const BLANK_PRODUCT   = { name: "", category: "", description: "" };
const BLANK_CAMPAIGN  = { name: "", channel: "LinkedIn", status: "draft" as CampaignStatus, owner: "", startDate: "", endDate: "", budget: "", reach: "", leads: "" };
const CONTENT_TYPES   = ["Carousel", "Post", "Article", "Video", "Email", "Ad", "Newsletter", "Landing Page", "Webinar", "Other"];
const CONTENT_STATUSES: ContentStatus[] = ["Draft", "Scheduled", "Published", "Archived"];

const CONTENT_STATUS_STYLE: Record<ContentStatus, string> = {
  Draft:     "text-muted-foreground bg-muted",
  Scheduled: "text-blue-700 bg-blue-50",
  Published: "text-green-700 bg-green-50",
  Archived:  "text-orange-700 bg-orange-50",
};

const BLANK_CONTENT = {
  title: "", contentType: "Post", topic: "", author: "",
  publishDate: "", status: "Draft" as ContentStatus,
  tagline: "", targetAudience: "", keyMessage: "",
  sharepointLink: "", performance: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

function Marketing() {
  // Navigation
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productTab, setProductTab] = useState<"campaigns" | "content">("campaigns");

  // Products
  const [products, setProducts]     = useState<Product[]>(SEED_PRODUCTS);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [productForm, setProductForm]       = useState({ ...BLANK_PRODUCT });

  // Campaigns (per product)
  const [campaigns, setCampaigns]           = useState<ProductCampaign[]>([]);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignForm, setCampaignForm]     = useState({ ...BLANK_CAMPAIGN });
  const [editCampaignId, setEditCampaignId] = useState<string | null>(null);

  // Content (per product)
  const [contents, setContents]             = useState<ChannelContent[]>([]);
  const [activeChannel, setActiveChannel]   = useState<typeof CHANNELS[number] | null>(null);
  const [contentFormOpen, setContentFormOpen] = useState(false);
  const [contentForm, setContentForm]       = useState({ ...BLANK_CONTENT });
  const [editContentId, setEditContentId]   = useState<string | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────

  const prodCampaigns = selectedProduct
    ? campaigns.filter(c => c.productId === selectedProduct.id)
    : [];
  const prodContents = selectedProduct
    ? contents.filter(c => c.productId === selectedProduct.id)
    : [];

  // ── Product handlers ──────────────────────────────────────────────────────

  function saveProduct() {
    if (!productForm.name.trim() || !productForm.category) return;
    setProducts(prev => [...prev, {
      id:          `PRD-${String(prev.length + 1).padStart(3, "0")}`,
      name:        productForm.name.trim(),
      category:    productForm.category,
      description: productForm.description.trim(),
      addedOn:     new Date().toISOString().slice(0, 10),
    }]);
    setProductForm({ ...BLANK_PRODUCT });
    setAddProductOpen(false);
  }

  function openProduct(p: Product) {
    setSelectedProduct(p);
    setProductTab("campaigns");
    setShowCampaignForm(false);
  }

  // ── Campaign handlers ─────────────────────────────────────────────────────

  function openNewCampaign() {
    setCampaignForm({ ...BLANK_CAMPAIGN });
    setEditCampaignId(null);
    setShowCampaignForm(true);
  }

  function saveCampaign() {
    if (!campaignForm.name.trim() || !selectedProduct) return;
    if (editCampaignId) {
      setCampaigns(prev => prev.map(c => c.id === editCampaignId ? { ...c, ...campaignForm } : c));
    } else {
      setCampaigns(prev => [...prev, {
        id:        `MKT-${String(prev.length + 1).padStart(3, "0")}`,
        productId: selectedProduct.id,
        ...campaignForm,
      }]);
    }
    setCampaignForm({ ...BLANK_CAMPAIGN });
    setShowCampaignForm(false);
    setEditCampaignId(null);
  }

  // ── Content handlers ──────────────────────────────────────────────────────

  function openChannelForm(ch: typeof CHANNELS[number], existingId?: string) {
    if (!selectedProduct) return;
    const existing = existingId
      ? contents.find(c => c.id === existingId)
      : contents.find(c => c.productId === selectedProduct.id && c.channel === ch.key);
    setActiveChannel(ch);
    if (existing) {
      setContentForm({
        title: existing.title, contentType: existing.contentType,
        topic: existing.topic, author: existing.author,
        publishDate: existing.publishDate, status: existing.status,
        tagline: existing.tagline, targetAudience: existing.targetAudience,
        keyMessage: existing.keyMessage, sharepointLink: existing.sharepointLink,
        performance: existing.performance,
      });
      setEditContentId(existing.id);
    } else {
      setContentForm({ ...BLANK_CONTENT });
      setEditContentId(null);
    }
    setContentFormOpen(true);
  }

  function updateContentStatus(id: string, status: ContentStatus) {
    setContents(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }

  function saveContent() {
    if (!selectedProduct || !activeChannel || !contentForm.title.trim()) return;
    const seq = contents.filter(c => c.productId === selectedProduct.id).length + 1;
    if (editContentId) {
      setContents(prev => prev.map(c => c.id === editContentId ? { ...c, ...contentForm } : c));
    } else {
      setContents(prev => [...prev, {
        id: `CT${String(seq).padStart(3, "0")}`,
        productId: selectedProduct.id,
        channel: activeChannel.key,
        addedOn: new Date().toISOString().slice(0, 10),
        ...contentForm,
      }]);
    }
    setContentFormOpen(false);
  }

  function hasContent(ch: string) {
    return !!selectedProduct && contents.some(c => c.productId === selectedProduct.id && c.channel === ch);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        eyebrow="Revenue · GTM"
        title="Marketing"
        description={selectedProduct ? `${selectedProduct.name} · ${selectedProduct.category}` : "Manage marketing by product"}
        actions={
          !selectedProduct
            ? <Button size="sm" onClick={() => setAddProductOpen(true)}><Plus className="size-3.5" /> Add Product</Button>
            : productTab === "campaigns" && !showCampaignForm
            ? <Button size="sm" onClick={openNewCampaign}><Plus className="size-3.5" /> New Campaign</Button>
            : null
        }
        tabs={
          selectedProduct ? (
            <>
              <PageTab active={productTab === "campaigns"} count={prodCampaigns.length} onClick={() => { setProductTab("campaigns"); setShowCampaignForm(false); }}>Campaigns</PageTab>
              <PageTab active={productTab === "content"}   count={prodContents.length}  onClick={() => setProductTab("content")}>Content</PageTab>
            </>
          ) : null
        }
      />

      {/* ── PRODUCTS LIST (no product selected) ───────────────────────────── */}
      {!selectedProduct && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-5">

          {/* Summary strip */}
          <div className="flex items-center gap-8 pb-2 border-b border-border">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total products</div>
              <div className="text-2xl font-bold">{products.length}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Campaigns running</div>
              <div className="text-2xl font-bold">{campaigns.filter(c => c.status === "active").length}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Content pieces</div>
              <div className="text-2xl font-bold">{contents.length}</div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <Package className="size-10 opacity-30" />
              <div className="text-sm">No products yet. Add one to start marketing.</div>
              <Button size="sm" onClick={() => setAddProductOpen(true)}><Plus className="size-3.5" /> Add product</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => {
                const pCampaigns = campaigns.filter(c => c.productId === p.id);
                const pContents  = contents.filter(c => c.productId === p.id);
                const activeChs  = [...new Set(pContents.map(c => c.channel))];
                return (
                  <div
                    key={p.id}
                    onClick={() => openProduct(p)}
                    className="rounded-lg border border-border bg-card p-5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                        <Package className="size-5" />
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </div>

                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{p.id}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 mb-3 line-clamp-2">{p.description || "No description"}</div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{p.category}</span>
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-4 pt-3 border-t border-border">
                      <div className="text-center">
                        <div className="text-sm font-bold">{pCampaigns.length}</div>
                        <div className="text-[10px] text-muted-foreground">Campaigns</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold">{pContents.length}</div>
                        <div className="text-[10px] text-muted-foreground">Content</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold">{pCampaigns.filter(c => c.status === "active").length}</div>
                        <div className="text-[10px] text-muted-foreground">Active</div>
                      </div>
                    </div>

                    {activeChs.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {activeChs.map(ch => {
                          const meta = CHANNELS.find(c => c.key === ch);
                          return meta ? (
                            <span key={ch} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${meta.color} ${meta.bg}`}>{ch}</span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add product card */}
              <button
                onClick={() => setAddProductOpen(true)}
                className="rounded-lg border border-dashed border-border p-5 cursor-pointer hover:border-primary/40 hover:bg-surface transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground min-h-[180px]"
              >
                <Plus className="size-5 opacity-50" />
                <span className="text-xs font-medium">Add product</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCT DETAIL ────────────────────────────────────────────────── */}
      {selectedProduct && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-5">

          {/* Back breadcrumb */}
          <button
            onClick={() => { setSelectedProduct(null); setShowCampaignForm(false); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> All Products
          </button>

          {/* ── CAMPAIGNS SUB-TAB ─────────────────────────────────────────── */}
          {productTab === "campaigns" && (
            <div className="space-y-4">

              {/* Inline new campaign form */}
              {showCampaignForm && (
                <div className="rounded-lg border border-primary/30 bg-card p-5 space-y-4">
                  <div className="text-sm font-semibold text-primary">
                    {editCampaignId ? "Edit Campaign" : "New Campaign"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Campaign name *</Label>
                      <Input className="h-8 text-xs" placeholder="Campaign name" autoFocus
                        value={campaignForm.name} onChange={e => setCampaignForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Channel</Label>
                      <Select value={campaignForm.channel} onValueChange={v => setCampaignForm(f => ({ ...f, channel: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CHANNELS.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Status</Label>
                      <Select value={campaignForm.status} onValueChange={v => setCampaignForm(f => ({ ...f, status: v as CampaignStatus }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["draft","active","scheduled","paused","complete"] as CampaignStatus[]).map(s => (
                            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Owner</Label>
                      <Input className="h-8 text-xs" placeholder="e.g. Shwetha G."
                        value={campaignForm.owner} onChange={e => setCampaignForm(f => ({ ...f, owner: e.target.value }))} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Start Date</Label>
                      <Input type="date" className="h-8 text-xs"
                        value={campaignForm.startDate} onChange={e => setCampaignForm(f => ({ ...f, startDate: e.target.value }))} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">End Date</Label>
                      <Input type="date" className="h-8 text-xs"
                        value={campaignForm.endDate} onChange={e => setCampaignForm(f => ({ ...f, endDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={!campaignForm.name.trim()} onClick={saveCampaign}>
                      {editCampaignId ? "Save changes" : "Save Campaign"}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground"
                      onClick={() => { setShowCampaignForm(false); setCampaignForm({ ...BLANK_CAMPAIGN }); setEditCampaignId(null); }}>
                      <X className="size-3 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Campaigns table */}
              {prodCampaigns.length === 0 && !showCampaignForm ? (
                <div className="rounded-lg border border-dashed border-border bg-card p-12 flex flex-col items-center gap-3 text-muted-foreground">
                  <Megaphone className="size-8 opacity-30" />
                  <div className="text-sm">No campaigns for {selectedProduct.name} yet</div>
                  <Button size="sm" onClick={openNewCampaign}><Plus className="size-3.5" /> Add campaign</Button>
                </div>
              ) : prodCampaigns.length > 0 && (
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-semibold">All Campaigns · {selectedProduct.name}</span>
                    <span className="text-[10px] text-muted-foreground">{prodCampaigns.length} total</span>
                  </div>
                  <table className="w-full border-collapse">
                    <thead className="bg-surface border-b border-border">
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">
                        {["Campaign", "Channel", "Status", "Owner", "Start", "End", ""].map(h => (
                          <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {prodCampaigns.map(c => (
                        <tr key={c.id} className="hover:bg-surface group">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
                                <Megaphone className="size-3.5" />
                              </div>
                              <div>
                                <div className="text-xs font-semibold">{c.name}</div>
                                <div className="text-[10px] font-mono text-muted-foreground">{c.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PLATFORM_COLOR[c.channel] || "text-muted-foreground bg-muted"}`}>
                              {c.channel}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusPill tone={STATUS_TONE[c.status]} dot>{c.status}</StatusPill>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">{c.owner || "—"}</td>
                          <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground">{c.startDate || "—"}</td>
                          <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground">{c.endDate || "—"}</td>
                          <td className="px-3 py-2.5">
                            <Button
                              variant="ghost" size="sm" className="h-6 text-[10px] px-2 opacity-0 group-hover:opacity-100"
                              onClick={() => {
                                setCampaignForm({ name: c.name, channel: c.channel, status: c.status, owner: c.owner, startDate: c.startDate, endDate: c.endDate, budget: c.budget, reach: c.reach, leads: c.leads });
                                setEditCampaignId(c.id);
                                setShowCampaignForm(true);
                              }}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── CONTENT SUB-TAB ───────────────────────────────────────────── */}
          {productTab === "content" && (
            <div className="space-y-6">

              {/* Channel grid */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Select a channel to add or edit content
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {CHANNELS.map(ch => {
                    const done = hasContent(ch.key);
                    const { Icon } = ch;
                    return (
                      <button
                        key={ch.key}
                        onClick={() => openChannelForm(ch)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                          done ? `${ch.bg} ${ch.border} border` : "bg-card border-border hover:border-primary/30"
                        }`}
                      >
                        {done && (
                          <span className="absolute top-2 right-2">
                            <CheckCircle2 className={`size-3 ${ch.color}`} />
                          </span>
                        )}
                        <div className={`size-8 rounded-lg flex items-center justify-center ${ch.bg}`}>
                          <Icon className={`size-4 ${ch.color}`} />
                        </div>
                        <span className="text-[10px] font-semibold text-center leading-tight">{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content table */}
              {prodContents.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Content · {selectedProduct.name}
                  </div>
                  <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead className="bg-surface border-b border-border">
                        <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">
                          {["Content ID", "Publish Date", "Platform", "Content Type", "Topic", "Author", "Status", "URL", "Performance", ""].map(h => (
                            <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {prodContents.map(cc => {
                          const meta = CHANNELS.find(ch => ch.key === cc.channel);
                          return (
                            <tr key={cc.id} className="hover:bg-surface group">
                              <td className="px-3 py-2.5">
                                <span className="text-[10px] font-mono text-muted-foreground">{cc.id}</span>
                              </td>
                              <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                                {cc.publishDate || "—"}
                              </td>
                              <td className="px-3 py-2.5">
                                {meta && (
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.color} ${meta.bg}`}>
                                    {cc.channel}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-xs text-muted-foreground">{cc.contentType || "—"}</td>
                              <td className="px-3 py-2.5 text-xs max-w-[140px] truncate">{cc.topic || cc.title}</td>
                              <td className="px-3 py-2.5 text-xs text-muted-foreground">{cc.author || "—"}</td>
                              {/* Inline status dropdown */}
                              <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                                <select
                                  value={cc.status}
                                  onChange={e => updateContentStatus(cc.id, e.target.value as ContentStatus)}
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-0 outline-none cursor-pointer appearance-none ${CONTENT_STATUS_STYLE[cc.status]}`}
                                >
                                  {CONTENT_STATUSES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2.5">
                                {cc.sharepointLink
                                  ? <a href={cc.sharepointLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-primary hover:underline"><Link2 className="size-3" /> View</a>
                                  : <span className="text-[10px] text-muted-foreground/40">—</span>
                                }
                              </td>
                              <td className="px-3 py-2.5 text-xs text-muted-foreground">{cc.performance || "—"}</td>
                              <td className="px-3 py-2.5">
                                <button
                                  onClick={() => { const ch = CHANNELS.find(c => c.key === cc.channel); if (ch) openChannelForm(ch, cc.id); }}
                                  className="text-[10px] text-primary opacity-0 group-hover:opacity-100 hover:underline"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {prodContents.length === 0 && (
                <div className="rounded-lg border border-dashed border-border bg-card p-10 flex flex-col items-center gap-2 text-muted-foreground">
                  <Link2 className="size-7 opacity-30" />
                  <div className="text-sm">No content added yet — pick a channel above</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── ADD PRODUCT DIALOG ────────────────────────────────────────────── */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid gap-1.5">
              <Label className="text-xs">Product name *</Label>
              <Input className="h-8 text-xs" placeholder="e.g. Keehoo CRM" autoFocus
                value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Category *</Label>
              <Select value={productForm.category} onValueChange={v => setProductForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select category…" /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea className="text-xs min-h-[72px] resize-none" placeholder="Brief description…"
                value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddProductOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!productForm.name.trim() || !productForm.category} onClick={saveProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CHANNEL CONTENT FORM DIALOG ───────────────────────────────────── */}
      <Dialog open={contentFormOpen} onOpenChange={setContentFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeChannel && (
                <div className={`size-6 rounded flex items-center justify-center ${activeChannel.bg}`}>
                  <activeChannel.Icon className={`size-3.5 ${activeChannel.color}`} />
                </div>
              )}
              {editContentId ? "Edit" : "Add"} Content
              {selectedProduct && activeChannel && (
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  · {selectedProduct.name} · {activeChannel.label}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            {/* Row 1: Product + Channel (read-only) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Product</Label>
                <div className="h-8 px-3 flex items-center rounded-md border border-border bg-surface text-xs text-muted-foreground">{selectedProduct?.name}</div>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Platform</Label>
                <div className="h-8 px-3 flex items-center rounded-md border border-border bg-surface text-xs text-muted-foreground">{activeChannel?.label}</div>
              </div>
            </div>

            {/* Row 2: Title + Content Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Topic / Title *</Label>
                <Input className="h-8 text-xs" placeholder="e.g. AI in Marketing" autoFocus
                  value={contentForm.title} onChange={e => setContentForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Content Type</Label>
                <Select value={contentForm.contentType} onValueChange={v => setContentForm(f => ({ ...f, contentType: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Author + Publish Date + Status */}
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Author</Label>
                <Input className="h-8 text-xs" placeholder="e.g. Ravi"
                  value={contentForm.author} onChange={e => setContentForm(f => ({ ...f, author: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Publish Date</Label>
                <Input type="date" className="h-8 text-xs"
                  value={contentForm.publishDate} onChange={e => setContentForm(f => ({ ...f, publishDate: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={contentForm.status} onValueChange={v => setContentForm(f => ({ ...f, status: v as ContentStatus }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Tagline */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Tagline</Label>
              <Input className="h-8 text-xs" placeholder="One-liner hook or value prop…"
                value={contentForm.tagline} onChange={e => setContentForm(f => ({ ...f, tagline: e.target.value }))} />
            </div>

            {/* Row 5: Key message */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Key message</Label>
              <Textarea className="text-xs min-h-[56px] resize-none" placeholder="Core message or CTA…"
                value={contentForm.keyMessage} onChange={e => setContentForm(f => ({ ...f, keyMessage: e.target.value }))} />
            </div>

            {/* Row 6: SharePoint link */}
            <div className="grid gap-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Link2 className="size-3 text-muted-foreground" /> SharePoint / Content URL
              </Label>
              <div className="relative">
                <Input className="h-8 text-xs pr-16" placeholder="Paste SharePoint or OneDrive link…"
                  value={contentForm.sharepointLink} onChange={e => setContentForm(f => ({ ...f, sharepointLink: e.target.value }))} />
                {contentForm.sharepointLink && (
                  <a href={contentForm.sharepointLink} target="_blank" rel="noopener noreferrer"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-primary font-medium hover:underline">
                    Open ↗
                  </a>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">Paste a SharePoint or OneDrive link — no file upload needed.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setContentFormOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!contentForm.title.trim()} onClick={saveContent}>
              {editContentId ? "Save changes" : "Add content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
