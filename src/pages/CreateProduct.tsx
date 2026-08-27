import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";
import { useMyProducts } from "@/hooks/useProducts";
import { PRODUCT_CATEGORIES } from "@/lib/products/types";

const CreateProduct = () => {
  const { session, signIn } = usePiAuth();
  const { create } = useMyProducts();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      await signIn();
      return;
    }

    const amount = Number(price);
    const originalAmount = originalPrice ? Number(originalPrice) : null;

    if (!title.trim() || !Number.isFinite(amount) || amount <= 0 || !category) {
      toast({
        title: "Formulaire incomplet",
        description: "Titre, prix et catégorie sont requis.",
        variant: "destructive",
      });
      return;
    }

    if (!imageUrl.trim()) {
      toast({
        title: "Image requise",
        description: "L'URL de l'image du produit est obligatoire.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const product = await create({
        title: title.trim(),
        description: description.trim(),
        price: amount,
        original_price: originalAmount,
        category,
        image_url: imageUrl.trim(),
        creator_name: creatorName.trim() || session.user.user_metadata?.pi_username || "Anonymous",
        is_featured: false,
      });

      if (product) {
        navigate("/products/dashboard");
      }
    } catch (err) {
      toast({
        title: "Création impossible",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Créer un produit
        </h1>
        <p className="text-muted-foreground mt-2">
          Mettez en vente un produit numérique (template, ebook, cours, etc.) en Pi.
          Les acheteurs paieront une seule fois pour accéder à votre produit.
        </p>

        <form
          onSubmit={submit}
          className="glass rounded-2xl border border-border p-6 mt-8 space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Titre du produit *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="UI Kit Premium Dashboard"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creator">Nom du créateur</Label>
            <Input
              id="creator"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Votre nom ou pseudo (optionnel)"
            />
            <p className="text-xs text-muted-foreground">
              Si vide, votre pseudo Pi sera utilisé
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (Pi) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Prix original (optionnel)</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="50 (pour afficher une promotion)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de l'image *</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/product-image.jpg"
              required
            />
            <p className="text-xs text-muted-foreground">
              Utilisez une image hébergée (Unsplash, Imgur, votre CDN, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez ce que l'acheteur va recevoir..."
              rows={5}
            />
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            disabled={saving}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {session ? "Publier le produit" : "Se connecter avec Pi"}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CreateProduct;
