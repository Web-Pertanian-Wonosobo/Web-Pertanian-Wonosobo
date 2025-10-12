import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { MockAPIService, BACKEND_AVAILABLE } from "../src/mockAPI";

export function TestPrice() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const priceData = await MockAPIService.fetchPrices();
      setData(priceData);
      console.log("Price data:", priceData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Test Price Prediction</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Data Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Backend Available: {BACKEND_AVAILABLE ? "Yes" : "No"}</p>
          <p>Data Source: {data?.source || "Unknown"}</p>
          <Button onClick={loadData} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}