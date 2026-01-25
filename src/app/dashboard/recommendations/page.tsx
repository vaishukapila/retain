"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getPersonalizedRecommendations, type PersonalizedRecommendationsOutput } from "@/ai/flows/personalized-product-recommendations";
import { Loader2, Wand2, ShoppingCart } from "lucide-react";
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setRecommendations(null);

    // In a real app, this data would come from the user's actual history
    const input = {
      pastPurchases: ["Stylish blue running shoes", "Smart watch with fitness tracker"],
      frequentlyBoughtTogether: ["Stainless steel water bottle", "Wireless headphones"],
    };

    try {
      const result = await getPersonalizedRecommendations(input);
      setRecommendations(result);
    } catch (error: any) {
      console.error("Failed to get recommendations:", error);
      let description = "Could not generate recommendations at this time. Please try again later.";
      if (error?.message?.includes("quota")) {
        description = "The recommendation engine is currently experiencing high demand and has exceeded its usage limit. Please try again later.";
      }
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProductByName = (name: string) => {
    // This is a simple fuzzy search for mock data
    const normalizedName = name.toLowerCase();
    return mockProducts.find(p => p.name.toLowerCase().includes(normalizedName.split(" ")[1]));
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Products For You</h1>
        <p className="text-muted-foreground">AI-powered recommendations based on your interests.</p>
      </header>

      <Card>
        <CardContent className="pt-6 text-center">
            <Button onClick={handleGetRecommendations} disabled={isLoading} size="lg">
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate My Recommendations
            </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
             <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg"></div>
                <CardHeader>
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
                </CardContent>
                <CardFooter>
                    <div className="h-10 w-full bg-muted rounded"></div>
                </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {recommendations && (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{recommendations.reasoning}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recommendations.recommendations.map((rec, index) => {
                    const product = getProductByName(rec);
                    return (
                        <Card key={index} className="flex flex-col">
                            {product ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    width={600}
                                    height={400}
                                    className="aspect-video w-full rounded-t-lg object-cover"
                                    data-ai-hint={product.imageHint}
                                />
                            ) : (
                                <div className="aspect-video w-full rounded-t-lg bg-muted flex items-center justify-center">
                                    <Wand2 className="w-10 h-10 text-muted-foreground" />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{rec}</CardTitle>
                                {product && <CardDescription>${product.price.toFixed(2)}</CardDescription>}
                            </CardHeader>
                             <CardContent className="flex-grow">
                                {product && <p className="text-sm text-muted-foreground">{product.description}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
      )}
    </div>
  );
}
