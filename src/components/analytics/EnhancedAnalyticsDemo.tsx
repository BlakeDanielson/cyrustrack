import React, { useState } from 'react';
import { ConsumptionSession } from '@/types/consumption';
import ConsumptionIntensityHeatmap from './ConsumptionIntensityHeatmap';
import SeasonalAnalysis from './SeasonalAnalysis';
import HolidayImpactAnalysis from './HolidayImpactAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Calendar, 
  Flame,
  Leaf,
  Package,
  Target
} from 'lucide-react';

interface EnhancedAnalyticsDemoProps {
  sessions: ConsumptionSession[];
}

const EnhancedAnalyticsDemo: React.FC<EnhancedAnalyticsDemoProps> = ({ sessions }) => {
  const [activeTab, setActiveTab] = useState('heatmap');

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Log some consumption sessions to see enhanced analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Analytics Dashboard</h1>
        <p className="text-gray-600">Advanced insights into your consumption patterns</p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {sessions.filter(s => {
                const date = new Date(s.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date >= weekAgo;
              }).length} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(sessions.map(s => s.date)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique consumption days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.reduce((sum, s) => {
                if (typeof s.quantity === 'number') return sum + s.quantity;
                if (s.quantity && typeof s.quantity === 'object') return sum + s.quantity.amount;
                return sum;
              }, 0).toFixed(2)}g
            </div>
            <p className="text-xs text-muted-foreground">
              Total consumed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Session</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(sessions.reduce((sum, s) => {
                if (typeof s.quantity === 'number') return sum + s.quantity;
                if (s.quantity && typeof s.quantity === 'object') return sum + s.quantity.amount;
                return sum;
              }, 0) / sessions.length).toFixed(2)}g
            </div>
            <p className="text-xs text-muted-foreground">
              Per session average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Intensity Heatmap
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Seasonal Analysis
          </TabsTrigger>
          <TabsTrigger value="holiday" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Holiday Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600" />
                Consumption Intensity Heatmap
              </CardTitle>
              <CardDescription>
                Visualize your daily consumption patterns with enhanced intensity mapping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsumptionIntensityHeatmap sessions={sessions} weeks={20} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Seasonal Consumption Analysis
              </CardTitle>
              <CardDescription>
                Discover how seasons affect your consumption patterns and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeasonalAnalysis sessions={sessions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holiday" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Holiday Impact Analysis
              </CardTitle>
              <CardDescription>
                Analyze how special dates and holidays influence your consumption behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HolidayImpactAnalysis sessions={sessions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Highlights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">New Analytics Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Flame className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Intensity Heatmap</h4>
            <p className="text-sm text-gray-600">
              View consumption by quantity or session count with enhanced color coding
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Seasonal Patterns</h4>
            <p className="text-sm text-gray-600">
              Identify how seasons affect your consumption habits and preferences
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Holiday Impact</h4>
            <p className="text-sm text-gray-600">
              See how special dates influence your consumption patterns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsDemo;
