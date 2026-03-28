import type { SearchResult } from '@/hooks/use-offline-search';
import { colors } from '@/lib/colors';
import MapLibreGL from '@maplibre/maplibre-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  destination: SearchResult | null;
  destinationInfoOpen: boolean;
  setDestinationInfoOpen: (open: boolean) => void;
};

function truncate(text: string, max = 28) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function DestinationMarker({ destination, destinationInfoOpen, setDestinationInfoOpen }: Props) {
  if (!destination) return null;

  return (
    <>
      <MapLibreGL.ShapeSource
        id="destination-source"
        shape={{
          type: 'FeatureCollection' as const,
          features: [{
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [destination.longitude, destination.latitude],
            },
            properties: { id: destination.id },
          }],
        }}
        onPress={() => setDestinationInfoOpen(!destinationInfoOpen)}
      >
        <MapLibreGL.CircleLayer
          id="destination-circle"
          style={{
            circleRadius: 9,
            circleColor: colors.secondary,
            circleStrokeColor: '#fff',
            circleStrokeWidth: 2,
            circleOpacity: 0.95,
          }}
        />
        <MapLibreGL.CircleLayer
          id="destination-circle-pulse"
          style={{
            circleRadius: 20,
            circleColor: colors.secondary,
            circleOpacity: 0.22,
          }}
        />
      </MapLibreGL.ShapeSource>

      {destinationInfoOpen ? (
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>Destination</Text>
          <Text style={styles.calloutText} numberOfLines={1}>{truncate(destination.name, 30)}</Text>
          {destination.address ? (
            <Text style={styles.calloutSubtext} numberOfLines={1}>
              {truncate(destination.address, 36)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  calloutContainer: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 10,
    backgroundColor: 'rgba(44, 39, 63, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 100,
  },
  calloutTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  calloutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  calloutSubtext: {
    color: 'rgba(234,234,251,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
});