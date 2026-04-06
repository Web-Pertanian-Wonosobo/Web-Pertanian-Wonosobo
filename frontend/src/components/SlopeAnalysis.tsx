import { useEffect, useRef, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle,
  XCircle,
  History,
  Shield,
  MessageCircle,
  Send,
  Phone,
  Loader2,
  MapPinned,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  getSlopeRecommendations,
} from "../services/elevationApi";

export function SlopeAnalysis() {
  // Data Kecamatan dan Desa di Wonosobo
  const wonosoboData = {
    'Wonosobo': {
      coordinates: { lat: -7.3617, lng: 109.9075 },
      villages: ['Wonosobo Utara', 'Wonosobo Timur', 'Jajar', 'Pucangan', 'Kulur']
    },
    'Kejajar': {
      coordinates: { lat: -7.2500, lng: 109.8000 },
      villages: ['Kejajar', 'Tambi', 'Sembungan', 'Patak Banteng', 'Dieng Kulon', 'Dieng Wetan']
    },
    'Garung': {
      coordinates: { lat: -7.3333, lng: 109.8333 },
      villages: ['Garung', 'Giriroto', 'Kaligesing', 'Tieng', 'Gumelem Wetan']
    },
    'Kertek': {
      coordinates: { lat: -7.3000, lng: 109.8500 },
      villages: ['Kertek', 'Sudimoro', 'Gondosuli', 'Tanjungsari', 'Kebonsari']
    },
    'Sapuran': {
      coordinates: { lat: -7.4000, lng: 109.9000 },
      villages: ['Sapuran', 'Candirejo', 'Pagergunung', 'Kalibeber', 'Jetis']
    },
    'Kalikajar': {
      coordinates: { lat: -7.2667, lng: 109.9333 },
      villages: ['Kalikajar', 'Tlogo', 'Buntu', 'Ngadirenggo', 'Sigedang']
    },
    'Kaliwiro': {
      coordinates: { lat: -7.4500, lng: 109.8500 },
      villages: ['Kaliwiro', 'Pringapus', 'Leksono', 'Candimulyo', 'Wonosari']
    },
    'Leksono': {
      coordinates: { lat: -7.4333, lng: 109.8000 },
      villages: ['Leksono', 'Kaliharjo', 'Gunungsari', 'Ngadireso', 'Wonolelo']
    },
    'Sukoharjo': {
      coordinates: { lat: -7.4667, lng: 109.9333 },
      villages: ['Sukoharjo', 'Candiroto', 'Gondang', 'Mudal', 'Semampir']
    },
    'Kalibawang': {
      coordinates: { lat: -7.3833, lng: 109.7667 },
      villages: ['Kalibawang', 'Clapar', 'Selomerto', 'Banjarnegara', 'Kepakisan']
    },
    'Mojotengah': {
      coordinates: { lat: -7.4167, lng: 109.7833 },
      villages: ['Mojotengah', 'Gumelem', 'Blumbang', 'Windusari', 'Bener']
    },
    'Watumalang': {
      coordinates: { lat: -7.3167, lng: 109.7500 },
      villages: ['Watumalang', 'Candimulyo', 'Sigrogol', 'Mlandi', 'Bringin']
    },
    'Wadaslintang': {
      coordinates: { lat: -7.4000, lng: 109.7000 },
      villages: ['Wadaslintang', 'Karangduwur', 'Sidorejo', 'Karangjati', 'Mlandi']
    },
    'Kepil': {
      coordinates: { lat: -7.3500, lng: 109.7000 },
      villages: ['Kepil', 'Kepilkroya', 'Wonokerto', 'Kepil Kidul', 'Kepil Wetan']
    },
    'Selomerto': {
      coordinates: { lat: -7.5000, lng: 109.8000 },
      villages: ['Selomerto', 'Kalitekuk', 'Selopuro', 'Banjarsari', 'Purworeja']
    }
  };

  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    district: 'all',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const selectedFeatureLayerRef = useRef<L.Path | null>(null);
  const selectedPointMarkerRef = useRef<L.Marker | null>(null);

  const [geoJsonStatus, setGeoJsonStatus] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: true, error: null });

  // Memoize API_BASE_URL to avoid recalculation on every render
  const API_BASE_URL = useMemo(
    () => (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, ""),
    []
  );
  // Memoize GEOJSON_URL to prevent infinite useEffect loops
  const GEOJSON_URL = useMemo(() => `${API_BASE_URL}/static/Lereng_Wonosobo.geojson`, [API_BASE_URL]);

  const getNumeric = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const cleaned = value.replace(/[^0-9.,-]/g, "").replace(/,/g, ".");
      const parsed = Number.parseFloat(cleaned);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };

  const extractSlopeFromProperties = (properties: Record<string, unknown> | null | undefined): number | null => {
    if (!properties) return null;

    const preferredKeys = [
      "slope",
      "Slope",
      "SLOPE",
      "lereng",
      "Lereng",
      "LERENG",
      "kemiringan",
      "Kemiringan",
      "KEMIRINGAN",
      "slope_pct",
      "slope_percent",
      "slope_percentage",
      "nilai",
      "NILAI",
      "value",
      "VALUE",
    ];

    for (const key of preferredKeys) {
      if (Object.prototype.hasOwnProperty.call(properties, key)) {
        const num = getNumeric(properties[key]);
        if (num !== null) return num;
      }
    }

    // Fallback: cari nilai numerik pertama yang masuk akal (0-100)
    for (const value of Object.values(properties)) {
      const num = getNumeric(value);
      if (num !== null && num >= 0 && num <= 100) return num;
    }

    return null;
  };

  const extractNameFromProperties = (properties: Record<string, unknown> | null | undefined): string | null => {
    if (!properties) return null;

    const preferredKeys = [
      "name",
      "Name",
      "NAME",
      "NAMOBJ",
      "nama",
      "Nama",
      "NAMA",
      "desa",
      "Desa",
      "DESA",
      "kecamatan",
      "Kecamatan",
      "KECAMATAN",
      "WADMKC",
      "WADMKD",
    ];

    for (const key of preferredKeys) {
      if (Object.prototype.hasOwnProperty.call(properties, key)) {
        const value = properties[key];
        if (typeof value === "string" && value.trim()) return value.trim();
      }
    }

    return null;
  };

  const riskFromSlope = (slopePercentage: number): "low" | "medium" | "high" => {
    if (slopePercentage <= 20) return "low";
    if (slopePercentage <= 30) return "medium";
    return "high";
  };

  const getRiskColorVar = (risk: "low" | "medium" | "high") => {
    if (risk === "high") return "var(--destructive)";
    if (risk === "medium") return "var(--chart-5)";
    return "var(--chart-4)";
  };

  const riskHistory = [
    {
      date: "25 Jul 2025",
      location: "Desa Sumbang",
      risk: "medium",
      slope: "25%",
      action: "Monitoring",
    },
    {
      date: "24 Jul 2025",
      location: "Desa Kedungbanteng",
      risk: "high",
      slope: "35%",
      action: "Alert Sent",
    },
    {
      date: "23 Jul 2025",
      location: "Desa Kembaran",
      risk: "low",
      slope: "15%",
      action: "Normal",
    },
  ];

  const emergencyContacts = [
    { name: "BASARNAS Purwokerto", phone: "0281-123456", type: "emergency" },
    { name: "BPBD Banyumas", phone: "0281-789012", type: "disaster" },
    {
      name: "Komunitas Siaga Bencana",
      whatsapp: "08123456789",
      type: "community",
    },
    {
      name: "Grup Instagram @BanyumasAlert",
      instagram: "@banyumasAlert",
      type: "social",
    },
  ];

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const center: L.LatLngExpression = [-7.3617, 109.9075]; // Wonosobo

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(center, 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (selectedPointMarkerRef.current) {
        selectedPointMarkerRef.current.remove();
        selectedPointMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      geoJsonLayerRef.current = null;
      selectedFeatureLayerRef.current = null;
    };
  }, []);

  // Load GeoJSON slope layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let cancelled = false;

    const load = async () => {
      setGeoJsonStatus({ loading: true, error: null });

      try {
        // Build GeoJSON URL
        const geoJsonUrl = `${API_BASE_URL}/static/Lereng_Wonosobo.geojson`;
        const response = await fetch(geoJsonUrl, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(
            `Gagal memuat GeoJSON (${response.status}). Pastikan backend aktif dan file tersedia di endpoint static.`
          );
        }

        const data = await response.json();
        if (cancelled) return;

        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.remove();
          geoJsonLayerRef.current = null;
        }

        const layer = L.geoJSON(data, {
          style: (feature) => {
            const slope = extractSlopeFromProperties((feature as any)?.properties);
            if (slope === null) {
              return {
                color: "var(--border)",
                weight: 1,
                fillColor: "var(--muted)",
                fillOpacity: 0.25,
              };
            }

            const risk = riskFromSlope(slope);
            const color = getRiskColorVar(risk);
            return {
              color,
              weight: 1,
              fillColor: color,
              fillOpacity: 0.35,
            };
          },
          onEachFeature: (feature, featureLayer) => {
            featureLayer.on("click", async (evt: any) => {
              const clickedLayer = evt.target as L.Path;
              if (geoJsonLayerRef.current && selectedFeatureLayerRef.current) {
                geoJsonLayerRef.current.resetStyle(selectedFeatureLayerRef.current);
              }
              selectedFeatureLayerRef.current = clickedLayer;
              clickedLayer.setStyle({ weight: 3 });

              const props = (feature as any)?.properties as Record<string, unknown> | undefined;
              const name = extractNameFromProperties(props);

              // Analisis selalu berbasis koordinat titik yang diklik, bukan seluruh area/polygon.
              const latlng = evt?.latlng as L.LatLng | undefined;
              if (!latlng) {
                toast.error("Koordinat titik klik tidak terbaca.");
                return;
              }

              const map = mapRef.current;
              if (map) {
                if (!selectedPointMarkerRef.current) {
                  selectedPointMarkerRef.current = L.marker(latlng).addTo(map);
                } else {
                  selectedPointMarkerRef.current.setLatLng(latlng);
                }
              }

              const locationName = name ? `${name}` : "Lokasi yang dipilih";
              await handleMapClick(latlng.lat, latlng.lng, feature, locationName);
            });
          },
        });

        layer.addTo(map);
        geoJsonLayerRef.current = layer;

        const layerBounds = layer.getBounds();
        if (layerBounds.isValid()) {
          map.fitBounds(layerBounds.pad(0.05));
        }

        setGeoJsonStatus({ loading: false, error: null });
      } catch (error: any) {
        console.error("Failed to load slope GeoJSON:", error);
        if (cancelled) return;
        setGeoJsonStatus({ loading: false, error: error?.message || "Gagal memuat GeoJSON" });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL]);

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return "";
    }
  };

  const handleSendToBasarnas = async () => {
    if (!selectedLocation || selectedLocation.risk !== "high") {
      toast.error(
        "Hanya lokasi dengan risiko tinggi yang dapat dikirim ke BASARNAS"
      );
      return;
    }

    // Simulate sending to BASARNAS
    setTimeout(() => {
      toast.success("Alert berhasil dikirim ke BASARNAS Purwokerto");
      // Log the alert
      const logEntry = {
        timestamp: new Date().toLocaleString("id-ID"),
        location: selectedLocation.name,
        action: "BASARNAS Alert Sent",
        severity: "high",
      };
      console.log("BASARNAS Alert:", logEntry);
    }, 1000);
  };

  const handleSendToCommunity = async (type: "whatsapp" | "instagram") => {
    if (!selectedLocation) {
      toast.error("Pilih lokasi terlebih dahulu");
      return;
    }

    const alertMessage = ` PERINGATAN POTENSI LONGSOR 

[LOCATION] Lokasi: ${selectedLocation.name}
 Tingkat Kemiringan: ${selectedLocation.slope}%
[WARNING] Status Risiko: ${getRiskLabel(selectedLocation.risk).toUpperCase()}
 Waktu: ${new Date().toLocaleString("id-ID")}

${
  selectedLocation.risk === "high"
    ? " SEGERA HINDARI AREA INI!"
    : "[WARNING] TETAP WASPADA!"
}

[INFO] Saran:
${selectedLocation.suggestions.map((s: string) => `• ${s}`).join("\n")}

#BanyumasAlert #SiagaBencana
Via EcoScope Banyumas`;

    if (type === "whatsapp") {
      const waUrl = `https://wa.me/628123456789?text=${encodeURIComponent(
        alertMessage
      )}`;
      window.open(waUrl, "_blank");
      toast.success("Membuka WhatsApp komunitas...");
    } else if (type === "instagram") {
      // For Instagram, we'll copy to clipboard since direct posting isn't available
      navigator.clipboard.writeText(alertMessage).then(() => {
        toast.success(
          "Pesan disalin ke clipboard. Buka Instagram untuk memposting."
        );
        window.open("https://instagram.com", "_blank");
      });
    }
  };

  const generateReport = () => {
    if (!selectedLocation) {
      toast.error("Pilih lokasi terlebih dahulu");
      return;
    }

    const reportContent = `LAPORAN ANALISIS LERENG - ECOSCOPE BANYUMAS

===================================================
INFORMASI LOKASI
===================================================
Nama Lokasi    : ${selectedLocation.name}
Koordinat      : ${selectedLocation.coordinates}
Kemiringan     : ${selectedLocation.slope}%
Status Risiko  : ${getRiskLabel(selectedLocation.risk)}
Waktu Analisis : ${new Date().toLocaleString("id-ID")}
${
  selectedLocation.analysisMethod
    ? `Metode Analisis: ${selectedLocation.analysisMethod}`
    : ""
}

===================================================
ASSESSMENT RISIKO
===================================================
${
  selectedLocation.risk === "high"
    ? "RISIKO TINGGI - Memerlukan perhatian segera"
    : selectedLocation.risk === "medium"
    ? "RISIKO SEDANG - Monitoring diperlukan"
    : "RISIKO RENDAH - Kondisi relatif aman"
}

===================================================
REKOMENDASI TINDAKAN
===================================================
${selectedLocation.suggestions
  .map((s: string, i: number) => `${i + 1}. ${s}`)
  .join("\n")}

===================================================
CATATAN
===================================================
- Data berdasarkan ${
      selectedLocation.analysisMethod || "analisis drone dan citra satelit"
    }
- Monitoring berkelanjutan diperlukan
- Segera hubungi otoritas jika kondisi memburuk

Generated by EcoScope Banyumas
${new Date().toLocaleString("id-ID")}`;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-lereng-${selectedLocation.name
      .toLowerCase()
      .replace(/ /g, "-")}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Laporan berhasil didownload");
  };

  /**
   * Analisis slope berdasarkan koordinat yang diklik di Google Maps
   */
  const handleMapClick = async (lat: number, lng: number, feature?: any, locationName?: string) => {
    setIsAnalyzing(true);

    try {
      // Baca slope dari GeoJSON properties
      const slope = extractSlopeFromProperties(feature?.properties);
      const featureName = extractNameFromProperties(feature?.properties);
      
      if (slope === null) {
        toast.error("Data kemiringan tidak ditemukan di lokasi ini.");
        setIsAnalyzing(false);
        return;
      }

      // Hitung degree dari percentage
      const slopeDegrees = Math.atan(slope / 100) * (180 / Math.PI);
      const riskLevel = riskFromSlope(slope);

      // Buat objek lokasi dengan data dari GeoJSON
      const newLocation = {
        id: Date.now(),
        name: locationName || featureName || "Lokasi yang dipilih",
        coordinates: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        slope: Math.round(slope * 10) / 10,
        slopeDegrees: Math.round(slopeDegrees * 10) / 10,
        risk: riskLevel,
        color:
          riskLevel === "high"
            ? "bg-red-500"
            : riskLevel === "medium"
            ? "bg-yellow-500"
            : "bg-green-500",
        suggestions: getSlopeRecommendations(slope),
        lastUpdate: "Baru saja",
        analysisMethod: "Model DEM GeoJSON",
        elevationData: [],
      };

      setSelectedLocation(newLocation);

      toast.success(
        `Analisis selesai! Kemiringan: ${Math.round(slope * 10) / 10}% (Risiko: ${getRiskLabel(riskLevel)})`
      );
    } catch (error) {
      console.error("Error analyzing slope:", error);
      toast.error("Terjadi error saat membaca data dari model DEM.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Handle district selection - zoom to district area on map
   */
  const handleDistrictChange = (district: string) => {
    setFormData({ district });
    
    // Zoom to district area if exists
    const map = mapRef.current;
    if (!map) return;

    if (district === "all") {
      const layer = geoJsonLayerRef.current;
      if (layer) {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.05));
          toast.info("Menampilkan semua area");
          return;
        }
      }
      map.setView([-7.3617, 109.9075], 10);
      toast.info("Menampilkan semua area");
      return;
    }

    if (district && wonosoboData[district as keyof typeof wonosoboData]) {
      const coords = wonosoboData[district as keyof typeof wonosoboData].coordinates;
      map.setView([coords.lat, coords.lng], 12);
      toast.info(`Menampilkan area ${district}`);
    }
  };

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Analisis Lereng</h1>
        <p className="text-muted-foreground">
          Monitoring risiko longsor berbasis kemiringan tanah
        </p>
      </div>

      {/* Emergency Alert */}
      {selectedLocation?.risk === "high" && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>PERINGATAN TINGGI!</strong> Lokasi {selectedLocation.name}{" "}
            memiliki risiko longsor tinggi. Segera lakukan tindakan mitigasi dan
            pertimbangkan untuk mengirim alert ke BASARNAS.
          </AlertDescription>
        </Alert>
      )}

      {/* Info API Sources */}
      {/* <Alert className="mb-6 border-blue-200 bg-blue-50">
        <MapPinned className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Sumber Data Elevasi:</strong> Sistem akan mencoba Google Elevation API (jika tersedia), 
          kemudian Open Elevation API (gratis), dan mock data sebagai fallback terakhir.
        </AlertDescription>
      </Alert> */}

      {/* Analysis Loading */}
      {isAnalyzing && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            Sedang menganalisis kemiringan tanah dari Model DEM...
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Peta Interaktif Wonosobo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simulated Map Interface */}
              <div className="bg-slate-100 h-96 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0">
                  <div ref={mapContainerRef} className="h-96 w-full" />

                  {/* GeoJSON status */}
                  {(geoJsonStatus.loading || geoJsonStatus.error) && (
                    <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-md max-w-md">
                      {geoJsonStatus.loading ? (
                        <p className="text-xs text-muted-foreground">Memuat layer GeoJSON lereng...</p>
                      ) : (
                        <p className="text-xs text-red-600">{geoJsonStatus.error}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Sumber: {GEOJSON_URL}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Location Info */}
              {selectedLocation && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{selectedLocation.name}</h4>
                      <p className="text-xs text-gray-600 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        Lokasi: {selectedLocation.coordinates}
                      </p>
                      {selectedLocation.analysisMethod && (
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                          <MapPinned className="h-3 w-3 mr-1" />
                          {selectedLocation.analysisMethod}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={generateReport}>
                        Download Laporan
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Kemiringan (%):</span>
                      <p className="text-lg font-semibold">{selectedLocation.slope}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Kemiringan (°):</span>
                      <p className="text-lg font-semibold">
                        {selectedLocation.slopeDegrees || 0}°
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-muted-foreground text-sm">
                      Risiko:
                    </span>
                    <Badge
                      variant={
                        selectedLocation.risk === "high"
                          ? "destructive"
                          : selectedLocation.risk === "medium"
                          ? "secondary"
                          : "default"
                      }
                      className="ml-2"
                    >
                      {getRiskLabel(selectedLocation.risk)}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">
                      Update: {selectedLocation.lastUpdate}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-muted-foreground text-sm">
                      Saran Tindakan:
                    </span>
                    <ul className="list-disc list-inside mt-1 text-sm">
                      {selectedLocation.suggestions.map(
                        (suggestion: string, index: number) => (
                          <li key={index}>{suggestion}</li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Emergency Actions */}
                  <div className="border-t pt-3">
                    <h5 className="text-sm font-medium mb-2">
                      Tindakan Darurat:
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Button
                        variant={
                          selectedLocation.risk === "high"
                            ? "destructive"
                            : "outline"
                        }
                        size="sm"
                        onClick={handleSendToBasarnas}
                        disabled={selectedLocation.risk !== "high"}
                        className="flex items-center"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Kirim ke BASARNAS
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendToCommunity("whatsapp")}
                        className="flex items-center"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        WhatsApp Komunitas
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendToCommunity("instagram")}
                        className="flex items-center"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Post Instagram
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Location Update Form */}
          <Card>
            <CardHeader>
              <CardTitle>Update Lokasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="district">Filter Kecamatan (Opsional)</Label>
                <Select 
                  value={formData.district} 
                  onValueChange={handleDistrictChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kecamatan</SelectItem>
                    {Object.keys(wonosoboData).map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Klik pada area di peta untuk menganalisis kemiringan tanah
              </p>
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded text-center">
                Data analisis dibaca langsung dari Model DEM
              </p>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Kontak Darurat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-2 bg-slate-50 rounded text-sm">
                    <p className="font-medium">{contact.name}</p>
                    {contact.phone && (
                      <p className="text-muted-foreground">{contact.phone}</p>
                    )}
                    {contact.whatsapp && (
                      <p className="text-muted-foreground">
                        WA: {contact.whatsapp}
                      </p>
                    )}
                    {contact.instagram && (
                      <p className="text-muted-foreground">
                        IG: {contact.instagram}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Upload Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Upload Video Drone
              </Button>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Citra Satelit
              </Button>
              <Button className="w-full">Ambil Data Baru</Button>
            </CardContent>
          </Card> */}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                Riwayat Scan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.date}
                      </p>
                      <p className="text-xs text-blue-600">{item.action}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(item.risk)}
                      <span className="text-sm">{item.slope}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
