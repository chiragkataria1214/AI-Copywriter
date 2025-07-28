import StandaloneApp from './standalone-app';

// Completely isolated main component - zero authentication
export default function SimpleMain() {
  return <StandaloneApp />;
}