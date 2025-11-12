import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { healthAPI } from '../services/api';

const HealthScreen = () => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    loadHealthMetrics();
  }, []);

  const loadHealthMetrics = async () => {
    try {
      setLoading(true);
      const response = await healthAPI.getHealthMetrics({ limit: 10 });
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error('Error loading health metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncHealthData = async () => {
    try {
      setLoading(true);
      // This would integrate with HealthKit on iOS or Health Connect on Android
      // For now, just show a message
      alert('Health data sync feature coming soon!');
    } catch (error) {
      console.error('Error syncing health data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Metrics</Text>
        <Text style={styles.headerSubtitle}>
          {Platform.OS === 'ios' ? 'Synced with Apple Health' : 'Synced with Health Connect'}
        </Text>
      </View>

      <TouchableOpacity style={styles.syncButton} onPress={syncHealthData}>
        <Text style={styles.syncButtonText}>
          {loading ? 'Syncing...' : 'Sync Health Data'}
        </Text>
      </TouchableOpacity>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricLabel}>Steps Today</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricLabel}>Calories Burned</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricLabel}>Active Minutes</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricLabel}>Heart Rate (bpm)</Text>
        </View>
      </View>

      {metrics.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Data</Text>
          {metrics.map((metric) => (
            <View key={metric.id} style={styles.historyItem}>
              <Text style={styles.historyType}>{metric.metric_type}</Text>
              <Text style={styles.historyValue}>
                {metric.metric_value} {metric.metric_unit}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Connect your health tracking device to automatically sync your health data.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  metricCard: {
    backgroundColor: '#fff',
    width: '47%',
    margin: '1.5%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  historySection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyType: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  historyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
  },
});

export default HealthScreen;
