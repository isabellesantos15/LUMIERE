
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
  erro: '#C44E69',
  sucesso: '#247B63',
};

const GRADIENTE = [
  '#10234E',
  '#315FB5',
  '#91B1E6',
] as const;

type Formulario = {
  nome: string;
  email: string;
  telefone: string;
  nascimento: string;
  cidade: string;
  senha: string;
  confirmacao: string;
};

type ChaveCampo = keyof Formulario;

const VALORES_INICIAIS: Formulario = {
  nome: '',
  email: '',
  telefone: '',
  nascimento: '',
  cidade: '',
  senha: '',
  confirmacao: '',
};

type CampoProps = {
  titulo: string;
  valor: string;
  placeholder: string;
  onChangeText: (texto: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  secure?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  maxLength?: number;
  erro?: string;
};

function Campo({
  titulo,
  valor,
  placeholder,
  onChangeText,
  keyboardType = 'default',
  secure = false,
  autoCapitalize = 'sentences',
  maxLength,
  erro,
}: CampoProps) {
  const [focado, setFocado] = useState(false);
  const [visivel, setVisivel] = useState(false);

  return (
    <View style={styles.grupoCampo}>
      <Text style={styles.rotulo}>{titulo}</Text>

      <View
        style={[
          styles.caixaCampo,
          focado && styles.campoFocado,
          !!erro && styles.campoComErro,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#97A6BE"
          value={valor}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={!secure}
          secureTextEntry={secure && !visivel}
          maxLength={maxLength}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          accessibilityLabel={titulo}
        />

        {secure && (
          <Pressable
            onPress={() => setVisivel(!visivel)}
            style={styles.botaoOlho}
            accessibilityRole="button"
            accessibilityLabel={
              visivel ? 'Ocultar senha' : 'Mostrar senha'
            }
          >
            <Text style={styles.textoOlho}>
              {visivel ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>
        )}
      </View>

      {!!erro && (
        <Text style={styles.mensagemErro}>{erro}</Text>
      )}
    </View>
  );
}

function formatarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);

  if (numeros.length <= 2) {
    return numeros ? `(${numeros}` : '';
  }

  if (numeros.length <= 6) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  const corte = numeros.length <= 10 ? 6 : 7;

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, corte)}-${numeros.slice(corte)}`;
}

function formatarData(valor: string) {
  const n = valor.replace(/\D/g, '').slice(0, 8);

  if (n.length <= 2) return n;
  if (n.length <= 4) {
    return `${n.slice(0, 2)}/${n.slice(2)}`;
  }

  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

function dataValida(valor: string) {
  const partes = valor.split('/');

  if (partes.length !== 3 || partes[2].length !== 4) {
    return false;
  }

  const [dia, mes, ano] = partes.map(Number);

  if (ano < 1900 || mes < 1 || mes > 12) {
    return false;
  }

  const data = new Date(ano, mes - 1, dia);

  return (
    data.getDate() === dia &&
    data.getMonth() === mes - 1 &&
    data.getFullYear() === ano &&
    data <= new Date()
  );
}

export default function CadastroScreen() {
  const [form, setForm] = useState<Formulario>(VALORES_INICIAIS);
  const [erros, setErros] = useState<Partial<Formulario>>({});
  const [carregando, setCarregando] = useState(false);

  function alterar(campo: ChaveCampo, valor: string) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setErros((anterior) => ({
      ...anterior,
      [campo]: undefined,
    }));
  }

  const senhaValida =
    form.senha.length >= 8 &&
    /[A-Z]/.test(form.senha) &&
    /[0-9]/.test(form.senha);

  function validarFormulario() {
    const novosErros: Partial<Formulario> = {};

    if (form.nome.trim().split(/\s+/).length < 2) {
      novosErros.nome = 'Informe seu nome completo.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      novosErros.email = 'Digite um e-mail válido.';
    }

    const telefone = form.telefone.replace(/\D/g, '');

    if (telefone.length !== 10 && telefone.length !== 11) {
      novosErros.telefone = 'Informe um telefone com DDD.';
    }

    if (!dataValida(form.nascimento)) {
      novosErros.nascimento = 'Informe uma data válida.';
    }

    if (form.cidade.trim().length < 2) {
      novosErros.cidade = 'Informe sua cidade.';
    }

    if (!senhaValida) {
      novosErros.senha = 'Sua senha não atende aos requisitos.';
    }

    if (
      !form.confirmacao ||
      form.confirmacao !== form.senha
    ) {
      novosErros.confirmacao = 'As senhas não coincidem.';
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  }

  async function cadastrar() {
    if (!validarFormulario()) {
      Alert.alert(
        'Verifique seus dados',
        'Corrija os campos destacados para continuar.'
      );
      return;
    }

    setCarregando(true);

    try {
      // Aqui você poderá conectar sua API de cadastro.
      // Não salve senhas em AsyncStorage.

      Alert.alert(
        'Dados validados! ✦',
        `Seu formulário está correto, ${form.nome.split(' ')[0]}!\n\n` +
        'O próximo passo é conectar o cadastro ao servidor.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.tela}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={CORES.azulEscuro}
      />

      <LinearGradient
        colors={GRADIENTE}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fundo}
      >
        {/* FORMAS DECORATIVAS */}
        <View
          pointerEvents="none"
          style={styles.circuloSuperior}
        />

        <View
          pointerEvents="none"
          style={styles.circuloLateral}
        />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === 'ios' ? 'padding' : undefined
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
                <Text style={styles.simbolo}>✦</Text>
              </View>

              <Text style={styles.marca}>LUMIÈRE</Text>

              <Text style={styles.assinatura}>
                THE ART OF CINEMA
              </Text>
            </View>

            {/* APRESENTAÇÃO */}
            <View style={styles.apresentacao}>
              <View style={styles.etiqueta}>
                <Text style={styles.textoEtiqueta}>
                  ✦ BEM-VINDA AO SEU UNIVERSO
                </Text>
              </View>

              <Text style={styles.titulo}>
                Sua história{'\n'}começa aqui.
              </Text>

              <Text style={styles.subtitulo}>
                Crie sua conta e prepare-se para
                descobrir histórias extraordinárias.
              </Text>
            </View>

            {/* FORMULÁRIO */}
            <View style={styles.sombraCartao}>
              <LinearGradient
                colors={['#FFFFFF', '#F5F8FE', '#EAF1FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cartao}
              >
                <View style={styles.topoCartao}>
                  <View style={styles.iconeSecao}>
                    <Text style={styles.iconeTexto}>✧</Text>
                  </View>

                  <View style={styles.infoCartao}>
                    <Text style={styles.miniTitulo}>
                      SEU PERFIL
                    </Text>

                    <Text style={styles.tituloCartao}>
                      Criar minha conta
                    </Text>
                  </View>
                </View>

                <View style={styles.divisor} />

                {/* DADOS PESSOAIS */}
                <View style={styles.cabecalhoSecao}>
                  <View style={styles.numero}>
                    <Text style={styles.numeroTexto}>01</Text>
                  </View>

                  <View style={styles.infoSecao}>
                    <Text style={styles.tituloSecao}>
                      Dados pessoais
                    </Text>

                    <Text style={styles.descricaoSecao}>
                      Vamos conhecer você melhor.
                    </Text>
                  </View>
                </View>

                <Campo
                  titulo="NOME COMPLETO"
                  valor={form.nome}
                  onChangeText={(v) => alterar('nome', v)}
                  placeholder="Digite seu nome completo"
                  autoCapitalize="words"
                  erro={erros.nome}
                />

                <Campo
                  titulo="E-MAIL"
                  valor={form.email}
                  onChangeText={(v) => alterar('email', v)}
                  placeholder="seuemail@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  erro={erros.email}
                />

                <Campo
                  titulo="TELEFONE"
                  valor={form.telefone}
                  onChangeText={(v) =>
                    alterar('telefone', formatarTelefone(v))
                  }
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  maxLength={15}
                  erro={erros.telefone}
                />

                <Campo
                  titulo="DATA DE NASCIMENTO"
                  valor={form.nascimento}
                  onChangeText={(v) =>
                    alterar('nascimento', formatarData(v))
                  }
                  placeholder="DD/MM/AAAA"
                  keyboardType="number-pad"
                  maxLength={10}
                  erro={erros.nascimento}
                />

                <Campo
                  titulo="CIDADE"
                  valor={form.cidade}
                  onChangeText={(v) => alterar('cidade', v)}
                  placeholder="Digite sua cidade"
                  autoCapitalize="words"
                  erro={erros.cidade}
                />

                <View style={styles.divisorGrande} />

                {/* DADOS DE ACESSO */}
                <View style={styles.cabecalhoSecao}>
                  <View style={styles.numero}>
                    <Text style={styles.numeroTexto}>02</Text>
                  </View>

                  <View style={styles.infoSecao}>
                    <Text style={styles.tituloSecao}>
                      Dados de acesso
                    </Text>

                    <Text style={styles.descricaoSecao}>
                      Segurança para sua experiência.
                    </Text>
                  </View>
                </View>

                <Campo
                  titulo="SENHA"
                  valor={form.senha}
                  onChangeText={(v) => alterar('senha', v)}
                  placeholder="Crie uma senha segura"
                  autoCapitalize="none"
                  secure
                  erro={erros.senha}
                />

                {/* FORÇA DA SENHA */}
                <View style={styles.seguranca}>
                  <Text style={styles.segurancaTitulo}>
                    SEGURANÇA DA SENHA
                  </Text>

                  <View style={styles.barras}>
                    {[0, 1, 2].map((i) => {
                      const pontos = [
                        form.senha.length >= 8,
                        /[A-Z]/.test(form.senha),
                        /[0-9]/.test(form.senha),
                      ].filter(Boolean).length;

                      return (
                        <View
                          key={i}
                          style={[
                            styles.barra,
                            i < pontos && styles.barraAtiva,
                          ]}
                        />
                      );
                    })}
                  </View>

                  <Text style={styles.segurancaTexto}>
                    Use pelo menos 8 caracteres, uma
                    letra maiúscula e um número.
                  </Text>
                </View>

                <Campo
                  titulo="CONFIRMAÇÃO DE SENHA"
                  valor={form.confirmacao}
                  onChangeText={(v) =>
                    alterar('confirmacao', v)
                  }
                  placeholder="Digite sua senha novamente"
                  autoCapitalize="none"
                  secure
                  erro={erros.confirmacao}
                />

                {/* BOTÃO COM DEGRADÊ */}
                <Pressable
                  onPress={cadastrar}
                  disabled={carregando}
                  style={({ pressed }) => [
                    styles.botaoContainer,
                    pressed && styles.botaoPressionado,
                    carregando && { opacity: 0.6 },
                  ]}
                >
                  <LinearGradient
                    colors={GRADIENTE}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.botaoPrincipal}
                  >
                    {carregando ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.textoBotao}>
                        CONTINUAR  ✦
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>

                <Text style={styles.avisoCadastro}>
                  Formulário demonstrativo: o cadastro
                  ainda não está conectado a um servidor.
                </Text>
              </LinearGradient>
            </View>

            {/* RODAPÉ */}
            <View style={styles.rodape}>
              <Text style={styles.rodapeDestaque}>
                ✦ HISTÓRIAS QUE PERMANECEM ✦
              </Text>

              <Text style={styles.rodapeTexto}>
                LUMIÈRE • 2026
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

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

  circuloSuperior: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -125,
    right: -90,
  },

  circuloLateral: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 300,
    left: -110,
  },

  conteudo: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 40,
    paddingBottom: 45,
  },

  cabecalho: {
    alignItems: 'center',
    marginBottom: 35,
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
    marginBottom: 17,
  },

  simbolo: {
    color: '#FFFFFF',
    fontSize: 29,
  },

  marca: {
    fontSize: 34,
    fontWeight: '300',
    letterSpacing: 6,
    color: '#FFFFFF',
  },

  assinatura: {
    color: '#E4EEFF',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 10,
  },

  apresentacao: {
    alignItems: 'center',
    marginBottom: 30,
  },

  etiqueta: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  textoEtiqueta: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
  },

  titulo: {
    fontSize: 35,
    lineHeight: 43,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },

  subtitulo: {
    fontSize: 14,
    lineHeight: 23,
    color: '#E5EDFC',
    textAlign: 'center',
    maxWidth: 315,
  },

  sombraCartao: {
    borderRadius: 26,
    shadowColor: '#071B43',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
  },

  cartao: {
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  topoCartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 25,
  },

  iconeSecao: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#E1EAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconeTexto: {
    color: CORES.azulRoyal,
    fontSize: 29,
  },

  infoCartao: {
    flex: 1,
  },

  miniTitulo: {
    color: CORES.azulMedio,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  tituloCartao: {
    color: CORES.texto,
    fontSize: 21,
    fontWeight: '700',
  },

  divisor: {
    height: 1,
    backgroundColor: CORES.borda,
    marginBottom: 28,
  },

  cabecalhoSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 27,
  },

  numero: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: '#E0EAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  numeroTexto: {
    fontSize: 13,
    fontWeight: '800',
    color: CORES.azulRoyal,
  },

  infoSecao: {
    flex: 1,
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.texto,
    marginBottom: 5,
  },

  descricaoSecao: {
    fontSize: 12,
    color: CORES.cinza,
  },

  grupoCampo: {
    marginBottom: 22,
  },

  rotulo: {
    color: CORES.azulRoyal,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 10,
  },

  caixaCampo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 13,
    paddingHorizontal: 15,
    minHeight: 55,
  },

  campoFocado: {
    borderColor: CORES.azulRoyal,
    borderWidth: 1.5,
  },

  campoComErro: {
    borderColor: CORES.erro,
  },

  input: {
    flex: 1,
    minWidth: 0,
    color: CORES.texto,
    fontSize: 14,
    paddingVertical: 14,
  },

  botaoOlho: {
    paddingLeft: 10,
    paddingVertical: 12,
  },

  textoOlho: {
    color: CORES.azulRoyal,
    fontSize: 12,
    fontWeight: '600',
  },

  mensagemErro: {
    color: CORES.erro,
    fontSize: 12,
    marginTop: 7,
  },

  divisorGrande: {
    height: 1,
    backgroundColor: CORES.borda,
    marginTop: 10,
    marginBottom: 31,
  },

  seguranca: {
    marginTop: -5,
    marginBottom: 27,
    backgroundColor: '#E8EFFB',
    padding: 15,
    borderRadius: 12,
  },

  segurancaTitulo: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: CORES.azulRoyal,
    marginBottom: 12,
  },

  barras: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 11,
  },

  barra: {
    flex: 1,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#CDD9EC',
  },

  barraAtiva: {
    backgroundColor: CORES.azulRoyal,
  },

  segurancaTexto: {
    fontSize: 11,
    lineHeight: 18,
    color: CORES.cinza,
  },

  botaoContainer: {
    borderRadius: 13,
    overflow: 'hidden',
    marginTop: 12,
    elevation: 4,
  },

  botaoPressionado: {
    opacity: 0.8,
  },

  botaoPrincipal: {
    minHeight: 57,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoBotao: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  avisoCadastro: {
    color: CORES.cinza,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 18,
  },

  rodape: {
    alignItems: 'center',
    marginTop: 42,
    gap: 12,
  },

  rodapeDestaque: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  rodapeTexto: {
    color: '#DFEAFC',
    fontSize: 10,
    letterSpacing: 2,
  },
});
