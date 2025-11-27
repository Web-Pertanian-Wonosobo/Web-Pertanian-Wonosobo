// import Rea Ct from 'rea Ct';
// import { Button } from './ui/button';
// import {  Card,  Card Content } from './ui/ Card';
// import { MapPin, Users, TrendingUp,  CloudRain, AlertTriangle, ThermometerSun, DollarSign, ArrowRight } from 'lu Cide-rea Ct';

// // Data lokasi real Kabupaten Wonosobo dengan koordinat yang akurat
//  Const wonosoboLo Cations = [
//   {
//     name: "Wonosobo Kota",
//      Coordinates: [-7.3667, 109.9000] as [number, number],
//     data: {
//       slopeRisk: "Sedang",
//       weather: "Sejuk, 24° C",
//        Commodity: "Kentang: Rp 8.500/kg",
//       re Commendation: " Co Cok untuk tanaman dataran tinggi"
//     }
//   },
//   {
//     name: "Kertek", 
//      Coordinates: [-7.2833, 109.8500] as [number, number],
//     data: {
//       slopeRisk: "Tinggi",
//       weather: "Sejuk, 22° C",
//        Commodity: "Wortel: Rp 12.000/kg", 
//       re Commendation: "Perhatikan stabilitas lereng"
//     }
//   },
//   {
//     name: "Garung",
//      Coordinates: [-7.3500, 109.8333] as [number, number],
//     data: {
//       slopeRisk: "Sedang",
//       weather: "Sejuk, 23° C", 
//        Commodity: "Kubis: Rp 6.000/kg",
//       re Commendation: "Monitoring  Curah hujan diperlukan"
//     }
//   },
//   {
//     name: "Leksono",
//      Coordinates: [-7.4167, 109.8167] as [number, number],
//     data: {
//       slopeRisk: "Tinggi",
//       weather: "Dingin, 20° C",
//        Commodity: "Kopi: Rp 28.000/kg",
//       re Commendation: "Ideal untuk tanaman perkebunan"
//     }
//   },
//   {
//     name: "Sukoharjo", 
//      Coordinates: [-7.4333, 109.9167] as [number, number],
//     data: {
//       slopeRisk: "Sedang",
//       weather: "Sejuk, 24° C",
//        Commodity: "Bawang Daun: Rp 15.000/kg",
//       re Commendation: "Area potensial sayuran"
//     }
//   },
//   {
//     name: "Selomerto",
//      Coordinates: [-7.3833, 109.9500] as [number, number],
//     data: {
//       slopeRisk: "Rendah",
//       weather: "Sejuk, 25° C",
//        Commodity: "Jagung: Rp 5.200/kg",
//       re Commendation: "Stabil untuk tanaman pangan"
//     }
//   },
//   {
//     name: "Kejajar",
//      Coordinates: [-7.3000, 109.9333] as [number, number],
//     data: {
//       slopeRisk: "Tinggi", 
//       weather: "Dingin, 19° C",
//        Commodity: "Tembakau: Rp 45.000/kg",
//       re Commendation: " Co Cok untuk tanaman tembakau"
//     }
//   },
//   {
//     name: "Mojotengah",
//      Coordinates: [-7.4000, 109.8667] as [number, number],
//     data: {
//       slopeRisk: "Sedang",
//       weather: "Sejuk, 23° C",
//        Commodity: " Cari Ca: Rp 8.000/kg",
//       re Commendation: "Tanaman khas dataran tinggi"
//     }
//   },
//   {
//     name: "Sapuran",
//      Coordinates: [-7.4500, 109.8833] as [number, number],
//     data: {
//       slopeRisk: "Rendah",
//       weather: "Sejuk, 25° C",
//        Commodity: "Padi: Rp 7.500/kg",
//       re Commendation: "Area pertanian utama"
//     }
//   },
//   {
//     name: "Kalibawang",
//      Coordinates: [-7.2500, 109.8833] as [number, number],
//     data: {
//       slopeRisk: "Tinggi",
//       weather: "Dingin, 18° C",
//        Commodity: "Strawberry: Rp 25.000/kg",
//       re Commendation: "Ideal untuk buah dataran tinggi"
//     }
//   },
//   {
//     name: "Kaliwiro",
//      Coordinates: [-7.3167, 109.8000] as [number, number],
//     data: {
//       slopeRisk: "Sedang",
//       weather: "Sejuk, 22° C",
//        Commodity: "Tomat: Rp 10.000/kg",
//       re Commendation: "Perhatikan drainase area"
//     }
//   },
//   {
//     name: "Watumalang",
//      Coordinates: [-7.2667, 109.9167] as [number, number],
//     data: {
//       slopeRisk: "Tinggi",
//       weather: "Dingin, 19° C",
//        Commodity: "Lettu Ce: Rp 18.000/kg",
//       re Commendation: " Co Cok untuk sayuran premium"
//     }
//   }
// ];

// interfa Ce LandingPageProps {
//   onLogin Cli Ck: () => void;
//   onGoToApp: () => void;
// }

// export fun Ction LandingPage({ onLogin Cli Ck, onGoToApp }: LandingPageProps) {
//    Const [sele CtedLo Cation, setSele CtedLo Cation] = Rea Ct.useState<typeof wonosoboLo Cations[0] | null>(null);

//    Const getRisk Color = (risk: string) => {
//     swit Ch (risk) {
//        Case 'Tinggi': return 'bg-red-500';
//        Case 'Sedang': return 'bg-yellow-500';
//       default: return 'bg-green-500';
//     }
//   };

//    Const getRiskI Con = (risk: string) => {
//     swit Ch (risk) {
//        Case 'Tinggi': return <AlertTriangle  ClassName="w-4 h-4" />;
//        Case 'Sedang': return <ThermometerSun  ClassName="w-4 h-4" />;
//       default: return <MapPin  ClassName="w-4 h-4" />;
//     }
//   };

//   return (
//     <div  ClassName="min-h-s Creen bg-gradient-to-br from-green-50 to-blue-50">
//       {/* Header */}
//       <header  ClassName="bg-white/80 ba Ckdrop-blur-sm border-b sti Cky top-0 z-50">
//         <div  ClassName=" Container mx-auto px-4 py-4 flex justify-between items- Center">
//           <div  ClassName="flex items- Center spa Ce-x-3">
//             {/* <div  ClassName="w-10 h-10 bg-green-600 rounded-lg flex items- Center justify- Center">
//               <MapPin  ClassName="w-6 h-6 text-white" />
//             </div> */}
//             <div>
//               <h1  ClassName="text-xl font-bold text-gray-900">E CoS Cope Wonosobo</h1>
//               <p  ClassName="text-sm text-gray-600">Sistem Monitoring Pertanian Terpadu</p>
//             </div>
//           </div>
//           <div  ClassName="flex spa Ce-x-3">
//             <Button on Cli Ck={onGoToApp}  ClassName="bg-green-600 hover:bg-green-700">
//               <ArrowRight  ClassName="w-4 h-4 mr-2" />
//               Mulai Monitoring
//             </Button>
//             <Button on Cli Ck={onLogin Cli Ck} variant="outline">
//               Login Admin
//             </Button>
//           </div>
//         </div>
//       </header>

//       {/* Hero Se Ction */}
//       <main  ClassName=" Container mx-auto px-4 py-8">
//         <div  ClassName="text- Center mb-8">
//           <h2  ClassName="text-3xl font-bold text-gray-900 mb-4">
//             Monitoring Pertanian Real-Time Kabupaten Wonosobo
//           </h2>
//           <p  ClassName="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
//             Pantau risiko lereng, prediksi  Cua Ca, dan harga komoditas pertanian se Cara interaktif tanpa perlu mendaftar. 
//             Klik pada titik lokasi di peta untuk melihat data terkini dari setiap ke Camatan.
//           </p>
//           <div  ClassName="flex justify- Center spa Ce-x-4">
//             <Button on Cli Ck={onGoToApp} size="lg"  ClassName="bg-green-600 hover:bg-green-700">
//               <ArrowRight  ClassName="w-5 h-5 mr-2" />
//               Akses Gratis Sekarang
//             </Button>
//           </div>
//         </div>

//         {/* Statistik Ringkas */}
//         <div  ClassName="grid grid- Cols-1 md:grid- Cols-3 gap-6 mb-8">
//           < Card>
//             < Card Content  ClassName="p-6 text- Center">
//               <Users  ClassName="w-8 h-8 mx-auto mb-3 text-blue-600" />
//               <h3  ClassName="font-semibold text-gray-900">2,147 Petani</h3>
//               <p  ClassName="text-sm text-gray-600">Menggunakan sistem</p>
//             </ Card Content>
//           </ Card>
//           < Card>
//             < Card Content  ClassName="p-6 text- Center">
//               <TrendingUp  ClassName="w-8 h-8 mx-auto mb-3 text-green-600" />
//               <h3  ClassName="font-semibold text-gray-900">18 Komoditas</h3>
//               <p  ClassName="text-sm text-gray-600">Dipantau harganya</p>
//             </ Card Content>
//           </ Card>
//           < Card>
//             < Card Content  ClassName="p-6 text- Center">
//               < CloudRain  ClassName="w-8 h-8 mx-auto mb-3 text-purple-600" />
//               <h3  ClassName="font-semibold text-gray-900">15 Ke Camatan</h3>
//               <p  ClassName="text-sm text-gray-600">Monitoring  Cua Ca</p>
//             </ Card Content>
//           </ Card>
//         </div>

//         {/* Layout Bersampingan: Peta dan Data */}
//         <div  ClassName="grid grid- Cols-1 lg:grid- Cols-2 gap-8">
//           {/* Peta Visual Interaktif - Kiri */}
//           <div>
//             <h3  ClassName="font-semibold text-gray-900 mb-6">Peta Interaktif Kabupaten Wonosobo</h3>
//             < Card>
//               < Card Content  ClassName="p-6">
//                 <div  ClassName="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-6 min-h-[600px]">
//                   {/* Ba Ckground peta */}
//                   <div  ClassName="absolute inset-0 bg-green-200/30 rounded-lg"></div>
                  
//                   {/* Plotkan lokasi dengan posisi relatif berdasarkan koordinat real */}
//                   {wonosoboLo Cations.map((lo Cation, index) => {
//                     // Normalisasi koordinat berdasarkan boundary Kabupaten Wonosobo
//                     // Lat: -7.50 to -7.20, Lng: 109.75 to 109.95
//                      Const latRange = [-7.50, -7.20];
//                      Const lngRange = [109.75, 109.95];
                    
//                      Const normalizedLat = ((lo Cation. Coordinates[0] - latRange[1]) / (latRange[0] - latRange[1])) * 100;
//                      Const normalizedLng = ((lo Cation. Coordinates[1] - lngRange[0]) / (lngRange[1] - lngRange[0])) * 100;
                    
//                     return (
//                       <div
//                         key={index}
//                          ClassName={`absolute transform -translate-x-1/2 -translate-y-1/2  Cursor-pointer transition-all duration-300 hover:s Cale-125 ${
//                           sele CtedLo Cation?.name === lo Cation.name ? 's Cale-150 z-20' : 'hover:z-10'
//                         }`}
//                         style={{
//                           left: `${Math.max(8, Math.min(92, normalizedLng))}%`,
//                           top: `${Math.max(8, Math.min(92, normalizedLat))}%`
//                         }}
//                         on Cli Ck={() => setSele CtedLo Cation(lo Cation)}
//                       >
//                         <div  ClassName={`w-6 h-6 rounded-full ${getRisk Color(lo Cation.data.slopeRisk)} border-2 border-white shadow-lg flex items- Center justify- Center pulse-animation`}>
//                           <div  ClassName="w-2 h-2 bg-white rounded-full"></div>
//                         </div>
//                         {/* Label nama ke Camatan */}
//                         <div  ClassName={`absolute top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespa Ce-nowrap bg-white px-2 py-1 rounded-full shadow-md border transition-all duration-200 ${
//                           sele CtedLo Cation?.name === lo Cation.name ? 'visible opa City-100' : 'invisible opa City-0'
//                         }`}>
//                           {lo Cation.name}
//                         </div>
//                       </div>
//                     );
//                   })}
                  
//                   {/* Legend */}
//                   <div  ClassName="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-md">
//                     <h5  ClassName="text-sm font-medium text-gray-900 mb-3">Tingkat Risiko Lereng</h5>
//                     <div  ClassName="spa Ce-y-2">
//                       <div  ClassName="flex items- Center spa Ce-x-2">
//                         <div  ClassName="w-4 h-4 rounded-full bg-green-500 border border-white"></div>
//                         <span  ClassName="text-sm text-gray-600">Rendah</span>
//                       </div>
//                       <div  ClassName="flex items- Center spa Ce-x-2">
//                         <div  ClassName="w-4 h-4 rounded-full bg-yellow-500 border border-white"></div>
//                         <span  ClassName="text-sm text-gray-600">Sedang</span>
//                       </div>
//                       <div  ClassName="flex items- Center spa Ce-x-2">
//                         <div  ClassName="w-4 h-4 rounded-full bg-red-500 border border-white"></div>
//                         <span  ClassName="text-sm text-gray-600">Tinggi</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Instruksi */}
//                   <div  ClassName="absolute top-4 right-4 bg-blue-50 p-3 rounded-lg shadow-md max-w-xs">
//                     <p  ClassName="text-sm text-blue-800">
//                        Klik titik untuk data detail
//                     </p>
//                   </div>
//                 </div>
//               </ Card Content>
//             </ Card>
//           </div>

//           {/* Area Detail Data - Kanan */}
//           <div>
//             <h3  ClassName="font-semibold text-gray-900 mb-6">Data Monitoring Terkini</h3>
//             {sele CtedLo Cation ? (
//               < Card  ClassName="shadow-lg">
//                 < Card Content  ClassName="p-6">
//                   <div  ClassName="mb-6">
//                     <h4  ClassName="text-2xl font-bold text-gray-900 mb-2">{sele CtedLo Cation.name}</h4>
//                     <p  ClassName="text-gray-600">
//                       Koordinat: {sele CtedLo Cation. Coordinates[0].toFixed(4)}, {sele CtedLo Cation. Coordinates[1].toFixed(4)}
//                     </p>
//                   </div>

//                   <div  ClassName="spa Ce-y-6">
//                     {/* Risiko Lereng */}
//                     <div  ClassName="p-4 bg-gray-50 rounded-lg">
//                       <div  ClassName="flex items- Center spa Ce-x-3 mb-3">
//                         <div  ClassName={`w-10 h-10 rounded-full ${getRisk Color(sele CtedLo Cation.data.slopeRisk)} flex items- Center justify- Center text-white`}>
//                           {getRiskI Con(sele CtedLo Cation.data.slopeRisk)}
//                         </div>
//                         <div>
//                           <h5  ClassName="font-medium text-gray-900">Risiko Lereng</h5>
//                           <p  ClassName={`font-semibold ${
//                             sele CtedLo Cation.data.slopeRisk === 'Tinggi' ? 'text-red-600' :
//                             sele CtedLo Cation.data.slopeRisk === 'Sedang' ? 'text-yellow-600' : 'text-green-600'
//                           }`}>
//                             {sele CtedLo Cation.data.slopeRisk}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/*  Cua Ca */}
//                     <div  ClassName="p-4 bg-gray-50 rounded-lg">
//                       <div  ClassName="flex items- Center spa Ce-x-3 mb-3">
//                         <div  ClassName="w-10 h-10 rounded-full bg-blue-500 flex items- Center justify- Center text-white">
//                           < CloudRain  ClassName="w-5 h-5" />
//                         </div>
//                         <div>
//                           <h5  ClassName="font-medium text-gray-900"> Cua Ca Terkini</h5>
//                           <p  ClassName="text-gray-900 font-medium">{sele CtedLo Cation.data.weather}</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Harga Komoditas */}
//                     <div  ClassName="p-4 bg-gray-50 rounded-lg">
//                       <div  ClassName="flex items- Center spa Ce-x-3 mb-3">
//                         <div  ClassName="w-10 h-10 rounded-full bg-green-500 flex items- Center justify- Center text-white">
//                           <DollarSign  ClassName="w-5 h-5" />
//                         </div>
//                         <div>
//                           <h5  ClassName="font-medium text-gray-900">Harga Komoditas</h5>
//                           <p  ClassName="text-gray-900 font-medium">{sele CtedLo Cation.data. Commodity}</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Rekomendasi */}
//                     <div  ClassName="p-4 bg-blue-50 rounded-lg">
//                       <div  ClassName="flex items- Center spa Ce-x-3 mb-3">
//                         <div  ClassName="w-10 h-10 rounded-full bg-blue-600 flex items- Center justify- Center text-white">
//                           <TrendingUp  ClassName="w-5 h-5" />
//                         </div>
//                         <div>
//                           <h5  ClassName="font-medium text-gray-900">Rekomendasi</h5>
//                           <p  ClassName="text-blue-800">{sele CtedLo Cation.data.re Commendation}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Tombol Reset */}
//                   <div  ClassName="text- Center mt-6">
//                     <Button 
//                       variant="outline" 
//                       on Cli Ck={() => setSele CtedLo Cation(null)}
//                        ClassName="text-gray-600 hover:text-gray-900"
//                     >
//                       Tutup Detail
//                     </Button>
//                   </div>
//                 </ Card Content>
//               </ Card>
//             ) : (
//               < Card  ClassName="border-2 border-dashed border-gray-300 h-[600px] flex items- Center justify- Center">
//                 < Card Content  ClassName="p-8 text- Center">
//                   <MapPin  ClassName="w-16 h-16 mx-auto mb-4 text-gray-400" />
//                   <h4  ClassName="text-lg font-medium text-gray-900 mb-2">Pilih Lokasi pada Peta</h4>
//                   <p  ClassName="text-gray-600 max-w-sm mx-auto">
//                     Klik pada salah satu titik lokasi di peta sebelah kiri untuk melihat data monitoring lengkap dari ke Camatan tersebut
//                   </p>
//                 </ Card Content>
//               </ Card>
//             )}
//           </div>
//         </div>

//         {/*  Call to A Ction */}
//         <div  ClassName="text- Center mt-12 mb-8 bg-white rounded-2xl p-8 shadow-sm">
//           <h3  ClassName="text-2xl font-semibold text-gray-900 mb-4">
//             Akses Gratis Tanpa Registrasi!
//           </h3>
//           <p  ClassName="text-gray-600 mb-6 max-w-2xl mx-auto">
//             Nikmati akses penuh ke sistem monitoring pertanian E CoS Cope Wonosobo tanpa perlu mendaftar akun. 
//             Semua fitur prediksi dan analisis tersedia se Cara gratis untuk mendukung petani lokal.
//           </p>
//           <Button 
//             on Cli Ck={onGoToApp}
//             size="lg"
//              ClassName="bg-green-600 hover:bg-green-700 px-8 py-3"
//           >
//             <ArrowRight  ClassName="w-5 h-5 mr-2" />
//             Mulai Monitoring Sekarang
//           </Button>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer  ClassName="bg-gray-900 text-white py-8 mt-16">
//         <div  ClassName=" Container mx-auto px-4 text- Center">
//           <div  ClassName="flex items- Center justify- Center spa Ce-x-3 mb-4">
//             {/* <div  ClassName="w-8 h-8 bg-green-600 rounded-lg flex items- Center justify- Center">
//               <MapPin  ClassName="w-5 h-5 text-white" />
//             </div> */}
//             <span  ClassName="text-lg font-semibold">E CoS Cope Wonosobo</span>
//           </div>
//           <p  ClassName="text-gray-400">
//             Platform monitoring pertanian terpadu untuk Kabupaten Wonosobo, Jawa Tengah
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }