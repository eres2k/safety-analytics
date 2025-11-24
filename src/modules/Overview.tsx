/**
 * Overview Module
 * Dashboard with KPIs and intelligent insights
 */

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  Activity,
  Shield,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { KPICard } from '@/components/KPICard';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store';
import { calculateSafetyKPIs } from '@/lib/calculations';
import { generatePredictiveInsights, generateSmartRecommendations } from '@/lib/intelligent-features';

export const Overview: React.FC = () => {
  const injuries = useAppStore(state => state.filteredInjuries);
  const nearMisses = useAppStore(state => state.filteredNearMisses);

  const kpis = useMemo(() => {
    if (injuries.length === 0) return null;
    return calculateSafetyKPIs(injuries, nearMisses);
  }, [injuries, nearMisses]);

  const insights = useMemo(() => {
    if (injuries.length === 0) return [];
    return generatePredictiveInsights(injuries, nearMisses);
  }, [injuries, nearMisses]);

  const recommendations = useMemo(() => {
    if (injuries.length === 0) return [];
    return generateSmartRecommendations(injuries, nearMisses);
  }, [injuries, nearMisses]);

  if (injuries.length === 0 && nearMisses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Safety Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Upload data to view safety analytics and insights
          </p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground">
              Upload injury and near miss data to start analyzing your safety performance
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Safety Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Comprehensive overview of workplace safety performance
        </p>
      </div>

      {/* Key Performance Indicators */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            label="TRIR"
            value={kpis.trir}
            trend={kpis.trend30Days}
            trendLabel="30 days"
            icon={<AlertTriangle className="h-6 w-6" />}
            format="decimal"
            delay={0.1}
          />
          <KPICard
            label="LTIR"
            value={kpis.ltir}
            trend={kpis.trend60Days}
            trendLabel="60 days"
            icon={<TrendingDown className="h-6 w-6" />}
            format="decimal"
            delay={0.2}
          />
          <KPICard
            label="DAFWR"
            value={kpis.dafwr}
            icon={<Activity className="h-6 w-6" />}
            format="decimal"
            delay={0.3}
          />
          <KPICard
            label="NMFR"
            value={kpis.nmfr}
            icon={<FileText className="h-6 w-6" />}
            format="decimal"
            delay={0.4}
          />
          <KPICard
            label="Safety Index"
            value={kpis.safetyIndex}
            icon={<Shield className="h-6 w-6" />}
            format="decimal"
            delay={0.5}
          />
          <KPICard
            label="Total Incidents"
            value={kpis.totalInjuries}
            icon={<AlertCircle className="h-6 w-6" />}
            format="number"
            delay={0.6}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictive Insights */}
        {insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Intelligent Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.slice(0, 3).map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge
                      variant={
                        insight.severity === 'critical'
                          ? 'critical'
                          : insight.severity === 'warning'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Confidence: {insight.confidence}%</span>
                    <span>{insight.type.replace('-', ' ')}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Smart Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{rec.category}</Badge>
                    <Badge
                      variant={
                        rec.impact === 'high'
                          ? 'critical'
                          : rec.impact === 'medium'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {rec.impact} impact
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm mb-2">{rec.recommendation}</h4>
                  <p className="text-xs text-muted-foreground">{rec.reasoning}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recordable Injuries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{kpis?.recordableInjuries || 0}</span>
              <span className="text-sm text-muted-foreground">
                ({kpis?.recordableRate.toFixed(1)}% rate)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lost Time Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{kpis?.lostTimeCases || 0}</span>
              <span className="text-sm text-muted-foreground">incidents</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Near Misses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{kpis?.nearMisses || 0}</span>
              <span className="text-sm text-muted-foreground">
                ({injuries.length > 0 ? (kpis!.nearMisses / injuries.length).toFixed(1) : 0}:1 ratio)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
