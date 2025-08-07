import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Route, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import MetaAdGeneratorFinal from "@/pages/index";
import UserManagement from "@/pages/user-management";
import Login from "@/pages/login";
import Register from "@/pages/register";

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, isUnauthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isUnauthenticated) {
    // Redirect to login by returning the Login component
    return <Login />;
  }

  if (isAuthenticated) {
    return <Component />;
  }

  // Fallback loading state
  return <LoadingScreen />;
}

// Public route wrapper (only accessible when not authenticated)
function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    // Redirect to main app if already authenticated
    return <MetaAdGeneratorFinal />;
  }

  return <Component />;
}

function App() {
  console.log('🔥 APP LOAD - Authentication-based routing');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Switch>
            {/* Public routes - only accessible when not authenticated */}
            <Route path="/login" component={() => <PublicRoute component={Login} />} />
            <Route path="/register" component={() => <PublicRoute component={Register} />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/users" component={() => <ProtectedRoute component={UserManagement} />} />
            <Route path="/" component={() => <ProtectedRoute component={MetaAdGeneratorFinal} />} />
            
            {/* Catch-all route */}
            <Route component={() => <ProtectedRoute component={MetaAdGeneratorFinal} />} />
          </Switch>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
