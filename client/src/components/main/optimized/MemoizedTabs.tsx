import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { 
  PaidSocialTabs, 
  LandingPageTabs, 
  CustomCopyTabs, 
  RetentionTabs, 
  ProductLaunchTabs, 
  AISettingsComponent 
} from '@/components/main';
import { OrganicSocialTabs } from '@/components/main/tabs/organic-social/OrganicSocialTabs';

// Memoized tab content components to prevent unnecessary re-renders
export const MemoizedPaidSocialTab = React.memo(({ 
  isActive,
  debugInfoManager,
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="paid-social">
      <PaidSocialTabs {...props} debugInfoManager={debugInfoManager} />
    </TabsContent>
  );
});

export const MemoizedOrganicSocialTab = React.memo(({ 
  isActive, 
  debugInfoManager,
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="organic-social">
      <OrganicSocialTabs {...props} debugInfoManager={debugInfoManager} />
    </TabsContent>
  );
});

export const MemoizedLandingPageTab = React.memo(({ 
  isActive, 
  debugInfoManager,
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="landing">
      <LandingPageTabs {...props} debugInfoManager={debugInfoManager} />
    </TabsContent>
  );
});

export const MemoizedCustomCopyTab = React.memo(({ 
  isActive, 
  debugInfoManager,
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="custom">
      <CustomCopyTabs {...props} debugInfoManager={debugInfoManager} />
    </TabsContent>
  );
});

export const MemoizedRetentionTab = React.memo(({ 
  isActive, 
  debugInfoManager,
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="retention">
      <RetentionTabs {...props} debugInfoManager={debugInfoManager} />
    </TabsContent>
  );
});

export const MemoizedProductLaunchTab = React.memo(({ 
  isActive, 
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="product-launch">
      <ProductLaunchTabs {...props} />
    </TabsContent>
  );
});

export const MemoizedAISettingsTab = React.memo(({ 
  isActive, 
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="settings">
      <AISettingsComponent {...props} />
    </TabsContent>
  );
});