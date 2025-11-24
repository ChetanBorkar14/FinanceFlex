import { Button } from "@/components/ui/button";
import Header from "@/components/header";

const Page = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Navbar */}
      <Header />

      {/* Hero / Button */}
      <div className="container mx-auto p-8 pt-24 text-center">
        <Button className="bg-primary text-primary-foreground mb-10">
          Welcome to FinanceFlex
        </Button>
        <h1 className="text-4xl font-bold mb-4">Your Financial Dashboard</h1>
      </div>
    </div>
  );
};

export default Page;
