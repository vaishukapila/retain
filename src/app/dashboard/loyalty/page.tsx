import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockLoyaltyInfo } from "@/lib/mock-data";
import { Gift, Star, ArrowRight } from "lucide-react";

export default function LoyaltyPage() {
  const { points, tier, pointsToNextTier, history } = mockLoyaltyInfo;
  const nextTierPoints = points + pointsToNextTier;
  const progressPercentage = (points / nextTierPoints) * 100;
  
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Loyalty Program</h1>
        <p className="text-muted-foreground">Earn points and get rewarded for your purchases.</p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Loyalty Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4 rounded-lg bg-muted p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Points</span>
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div className="text-4xl font-bold">{points}</div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="font-semibold">{tier} Tier</span>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-2 p-6">
             <div className="flex justify-between text-sm text-muted-foreground">
                <span>Your Progress</span>
                <span>Next Tier: Gold</span>
             </div>
             <Progress value={progressPercentage} className="w-full" />
             <p className="text-sm text-center text-muted-foreground pt-2">
                You're <span className="font-bold text-primary">{pointsToNextTier}</span> points away from Gold tier!
             </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
          <CardDescription>A log of your recent loyalty point activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="font-medium">{item.activity}</TableCell>
                  <TableCell className={`text-right font-semibold ${item.points > 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {item.points > 0 ? `+${item.points}` : item.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
