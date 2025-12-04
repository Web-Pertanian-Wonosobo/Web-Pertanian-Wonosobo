import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Sprout, 
  TrendingUp, 
  Clock, 
  Thermometer, 
  CloudRain, 
  Droplets,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface CropRecommendation {
  id: string;
  data: {
    name: string;
    category: string;
    temp_optimal: [number, number];
    rainfall_optimal: [number, number];
    growth_period: number;
    economic_value: string;
    difficulty: string;
    description: string;
  };
  score: number;
  suitability: string;
}

interface WeatherAnalysis {
  avg_temp: number;
  total_rainfall: number;
  avg_humidity: number;
  prediction_days: number;
}

interface CropRecommendationsProps {
  recommendations: {
    highly_recommended: CropRecommendation[];
    recommended: CropRecommendation[];
    not_recommended: CropRecommendation[];
  };
  weather_analysis: WeatherAnalysis;
  planting_tips: string[];
  season_info: {
    season: string;
    description: string;
  };
  location: string;
  prediction_source?: string;
}

export function CropRecommendations({ 
  recommendations, 
  weather_analysis, 
  planting_tips, 
  season_info,
  location,
  prediction_source 
}: CropRecommendationsProps) {
  
  const getEconomicValueColor = (value: string) => {
    switch(value) {
      case 'sangat_tinggi': return 'bg-green-100 text-green-800';
      case 'tinggi': return 'bg-blue-100 text-blue-800';
      case 'sedang': return 'bg-yellow-100 text-yellow-800';
      case 'rendah': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'mudah': return 'bg-green-100 text-green-800';
      case 'sedang': return 'bg-yellow-100 text-yellow-800';
      case 'sulit': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    switch(suitability) {
      case 'Sangat Cocok': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Cocok': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'Cukup Cocok': return <Info className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const renderCropCard = (crop: CropRecommendation, variant: 'highly' | 'recommended' | 'not') => {
    const borderColors = {
      highly: 'border-green-200 bg-green-50',
      recommended: 'border-blue-200 bg-blue-50', 
      not: 'border-red-200 bg-red-50'
    };

    return (
      <Card key={crop.id} className={`${borderColors[variant]} border-2`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">{crop.data.name}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {getSuitabilityIcon(crop.suitability)}
              <span className="text-sm font-medium">{Math.round(crop.score)}%</span>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">
            {crop.data.category}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">{crop.data.description}</p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span>{crop.data.temp_optimal[0]}-{crop.data.temp_optimal[1]}°C</span>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-blue-500" />
              <span>{crop.data.rainfall_optimal[0]}-{crop.data.rainfall_optimal[1]}mm</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span>{crop.data.growth_period} hari</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <Badge className={getEconomicValueColor(crop.data.economic_value)}>
                {crop.data.economic_value.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Badge className={getDifficultyColor(crop.data.difficulty)}>
              {crop.data.difficulty}
            </Badge>
            <Badge variant="outline" className={
              variant === 'highly' ? 'text-green-700 bg-green-100' :
              variant === 'recommended' ? 'text-blue-700 bg-blue-100' :
              'text-red-700 bg-red-100'
            }>
              {crop.suitability}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-green-600" />
            Rekomendasi Komoditas Pangan - {location}
          </CardTitle>
          {prediction_source && (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Berdasarkan prediksi AI/ML: {prediction_source}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Thermometer className="h-6 w-6 mx-auto text-orange-500 mb-1" />
              <p className="text-sm text-gray-600">Suhu Rata-rata</p>
              <p className="font-bold">{weather_analysis.avg_temp.toFixed(1)}°C</p>
            </div>
            <div className="text-center">
              <CloudRain className="h-6 w-6 mx-auto text-blue-500 mb-1" />
              <p className="text-sm text-gray-600">Curah Hujan</p>
              <p className="font-bold">{weather_analysis.total_rainfall}mm</p>
            </div>
            <div className="text-center">
              <Droplets className="h-6 w-6 mx-auto text-cyan-500 mb-1" />
              <p className="text-sm text-gray-600">Kelembapan</p>
              <p className="font-bold">{weather_analysis.avg_humidity}%</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto text-purple-500 mb-1" />
              <p className="text-sm text-gray-600">Periode Analisis</p>
              <p className="font-bold">{weather_analysis.prediction_days} hari</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Season Info */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Info Musim</h4>
              <p className="text-sm text-blue-700">{season_info.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Highly Recommended Crops */}
      {recommendations.highly_recommended.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Sangat Direkomendasikan ({recommendations.highly_recommended.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.highly_recommended.map(crop => renderCropCard(crop, 'highly'))}
          </div>
        </div>
      )}

      {/* Recommended Crops */}
      {recommendations.recommended.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Direkomendasikan ({recommendations.recommended.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.recommended.map(crop => renderCropCard(crop, 'recommended'))}
          </div>
        </div>
      )}

      {/* Planting Tips */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Tips Penanaman
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {planting_tips.map((tip, index) => (
              <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Not Recommended (if any) */}
      {recommendations.not_recommended.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Kurang Direkomendasikan ({recommendations.not_recommended.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.not_recommended.map(crop => renderCropCard(crop, 'not'))}
          </div>
        </div>
      )}
    </div>
  );
}