/**
 * Data Upload Module
 * Upload and manage safety data
 */

import React from 'react';
import { Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDataUpload } from '@/hooks/useDataUpload';
import { useAppStore } from '@/store';

export const DataUpload: React.FC = () => {
  const { uploadFile, isUploading, uploadProgress } = useDataUpload();

  const injuries = useAppStore(state => state.injuries);
  const nearMisses = useAppStore(state => state.nearMisses);
  const inspections = useAppStore(state => state.inspections);
  const clearAllData = useAppStore(state => state.clearAllData);
  const injuryQuality = useAppStore(state => state.injuryQuality);
  const nearMissQuality = useAppStore(state => state.nearMissQuality);

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Management</h2>
        <p className="text-muted-foreground mt-2">
          Upload and manage safety data from CSV files
        </p>
      </div>

      {/* Current Data Status */}
      {(injuries.length > 0 || nearMisses.length > 0 || inspections.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Current Data Status
                </CardTitle>
                <CardDescription>Overview of loaded data</CardDescription>
              </div>
              <Button variant="destructive" size="sm" onClick={clearAllData}>
                Clear All Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Injuries</span>
                  <Badge variant={injuries.length > 0 ? 'success' : 'secondary'}>
                    {injuries.length} records
                  </Badge>
                </div>
                {injuryQuality && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Quality Score:</span>
                      <span className="font-medium">{injuryQuality.overallScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completeness:</span>
                      <span>{injuryQuality.completeness}%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Near Misses</span>
                  <Badge variant={nearMisses.length > 0 ? 'success' : 'secondary'}>
                    {nearMisses.length} records
                  </Badge>
                </div>
                {nearMissQuality && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Quality Score:</span>
                      <span className="font-medium">{nearMissQuality.overallScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completeness:</span>
                      <span>{nearMissQuality.completeness}%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Inspections</span>
                  <Badge variant={inspections.length > 0 ? 'success' : 'secondary'}>
                    {inspections.length} records
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUpload
          title="Upload Injury Data"
          description="CSV file containing injury and illness records"
          accept=".csv"
          onFileSelect={(file) => uploadFile(file, 'injury')}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        <FileUpload
          title="Upload Near Miss Data"
          description="CSV file containing near miss incident records"
          accept=".csv"
          onFileSelect={(file) => uploadFile(file, 'nearMiss')}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        <FileUpload
          title="Upload Inspection Data"
          description="CSV file containing safety inspection records"
          accept=".csv"
          onFileSelect={(file) => uploadFile(file, 'inspection')}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      </div>

      {/* Data Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Data Format Guide</CardTitle>
          <CardDescription>Required and optional fields for each data type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Injury Data Required Fields:</h4>
            <div className="flex flex-wrap gap-2">
              {['site', 'date', 'incidentType', 'severity', 'bodyPart', 'location', 'description', 'rootCause', 'correctiveAction'].map(
                field => (
                  <Badge key={field} variant="outline">{field}</Badge>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Near Miss Required Fields:</h4>
            <div className="flex flex-wrap gap-2">
              {['site', 'date', 'category', 'severity', 'location', 'description', 'potentialImpact', 'correctiveAction'].map(
                field => (
                  <Badge key={field} variant="outline">{field}</Badge>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Inspection Required Fields:</h4>
            <div className="flex flex-wrap gap-2">
              {['site', 'inspectionType', 'scheduledDate', 'status', 'inspector'].map(
                field => (
                  <Badge key={field} variant="outline">{field}</Badge>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
