
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Award, Gift, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Revolut payment link
const PAYMENT_LINK = "https://checkout.revolut.com/pay/4b623f7a-5dbc-400c-9291-ff34c4258654";

const SupportSection = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('premium');

  const handleSubscribe = (tier: string) => {
    // Open Revolut checkout in new tab
    window.open(PAYMENT_LINK, '_blank');
    
    toast({
      title: "Redirecting to payment",
      description: `You'll be redirected to complete your ${tier} subscription.`,
      duration: 3000,
    });
  };

  const handleDonate = (amount: string) => {
    // Open Revolut checkout in new tab
    window.open(PAYMENT_LINK, '_blank');
    
    toast({
      title: "Redirecting to payment",
      description: `Thank you for your $${amount} donation!`,
      duration: 3000,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center font-heading">Support Pirate Gaming</h2>
      
      <Tabs defaultValue="premium" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 w-full">
          <TabsTrigger value="premium">Premium Tiers</TabsTrigger>
          <TabsTrigger value="donate">Donate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Tier */}
            <Card className="bg-white shadow-saas">
              <CardHeader className="pb-4">
                <CardTitle className="text-center flex justify-center">
                  <Star className="mb-2 h-6 w-6" />
                </CardTitle>
                <CardTitle className="text-center text-xl font-bold">Basic</CardTitle>
                <CardDescription className="text-center text-xl font-bold">$5/month</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-4">
                <ul className="space-y-2 mb-4 text-sm">
                  <li>Access to all games</li>
                  <li>Ad-free experience</li>
                  <li>Basic discord perks</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSubscribe('Basic')}
                  className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                >
                  Subscribe
                </Button>
              </CardFooter>
            </Card>
            
            {/* Pro Tier */}
            <Card className="bg-white shadow-saas border-2 border-black relative">
              <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 bg-black text-white text-xs font-medium rounded-full">
                POPULAR
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-center flex justify-center">
                  <Award className="mb-2 h-6 w-6" />
                </CardTitle>
                <CardTitle className="text-center text-xl font-bold">Pro Pirate</CardTitle>
                <CardDescription className="text-center text-xl font-bold">$10/month</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-4">
                <ul className="space-y-2 mb-4 text-sm">
                  <li>Everything in Basic</li>
                  <li>Early access to new games</li>
                  <li>100 Pirate Coins monthly</li>
                  <li>Pro discord perks</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSubscribe('Pro Pirate')}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  Subscribe
                </Button>
              </CardFooter>
            </Card>
            
            {/* Elite Tier */}
            <Card className="bg-white shadow-saas">
              <CardHeader className="pb-4">
                <CardTitle className="text-center flex justify-center">
                  <Gift className="mb-2 h-6 w-6" />
                </CardTitle>
                <CardTitle className="text-center text-xl font-bold">Elite Pirate</CardTitle>
                <CardDescription className="text-center text-xl font-bold">$25/month</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-4">
                <ul className="space-y-2 mb-4 text-sm">
                  <li>Everything in Pro</li>
                  <li>Exclusive beta access</li>
                  <li>300 Pirate Coins monthly</li>
                  <li>Premium discord role</li>
                  <li>Custom profile badge</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSubscribe('Elite Pirate')}
                  className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                >
                  Subscribe
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="donate">
          <div className="bg-white p-6 rounded-xl shadow-saas">
            <h3 className="text-xl font-bold mb-4 text-center">Support Our Development</h3>
            <p className="text-center text-gray-600 mb-6">
              Every donation helps us create better gaming experiences and supports our developers!
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => handleDonate('5')}
                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
              >
                Donate $5
              </Button>
              <Button 
                onClick={() => handleDonate('10')}
                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
              >
                Donate $10
              </Button>
              <Button 
                onClick={() => handleDonate('25')}
                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
              >
                Donate $25
              </Button>
              <Button 
                onClick={() => handleDonate('50')}
                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
              >
                Donate $50
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportSection;
