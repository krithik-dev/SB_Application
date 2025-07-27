import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


const CommunityScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>community page (Python MVP)</Text>
    </View>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
