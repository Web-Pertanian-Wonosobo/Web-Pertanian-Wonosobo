import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MapPin, Search, Download } from "lucide-react";
import { fetchWilayah, type Wilayah, parseLatLongArea } from "../services/wilayahApi";

export function WilayahList() {
  const [wilayahData, setWilayahData] = useState<Wilayah[]>([]);
  const [filteredData, setFilteredData] = useState<Wilayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWilayah, setSelectedWilayah] = useState<Wilayah | null>(null);

  useEffect(() => {
    const loadWilayah = async () => {
      setLoading(true);
      try {
        const data = await fetchWilayah();
        setWilayahData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Gagal memuat data wilayah:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWilayah();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(wilayahData);
    } else {
      const filtered = wilayahData.filter(
        (w) =>
          w.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.kode.includes(searchQuery)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, wilayahData]);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(wilayahData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wilayah-wonosobo.json";
    link.click();
  };

  const getCoordinateCount = (wilayah: Wilayah): number => {
    try {
      const coords = parseLatLongArea(wilayah.latlong_area);
      return coords.length;
    } catch {
      return 0;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Wilayah Kecamatan Wonosobo
          </h1>
          <p className="text-gray-600 mt-1">
            Data resmi dari Disdukcapil Kabupaten Wonosobo
          </p>
        </div>
        <Button onClick={handleExportJSON} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Cari kecamatan berdasarkan nama atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Kecamatan</p>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? "..." : filteredData.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wilayah List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Wilayah ({loading ? "..." : filteredData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat data wilayah...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="space-y-3">
              {filteredData.map((wilayah) => (
                <div
                  key={wilayah.id}
                  className={`p-4 border rounded-lg hover:bg-blue-50 transition-colors cursor-pointer ${
                    selectedWilayah?.id === wilayah.id ? "bg-blue-50 border-blue-300" : ""
                  }`}
                  onClick={() => setSelectedWilayah(wilayah)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {wilayah.nama}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Kode: <span className="font-mono">{wilayah.kode}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getCoordinateCount(wilayah)} titik koordinat
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ID: {wilayah.id}
                      </span>
                    </div>
                  </div>

                  {selectedWilayah?.id === wilayah.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Detail Wilayah:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">ID Wilayah</p>
                          <p className="font-mono text-gray-900">{wilayah.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Kode Wilayah</p>
                          <p className="font-mono text-gray-900">{wilayah.kode}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Nama Kecamatan</p>
                          <p className="font-medium text-gray-900">{wilayah.nama}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Koordinat Area</p>
                          <p className="text-gray-900">{getCoordinateCount(wilayah)} titik</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                            Lihat Data Koordinat Lengkap
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-100 rounded overflow-x-auto max-h-40">
                            {JSON.stringify(parseLatLongArea(wilayah.latlong_area).slice(0, 10), null, 2)}
                            {getCoordinateCount(wilayah) > 10 && "\n... dan " + (getCoordinateCount(wilayah) - 10) + " titik lainnya"}
                          </pre>
                        </details>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Tidak ada wilayah yang sesuai dengan pencarian "{searchQuery}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Sumber Data</h4>
              <p className="text-sm text-gray-600">
                Data wilayah kecamatan ini berasal dari API resmi Disdukcapil Kabupaten Wonosobo.
                Setiap wilayah memiliki data koordinat batas administratif yang dapat digunakan
                untuk pemetaan dan analisis geografis.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                API: https://disdukcapil.wonosobokab.go.id/api/wilayah
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
