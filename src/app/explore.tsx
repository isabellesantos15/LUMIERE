/*
  Funcionalidades:
  - Catálogo de filmes premiados
  - Busca por título, gênero e diretor
  - Filtros cinematográficos
  - Favoritos com AsyncStorage
  - Detalhes dos filmes
  - Pôsteres com imagens
  - Degradês Azul Royal & Pérola
  - Lista organizada com FlatList
*/

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// ================================================
// 1. CORES DO APLICATIVO
// ================================================

const CORES = {
  azulEscuro: '#10234E',
  azulRoyal: '#244DA0',
  azulMedio: '#648ED4',
  azulClaro: '#B8CFF2',
  perola: '#F5F7FC',
  branco: '#FFFFFF',
  texto: '#1A315C',
  cinza: '#7485A0',
  borda: '#DCE5F4',
  rosa: '#C16C94',
};

// Degradê utilizado no cabeçalho.
const DEGRADE = [
  '#10234E',
  '#315FB5',
  '#91B1E6',
] as const;

// Degradê dos botões.
const DEGRADE_BOTAO = [
  '#173875',
  '#527CC8',
] as const;

// Identificador dos favoritos no armazenamento.
const CHAVE_FAVORITOS = '@lumiere:favoritos';

// Endereço das imagens.
const TMDB = 'https://image.tmdb.org/t/p/w500';

// 2. TIPO DOS FILMES// 
type Filme = {
  id: number;
  titulo: string;
  ano: number;
  genero: string;
  diretor: string;
  duracao: string;
  premio: string;
  melhorFilme: boolean;
  sinopse: string;
  poster: string;
};

// 3. CATÁLOGO DE FILMES// 

const FILMES: Filme[] = [
  {
    id: 1,
    titulo: 'Oppenheimer',
    ano: 2023,
    genero: 'Drama',
    diretor: 'Christopher Nolan',
    duracao: '3h',
    premio: 'Melhor Filme - Oscar 2024',
    melhorFilme: true,
    sinopse:
      'A história de J. Robert Oppenheimer, ' +
      'o físico responsável por liderar o ' +
      'desenvolvimento da primeira bomba atômica.',
    poster:
      `${TMDB}/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg`,
  },
  {
    id: 2,
    titulo: 'Parasita',
    ano: 2019,
    genero: 'Suspense',
    diretor: 'Bong Joon-ho',
    duracao: '2h12',
    premio: 'Melhor Filme - Oscar 2020',
    melhorFilme: true,
    sinopse:
      'Uma família com dificuldades financeiras ' +
      'se aproxima de uma família rica, dando ' +
      'início a acontecimentos inesperados.',
    poster:
      `${TMDB}/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg`,
  },
  {
    id: 3,
    titulo: 'La La Land',
    ano: 2016,
    genero: 'Romance',
    diretor: 'Damien Chazelle',
    duracao: '2h08',
    premio: '6 Oscars - 2017',
    melhorFilme: false,
    sinopse:
      'Uma atriz e um pianista se apaixonam ' +
      'enquanto buscam realizar seus sonhos ' +
      'na cidade de Los Angeles.',
    poster:
      `${TMDB}/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg`,
  },
  {
    id: 4,
    titulo: 'Tudo em Todo Lugar ao Mesmo Tempo',
    ano: 2022,
    genero: 'Ficção',
    diretor: 'Daniel Kwan e Daniel Scheinert',
    duracao: '2h19',
    premio: 'Melhor Filme - Oscar 2023',
    melhorFilme: true,
    sinopse:
      'Uma mulher descobre diferentes universos ' +
      'e precisa explorar outras versões de sua ' +
      'vida para proteger sua família.',
    poster:
      `${TMDB}/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg`,
  },
  {
    id: 5,
    titulo: 'Titanic',
    ano: 1997,
    genero: 'Romance',
    diretor: 'James Cameron',
    duracao: '3h14',
    premio: 'Melhor Filme - Oscar 1998',
    melhorFilme: true,
    sinopse:
      'Jack e Rose vivem um romance inesquecível ' +
      'durante a viagem inaugural do Titanic.',
    poster:
      `${TMDB}/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg`,
  },
  {
    id: 6,
    titulo: 'A Forma da Água',
    ano: 2017,
    genero: 'Fantasia',
    diretor: 'Guillermo del Toro',
    duracao: '2h03',
    premio: 'Melhor Filme - Oscar 2018',
    melhorFilme: true,
    sinopse:
      'Uma mulher que trabalha em um laboratório ' +
      'secreto estabelece uma ligação especial ' +
      'com uma criatura misteriosa.',
    poster:
      `${TMDB}/9zfwPffUXpBrEP26yp0q1ckXDcj.jpg`,
  },
  {
    id: 7,
    titulo: 'Interestelar',
    ano: 2014,
    genero: 'Ficção',
    diretor: 'Christopher Nolan',
    duracao: '2h49',
    premio: 'Oscar de Efeitos Visuais - 2015',
    melhorFilme: false,
    sinopse:
      'Um grupo de astronautas atravessa o espaço ' +
      'em busca de um novo lar para a humanidade.',
    poster:
      `${TMDB}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
  },
  {
    id: 8,
    titulo: 'Forrest Gump',
    ano: 1994,
    genero: 'Drama',
    diretor: 'Robert Zemeckis',
    duracao: '2h22',
    premio: 'Melhor Filme - Oscar 1995',
    melhorFilme: true,
    sinopse:
      'Um homem de coração generoso participa ' +
      'de momentos históricos enquanto vive ' +
      'uma emocionante jornada pessoal.',
    poster:
      `${TMDB}/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg`,
  },
  {
    id: 9,
    titulo: 'O Poderoso Chefão',
    ano: 1972,
    genero: 'Drama',
    diretor: 'Francis Ford Coppola',
    duracao: '2h55',
    premio: 'Melhor Filme - Oscar 1973',
    melhorFilme: true,
    sinopse:
      'A história da poderosa família Corleone ' +
      'e de seus conflitos envolvendo poder, ' +
      'lealdade e crime organizado.',
    poster:
      `${TMDB}/3bhkrj58Vtu7enYsRolD1fZdja1.jpg`,
  },
  {
    id: 10,
    titulo: 'Barbie',
    ano: 2023,
    genero: 'Comédia',
    diretor: 'Greta Gerwig',
    duracao: '1h54',
    premio: 'Oscar de Canção Original - 2024',
    melhorFilme: false,
    sinopse:
      'Barbie deixa seu mundo perfeito e parte ' +
      'em uma jornada de descobertas sobre ' +
      'identidade, liberdade e autoconhecimento.',
    poster:
      `${TMDB}/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg`,
  },
];

// CATEGORIAS DE FILTRO//
const FILTROS = [
  'Todos',
  'Melhor Filme',
  'Romance',
  'Drama',
  'Suspense',
  'Ficção',
  'Fantasia',
  'Comédia',
  'Favoritos',
];
// COMPONENTE DO PÔSTER// 
type PosterProps = {
  filme: Filme;
  altura?: number;
};

function Poster({
  filme,
  altura = 230,
}: PosterProps) {

  // Identifica se houve falha na imagem.
  const [erroImagem, setErroImagem] = useState(false);

  return (
    <View
      style={{
        width: '100%',
        height: altura,
        backgroundColor: CORES.azulEscuro,
        overflow: 'hidden',
      }}
    >

      {/* Pôster do filme */}
      {!erroImagem ? (
        <Image
          source={{ uri: filme.poster }}
          resizeMode="cover"
          onError={() => setErroImagem(true)}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      ) : (

        /* Degradê alternativo se a imagem falhar */
        <LinearGradient
          colors={[
            '#10234E',
            '#648ED4',
          ] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 15,
          }}
        >

          <Text style={styles.posterSimbolo}>
            ✦
          </Text>

          <Text style={styles.posterTitulo}>
            {filme.titulo}
          </Text>

        </LinearGradient>
      )}

      {/* Selo de premiação */}
      <View style={styles.seloOscar}>
        <Text style={styles.textoSeloOscar}>
          ✦ OSCAR
        </Text>
      </View>

    </View>
  );
}

// TELA EXPLORE//
export default function ExploreScreen() {

  // Texto digitado na pesquisa.
  const [busca, setBusca] = useState('');

  // Filtro selecionado.
  const [filtro, setFiltro] = useState('Todos');

  // Lista de IDs dos filmes favoritos.
  const [favoritos, setFavoritos] = useState<number[]>([]);

  // Filme selecionado para os detalhes.
  const [filmeSelecionado, setFilmeSelecionado] =
    useState<Filme | null>(null);

  // Estado de carregamento.
  const [carregando, setCarregando] = useState(true);

  // 7. CARREGAR FAVORITOS// 

  useEffect(() => {
    let ativo = true;

    async function carregarFavoritos() {
      try {
        const dados = await AsyncStorage.getItem(
          CHAVE_FAVORITOS
        );

        if (dados !== null) {
          const lista: unknown = JSON.parse(dados);

          if (ativo && Array.isArray(lista)) {
            setFavoritos(
              lista.filter(
                (id): id is number =>
                  typeof id === 'number'
              )
            );
          }
        }

      } catch (erro) {
        console.error(
          'Erro ao carregar favoritos:',
          erro
        );

      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarFavoritos();

    return () => {
      ativo = false;
    };
  }, []);

  // ADICIONAR OU REMOVER FAVORITOS//
  async function alternarFavorito(id: number) {

    const novaLista = favoritos.includes(id)
      ? favoritos.filter((item) => item !== id)
      : [...favoritos, id];

    try {
      await AsyncStorage.setItem(
        CHAVE_FAVORITOS,
        JSON.stringify(novaLista)
      );

      setFavoritos(novaLista);

    } catch (erro) {
      console.error(
        'Erro ao salvar favoritos:',
        erro
      );

      Alert.alert(
        'Erro',
        'Não foi possível atualizar os favoritos.'
      );
    }
  }
  // 9. PESQUISA E FILTROS//

  const filmesFiltrados = useMemo(() => {

    const textoBusca = busca
      .trim()
      .toLocaleLowerCase('pt-BR');

    return FILMES.filter((filme) => {

      const correspondeBusca =
        `${filme.titulo} ${filme.genero} ${filme.diretor}`
          .toLocaleLowerCase('pt-BR')
          .includes(textoBusca);

      const correspondeFiltro =
        filtro === 'Todos' ||
        (filtro === 'Melhor Filme' &&
          filme.melhorFilme) ||
        (filtro === 'Favoritos' &&
          favoritos.includes(filme.id)) ||
        filme.genero === filtro;

      return correspondeBusca && correspondeFiltro;

    });

  }, [busca, filtro, favoritos]);

  // Filme apresentado no destaque.
  const destaque = FILMES[0];

  // 10. CABEÇALHO DA TELA// 

  const cabecalho = (
    <View>

      {/* Fundo superior com degradê */}
      <LinearGradient
        colors={DEGRADE}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cabecalho}
      >

        <View style={styles.circuloSuperior} />
        <View style={styles.circuloInferior} />

        <View style={styles.linhaMarca}>

          <View>
            <Text style={styles.marca}>
              LUMIÈRE
            </Text>

            <Text style={styles.submarca}>
              THE ART OF CINEMA
            </Text>
          </View>

          <View style={styles.iconeMarca}>
            <Text style={styles.estrelaMarca}>
              ✦
            </Text>
          </View>

        </View>

        <View style={styles.separadorCabecalho} />

        <Text style={styles.etiquetaCabecalho}>
          ✦ UMA EXPERIÊNCIA CINEMATOGRÁFICA
        </Text>

        <Text style={styles.tituloCabecalho}>
          Histórias que{'\n'}merecem ser vistas.
        </Text>

        <Text style={styles.descricaoCabecalho}>
          Descubra obras-primas, romances
          inesquecíveis e filmes premiados.
        </Text>

        <Pressable
          style={styles.botaoDestaque}
          onPress={() => setFilmeSelecionado(destaque)}
        >
          <Text style={styles.textoBotaoDestaque}>
            EXPLORAR DESTAQUE ↗
          </Text>
        </Pressable>

      </LinearGradient>

      {/* FILME EM DESTAQUE */}
      <View style={styles.secaoDestaque}>

        <View style={styles.tituloLinha}>
          <Text style={styles.etiquetaSecao}>
            DESTAQUE DA SEMANA
          </Text>

          <Text style={styles.estrelaSecao}>
            ✦
          </Text>
        </View>

        <Pressable
          style={styles.cartaoDestaque}
          onPress={() => setFilmeSelecionado(destaque)}
        >

          <View style={styles.imagemDestaque}>
            <Poster
              filme={destaque}
              altura={190}
            />
          </View>

          <View style={styles.informacoesDestaque}>

            <Text style={styles.pequenoDestaque}>
              ESCOLHA LUMIÈRE
            </Text>

            <Text style={styles.nomeDestaque}>
              {destaque.titulo}
            </Text>

            <Text style={styles.metaDestaque}>
              {destaque.ano} • {destaque.genero}
            </Text>

            <Text style={styles.premioDestaque}>
              ✦ {destaque.premio}
            </Text>

            <Text style={styles.linkDestaque}>
              Ver detalhes →
            </Text>

          </View>

        </Pressable>
      </View>

      {/* PESQUISA */}
      <View style={styles.secaoPesquisa}>

        <Text style={styles.etiquetaSecao}>
          SUA PRÓXIMA DESCOBERTA
        </Text>

        <Text style={styles.tituloSecao}>
          Explore o cinema
        </Text>

        <View style={styles.caixaPesquisa}>

          <Text style={styles.iconePesquisa}>
            ⌕
          </Text>

          <TextInput
            style={styles.inputPesquisa}
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar filmes ou diretores..."
            placeholderTextColor="#9BA9C0"
            returnKeyType="search"
          />

          {busca.length > 0 && (
            <Pressable
              onPress={() => setBusca('')}
            >
              <Text style={styles.limparPesquisa}>
                ✕
              </Text>
            </Pressable>
          )}

        </View>

        {/* FILTROS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listaFiltros}
        >

          {FILTROS.map((item) => {

            const ativo = filtro === item;

            return (
              <Pressable
                key={item}
                onPress={() => setFiltro(item)}
                style={[
                  styles.botaoFiltro,
                  ativo && styles.botaoFiltroAtivo,
                ]}
              >

                <Text
                  style={[
                    styles.textoFiltro,
                    ativo && styles.textoFiltroAtivo,
                  ]}
                >
                  {item === 'Favoritos'
                    ? `♡ Favoritos (${favoritos.length})`
                    : item}
                </Text>

              </Pressable>
            );
          })}

        </ScrollView>

        <View style={styles.linhaCatalogo}>

          <Text style={styles.tituloCatalogo}>
            Seleção especial
          </Text>

          <Text style={styles.contador}>
            {filmesFiltrados.length} filmes
          </Text>

        </View>

      </View>

    </View>
  );
  // 11. CARTÃO INDIVIDUAL DO FILME//
  function renderizarFilme({
    item,
  }: {
    item: Filme;
  }) {

    const favorito = favoritos.includes(item.id);

    return (
      <Pressable
        style={styles.cartaoFilme}
        onPress={() => setFilmeSelecionado(item)}
      >

        <View style={styles.areaImagem}>

          <Poster filme={item} altura={225} />

          {/* Botão para adicionar aos favoritos */}
          <Pressable
            onPress={() => {
              void alternarFavorito(item.id);
            }}
            style={styles.botaoCoracao}
            accessibilityRole="button"
            accessibilityLabel={
              favorito
                ? `Remover ${item.titulo} dos favoritos`
                : `Adicionar ${item.titulo} aos favoritos`
            }
          >

            <Text
              style={[
                styles.coracao,
                favorito && styles.coracaoAtivo,
              ]}
            >
              {favorito ? '♥' : '♡'}
            </Text>

          </Pressable>

        </View>

        <View style={styles.informacoesFilme}>

          <Text
            style={styles.nomeFilme}
            numberOfLines={2}
          >
            {item.titulo}
          </Text>

          <Text style={styles.metaFilme}>
            {item.ano} • {item.genero}
          </Text>

          <Text
            style={styles.premioFilme}
            numberOfLines={2}
          >
            ✦ {item.premio}
          </Text>

        </View>

      </Pressable>
    );
  }
  // 12. INTERFACE PRINCIPAL
// 
    <SafeAreaView style={styles.tela}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={CORES.azulEscuro}
      />

      {carregando ? (

        <View style={styles.carregamento}>
          <ActivityIndicator
            size="large"
            color={CORES.azulRoyal}
          />
        </View>

      ) : (

        <FlatList
          data={filmesFiltrados}
          keyExtractor={(item) =>
            item.id.toString()
          }
          numColumns={2}
          renderItem={renderizarFilme}
          ListHeaderComponent={cabecalho}
          columnWrapperStyle={styles.linhaFilmes}
          contentContainerStyle={styles.conteudoLista}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={

            <View style={styles.vazio}>

              <Text style={styles.iconeVazio}>
                ✧
              </Text>

              <Text style={styles.tituloVazio}>
                Nenhum filme encontrado
              </Text>

              <Text style={styles.textoVazio}>
                Tente pesquisar outro filme
                ou selecione uma categoria diferente.
              </Text>

            </View>
          }
          ListFooterComponent={

            <Text style={styles.rodape}>
              ✦ LUMIÈRE • HISTÓRIAS QUE PERMANECEM ✦
            </Text>
          }
        />
      )}

      {/* JANELA DE DETALHES */}
      <Modal
        visible={filmeSelecionado !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setFilmeSelecionado(null)
        }
      >

        <View style={styles.fundoModal}>

          <View style={styles.cartaoModal}>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >

              {filmeSelecionado !== null && (
                <>

                  <Poster
                    filme={filmeSelecionado}
                    altura={220}
                  />

                  <View style={styles.conteudoModal}>

                    <Text style={styles.etiquetaModal}>
                      ✦ CINEMA PREMIADO
                    </Text>

                    <Text style={styles.tituloModal}>
                      {filmeSelecionado.titulo}
                    </Text>

                    <Text style={styles.metaModal}>
                      {filmeSelecionado.ano}
                      {' • '}
                      {filmeSelecionado.genero}
                      {' • '}
                      {filmeSelecionado.duracao}
                    </Text>

                    <View style={styles.seloPremio}>
                      <Text style={styles.textoPremio}>
                        ✦ {filmeSelecionado.premio}
                      </Text>
                    </View>

                    <Text style={styles.rotuloModal}>
                      SINOPSE
                    </Text>

                    <Text style={styles.descricaoModal}>
                      {filmeSelecionado.sinopse}
                    </Text>

                    <Text style={styles.rotuloModal}>
                      DIREÇÃO
                    </Text>

                    <Text style={styles.descricaoModal}>
                      {filmeSelecionado.diretor}
                    </Text>

                    {/* BOTÃO DE FAVORITOS */}
                    <Pressable
                      style={styles.botaoModal}
                      onPress={() => {
                        void alternarFavorito(
                          filmeSelecionado.id
                        );
                      }}
                    >

                      <LinearGradient
                        colors={DEGRADE_BOTAO}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.degradeBotaoModal}
                      >

                        <Text style={styles.textoBotaoModal}>
                          {favoritos.includes(
                            filmeSelecionado.id
                          )
                            ? '♥ REMOVER DOS FAVORITOS'
                            : '♡ ADICIONAR AOS FAVORITOS'}
                        </Text>

                      </LinearGradient>

                    </Pressable>

                    {/* BOTÃO FECHAR */}
                    <Pressable
                      onPress={() =>
                        setFilmeSelecionado(null)
                      }
                      style={styles.botaoFechar}
                    >

                      <Text style={styles.textoFechar}>
                        Fechar detalhes
                      </Text>

                    </Pressable>

                  </View>

                </>
              )}

            </ScrollView>

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  ;
}

//ESTILOS DO APLICATIVO// 

const styles = StyleSheet.create({

  tela: {
    flex: 1,
    backgroundColor: CORES.perola,
  },

  conteudoLista: {
    paddingBottom: 25,
  },

  carregamento: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // CABEÇALHO
  cabecalho: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 35,
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  circuloSuperior: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    top: -100,
    right: -100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  circuloInferior: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -60,
    left: -100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  linhaMarca: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  marca: {
    color: CORES.branco,
    fontSize: 27,
    fontWeight: '300',
    letterSpacing: 4,
  },

  submarca: {
    color: '#DCE8FF',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 5,
  },

  iconeMarca: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  estrelaMarca: {
    color: CORES.branco,
    fontSize: 25,
  },

  separadorCabecalho: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 29,
  },

  etiquetaCabecalho: {
    color: '#E6EFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 13,
  },

  tituloCabecalho: {
    color: CORES.branco,
    fontSize: 34,
    fontWeight: '500',
    lineHeight: 43,
    marginBottom: 13,
  },

  descricaoCabecalho: {
    color: '#E5EEFC',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 310,
  },

  botaoDestaque: {
    backgroundColor: CORES.branco,
    paddingHorizontal: 19,
    paddingVertical: 14,
    borderRadius: 13,
    marginTop: 23,
    alignSelf: 'flex-start',
  },

  textoBotaoDestaque: {
    color: CORES.azulRoyal,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // DESTAQUE
  secaoDestaque: {
    marginHorizontal: 20,
    marginTop: 28,
  },

  tituloLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  etiquetaSecao: {
    color: CORES.azulRoyal,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  estrelaSecao: {
    color: CORES.azulMedio,
    fontSize: 18,
  },

  cartaoDestaque: {
    backgroundColor: CORES.branco,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#17366F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  imagemDestaque: {
    width: '41%',
    overflow: 'hidden',
  },

  informacoesDestaque: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },

  pequenoDestaque: {
    color: CORES.azulMedio,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 9,
  },

  nomeDestaque: {
    color: CORES.texto,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },

  metaDestaque: {
    color: CORES.cinza,
    fontSize: 11,
    marginBottom: 12,
  },

  premioDestaque: {
    color: CORES.azulRoyal,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 17,
  },

  linkDestaque: {
    color: CORES.azulRoyal,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 15,
  },

  // PESQUISA
  secaoPesquisa: {
    paddingHorizontal: 20,
    paddingTop: 31,
  },

  tituloSecao: {
    color: CORES.texto,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 17,
  },

  caixaPesquisa: {
    height: 54,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  iconePesquisa: {
    color: CORES.azulRoyal,
    fontSize: 29,
    marginRight: 10,
  },

  inputPesquisa: {
    flex: 1,
    color: CORES.texto,
    fontSize: 13,
    paddingVertical: 12,
  },

  limparPesquisa: {
    color: CORES.cinza,
    fontSize: 15,
    padding: 5,
  },

  // FILTROS
  listaFiltros: {
    gap: 8,
    paddingTop: 16,
    paddingBottom: 12,
  },

  botaoFiltro: {
    borderRadius: 25,
    backgroundColor: '#E7EEFA',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: CORES.borda,
  },

  botaoFiltroAtivo: {
    backgroundColor: CORES.azulRoyal,
    borderColor: CORES.azulRoyal,
  },

  textoFiltro: {
    color: CORES.azulRoyal,
    fontSize: 12,
    fontWeight: '600',
  },

  textoFiltroAtivo: {
    color: CORES.branco,
  },

  linhaCatalogo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 17,
    marginBottom: 18,
  },

  tituloCatalogo: {
    color: CORES.texto,
    fontSize: 19,
    fontWeight: '800',
  },

  contador: {
    color: CORES.cinza,
    fontSize: 12,
  },

  // CATÁLOGO
  linhaFilmes: {
    paddingHorizontal: 20,
    gap: 12,
    justifyContent: 'space-between',
  },

  cartaoFilme: {
    flex: 1,
    marginBottom: 20,
    backgroundColor: CORES.branco,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CORES.borda,
    elevation: 2,
    shadowColor: '#18366B',
    shadowOpacity: 0.07,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
  },

  areaImagem: {
    position: 'relative',
  },

  posterSimbolo: {
    color: CORES.branco,
    fontSize: 35,
    marginBottom: 10,
  },

  posterTitulo: {
    color: CORES.branco,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  seloOscar: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(16,35,78,0.85)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  textoSeloOscar: {
    color: CORES.branco,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  botaoCoracao: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  coracao: {
    color: CORES.azulRoyal,
    fontSize: 24,
    marginTop: -2,
  },

  coracaoAtivo: {
    color: CORES.rosa,
  },

  informacoesFilme: {
    padding: 12,
    minHeight: 112,
  },

  nomeFilme: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    minHeight: 36,
  },

  metaFilme: {
    color: CORES.cinza,
    fontSize: 11,
    marginTop: 6,
  },

  premioFilme: {
    color: CORES.azulRoyal,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 9,
  },

  // ESTADO VAZIO
  vazio: {
    padding: 35,
    alignItems: 'center',
  },

  iconeVazio: {
    color: CORES.azulMedio,
    fontSize: 42,
  },

  tituloVazio: {
    color: CORES.texto,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
  },

  textoVazio: {
    color: CORES.cinza,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },

  rodape: {
    color: CORES.cinza,
    fontSize: 9,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },

  // MODAL DE DETALHES
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(7,17,37,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },

  cartaoModal: {
    backgroundColor: CORES.perola,
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 430,
    maxHeight: '88%',
  },

  conteudoModal: {
    padding: 22,
  },

  etiquetaModal: {
    color: CORES.azulRoyal,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 9,
  },

  tituloModal: {
    color: CORES.texto,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
  },

  metaModal: {
    color: CORES.cinza,
    marginTop: 9,
    fontSize: 12,
  },

  seloPremio: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E9F9',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 19,
  },

  textoPremio: {
    color: CORES.azulRoyal,
    fontSize: 11,
    fontWeight: '800',
  },

  rotuloModal: {
    color: CORES.azulRoyal,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginTop: 12,
    marginBottom: 8,
  },

  descricaoModal: {
    color: CORES.texto,
    fontSize: 13,
    lineHeight: 21,
  },

  botaoModal: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 23,
  },

  degradeBotaoModal: {
    padding: 16,
    alignItems: 'center',
  },

  textoBotaoModal: {
    color: CORES.branco,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  botaoFechar: {
    alignItems: 'center',
    padding: 15,
  },

  textoFechar: {
    color: CORES.azulRoyal,
    fontSize: 13,
    fontWeight: '600',
  },
});
