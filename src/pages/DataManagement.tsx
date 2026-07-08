import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Download, Upload, Trash2, Database, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { downloadData, uploadData, clearAllData, getDataStats, performAutoBackup, restoreFromAutoBackup } from "@/lib/dataPersistence";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const DataManagement = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; errors: string[] } | null>(null);
  const [stats] = useState(() => getDataStats());

  const handleExport = () => {
    try {
      downloadData();
      performAutoBackup();
      toast({
        title: "Export Successful",
        description: "Data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid File",
        description: "Please select a valid JSON file.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await uploadData(file);
      setImportResult(result);

      if (result.success) {
        performAutoBackup();
        toast({
          title: "Import Successful",
          description: "Data has been imported successfully. Please refresh the page.",
        });
        // Reload the page to reflect imported data
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast({
          title: "Import Failed",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }
    } catch (error) {
      setImportResult({ success: false, errors: ['Unexpected error occurred'] });
      toast({
        title: "Import Failed",
        description: "An unexpected error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = () => {
    const result = clearAllData();
    if (result.success) {
      toast({
        title: "Data Cleared",
        description: "All data has been cleared successfully.",
      });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast({
        title: "Clear Failed",
        description: result.errors.join(', '),
        variant: "destructive",
      });
    }
  };

  const handleRestoreBackup = () => {
    const result = restoreFromAutoBackup();
    if (result.success) {
      toast({
        title: "Restore Successful",
        description: "Data has been restored from auto-backup.",
      });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast({
        title: "Restore Failed",
        description: result.errors.join(', '),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Data Management Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="h-12 md:h-16 glass-panel border-b border-border/50 flex items-center px-4 md:px-6 gap-3 md:gap-4 shrink-0 z-20">
          <div className="flex items-center gap-2 md:gap-2.5">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Database className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-xs md:text-sm">Data Management</h1>
              <p className="text-[10px] md:text-[11px] text-muted-foreground">Backup, restore, and manage your data</p>
            </div>
          </div>

          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Products</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.productsCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Categories</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.categoriesCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Receipts</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.receiptsCount}</p>
              {stats.receiptsCount > 800 && (
                <p className="text-xs text-amber-600 mt-1">
                  Approaching 1000 limit ({1000 - stats.receiptsCount} remaining)
                </p>
              )}
              {stats.receiptsCount >= 1000 && (
                <p className="text-xs text-red-600 mt-1">
                  At maximum capacity - old receipts will be removed
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">₵</span>
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold mt-2">₵{stats.totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Import/Export Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download all your data (products, categories, receipts) as a JSON file for backup purposes.
              </p>
              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              {stats.lastBackup && (
                <p className="text-xs text-muted-foreground">
                  Last backup: {new Date(stats.lastBackup).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Import data from a previously exported JSON file. This will replace all current data.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? "Importing..." : "Import Data"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Import Results */}
        {importResult && (
          <Alert className={`mb-6 ${importResult.success ? 'border-green-500' : 'border-destructive'}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{importResult.success ? 'Import Successful' : 'Import Failed'}</strong>
              {importResult.errors.length > 0 && (
                <ul className="mt-2 list-disc list-inside">
                  {importResult.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Separator className="my-8" />

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Restore from Auto-Backup</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Restore data from the last automatic backup.
                </p>
                <Button
                  onClick={handleRestoreBackup}
                  variant="outline"
                  size="sm"
                  disabled={!localStorage.getItem('pahc-auto-backup')}
                >
                  Restore Backup
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-destructive">Clear All Data</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete all products, categories, and receipts. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your products,
                        categories, receipts, and all associated data from this device.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, clear all data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Data Storage Information</h4>
          <p className="text-sm text-muted-foreground">
            All data is stored locally in your browser's localStorage. Regular exports are recommended
            to prevent data loss. For production use, consider implementing a proper backend database.
          </p>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;