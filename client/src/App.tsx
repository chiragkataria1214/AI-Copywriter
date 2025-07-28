import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SimpleMain from "@/pages/simple-main";

// ZERO AUTHENTICATION - DIRECT APP ACCESS
function App() {
  console.log('🔥 DIRECT APP LOAD - Zero authentication barriers');
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SimpleMain />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
