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
import NotFound from "@/pages/not-found";
import BypassPage from "@/pages/bypass";

function AuthenticatedRouter() {
  const { user, isLoading, isAuthenticated, isUnauthenticated } = useAuth();
  const [location] = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a user object, show the main app
  if (user && isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={MetaAdGenerator} />
        <Route path="/users" component={UserManagement} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // If not authenticated or no user, show login/register pages
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
