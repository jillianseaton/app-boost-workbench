
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, MousePointer, Move, Thermometer } from 'lucide-react';

const Heatmaps = () => {
  const [selectedPage, setSelectedPage] = useState('homepage');

  const heatmapData = {
    homepage: {
      clicks: 2847,
      scrollDepth: '68%',
      avgTimeOnPage: '2:34',
      exitRate: '32%'
    },
    pricing: {
      clicks: 1923,
      scrollDepth: '45%',
      avgTimeOnPage: '1:52',
      exitRate: '28%'
    },
    signup: {
      clicks: 1456,
      scrollDepth: '85%',
      avgTimeOnPage: '3:12',
      exitRate: '15%'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Heatmap Analytics</h1>
          <p className="text-muted-foreground">Visualize user behavior and interaction patterns</p>
        </div>

        <div className="mb-6">
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homepage">Homepage</SelectItem>
              <SelectItem value="pricing">Pricing Page</SelectItem>
              <SelectItem value="signup">Signup Page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="clicks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="clicks" className="flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Click Heatmap
            </TabsTrigger>
            <TabsTrigger value="scroll" className="flex items-center gap-2">
              <Move className="h-4 w-4" />
              Scroll Map
            </TabsTrigger>
            <TabsTrigger value="attention" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Attention Map
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clicks">
            <Card>
              <CardHeader>
                <CardTitle>Click Heatmap - {selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MousePointer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Click heatmap visualization would appear here</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Shows where users click most frequently on your page
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{heatmapData[selectedPage as keyof typeof heatmapData].clicks}</div>
                    <div className="text-sm text-muted-foreground">Total Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">127</div>
                    <div className="text-sm text-muted-foreground">Hot Spots</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">23%</div>
                    <div className="text-sm text-muted-foreground">CTA Click Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">89%</div>
                    <div className="text-sm text-muted-foreground">Above Fold</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scroll">
            <Card>
              <CardHeader>
                <CardTitle>Scroll Map - {selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Move className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Scroll depth visualization would appear here</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Shows how far down users scroll on your page
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{heatmapData[selectedPage as keyof typeof heatmapData].scrollDepth}</div>
                    <div className="text-sm text-muted-foreground">Avg Scroll Depth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">92%</div>
                    <div className="text-sm text-muted-foreground">Reach Fold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">45%</div>
                    <div className="text-sm text-muted-foreground">Reach Bottom</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">67%</div>
                    <div className="text-sm text-muted-foreground">Reach CTA</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attention">
            <Card>
              <CardHeader>
                <CardTitle>Attention Map - {selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Attention heatmap would appear here</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Shows which areas get the most visual attention
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{heatmapData[selectedPage as keyof typeof heatmapData].avgTimeOnPage}</div>
                    <div className="text-sm text-muted-foreground">Avg Time on Page</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">156</div>
                    <div className="text-sm text-muted-foreground">Focus Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">3.2s</div>
                    <div className="text-sm text-muted-foreground">First Attention</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">12.5s</div>
                    <div className="text-sm text-muted-foreground">Longest Focus</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Time on Page</span>
                    <span className="font-semibold">{heatmapData[selectedPage as keyof typeof heatmapData].avgTimeOnPage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exit Rate</span>
                    <span className="font-semibold">{heatmapData[selectedPage as keyof typeof heatmapData].exitRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scroll Depth</span>
                    <span className="font-semibold">{heatmapData[selectedPage as keyof typeof heatmapData].scrollDepth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Interactions</span>
                    <span className="font-semibold">{heatmapData[selectedPage as keyof typeof heatmapData].clicks}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-1">Most Clicked Element</h4>
                    <p className="text-sm text-blue-700">Primary CTA button (847 clicks)</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-1">High Attention Area</h4>
                    <p className="text-sm text-green-700">Hero section (avg 8.2s focus time)</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-1">Drop-off Point</h4>
                    <p className="text-sm text-orange-700">45% users exit at pricing section</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Heatmaps;
