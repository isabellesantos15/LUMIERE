
/*
  FUNCIONALIDADES:
  - Salvar preferências com AsyncStorage
  - Recuperar informações salvas
  - Apagar dados com confirmação
  - Compatibilidade com navegador e celular
  - Selecionar gênero favorito
  - Compartilhamento nativo
  - Feedback tátil com expo-haptics
  - Navegação para cadastro e filmes
  - Design Azul Royal & Pérola
*/

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

// Chave usada para armazenar o nome e o gênero.
const CHAVE_DADOS = '@lumiere:preferencias';

// Define o formato das informações armazenadas.
type DadosLumiere = {
  nome: string;
  genero: string;
};

// Cores oficiais do LUMIÈRE.
const CORES = {
  azulEscuro: '#10234E',
  azulRoyal: '#244DA0',
  azulMedio: '#648ED4',
  azulClaro: '#B8CFF2',
  perola: '#F5F7FC',
  branco: '#FFFFFF',
  texto: '#1A315C',
  cinza: '#7283A0',
  borda: '#DCE5F4',
  vermelho: '#B54D6B',
  verde: '#246D60',
};

// Cores do degradê principal.
const DEGRADE = [
  '#10234E',
  '#315FB5',
  '#91B1E6',
] as const;

// Cores do degradê do botão principal.
const DEGRADE_BOTAO = [
  '#173875',
  '#3567B9',
  '#85A7E0',
] as const;

// Gêneros que podem ser selecionados.
const GENEROS = [
  'Romance',
  'Comédia',
  'Drama',
  'Suspense',
  'Ação',
  'Ficção científica',
  'Animação',
  'Documentário',
];

// COMPONENTE PRINCIPAL // 

export default function HomeScreen() {

  // Permite navegar para as outras páginas.
  const router = useRouter();

  // Nome digitado pelo usuário.
  const [nome, setNome] = useState('');

  // Gênero cinematográfico selecionado.
  const [genero, setGenero] = useState('');

  // Mensagem mostrada ao usuário.
  const [mensagem, setMensagem] = useState('');

  // Controla o indicador de carregamento.
  const [carregando, setCarregando] = useState(false);

  // Controla a confirmação de exclusão na própria tela.
  const [mostrarConfirmacao, setMostrarConfirmacao] =
    useState(false);

  /*
    RECURSO NATIVO 1: FEEDBACK TÁTIL

    O expo-haptics permite emitir respostas
    táteis durante as interações do usuário.
  */
  async function vibrarSucesso() {
    if (Platform.OS === 'web') {
      setMensagem(
        'O feedback tátil deve ser testado no celular.'
      );
      return;
    }

    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (erro) {
      console.log(
        'Feedback tátil não disponível:',
        erro
      );
    }
  }

  // Feedback tátil ao selecionar um gênero.
  async function vibrarSelecao() {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Haptics.selectionAsync();
    } catch (erro) {
      console.log(
        'Feedback de seleção indisponível:',
        erro
      );
    }
  }

  /*
    RECURSO NATIVO 2: COMPARTILHAMENTO

    No Android/iOS utiliza Share.share().
    No navegador utiliza Web Share API,
    quando disponível, ou copia a mensagem.
  */
  async function compartilharAplicativo() {
    const texto =
      '✦ LUMIÈRE ✦\n\n' +
      'Conheça meu aplicativo de cinema!\n' +
      'Descubra histórias premiadas e organize ' +
      'suas preferências cinematográficas.';

    try {
      if (Platform.OS === 'web') {
        // Recursos disponíveis nos navegadores.
        if (
          typeof navigator !== 'undefined' &&
          typeof navigator.share === 'function'
        ) {
          await navigator.share({
            title: 'LUMIÈRE',
            text: texto,
          });
        } else if (
          typeof navigator !== 'undefined' &&
          navigator.clipboard?.writeText
        ) {
          await navigator.clipboard.writeText(texto);
          setMensagem(
            'Mensagem copiada para compartilhar!'
          );
        } else {
          setMensagem(
            'Compartilhamento indisponível neste navegador.'
          );
        }

        return;
      }

      // Abre o compartilhamento nativo do celular.
      await Share.share({
        title: 'LUMIÈRE',
        message: texto,
      });
    } catch (erro) {
      // Cancelar o compartilhamento no navegador
      // não deve aparecer como erro para o usuário.
      if (
        erro instanceof Error &&
        erro.name === 'AbortError'
      ) {
        return;
      }

      console.error('Erro ao compartilhar:', erro);
      setMensagem('Não foi possível compartilhar.');
    }
  }

  /*
    ASYNCSTORAGE: SALVAR

    Armazena nome e gênero selecionado
    mesmo depois de fechar o aplicativo.
  */
  async function salvarDados() {
    if (carregando) {
      return;
    }

    if (!nome.trim() || !genero.trim()) {
      setMensagem(
        'Preencha seu nome e escolha seu gênero favorito.'
      );
      return;
    }

    const dados: DadosLumiere = {
      nome: nome.trim(),
      genero: genero.trim(),
    };

    setCarregando(true);

    try {
      await AsyncStorage.setItem(
        CHAVE_DADOS,
        JSON.stringify(dados)
      );

      setMostrarConfirmacao(false);

      setMensagem(
        `Preferências salvas com sucesso, ${dados.nome}!`
      );

      // Feedback tátil após salvar os dados.
      if (Platform.OS !== 'web') {
        await vibrarSucesso();
      }
    } catch (erro) {
      console.error('Erro ao salvar dados:', erro);

      setMensagem(
        'Não foi possível salvar suas preferências.'
      );
    } finally {
      setCarregando(false);
    }
  }

  /*
    ASYNCSTORAGE: CARREGAR

    Recupera as preferências salvas e
    preenche os campos automaticamente.
  */
  async function carregarDados(
    exibirMensagem = true
  ) {
    setCarregando(true);

    try {
      const textoSalvo = await AsyncStorage.getItem(
        CHAVE_DADOS
      );

      if (textoSalvo === null) {
        if (exibirMensagem) {
          setMensagem(
            'Nenhuma preferência salva foi encontrada.'
          );
        }

        return;
      }

      const dados: DadosLumiere =
        JSON.parse(textoSalvo);

      if (
        !dados ||
        typeof dados.nome !== 'string' ||
        typeof dados.genero !== 'string'
      ) {
        throw new Error('Dados armazenados inválidos.');
      }

      // Atualiza os campos visíveis.
      setNome(dados.nome);
      setGenero(dados.genero);

      if (exibirMensagem) {
        setMensagem(
          `Dados recuperados: ${dados.nome} • ${dados.genero}`
        );
      }
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);

      if (exibirMensagem) {
        setMensagem(
          'Não foi possível recuperar suas preferências.'
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  /*
    ASYNCSTORAGE: APAGAR

    Exclui nome e gênero do armazenamento
    e limpa os campos da tela.
  */
  async function apagarDados() {
    if (carregando) {
      return;
    }

    setCarregando(true);

    try {
      await AsyncStorage.removeItem(CHAVE_DADOS);

      // Limpa os campos imediatamente.
      setNome('');
      setGenero('');

      // Fecha a confirmação.
      setMostrarConfirmacao(false);

      setMensagem(
        'Suas preferências foram apagadas com sucesso!'
      );
    } catch (erro) {
      console.error('Erro ao apagar dados:', erro);

      setMensagem(
        'Não foi possível apagar suas preferências.'
      );
    } finally {
      setCarregando(false);
    }
  }

  /*
    CONFIRMAÇÃO DE EXCLUSÃO

    A confirmação é exibida dentro da tela,
    funcionando igualmente no navegador,
    Android e iPhone.

    Isso evita depender de Alert.alert(),
    que pode não funcionar no React Native Web.
  */
  function confirmarExclusao() {
    setMostrarConfirmacao(true);
    setMensagem('');
  }

  /*
    useEffect

    Carrega os dados automaticamente
    quando o componente é iniciado.
  */
  useEffect(() => {
    void carregarDados(false);
  }, []);

  // INTERFACE // 

  return (
    <SafeAreaView style={styles.tela}>

      {/* Barra de status do dispositivo. */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={CORES.azulEscuro}
      />

      {/* Fundo com degradê Azul Royal & Pérola. */}
      <LinearGradient
        colors={DEGRADE}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fundo}
      >

        {/* Círculos decorativos. */}
        <View
          pointerEvents="none"
          style={styles.circuloSuperior}
        />

        <View
          pointerEvents="none"
          style={styles.circuloLateral}
        />

        {/* Ajusta a interface ao abrir o teclado. */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >

          <ScrollView
            contentContainerStyle={styles.conteudo}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* CABEÇALHO */}
            <View style={styles.cabecalho}>

              <View style={styles.emblema}>
                <Text style={styles.simbolo}>
                  ✦
                </Text>
              </View>

              <Text style={styles.marca}>
                LUMIÈRE
              </Text>

              <Text style={styles.assinatura}>
                THE ART OF CINEMA
              </Text>

              <View style={styles.divisor}>
                <View style={styles.linha} />
                <Text style={styles.estrela}>✦</Text>
                <View style={styles.linha} />
              </View>
            </View>

            {/* APRESENTAÇÃO */}
            <View style={styles.apresentacao}>

              <Text style={styles.selo}>
                ✦ UMA EXPERIÊNCIA EXCLUSIVA
              </Text>

              <Text style={styles.tituloPrincipal}>
                O cinema começa{'\n'}com você.
              </Text>

              <Text style={styles.descricao}>
                Cada história é única. Personalize
                suas preferências e descubra
                seu universo cinematográfico.
              </Text>
            </View>

            {/* CARTÃO PRINCIPAL */}
            <View style={styles.sombraCartao}>

              <LinearGradient
                colors={[
                  '#FFFFFF',
                  '#F5F8FE',
                  '#EAF1FC',
                ] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cartao}
              >

                <View style={styles.topoCartao}>

                  <Text style={styles.numero}>
                    01 / SEU PERFIL
                  </Text>

                  <Text style={styles.iconeCartao}>
                    ✧
                  </Text>
                </View>

                <Text style={styles.tituloCartao}>
                  Suas preferências
                </Text>

                <Text style={styles.subtituloCartao}>
                  Descubra o cinema de um jeito
                  que combina com você.
                </Text>

                {/* CAMPO NOME */}
                <Text style={styles.rotulo}>
                  SEU NOME
                </Text>

                <View style={styles.caixaInput}>
                  <TextInput
                    style={styles.input}
                    value={nome}
                    onChangeText={(valor) => {
                      setNome(valor);
                      setMensagem('');
                    }}
                    placeholder="Como podemos chamar você?"
                    placeholderTextColor="#98A7BF"
                    autoCapitalize="words"
                    maxLength={50}
                    editable={!carregando}
                  />
                </View>

                {/* SELEÇÃO DE GÊNERO */}
                <Text style={styles.rotulo}>
                  SEU GÊNERO FAVORITO
                </Text>

                <Text style={styles.instrucao}>
                  Que tipo de história você mais ama?
                </Text>

                <View style={styles.listaGeneros}>

                  {GENEROS.map((item) => {
                    const selecionado =
                      genero === item;

                    return (
                      <Pressable
                        key={item}
                        disabled={carregando}
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: selecionado,
                        }}
                        onPress={() => {
                          setGenero(item);
                          setMensagem('');
                          void vibrarSelecao();
                        }}
                        style={styles.generoContainer}
                      >

                        {selecionado ? (
                          <LinearGradient
                            colors={[
                              '#244DA0',
                              '#648ED4',
                            ] as const}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.generoSelecionado}
                          >
                            <Text
                              style={styles.generoTextoAtivo}
                            >
                              ✦ {item}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.generoNormal}>
                            <Text style={styles.generoTexto}>
                              {item}
                            </Text>
                          </View>
                        )}

                      </Pressable>
                    );
                  })}

                </View>

                {/* BOTÃO SALVAR */}
                <Pressable
                  onPress={salvarDados}
                  disabled={carregando}
                  style={({ pressed }) => [
                    styles.botaoContainer,
                    pressed && styles.botaoPressionado,
                  ]}
                >
                  <LinearGradient
                    colors={DEGRADE_BOTAO}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.botaoPrincipal}
                  >
                    {carregando ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.textoBotao}>
                        SALVAR PREFERÊNCIAS ✦
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* BOTÃO RECUPERAR */}
                <Pressable
                  style={styles.botaoSecundario}
                  onPress={() => {
                    void carregarDados();
                  }}
                  disabled={carregando}
                >
                  <Text style={styles.textoSecundario}>
                    ↻ Recuperar meus dados
                  </Text>
                </Pressable>

                {/* BOTÃO APAGAR */}
                <Pressable
                  style={styles.botaoApagar}
                  onPress={confirmarExclusao}
                  disabled={carregando}
                >
                  <Text style={styles.textoApagar}>
                    Apagar minhas preferências
                  </Text>
                </Pressable>

                {/* CONFIRMAÇÃO DE EXCLUSÃO */}
                {mostrarConfirmacao && (
                  <View style={styles.confirmacaoCard}>

                    <Text style={styles.confirmacaoTitulo}>
                      Deseja apagar suas preferências?
                    </Text>

                    <Text style={styles.confirmacaoTexto}>
                      Seu nome e gênero favorito serão
                      removidos deste dispositivo.
                    </Text>

                    <View style={styles.confirmacaoBotoes}>

                      {/* Cancela a exclusão. */}
                      <Pressable
                        style={styles.botaoCancelar}
                        onPress={() => {
                          setMostrarConfirmacao(false);
                        }}
                      >
                        <Text style={styles.textoCancelar}>
                          Cancelar
                        </Text>
                      </Pressable>

                      {/* Confirma e executa a exclusão. */}
                      <Pressable
                        style={styles.botaoConfirmar}
                        onPress={() => {
                          void apagarDados();
                        }}
                        disabled={carregando}
                      >
                        <Text style={styles.textoConfirmar}>
                          Sim, apagar
                        </Text>
                      </Pressable>

                    </View>
                  </View>
                )}

                {/* MENSAGEM DE RESULTADO */}
                {mensagem !== '' && (
                  <View style={styles.caixaMensagem}>
                    <Text style={styles.mensagem}>
                      ✦ {mensagem}
                    </Text>
                  </View>
                )}

              </LinearGradient>
            </View>

            {/* NAVEGAÇÃO PARA OUTRAS TELAS */}
            <View style={styles.navegacaoCard}>

              <Text style={styles.recursosTitulo}>
                ✦ DESCUBRA O LUMIÈRE
              </Text>

              <Text style={styles.recursosDescricao}>
                Continue sua experiência cinematográfica.
              </Text>

              {/* Navega para o catálogo de filmes. */}
              <Pressable
                style={styles.recursoBotao}
                onPress={() => router.push('/explore')}
              >
                <Text style={styles.recursoIcone}>
                  ◈
                </Text>

                <View style={styles.recursoTextoArea}>
                  <Text style={styles.recursoNome}>
                    Explorar filmes
                  </Text>

                  <Text style={styles.recursoDetalhe}>
                    Descubra filmes famosos e premiados
                  </Text>
                </View>

                <Text style={styles.recursoSeta}>
                  ›
                </Text>
              </Pressable>

              {/* Navega para a tela de cadastro. */}
              <Pressable
                style={styles.recursoBotao}
                onPress={() => router.push('/cadastro')}
              >
                <Text style={styles.recursoIcone}>
                  ✧
                </Text>

                <View style={styles.recursoTextoArea}>
                  <Text style={styles.recursoNome}>
                    Criar minha conta
                  </Text>

                  <Text style={styles.recursoDetalhe}>
                    Acesse o formulário de cadastro
                  </Text>
                </View>

                <Text style={styles.recursoSeta}>
                  ›
                </Text>
              </Pressable>

            </View>

            {/* RECURSOS NATIVOS */}
            <View style={styles.recursosCard}>

              <Text style={styles.recursosTitulo}>
                ✦ RECURSOS INTERATIVOS
              </Text>

              <Text style={styles.recursosDescricao}>
                Explore as funcionalidades do seu dispositivo.
              </Text>

              {/* RECURSO NATIVO 1: HAPTICS */}
              <Pressable
                style={styles.recursoBotao}
                onPress={() => {
                  void vibrarSucesso();
                }}
                accessibilityRole="button"
              >
                <Text style={styles.recursoIcone}>
                  ✧
                </Text>

                <View style={styles.recursoTextoArea}>

                  <Text style={styles.recursoNome}>
                    Experimentar vibração
                  </Text>

                  <Text style={styles.recursoDetalhe}>
                    Feedback tátil do dispositivo
                  </Text>

                </View>

                <Text style={styles.recursoSeta}>
                  ›
                </Text>
              </Pressable>

              {/* RECURSO NATIVO 2: SHARE */}
              <Pressable
                style={styles.recursoBotao}
                onPress={() => {
                  void compartilharAplicativo();
                }}
                accessibilityRole="button"
              >
                <Text style={styles.recursoIcone}>
                  ↗
                </Text>

                <View style={styles.recursoTextoArea}>

                  <Text style={styles.recursoNome}>
                    Compartilhar LUMIÈRE
                  </Text>

                  <Text style={styles.recursoDetalhe}>
                    Compartilhe o aplicativo com alguém
                  </Text>

                </View>

                <Text style={styles.recursoSeta}>
                  ›
                </Text>
              </Pressable>

            </View>

            {/* RODAPÉ */}
            <View style={styles.rodape}>

              <Text style={styles.rodapeDestaque}>
                ✦ HISTÓRIAS QUE PERMANECEM ✦
              </Text>

              <Text style={styles.rodapeTexto}>
                Suas preferências ficam salvas
                neste dispositivo.
              </Text>

              <Text style={styles.copyright}>
                LUMIÈRE • 2026
              </Text>

            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ESTILOS //
const styles = StyleSheet.create({

  flex: {
    flex: 1,
  },

  tela: {
    flex: 1,
    backgroundColor: CORES.azulEscuro,
  },

  fundo: {
    flex: 1,
  },

  // Círculos decorativos do fundo.
  circuloSuperior: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -120,
    right: -95,
  },

  circuloLateral: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 350,
    left: -115,
  },

  conteudo: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 38,
    paddingBottom: 45,
  },

  cabecalho: {
    alignItems: 'center',
    marginBottom: 30,
  },

  emblema: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  simbolo: {
    color: CORES.branco,
    fontSize: 29,
  },

  marca: {
    color: CORES.branco,
    fontSize: 35,
    fontWeight: '300',
    letterSpacing: 6,
    textAlign: 'center',
  },

  assinatura: {
    color: '#E4EEFF',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 12,
  },

  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 25,
  },

  linha: {
    width: 55,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  estrela: {
    color: CORES.branco,
    fontSize: 12,
  },

  apresentacao: {
    alignItems: 'center',
    marginBottom: 30,
  },

  selo: {
    color: '#E2EDFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 15,
    textAlign: 'center',
  },

  tituloPrincipal: {
    color: CORES.branco,
    fontSize: 31,
    fontWeight: '500',
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 13,
  },

  descricao: {
    color: '#E5EEFD',
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 320,
  },

  sombraCartao: {
    borderRadius: 25,
    shadowColor: '#0A1D46',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },

  cartao: {
    borderRadius: 25,
    padding: 23,
    borderWidth: 1,
    borderColor: CORES.branco,
  },

  topoCartao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  numero: {
    color: CORES.azulRoyal,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  iconeCartao: {
    color: CORES.azulMedio,
    fontSize: 25,
  },

  tituloCartao: {
    color: CORES.texto,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 9,
  },

  subtituloCartao: {
    color: CORES.cinza,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 28,
  },

  rotulo: {
    color: CORES.azulRoyal,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 10,
  },

  caixaInput: {
    backgroundColor: CORES.branco,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: CORES.borda,
    marginBottom: 27,
    overflow: 'hidden',
  },

  input: {
    color: CORES.texto,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },

  instrucao: {
    color: CORES.cinza,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 17,
  },

  listaGeneros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 32,
  },

  generoContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },

  generoNormal: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#E6EDF9',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D5E1F3',
  },

  generoSelecionado: {
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 24,
  },

  generoTexto: {
    color: CORES.azulRoyal,
    fontSize: 12,
    fontWeight: '500',
  },

  generoTextoAtivo: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
  },

  botaoContainer: {
    borderRadius: 13,
    overflow: 'hidden',
    elevation: 3,
  },

  botaoPressionado: {
    opacity: 0.85,
  },

  botaoPrincipal: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },

  textoBotao: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#C7D7F1',
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.65)',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 13,
  },

  textoSecundario: {
    color: CORES.azulRoyal,
    fontSize: 13,
    fontWeight: '600',
  },

  botaoApagar: {
    alignItems: 'center',
    paddingVertical: 17,
    marginTop: 4,
  },

  textoApagar: {
    color: CORES.vermelho,
    fontSize: 12,
    fontWeight: '600',
  },

  // Caixa de confirmação de exclusão.
  confirmacaoCard: {
    backgroundColor: '#FFF5F8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBC5D1',
    padding: 17,
    marginTop: 8,
  },

  confirmacaoTitulo: {
    color: CORES.texto,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },

  confirmacaoTexto: {
    color: CORES.cinza,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 16,
  },

  confirmacaoBotoes: {
    flexDirection: 'row',
    gap: 10,
  },

  botaoCancelar: {
    flex: 1,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  textoCancelar: {
    color: CORES.azulRoyal,
    fontSize: 12,
    fontWeight: '700',
  },

  botaoConfirmar: {
    flex: 1,
    backgroundColor: CORES.vermelho,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  textoConfirmar: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
  },

  caixaMensagem: {
    backgroundColor: '#E4EDFC',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: CORES.azulRoyal,
    marginTop: 8,
  },

  mensagem: {
    color: CORES.azulRoyal,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
  },

  // Cartões das áreas de navegação e recursos.
  navegacaoCard: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    padding: 18,
  },

  recursosCard: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    padding: 18,
  },

  recursosTitulo: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 9,
  },

  recursosDescricao: {
    color: '#E8F0FF',
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 20,
  },

  recursoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.perola,
    borderRadius: 14,
    padding: 15,
    marginBottom: 11,
    gap: 13,
  },

  recursoIcone: {
    fontSize: 25,
    color: CORES.azulRoyal,
    width: 28,
    textAlign: 'center',
  },

  recursoTextoArea: {
    flex: 1,
  },

  recursoNome: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
  },

  recursoDetalhe: {
    color: CORES.cinza,
    fontSize: 11,
    lineHeight: 16,
  },

  recursoSeta: {
    color: CORES.azulMedio,
    fontSize: 27,
  },

  // Rodapé.
  rodape: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },

  rodapeDestaque: {
    color: CORES.branco,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  rodapeTexto: {
    color: '#E1EBFA',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
  },

  copyright: {
    color: '#D5E5FA',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 12,
  },
});
