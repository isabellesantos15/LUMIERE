import {
    Alert,
    Button,
    Platform,
    StyleSheet,
    View,
} from 'react-native';

export function BotaoCadastro() {
  function cadastrarUsuario() {
    if (Platform.OS === 'web') {
      window.alert('Dados enviados com sucesso!');
    } else {
      Alert.alert('Cadastro', 'Dados enviados com sucesso!');
    }
  }

  return (
    <View style={styles.container}>
      <Button
        title="Realizar cadastro"
        onPress={cadastrarUsuario}
        color="#2563eb"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginBottom: 24,
    overflow: 'hidden',
  },
});
