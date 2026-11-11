import { StyleSheet, Text, View } from 'react-native';

export function HeaderCadastro() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de usuário</Text>
      <Text style={styles.subtitulo}>
        Preencha seus dados para criar uma conta
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  titulo: {
    color: '#172554',
    fontSize: 28,
    fontWeight: '700',
  },

  subtitulo: {
    color: '#64748b',
    fontSize: 15,
    marginTop: 6,
  },
});
