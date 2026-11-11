import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type SecaoCadastroProps = PropsWithChildren<{
  titulo: string;
}>;

export function SecaoCadastro({
  titulo,
  children,
}: SecaoCadastroProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    marginBottom: 18,
    padding: 16,
  },

  titulo: {
    color: '#1d4ed8',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 15,
  },
});
