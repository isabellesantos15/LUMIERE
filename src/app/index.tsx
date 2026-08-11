import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

type Filme = {
  id: number;
  titulo: string;
  genero: string;
  nota: number;
  ano: number;
};

const filmes: Filme[] = [
  {
    id: 1,
    titulo: 'Interestelar',
    genero: 'Ficção científica',
    nota: 8.7,
    ano: 2014,
  },
  {
    id: 2,
    titulo: 'Oppenheimer',
    genero: 'Drama',
    nota: 8.5,
    ano: 2023,
  },
  {
    id: 3,
    titulo: 'Barbie',
    genero: 'Comédia',
    nota: 7.0,
    ano: 2023,
  },
  {
    id: 4,
    titulo: 'Vingadores: Ultimato',
    genero: 'Ação',
    nota: 8.4,
    ano: 2019,
  },
];

export default function HomeScreen() {
  const [favoritos, setFavoritos] = useState<number[]>([]);

  useEffect(() => {
    carregarFavoritos();
  }, []);

  async function carregarFavoritos() {
    try {
      const dados = await AsyncStorage.getItem('@cinelist:favoritos');

      if (dados) {
        setFavoritos(JSON.parse(dados));
      }
    } catch (error) {
      console.log('Erro ao carregar favoritos:', error);
    }
  }

  async function alternarFavorito(id: number) {
    try {
      const jaEraFavorito = favoritos.includes(id);

      let novosFavoritos: number[];

      if (jaEraFavorito) {
        novosFavoritos = favoritos.filter((item) => item !== id);
      } else {
        novosFavoritos = [...favoritos, id];
      }

      setFavoritos(novosFavoritos);

      await AsyncStorage.setItem(
        '@cinelist:favoritos',
        JSON.stringify(novosFavoritos)
      );

      Toast.show({
        type: 'success',
        text1: jaEraFavorito
          ? 'Filme removido dos favoritos'
          : 'Filme adicionado aos favoritos',
        visibilityTime: 2000,
        position: 'top',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o favorito.');
    }
  }

  const dataAtual = format(new Date(), 'dd/MM/yyyy');

  return (
    <LinearGradient
      colors={['#111827', '#1f2937', '#111827']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <View>
            <Text style={styles.logo}>CineList</Text>
            <Text style={styles.subtitulo}>
              Sua lista de filmes favoritos
            </Text>
          </View>

          <Ionicons name="film-outline" size={38} color="#facc15" />
        </View>

        <View style={styles.dataContainer}>
          <Ionicons
            name="calendar-outline"
            size={17}
            color="#9ca3af"
          />
          <Text style={styles.data}>
            Atualizado em {dataAtual}
          </Text>
        </View>

        <Text style={styles.tituloSecao}>
          Filmes em destaque
        </Text>

        {filmes.map((filme) => {
          const favorito = favoritos.includes(filme.id);

          return (
            <View key={filme.id} style={styles.card}>
              <View style={styles.informacoes}>
                <Text style={styles.tituloFilme}>
                  {filme.titulo}
                </Text>

                <Text style={styles.genero}>
                  {filme.genero} • {filme.ano}
                </Text>

                <View style={styles.avaliacao}>
                  <Ionicons
                    name="star"
                    size={18}
                    color="#facc15"
                  />

                  <Text style={styles.nota}>
                    {filme.nota}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.botaoFavorito}
                onPress={() => alternarFavorito(filme.id)}
              >
                <Ionicons
                  name={favorito ? 'heart' : 'heart-outline'}
                  size={30}
                  color={favorito ? '#ef4444' : '#d1d5db'}
                />
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.resumo}>
          <Ionicons name="heart" size={20} color="#ef4444" />

          <Text style={styles.textoResumo}>
            {favoritos.length}{' '}
            {favoritos.length === 1
              ? 'filme favoritado'
              : 'filmes favoritados'}
          </Text>
        </View>

        <Text style={styles.rodape}>
          CineList • Desenvolvido com React Native + Expo
        </Text>

        <View style={styles.tecnologias}>
          <Text style={styles.tituloTecnologias}>
            Tecnologias utilizadas
          </Text>

          <Text style={styles.itemTecnologia}>
            • expo-linear-gradient
          </Text>

          <Text style={styles.itemTecnologia}>
            • @expo/vector-icons
          </Text>

          <Text style={styles.itemTecnologia}>
            • @react-native-async-storage/async-storage
          </Text>

          <Text style={styles.itemTecnologia}>
            • date-fns
          </Text>

          <Text style={styles.itemTecnologia}>
            • react-native-toast-message
          </Text>
        </View>
      </ScrollView>

      <Toast />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  conteudo: {
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 40,
  },

  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  logo: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 3,
  },

  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 30,
  },

  data: {
    color: '#9ca3af',
    fontSize: 13,
  },

  tituloSecao: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  informacoes: {
    flex: 1,
  },

  tituloFilme: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  genero: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 10,
  },

  avaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  nota: {
    color: '#facc15',
    fontSize: 15,
    fontWeight: 'bold',
  },

  botaoFavorito: {
    padding: 10,
  },

  resumo: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  textoResumo: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  rodape: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
  },

  tecnologias: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 18,
    marginTop: 25,
  },

  tituloTecnologias: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  itemTecnologia: {
    color: '#d1d5db',
    fontSize: 14,
    marginBottom: 7,
  },
});
