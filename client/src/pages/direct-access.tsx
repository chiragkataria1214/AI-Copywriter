import MetaAdGenerator from './meta-ad-generator';

// Direct access to main app - bypasses all authentication logic
export default function DirectAccess() {
  return <MetaAdGenerator />;
}