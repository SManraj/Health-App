import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { mealAPI } from '../services/api';
import { format } from 'date-fns';

const MealsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const response = await mealAPI.getAllMeals({ limit: 20 });
      setMeals(response.data.meals);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMealItem = ({ item }) => (
    <TouchableOpacity style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{item.meal_name}</Text>
        <Text style={styles.mealType}>{item.meal_type}</Text>
      </View>
      <Text style={styles.mealDate}>
        {format(new Date(item.meal_date), 'MMM d, yyyy')}
      </Text>
      <View style={styles.mealNutrition}>
        <Text style={styles.nutritionText}>{item.calories} cal</Text>
        <Text style={styles.nutritionText}>P: {item.protein}g</Text>
        <Text style={styles.nutritionText}>C: {item.carbs}g</Text>
        <Text style={styles.nutritionText}>F: {item.fats}g</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={meals}
        renderItem={renderMealItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No meals logged yet</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Meal</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  mealCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mealType: {
    fontSize: 14,
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  mealDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mealNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MealsScreen;
