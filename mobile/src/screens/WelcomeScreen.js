import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

const WelcomeScreen = () => {
  const params = useLocalSearchParams();
  const { firstname, lastname, userType, profileImage } = params;

  const handleLogout = () => {
    // Add logout logic here
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      {profileImage && (
        <Image 
          source={{ uri: profileImage }} 
          style={styles.profileImage}
        />
      )}
      
      <Text style={styles.welcomeText}>
        Hello, {firstname} {lastname}!
      </Text>
      
      <Text style={styles.userType}>
        Account Type: {userType}
      </Text>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  userType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default WelcomeScreen; 