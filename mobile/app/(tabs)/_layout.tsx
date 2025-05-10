import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return user.role === 'owner' ? 
    <Redirect href="/(owner-tabs)" /> : 
    <Redirect href="/(user-tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  }
});