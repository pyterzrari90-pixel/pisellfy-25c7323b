import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";
import { useMyProducts, useProduct } from "@/hooks/useProducts";
import { PRODUCT_CATEGORIES } from "@/lib/products/types";

const EditProduct = () => {
  const { productId } = useParams<{ productId: string }>();
  const { session, signIn } = usePiAuth();
  const { update } = useMyProducts();
  const { product, loading: loadingProduct } = useProduct(productId || null);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [saving, setSaving] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      // Check ownership
      if (session?.user?.id && product.seller_id !== session.user.id) {
        setNotAuthorized(true);
        toast({
          title: "Accès refusé",
          description: "Vous n'êtes pas autorisé à modifier ce produit.",
          variant: "destructive",
        });
        return;
      }

      setTitle(product.title);
      setDescription(product.description);
      setPrice(String(product.price));
      setOriginalPrice(product.original_price ? String(product.original_price) : "");
      setCategory(product.category);
      setImageUrl(product.image_url);
      setCreatorName(product.creator_name);
    }
  }, [product, session?.user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      await signIn();
      return;
    }

    if (!productId) {
      toast({
        title: "Erreur",
        description: "ID du produit manquant.",
        variant: "destructive",
      });
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

    setSaving(true);
    try {
      const updated = await update(productId, {
        title: title.trim(),
        description: description.trim(),
        price: amount,
        original_price: originalAmount,
        category,
        image_url: imageUrl.trim(),
        creator_name: creatorName.trim() || session.user.user_metadata?.pi_username || "Anonymous",
      });

      if (updated) {
        navigate("/products/dashboard");
      }
    } catch (err) {
      toast({
        title: "Mise à jour impossible",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  // Not authorized state
  if (notAuthorized || (product && session?.user?.id && product.seller_id !== session.user.id)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous n'êtes pas autorisé à modifier ce produit. Seul le créateur peut le modifier.
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/products/dashboard")}>
            Retour au tableau de bord
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Produit non trouvé. Il a peut-être été supprimé.
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/products/dashboard")}>
            Retour au tableau de bord
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Modifier le produit
        </h1>
        <p className="text-muted-foreground mt-2">
          Mettez à jour les informations de votre produit.
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

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/products/dashboard")}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="flex-1"
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Sauvegarder
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default EditProduct;
