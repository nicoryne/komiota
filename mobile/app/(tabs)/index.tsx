import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// MapLibre import (Assuming installed: npm i @maplibre/maplibre-react-native)
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-primary relative">
      {/* Minimal Upper Header */}
      <View 
        className="px-6 flex-row items-center justify-between pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center">
            <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="bus" size={24} color="#FFF" />
            </View>
            <Text className="text-white text-xl font-bold">Komiota</Text>
        </View>
        <Ionicons name="search" size={24} color="#FFF" />
      </View>

      {/* Main Content Card with rounded top corners */}
      <View className="flex-1 bg-card rounded-t-[40px] overflow-hidden shadow-2xl relative">
        
        {/* MapLibre Map integration */}
        <MapLibreGL.MapView
          style={StyleSheet.absoluteFillObject}
          logoEnabled={false}
          attributionEnabled={false}
          mapStyle={JSON.stringify({
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap Contributors',
                maxzoom: 19,
              },
            },
            layers: [
              {
                id: 'osm',
                type: 'raster',
                source: 'osm',
              },
            ],
          })}
        >
          {/* Initial coordinate: Cebu City roughly */}
          <MapLibreGL.Camera
            defaultSettings={{
              centerCoordinate: [123.8854, 10.3157],
              zoomLevel: 13,
            }}
          />
        </MapLibreGL.MapView>

        {/* Floating Action Buttons */}
        <View className="absolute bottom-8 right-6 space-y-4">
          
          {/* Current Location Button */}
          <Pressable className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-lg border border-gray-100 active:opacity-80">
            <Ionicons name="locate" size={26} color="#7B39ED" />
          </Pressable>

          {/* Add Stop Button */}
          <Pressable className="w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg active:opacity-80 mb-2">
            <Ionicons name="add" size={32} color="#FFF" />
          </Pressable>

        </View>
      </View>
    </View>
  );
}
