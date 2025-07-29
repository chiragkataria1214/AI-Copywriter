import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MetaAdGenerator() {
  const [activeTab, setActiveTab] = useState('ads');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Copywriter</h1>
        <p className="text-gray-600">Generate professional marketing copy with AI</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ads">Ad Copy</TabsTrigger>
          <TabsTrigger value="landing">Landing Pages</TabsTrigger>
          <TabsTrigger value="launch">Launch</TabsTrigger>
          <TabsTrigger value="custom">Custom Request</TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meta Ad Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Generate Meta ad copy functionality will be restored here.</p>
              <Button className="mt-4">Generate Ad Copy</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="landing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Landing page generation functionality will be restored here.</p>
              <Button className="mt-4">Generate Landing Page</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="launch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Launch Brief</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Launch brief functionality will be restored here.</p>
              <Button className="mt-4">Generate Launch Brief</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Custom copywriting requests will be handled here.</p>
              <Button className="mt-4">Submit Request</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}