import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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


function AuthenticatedRouter() {
  const { user, isLoading, isAuthenticated, isUnauthenticated } = useAuth();
  const [location] = useLocation();
  
  // Debug authentication state - remove after fix
  if (Math.random() < 0.1) { // Only log 10% of the time to reduce noise
    console.log('AuthenticatedRouter debug:', {
      location,
      user: user ? { id: user.id, username: user.username } : null,
      isLoading,
      isAuthenticated,
      isUnauthenticated
    });
  }

  // Check if we're on a bypass route - allow direct access
  if (location.startsWith('/demo') || location.startsWith('/bypass') || location.startsWith('/analytics') || location.startsWith('/direct')) {
    return (
      <Switch>
        <Route path="/demo" component={DemoGenerator} />
        <Route path="/analytics" component={ReviewAnalytics} />
        <Route path="/bypass" component={BypassPage} />
        <Route path="/direct" component={DirectAccess} />
        <Route component={DemoGenerator} />
      </Switch>
    );
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If we have an authentication error, show login immediately
  if (isUnauthenticated) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/admin-setup" component={AdminSetup} />
        <Route path="/bypass" component={BypassPage} />
        <Route component={Login} />
      </Switch>
    );
  }

  // If we have a user object, show the main app
  if (user && isAuthenticated) {
    console.log('🟢 SHOWING MAIN APP - User authenticated');
    return (
      <Switch>
        <Route path="/" component={MetaAdGenerator} />
        <Route path="/training" component={ReviewTraining} />
        <Route path="/analytics" component={ReviewAnalytics} />
        <Route path="/admin" component={AdminSetup} />
        <Route path="/users" component={UserManagement} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // If not authenticated or no user, show login/register pages
  console.log('🔴 SHOWING LOGIN PAGE - Not authenticated');
  return (
    <Switch>
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/admin-setup" component={AdminSetup} />
      <Route path="/bypass" component={BypassPage} />
      <Route component={Login} /> {/* Default to login for any other route */}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
