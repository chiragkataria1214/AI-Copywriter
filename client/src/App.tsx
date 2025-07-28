import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// Authentication removed - direct access enabled
import MetaAdGenerator from "@/pages/meta-ad-generator";
import UserManagement from "@/pages/user-management";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminSetup from "@/pages/admin-setup";
import ReviewTraining from "@/pages/review-training";
import NotFound from "@/pages/not-found";
import BypassPage from "@/pages/bypass";
import DemoGenerator from "@/pages/demo-generator";
import ReviewAnalytics from "@/pages/review-analytics";
import DirectAccess from "@/pages/direct-access";


function MainRouter() {
  // NO AUTHENTICATION - Direct access to all features
  console.log('🚀 MAIN APP LOADED - No authentication required');
  return (
    <Switch>
      <Route path="/" component={MetaAdGenerator} />
      <Route path="/training" component={ReviewTraining} />
      <Route path="/analytics" component={ReviewAnalytics} />
      <Route path="/admin" component={AdminSetup} />
      <Route path="/users" component={UserManagement} />
      <Route path="/demo" component={DemoGenerator} />
      <Route path="/bypass" component={BypassPage} />
      <Route path="/direct" component={DirectAccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MainRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
