import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Completely standalone AI Copywriter - no dependencies
export default function StandaloneApp() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const generateCopy = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-ad-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: 'Life Juggler',
          brandBalance: 50,
          productContext: 'Foundation',
          customInput: 'Generate ad copy for Jones Road Beauty foundation'
        })
      });
      const data = await response.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (error) {
      setOutput('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI Copywriter - Jones Road Beauty
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Ad Copy Generator</CardTitle>
            <CardDescription>Generate authentic brand-aligned advertising copy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={generateCopy} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Ad Copy'}
            </Button>
            
            {output && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Generated Copy:</h3>
                <Textarea 
                  value={output} 
                  readOnly 
                  className="min-h-[200px]"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}